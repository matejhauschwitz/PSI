param location string
param prefix string
param env string
param subnetId string
param acrName string
param acrResourceGroup string
param dbHost string
param dbName string
param lawId string
param aiConnectionString string
param containerImage string
param deployDebugTools bool = false
param developerIdentityEmail string
@secure()
param jwtSecret string

// MySQL varianty pgadmin parametrů
param phpmyadminAadClientId string = ''
@secure()
param phpmyadminAadClientSecret string = ''

@secure()
param acsConnectionString string
param acsFromAddress string

param tags object

var acrPullRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
var deployDebugAuth = deployDebugTools && !empty(phpmyadminAadClientId) && !empty(phpmyadminAadClientSecret)

resource law 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  name: last(split(lawId, '/'))
}

// --- ACA Environment ---
resource env_aca 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-${prefix}-${env}'
  location: location
  tags: tags
  properties: {
    vnetConfiguration: {
      infrastructureSubnetId: subnetId
    }
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: law.properties.customerId
        sharedKey: law.listKeys().primarySharedKey
      }
    }
  }
}

// --- Identities ---
resource app_identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-${prefix}-${env}-app'
  location: location
  tags: tags
}

module app_acr_pull './acr-role.bicep' = {
  name: 'app-acr-pull-${env}'
  scope: resourceGroup(acrResourceGroup)
  params: {
    principalId: app_identity.properties.principalId
    roleDefinitionId: acrPullRoleDefinitionId
    acrName: acrName
  }
}

resource migrator_identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-${prefix}-${env}-migrator'
  location: location
  tags: tags
}

module migrator_acr_pull './acr-role.bicep' = {
  name: 'migrator-acr-pull-${env}'
  scope: resourceGroup(acrResourceGroup)
  params: {
    principalId: migrator_identity.properties.principalId
    roleDefinitionId: acrPullRoleDefinitionId
    acrName: acrName
  }
}

// --- Backend App ---
resource backend_app 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-${prefix}-${env}-backend'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${app_identity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: env_aca.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
      }
      registries: [
        {
          server: '${acrName}.azurecr.io'
          identity: app_identity.id
        }
      ]
      secrets: [
        {
          name: 'acs-connection-string'
          value: acsConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: containerImage
          env: [
            // CONNECTION STRING PRO MYSQL + .NET
            { name: 'ConnectionStrings__DefaultConnection', value: 'Server=${dbHost}; User Id=id-bookstore-${env}-app; Database=${dbName}; SSL Mode=Required;' }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: aiConnectionString }
            { name: 'JWT_SECRET_KEY', value: jwtSecret } // Sjednoceno s tvým docker-compose
            { name: 'ASPNETCORE_ENVIRONMENT', value: (env == 'dev' ? 'Development' : 'Production') }
            { name: 'AZURE_CLIENT_ID', value: app_identity.properties.clientId }
            { name: 'ACS_CONNECTION_STRING', secretRef: 'acs-connection-string' }
            { name: 'ACS_FROM_ADDRESS', value: acsFromAddress }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

// --- Static Web App (Frontend) ---
resource frontend_swa 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'swa-${prefix}-${env}'
  location: 'westeurope'
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

// --- Debugging Tools ---
resource phpmyadmin 'Microsoft.App/containerApps@2023-05-01' = if (deployDebugTools) {
  name: 'ca-${prefix}-${env}-phpmyadmin'
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: env_aca.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'auto'
      }
    }
    template: {
      containers: [
        {
          name: 'phpmyadmin'
          image: 'phpmyadmin/phpmyadmin'
          env: [
            { name: 'PMA_HOST', value: dbHost }
            { name: 'PMA_ARBITRARY', value: '1' }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
}

output backendUrl string = backend_app.properties.configuration.ingress.fqdn
output frontendUrl string = frontend_swa.properties.defaultHostname
output appPrincipalId string = app_identity.properties.principalId
