targetScope = 'resourceGroup'

param location string = resourceGroup().location
param prefix string = 'bookstore'
param env string
param subnetId string
param acrName string
param acrResourceGroup string
param dbHost string
param dbName string
param idDbSetupId string
param idDbSetupName string
param storageAccountName string
param scriptsSubnetId string
param developerIdentityEmail string = 'matej.hauschwitz@tul.cz' // TVŮJ MAIL
param deployDebugTools bool = false
param containerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
@secure()
param jwtSecret string

param phpmyadminAadClientId string = ''
@secure()
param phpmyadminAadClientSecret string = ''

param alertsEmail string = developerIdentityEmail
param alertWindowDuration string = 'PT5M'
param p95LatencyThreshold int = 1000
param endpointErrorsThreshold int = 3

param tags object = {
  project: 'bookstore'
  env: env
  managedBy: 'bicep'
}

// --- Monitoring ---
module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring-${env}-deployment'
  params: {
    location: location
    prefix: prefix
    env: env
    tags: tags
  }
}

// --- Alerts ---
module alerts './modules/alerts.bicep' = {
  name: 'alerts-${env}-deployment'
  params: {
    location: location
    prefix: prefix
    env: env
    appInsightsId: monitoring.outputs.appInsightsId
    alertsEmail: alertsEmail
    alertWindowDuration: alertWindowDuration
    p95LatencyThreshold: p95LatencyThreshold
    endpointErrorsThreshold: endpointErrorsThreshold
    tags: tags
  }
}

// --- Email ---
module acs './modules/acs.bicep' = {
  name: 'acs-${env}-deployment'
  params: {
    prefix: prefix
    env: env
    tags: tags
  }
}

// --- Compute (ACA + SWA) ---
module compute './modules/compute.bicep' = {
  name: 'compute-${env}-deployment'
  params: {
    location: location
    prefix: prefix
    env: env
    subnetId: subnetId
    acrName: acrName
    acrResourceGroup: acrResourceGroup
    dbHost: dbHost
    dbName: dbName
    containerImage: containerImage
    jwtSecret: jwtSecret
    deployDebugTools: deployDebugTools
    phpmyadminAadClientId: phpmyadminAadClientId
    phpmyadminAadClientSecret: phpmyadminAadClientSecret
    lawId: monitoring.outputs.workspaceId
    aiConnectionString: monitoring.outputs.connectionString
    acsConnectionString: acs.outputs.connectionString
    acsFromAddress: acs.outputs.fromAddress
    tags: tags
    developerIdentityEmail: developerIdentityEmail
  }
}

// --- Database Role Bootstrap ---
module dbBootstrap './modules/database-bootstrap.bicep' = {
  name: 'db-bootstrap-${env}-deployment'
  params: {
    location: location
    prefix: prefix
    env: env
    dbHost: dbHost
    dbName: dbName
    idDbSetupId: idDbSetupId
    dbAdminName: idDbSetupName
    storageAccountName: storageAccountName
    scriptsSubnetId: scriptsSubnetId
    developerIdentityEmail: developerIdentityEmail
    tags: tags
  }

  dependsOn: [
    compute
  ]
}

output backendUrl string = compute.outputs.backendUrl
output appPrincipalId string = compute.outputs.appPrincipalId
output migratorPrincipalId string = compute.outputs.migratorPrincipalId
