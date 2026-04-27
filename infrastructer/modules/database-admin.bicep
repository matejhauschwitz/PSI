param serverName string
param principalId string
param principalName string
param tenantId string
param identityResourceId string

resource mysql 'Microsoft.DBforMySQL/flexibleServers@2023-12-30' existing = {
  name: serverName
}

// Nastavení administrátora pro MySQL
resource mysqlAdmin 'Microsoft.DBforMySQL/flexibleServers/administrators@2023-12-30' = {
  parent: mysql
  name: 'ActiveDirectory'
  properties: {
    administratorType: 'ActiveDirectory'
    login: principalName
    sid: principalId
    tenantId: tenantId
    identityResourceId: identityResourceId
  }
}
