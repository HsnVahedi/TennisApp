targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name which is used to generate a short unique hash for each resource')
param name string

@minLength(1)
@description('Primary location for all resources')
param location string

@secure()
@description('DBServer administrator password')
param dbserverPassword string

@secure()
@description('Secret Key')
param secretKey string

param webAppExists bool = false
param frontendAppExists bool = false
param celeryAppExists bool = false

@description('Id of the user or app to assign application roles')
param principalId string = ''

var resourceToken = toLower(uniqueString(subscription().id, name, location))
var prefix = '${name}-${resourceToken}'
var tags = { 'azd-env-name': name }

var secrets = [
  {
    name: 'DBSERVERPASSWORD'
    value: dbserverPassword
  }
  {
    name: 'SECRETKEY'
    value: secretKey
  }
]

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: '${name}-rg'
  location: location
  tags: tags
}

module virtualNetwork 'br/public:avm/res/network/virtual-network:0.1.8' = {
  name: 'virtualNetworkDeployment'
  scope: resourceGroup
  params: {
    // Required parameters
    addressPrefixes: [
      '10.0.0.0/16'
    ]
    name: '${name}-vnet'
    location: location
    tags: tags
    subnets: [
      {
        addressPrefix: '10.0.0.0/24'
        name: 'keyvault'
        tags: tags
      }
      {
        addressPrefix: '10.0.2.0/23'
        name: 'web'
        tags: tags
        serviceEndpoints: [
          {
            service: 'Microsoft.KeyVault'
          }
        ]
      } 
      {
        addressPrefix: '10.0.4.0/23'
        name: 'frontend'
        tags: tags
        serviceEndpoints: [
          {
            service: 'Microsoft.KeyVault'
          }
        ]
      }
      {
        addressPrefix: '10.0.6.0/23'
        name: 'celery'
        tags: tags
        serviceEndpoints: [
          {
            service: 'Microsoft.KeyVault'
          }
        ]
      }
      {
        addressPrefix: '10.0.8.0/24'
        name: 'gateway' 
        tags: tags
        properties: {
          privateLinkServiceNetworkPolicies: 'Disabled'
        }
        serviceEndpoints: [
          {
            service: 'Microsoft.KeyVault'
          }
        ]
      }
    ]
  }
}

module privateDnsZone 'br/public:avm/res/network/private-dns-zone:0.3.1' = {
  name: 'privateDnsZoneDeployment'
  scope: resourceGroup
  params: {
    name: 'relecloud.net'
    // name: envDefaultDomain
    tags: tags
  }
}


// module applicationGateway 'core/gateway/main.bicep' = {
//   name: 'applicationGateway'
//   scope: resourceGroup
//   params: {
//     // resourceGroupName: resourceGroup.name
//     location: location
//     applicationGatewayName: '${prefix}-gateway'
//     // frontendAppName: 'frontend'
//     appGatewaySubnetId: virtualNetwork.outputs.subnetResourceIds[4]
//     frontendAppInternalIp: frontend.outputs.staticIp
//     publicIpName: 'public-gateway'
//     sslCertificateName: 'ssl-cert'
//     keyVaultName: keyVault.outputs.name
//   }
// }


module blobStorage 'core/storage/blob.bicep' = {
  name: 'blobStorage'
  scope: resourceGroup
  params: {
    name: take(replace(prefix, '-', ''), 5) 
    location: location
    tags: tags
  }
}



// Store secrets in a keyvault
module keyVault 'br/public:avm/res/key-vault/vault:0.6.2' = {
  name: 'keyvault'
  scope: resourceGroup
  params: {
    name: '${take(replace(prefix, '-', ''), 10)}-vault'
    location: location
    tags: tags
    sku: 'standard'
    enableRbacAuthorization: true
    accessPolicies: [
      {
        objectId: principalId
        permissions: { secrets: ['get', 'list'] }
        tenantId: subscription().tenantId
      }
    ]
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
      // ipRules: [
      //   { value: '<your IP>' }
      // ]
      virtualNetworkRules: [
        {
          id: virtualNetwork.outputs.subnetResourceIds[1]
        }
        {
          id: virtualNetwork.outputs.subnetResourceIds[2]
        }
      ]
    }
    privateEndpoints: [
      {
        name: '${name}-keyvault-pe'
        subnetResourceId: virtualNetwork.outputs.subnetResourceIds[0]
        privateDnsZoneResourceIds: [privateDnsZone.outputs.resourceId]
      }
    ]
    diagnosticSettings: [
      {
        logCategoriesAndGroups: [
          {
            category: 'AuditEvent'
          }
        ]
        name: 'auditEventLogging'
        workspaceResourceId: monitoring.outputs.logAnalyticsWorkspaceId
      }
    ]
    secrets: [
      for secret in secrets: {
        name: secret.name
        value: secret.value
        tags: tags
        attributes: {
          exp: 0
          nbf: 0
        }
      }
    ]
  }
}

