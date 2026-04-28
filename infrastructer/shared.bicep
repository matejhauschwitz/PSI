targetScope = 'resourceGroup'

param location string = resourceGroup().location
param prefix string = 'bookstore'
@secure()
param administratorLoginPassword string
@secure()
param jwtSecret string

param tags object = {
  project: 'bookstore'
  env: 'shared'
  managedBy: 'bicep'
}

// --- Monitoring (Shared) ---
module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring-shared-deployment'
  params: {
    location: location
    prefix: prefix
    env: 'shared'
    tags: tags
  }
}

// --- Network ---
module network './modules/network.bicep' = {
  name: 'network-deployment'
  params: {
    location: location
    tags: tags
    vnetName: 'vnet-${prefix}-shared'
  }
}

// --- Container Registry ---
module acr './modules/acr.bicep' = {
  name: 'acr-deployment'
  params: {
    location: location
    prefix: prefix
    tags: tags
    lawId: monitoring.outputs.workspaceId
  }
}

// --- Database (Shared Host) ---
module database './modules/database.bicep' = {
  name: 'database-deployment'
  params: {
    location: location
    prefix: prefix
    env: 'shared'
    subnetId: network.outputs.snetDbId
    vnetId: network.outputs.vnetId
    scriptsSubnetId: network.outputs.snetScriptsId
    tags: tags
    lawId: monitoring.outputs.workspaceId
    administratorLoginPassword: administratorLoginPassword
  }
}

// --- Backend App Service ---
module backendApp './modules/webapp.bicep' = {
  name: 'backend-deployment'
  params: {
    location: location
    prefix: prefix
    env: 'shared'
    acrName: acr.outputs.acrName
    subnetId: network.outputs.snetDevId
    dbHost: database.outputs.mysqlFullyQualifiedDomainName
    dbUser: 'mysqladmin'
    dbPassword: administratorLoginPassword
    jwtSecret: jwtSecret
  }
}

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: 'stapp-psi-frontend-shared'
  location: 'westeurope'
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output acrName string = acr.outputs.acrName
output vnetId string = network.outputs.vnetId
output snetDevId string = network.outputs.snetDevId
output snetProdId string = network.outputs.snetProdId
output dbHost string = database.outputs.mysqlFullyQualifiedDomainName 
output idDbSetupId string = database.outputs.idDbSetupId
output idDbSetupName string = database.outputs.idDbSetupName
output storageAccountName string = database.outputs.storageAccountName
output snetScriptsId string = network.outputs.snetScriptsId
