param location string
param prefix string
param env string
param subnetId string
param vnetId string
param scriptsSubnetId string
param tags object
param lawId string = ''
param administratorLogin string = 'mysqladmin'
@secure()
param administratorLoginPassword string

// --- Identity for DB Setup/Bootstrap ---
resource idDbSetup 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-${prefix}-${env}-db-setup'
  location: location
  tags: tags
}

// --- Storage Account for Infrastructure Scripts ---
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'st${prefix}${env}scripts' 
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
      virtualNetworkRules: [
        {
          id: scriptsSubnetId
          action: 'Allow'
        }
      ]
    }
  }
}


resource storageContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, idDbSetup.id, 'StorageAccountContributor')
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '17d1049b-9a84-46fb-8f53-869881c3d3ab')
    principalId: idDbSetup.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource blobContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, idDbSetup.id, 'BlobDataContributor')
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')
    principalId: idDbSetup.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource filePrivilegedContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, idDbSetup.id, 'FilePrivilegedContributor')
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '69566ab7-960f-475b-8e7c-b3118f30c6bd')
    principalId: idDbSetup.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// --- MySQL Flexible Server ---
resource mysql 'Microsoft.DBforMySQL/flexibleServers@2023-12-30' = {
  name: 'mysql-${prefix}-${env}'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${idDbSetup.id}': {}
    }
  }
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '8.0.21' // MySQL 8.0
    storage: {
      storageSizeGB: 20
      iops: 360
      autoGrow: 'Enabled'
    }
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    network: {
      delegatedSubnetResourceId: subnetId
      privateDnsZoneResourceId: privateDnsZone.id
    }
  }
}

resource mysql_diagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (!empty(lawId)) {
  name: 'ds-${mysql.name}'
  scope: mysql
  properties: {
    workspaceId: lawId
    logs: [
      {
        category: 'MySqlAuditLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
  }
}

// Samotná databáze "bookstore"
resource db_bookstore 'Microsoft.DBforMySQL/flexibleServers/databases@2023-12-30' = {
  parent: mysql
  name: 'bookstore'
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_0900_ai_ci'
  }
}

// DNS Zóna pro MySQL
resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: '${prefix}-${env}.mysql.database.azure.com'
  location: 'global'
  tags: tags
}

resource privateDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsZone
  name: '${prefix}-${env}-link'
  location: 'global'
  tags: tags
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnetId
    }
  }
}

// Administrátor
module mysqlAdmin './database-admin.bicep' = {
  name: 'mysql-admin-assignment'
  params: {
    serverName: mysql.name
    principalId: idDbSetup.properties.principalId
    principalName: idDbSetup.name
    tenantId: subscription().tenantId
  }
}

output mysqlId string = mysql.id
output mysqlFullyQualifiedDomainName string = mysql.properties.fullyQualifiedDomainName
output idDbSetupId string = idDbSetup.id
output idDbSetupName string = idDbSetup.name
output storageAccountName string = storageAccount.name