module roleAssignment 'core/security/role.bicep' = {
  name: 'webRoleAssignment'
  scope: resourceGroup
  params: {
    principalId: web.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
    roleDefinitionId: '4633458b-17de-408a-b874-0445c86b69e6' // Key Vault Secrets User
  }
}

module db 'db.bicep' = {
  name: 'db'
  scope: resourceGroup
  params: {
    name: 'dbserver'
    location: location
    tags: tags
    prefix: prefix
    dbserverDatabaseName: 'relecloud'
    dbserverPassword: dbserverPassword
  }
}

// Monitor application with Azure Monitor
module monitoring 'core/monitor/monitoring.bicep' = {
  name: 'monitoring'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
    applicationInsightsDashboardName: '${prefix}-appinsights-dashboard'
    applicationInsightsName: '${prefix}-appinsights'
    logAnalyticsName: '${take(prefix, 50)}-loganalytics' // Max 63 chars
  }
}

// TODO: Implement frontend monitoring
// module frontendMonitoring 'core/monitor/monitoring.bicep' = {
//   name: 'frontendMonitoring'
//   scope: resourceGroup
//   params: {
//     location: location
//     tags: tags
//     applicationInsightsDashboardName: '${prefix}-frontend-appinsights-dashboard'
//     applicationInsightsName: '${prefix}-frontend-appinsights'
//     logAnalyticsName: '${take(prefix, 40)}-frontend-loganalytics' // Max 63 chars
//   }
// }

module redis 'core/cache/redis.bicep' = {
  name: 'redis'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
  }
}


var containerRegistryName = '${replace(prefix, '-', '')}registry'

// Container apps host (including container registry)
module containerApps 'core/host/container-apps.bicep' = {
  name: 'container-apps'
  scope: resourceGroup
  dependsOn: [
    redis
  ]
  params: {
    name: 'app'
    location: location
    containerAppsEnvironmentName: '${prefix}-containerapps-env'
    containerRegistryName: containerRegistryName 
    logAnalyticsWorkspaceResourceId: monitoring.outputs.logAnalyticsWorkspaceId
    virtualNetworkSubnetId: virtualNetwork.outputs.subnetResourceIds[1]
  }
}

module celeryContainerApps 'core/host/celery-container-apps.bicep' = {
  name: 'celery-container-apps'
  scope: resourceGroup
  dependsOn: [
    redis, containerApps
  ]
  params: {
    // name: 'celery'
    // location: location
    containerAppsEnvironmentName: containerApps.outputs.environmentName
    containerRegistryName: containerRegistryName
    // logAnalyticsWorkspaceResourceId: monitoring.outputs.logAnalyticsWorkspaceId
    // virtualNetworkSubnetId: virtualNetwork.outputs.subnetResourceIds[3]
  }
}

module frontendContainerApps 'core/host/frontend-container-apps.bicep' = {
  name: 'frontend-container-apps'
  scope: resourceGroup
  dependsOn: [
    containerApps, celeryContainerApps
  ]
  params: {
    name: 'frontend-app'
    location: location
    containerAppsEnvironmentName: '${prefix}-frontend-containerapps-env'
    containerRegistryName: containerRegistryName 
    logAnalyticsWorkspaceResourceId: monitoring.outputs.logAnalyticsWorkspaceId
    virtualNetworkSubnetId: virtualNetwork.outputs.subnetResourceIds[2]
  }
}

var identityName = '${prefix}-id-web'


module web 'web.bicep' = {
  name: 'web'
  scope: resourceGroup
  params: {
    name: replace('${take(prefix,19)}-ca', '--', '-')
    location: location
    tags: tags
    applicationInsightsName: monitoring.outputs.applicationInsightsName
    keyVaultName: keyVault.outputs.name
    identityName: identityName 
    containerAppsEnvironmentName: containerApps.outputs.environmentName
    containerRegistryName: containerApps.outputs.registryName
    exists: webAppExists
    dbserverDomainName: db.outputs.dbserverDomainName
    dbserverUser: db.outputs.dbserverUser
    dbserverDatabaseName: db.outputs.dbserverDatabaseName
    dbserverPassword: dbserverPassword
    storageAccountName: blobStorage.outputs.storageAccountName
    staticFilesContainerName: blobStorage.outputs.staticContainerName
    mediaFilesContainerName: blobStorage.outputs.mediaContainerName
    redisName: redis.outputs.redisName
  }
}


