param location string
param prefix string
param env string
param scriptsSubnetId string
param storageAccountName string
param dbHost string
param dbAdminName string
param dbName string
param idDbSetupId string
param developerIdentityEmail string
param tags object

param forceUpdateTag string = utcNow()

resource dbBootstrap 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'ds-${prefix}-${env}-bootstrap'
  location: location
  kind: 'AzureCLI'
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${idDbSetupId}': {}
    }
  }
  properties: {
    forceUpdateTag: forceUpdateTag
    azCliVersion: '2.50.0'
    containerSettings: {
      containerGroupName: 'cg-${prefix}-${env}-db-bootstrap'
      subnetIds: [
        {
          id: scriptsSubnetId
        }
      ]
    }
    storageAccountSettings: {
      storageAccountName: storageAccountName
    }
    environmentVariables: [
      { name: 'DB_HOST', value: dbHost }
      { name: 'DB_ADMIN', value: dbAdminName }
      { name: 'DB_NAME', value: dbName }
      { name: 'ENV', value: env }
      { name: 'DEV_EMAIL', value: developerIdentityEmail }
      // Resource ID pro MySQL Entra ID autentizaci
      { name: 'MYSQL_RESOURCE', value: 'https://ossrdbms-aad.database.windows.net' }
    ]
    scriptContent: '''
set -e

echo "Waiting for DNS propagation..."
sleep 30

# Instalace MySQL klienta (v Alpine je to balíček mariadb-client, který obsahuje příkaz 'mysql')
apk update && apk add mariadb-client

# Získání tokenu pro MySQL Entra ID přihlášení
export ACCESS_TOKEN=$(az account get-access-token --resource "$MYSQL_RESOURCE" -o tsv --query accessToken)

# Funkce pro spouštění MySQL příkazů
run_sql() {
  mysql -h "$DB_HOST" -u "$DB_ADMIN" --password="$ACCESS_TOKEN" --enable-cleartext-plugin -e "$1"
}

echo "--- Step 1: Create Users for Managed Identities ---"
# V MySQL Flexible Serveru se Entra ID uživatelé vytvářejí takto:
# Identita migratora (pro migrace databáze - DDL)
run_sql "CREATE USER IF NOT EXISTS 'id-bookstore-${ENV}-migrator' IDENTIFIED WITH AzureAD;"
# Identita aplikace (pro běžný chod - DML)
run_sql "CREATE USER IF NOT EXISTS 'id-bookstore-${ENV}-app' IDENTIFIED WITH AzureAD;"
# Identita pro tebe (vývojáře)
run_sql "CREATE USER IF NOT EXISTS '${DEV_EMAIL}' IDENTIFIED WITH AzureAD;"

echo "--- Step 2: Grant Permissions ---"
# Práva pro Migratora (může měnit strukturu tabulek)
run_sql "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO 'id-bookstore-${ENV}-migrator';"

# Práva pro tvou identitu (můžeš všechno)
run_sql "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DEV_EMAIL}';"

# Práva pro Aplikaci (může jen číst a zapisovat data, ne měnit tabulky)
run_sql "GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON ${DB_NAME}.* TO 'id-bookstore-${ENV}-app';"

# Aplikování změn
run_sql "FLUSH PRIVILEGES;"

echo "SUCCESS: MySQL database bootstrap complete for $ENV."
'''
    retentionInterval: 'P1D'
    cleanupPreference: 'OnSuccess'
  }
}
