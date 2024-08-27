param name string
param location string = resourceGroup().location
param tags object = {}

// param applicationInsightsName string
param containerAppsEnvironmentName string
param containerRegistryName string
param exists bool
param identityName string
param serviceName string = 'frontend'
param backendApiUri string
// param keyVaultName string


// resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' existing = {
//   name: keyVaultName
// }

resource webIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: identityName
}

// module keyVaultRoleAssignment 'core/security/role.bicep' = {
//   name: 'frontendRoleAssignment'
//   params: {
//     principalId: webIdentity.properties.principalId
//     roleDefinitionId: '4633458b-17de-408a-b874-0445c86b69e6' // Key Vault Secrets User
//   }
// }

// resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
//   name: storageAccountName
// } 



module app 'core/host/container-app-upsert.bicep' = {
  name: '${serviceName}-container-app-module'
  // dependsOn: [keyVaultRoleAssignment]
  params: {
    name: name
    location: location
    tags: union(tags, { 'azd-service-name': serviceName })
    identityName: webIdentity.name
    exists: exists
    containerAppsEnvironmentName: containerAppsEnvironmentName
    containerRegistryName: containerRegistryName
    // TODO: Optimize these values to be as less as possible:
    // In Azure Container Apps, the available combinations of CPU and memory are predefined. You can allocate CPU and memory resources as follows:

    // 0.25 vCPU: 0.5 GB, 1 GB, 1.5 GB, or 2 GB memory
    // 0.5 vCPU: 1 GB, 2 GB, or 3 GB memory
    // 1 vCPU: 2 GB, 3 GB, or 4 GB memory
    // 2 vCPU: 4 GB, 6 GB, or 8 GB memory
    // 4 vCPU: 8 GB, 12 GB, or 16 GB memory
    containerMemory: '4.0Gi'
    containerCpuCoreCount: '2'
    targetPort: 3000
    env: [
      {
        name: 'CLIENT_SIDE_BACKEND_HOST'
        value: backendApiUri
      }
      {
        name: 'SERVER_SIDE_BACKEND_HOST'
        value: backendApiUri
      }
    ]
  }
}

// resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = {
//   name: applicationInsightsName
// }

output SERVICE_WEB_IDENTITY_PRINCIPAL_ID string = webIdentity.properties.principalId
output SERVICE_WEB_NAME string = app.outputs.name
output SERVICE_WEB_URI string = app.outputs.uri
output SERVICE_WEB_IMAGE_NAME string = app.outputs.imageName

output uri string = app.outputs.uri