var containerRegistryAccessName = web.outputs.containerRegistryAccessName 

module celery 'celery.bicep' = {
  name: 'celery'
  scope: resourceGroup
  dependsOn: [web]
  params: {
    name: replace('${take(prefix,19)}-celery', '--', '-')
    location: location
    tags: tags
    // applicationInsightsName: monitoring.outputs.applicationInsightsName
    keyVaultName: keyVault.outputs.name
    identityName: identityName 
    containerAppsEnvironmentName: celeryContainerApps.outputs.environmentName
    containerRegistryName: containerApps.outputs.registryName
    exists: celeryAppExists
    dbserverDomainName: db.outputs.dbserverDomainName
    dbserverUser: db.outputs.dbserverUser
    dbserverDatabaseName: db.outputs.dbserverDatabaseName
    dbserverPassword: dbserverPassword
    storageAccountName: blobStorage.outputs.storageAccountName
    staticFilesContainerName: blobStorage.outputs.staticContainerName
    mediaFilesContainerName: blobStorage.outputs.mediaContainerName
    redisName: redis.outputs.redisName
    containerRegistryAccessName: containerRegistryAccessName
  }
}


module frontend 'frontend.bicep' = {
  name: 'frontend'
  scope: resourceGroup
  dependsOn: [
    web, celery
  ]
  params: {
    name: replace('${take(prefix,19)}-front', '--', '-')
    location: location
    tags: tags
    // applicationInsightsName: frontendMonitoring.outputs.applicationInsightsName
    identityName: identityName
    keyVaultName: keyVault.outputs.name
    containerAppsEnvironmentName: frontendContainerApps.outputs.environmentName
    containerRegistryName: frontendContainerApps.outputs.registryName
    exists: frontendAppExists
    backendApiUri: web.outputs.SERVICE_WEB_URI
    // keyVaultName: keyVault.outputs.name
    containerRegistryAccessName: containerRegistryAccessName
  }
}


output AZURE_LOCATION string = location

output AZURE_CONTAINER_ENVIRONMENT_NAME string = containerApps.outputs.environmentName
output AZURE_FRONTEND_CONTAINER_ENVIRONMENT_NAME string = frontendContainerApps.outputs.environmentName

output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerApps.outputs.registryLoginServer
// output AZURE_FRONTEND_CONTAINER_REGISTRY_ENDPOINT string = frontendContainerApps.outputs.registryLoginServer

output AZURE_CONTAINER_REGISTRY_NAME string = containerApps.outputs.registryName
output AZURE_FRONTEND_CONTAINER_REGISTRY_NAME string = frontendContainerApps.outputs.registryName

output SERVICE_WEB_IDENTITY_PRINCIPAL_ID string = web.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
output SERVICE_FRONTEND_IDENTITY_PRINCIPAL_ID string = frontend.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID


output SERVICE_WEB_NAME string = web.outputs.SERVICE_WEB_NAME
output SERVICE_FRONTEND_NAME string = frontend.outputs.SERVICE_WEB_NAME

output SERVICE_WEB_URI string = web.outputs.SERVICE_WEB_URI
output SERVICE_FRONTEND_URI string = frontend.outputs.SERVICE_WEB_URI

output SERVICE_WEB_IMAGE_NAME string = web.outputs.SERVICE_WEB_IMAGE_NAME
output SERVICE_FRONTEND_IMAGE_NAME string = frontend.outputs.SERVICE_WEB_IMAGE_NAME


output BACKEND_URI string = web.outputs.uri
output FRONTEND_URI string = frontend.outputs.uri


output APP_EXISTS bool = webAppExists
output FRONTEND_EXISTS bool = frontendAppExists
output CELERY_EXISTS bool = celeryAppExists

output AZURE_KEY_VAULT_ENDPOINT string = keyVault.outputs.uri
output AZURE_KEY_VAULT_NAME string = keyVault.outputs.name
output APPLICATIONINSIGHTS_NAME string = monitoring.outputs.applicationInsightsName
