metadata description = 'Creates a container app in an Azure Container App environment.'
param name string
param location string = resourceGroup().location
param tags object = {}
@description('Custom domain name')
param customDomain string

@description('Allowed origins')
param allowedOrigins array = []

@description('Name of the environment for container apps')
param containerAppsEnvironmentName string

@description('CPU cores allocated to a single container instance, e.g., 0.5')
param containerCpuCoreCount string = '0.5'

@description('The maximum number of replicas to run. Must be at least 1.')
@minValue(1)
param containerMaxReplicas int = 10

@description('Memory allocated to a single container instance, e.g., 1Gi')
param containerMemory string = '1.0Gi'

@description('The minimum number of replicas to run. Must be at least 1.')
param containerMinReplicas int = 1

@description('The name of the container')
param containerName string = 'main'

@description('The name of the container registry')
param containerRegistryName string = ''

@description('Hostname suffix for container registry. Set when deploying to sovereign clouds')
param containerRegistryHostSuffix string = 'azurecr.io'

// Service options
@description('PostgreSQL service ID')
param postgresServiceId string = ''

@description('The protocol used by Dapr to connect to the app, e.g., http or grpc')
@allowed([ 'http', 'grpc' ])
param daprAppProtocol string = 'http'

@description('The Dapr app ID')
param daprAppId string = containerName

@description('The keyvault identities required for the container')
@secure()
param keyvaultIdentities object = {}

@description('Enable Dapr')
param daprEnabled bool = false

@description('The environment variables for the container')
param env array = []

@description('Specifies if the resource ingress is exposed externally')
param external bool = true

@description('The name of the user-assigned identity')
param identityName string = ''

@description('The type of identity for the resource')
@allowed([ 'None', 'SystemAssigned', 'UserAssigned' ])
param identityType string = 'None'

@description('The name of the container image')
param imageName string = ''

@description('Specifies if Ingress is enabled for the container app')
param ingressEnabled bool = true

param revisionMode string = 'Single'

// @description('The secrets required for the container')
// @secure()
// param secrets object = {}

// @description('The keyvault identities required for the container')
// @secure()
// param keyvaultIdentities object = {}

@description('The service binds associated with the container')
param serviceBinds array = []

@description('The name of the container apps add-on to use. e.g. redis')
param serviceType string = ''

@description('The target port for the container')
param targetPort int = 80

@description('The secrets required for the container')
@secure()
param secrets object = {}

@description('The container registry access name')
param containerRegistryAccessName string

resource userIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = if (!empty(identityName)) {
  name: identityName
}


resource deploymentScriptIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: 'deploymentScriptIdentity'
  location: location
}




resource deploymentScriptRoleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(resourceGroup().id, deploymentScriptIdentity.name, 'container-app-contributor-role-assignment')
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c') // Contributor Role ID
    principalId: deploymentScriptIdentity.properties.principalId
  }
}



// var keyvalueSecrets = [for secret in items(secrets): {
//   name: secret.key
//   value: secret.value
// }]

// var keyvaultIdentitySecrets = [for secret in items(keyvaultIdentities): {
//   name: secret.key
//   keyVaultUrl: secret.value.keyVaultUrl
//   identity: secret.value.identity
// }] 

// module containerRegistryAccess '../security/registry-access.bicep' = if (usePrivateRegistry) {
//   name: containerRegistryAccessName
//   params: {
//     containerRegistryName: containerRegistryName
//     principalId: usePrivateRegistry ? userIdentity.properties.principalId : ''
//   }
// }

// Private registry support requires both an ACR name and a User Assigned managed identity
var usePrivateRegistry = !empty(identityName) && !empty(containerRegistryName)

// Automatically set to `UserAssigned` when an `identityName` has been set
var normalizedIdentityType = !empty(identityName) ? 'UserAssigned' : identityType

var keyvalueSecrets = [for secret in items(secrets): {
  name: secret.key
  value: secret.value
}]

var keyvaultIdentitySecrets = [for secret in items(keyvaultIdentities): {
  name: secret.key
  keyVaultUrl: secret.value.keyVaultUrl
  identity: secret.value.identity
}]






// resource app 'Microsoft.App/containerApps@2023-05-02-preview' = {
//   name: name
//   location: location
//   tags: tags
//   // It is critical that the identity is granted ACR pull access before the app is created
//   // otherwise the container app will throw a provision error
//   // This also forces us to use an user assigned managed identity since there would no way to 
//   // provide the system assigned identity with the ACR pull access before the app is created
//   // dependsOn: usePrivateRegistry ? [ containerRegistryAccess ] : []
//   identity: {
//     type: normalizedIdentityType
//     userAssignedIdentities: !empty(identityName) && normalizedIdentityType == 'UserAssigned' ? { '${userIdentity.id}': {} } : null
//   }
//   properties: {
//     managedEnvironmentId: containerAppsEnvironment.id
//     configuration: {
//       maxInactiveRevisions: 0
//       activeRevisionsMode: revisionMode
//       ingress: ingressEnabled ? {
//         external: external
//         targetPort: targetPort
//         transport: 'auto'
//         corsPolicy: {
//           allowedOrigins: union([ 'https://portal.azure.com', 'https://ms.portal.azure.com' ], allowedOrigins)
//         }
//         customDomains: [
//           {
//             name: customDomain
//             certificateId: '' 
//           }
//         ]

//         // customDomains: [
//         //   {
//         //     name: certificate.name 
//         //     // certificateId: '${certificate.id}-art-of-t-240909021124'
//         //     certificateId: certificate.id
//         //     bindingType: 'SniEnabled'
//         //   }
//         //   // {
//         //   //   name: managedEnvironmentManagedCertificate.properties.subjectName
//         //   //   certificateId: managedEnvironmentManagedCertificate.id
//         //   //   bindingType: 'SniEnabled'
//         //   // }
//         // ]
//       } : null
//       dapr: daprEnabled ? {
//         enabled: true
//         appId: daprAppId
//         appProtocol: daprAppProtocol
//         appPort: ingressEnabled ? targetPort : 0
//       } : { enabled: false }
//       secrets: concat(keyvalueSecrets, keyvaultIdentitySecrets)
//       service: !empty(serviceType) ? { type: serviceType } : null
//       registries: usePrivateRegistry ? [
//         {
//           server: '${containerRegistryName}.${containerRegistryHostSuffix}'
//           identity: userIdentity.id
//         }
//       ] : []
//     }
//     template: {
//       serviceBinds: !empty(serviceBinds) ? serviceBinds : null
//       containers: [
//         {
//           image: !empty(imageName) ? imageName : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
//           name: containerName
//           env: env
//           resources: {
//             cpu: json(containerCpuCoreCount)
//             memory: containerMemory
//           }
//         }
//       ]
//       scale: {
//         minReplicas: containerMinReplicas
//         maxReplicas: containerMaxReplicas
//       }
//     }
//   }
// }


// Deploy the container app without custom domains
module containerAppModule '../frontend/containerApp.bicep' = {
  name: 'deployContainerApp'
  params: {
    name: name
    location: location
    tags: tags
    identityName: identityName
    normalizedIdentityType: normalizedIdentityType
    // userIdentity: userIdentity
    containerAppsEnvironmentId: containerAppsEnvironment.id
    allowedOrigins: allowedOrigins
    containerCpuCoreCount: containerCpuCoreCount
    containerMaxReplicas: containerMaxReplicas
    containerMemory: containerMemory
    containerMinReplicas: containerMinReplicas
    containerName: containerName
    containerRegistryName: containerRegistryName
    containerRegistryHostSuffix: containerRegistryHostSuffix
    daprAppId: daprAppId
    daprAppProtocol: daprAppProtocol
    daprEnabled: daprEnabled
    env: env
    external: external
    imageName: imageName
    ingressEnabled: ingressEnabled
    keyvalueSecrets: keyvalueSecrets
    keyvaultIdentitySecrets: keyvaultIdentitySecrets
    revisionMode: revisionMode
    serviceType: serviceType
    targetPort: targetPort
    usePrivateRegistry: usePrivateRegistry
  }
}

var deploymentScriptIdentityId = deploymentScriptIdentity.id

// resource mapCustomDomainScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
//   name: 'mapCustomDomainScript'
//   location: location
//   kind: 'AzureCLI'
//   identity: {
//     type: 'UserAssigned'
//     userAssignedIdentities: {
//       '${deploymentScriptIdentityId}': {}
//     }
//   }
//   properties: {
//     azCliVersion: '2.63.0' // Updated to a supported version
//     scriptContent: format('''
//       az extension add --upgrade --name containerapp
//       az containerapp hostname bind --resource-group "{0}" --name "{1}" --hostname "{2}"
//     ''', resourceGroup().name, name, customDomain)
//     timeout: 'PT30M'
//     cleanupPreference: 'OnSuccess'
//     retentionInterval: 'P1D'
//     authentication: {
//       managedIdentity: {
//         clientId: deploymentScriptIdentity.properties.clientId
//       }
//     }
//     forceUpdateTag: guid(resourceGroup().id, 'mapCustomDomainScript')
//   }
//   dependsOn: [
//     containerAppModule
//     deploymentScriptRoleAssignment
//   ]
// }

resource mapCustomDomainScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'mapCustomDomainScript'
  location: location
  kind: 'AzureCLI'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${deploymentScriptIdentity.id}': {}
    }
  }
  properties: {
    azCliVersion: '2.63.0' // Updated to a supported version
    scriptContent: format('''
      az extension add --upgrade --name containerapp --allow-preview true
      az containerapp hostname bind --resource-group "{0}" --name "{1}" --hostname "{2}" --environment "{3}"
    ''', resourceGroup().name, name, customDomain, containerAppsEnvironmentName)
    timeout: 'PT30M'
    cleanupPreference: 'OnSuccess'
    retentionInterval: 'P1D'
    authentication: {
      managedIdentity: {
        clientId: deploymentScriptIdentity.properties.clientId
      }
    }
    forceUpdateTag: guid(resourceGroup().id, 'mapCustomDomainScript')
  }
  dependsOn: [
    containerAppModule
    deploymentScriptRoleAssignment
  ]
}


// resource updateAppScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
//   name: 'updateAppWithCert'
//   kind: 'AzureCLI'
//   location: location
//   identity: {
//     type: 'UserAssigned'
//     userAssignedIdentities: {
//       '${deploymentScriptIdentityId}': {}
//     }
//   }
//   properties: {
//     azCliVersion: '2.63.0' // Updated to a supported version
//     scriptContent: format('''
//       az extension add --upgrade --name containerapp
//       az containerapp hostname bind --resource-group "{0}" --name "{1}" --hostname "{2}" --certificate-id "{3}"
//     ''', resourceGroup().name, name, customDomain, managedCertModule.outputs.managedCertId)
//     timeout: 'PT30M'
//     cleanupPreference: 'OnSuccess'
//     retentionInterval: 'P1D'
//     authentication: {
//       managedIdentity: {
//         clientId: deploymentScriptIdentity.properties.clientId
//       }
//     }
//     forceUpdateTag: guid(resourceGroup().id, 'updateAppWithCert')
//   }
//   dependsOn: [
//     managedCertModule
//     deploymentScriptRoleAssignment
//   ]
// }

resource updateAppScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'updateAppWithCert'
  kind: 'AzureCLI'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${deploymentScriptIdentity.id}': {}
    }
  }
  properties: {
    azCliVersion: '2.63.0' // Updated to a supported version
    scriptContent: format('''
      az extension add --upgrade --name containerapp --allow-preview true
      az containerapp hostname bind --resource-group "{0}" --name "{1}" --hostname "{2}" --certificate-id "{3}" --environment "{4}"
    ''', resourceGroup().name, name, customDomain, managedCertModule.outputs.managedCertId, containerAppsEnvironmentName)
    timeout: 'PT30M'
    cleanupPreference: 'OnSuccess'
    retentionInterval: 'P1D'
    authentication: {
      managedIdentity: {
        clientId: deploymentScriptIdentity.properties.clientId
      }
    }
    forceUpdateTag: guid(resourceGroup().id, 'updateAppWithCert')
  }
  dependsOn: [
    managedCertModule
    deploymentScriptRoleAssignment
  ]
}





// Create the managed certificate
module managedCertModule '../frontend/managedCert.bicep' = {
  name: 'deployManagedCert'
  params: {
    location: location
    customDomain: customDomain
    containerAppsEnvironmentName: containerAppsEnvironmentName
  }
  dependsOn: [
    mapCustomDomainScript
  ]
}



resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerAppsEnvironmentName
}

// resource managedCert 'Microsoft.App/managedEnvironments/managedCertificates@2023-05-01' = {
//   name: '${uniqueString(containerAppsEnvironment.id, customDomain)}-cert'
//   parent: containerAppsEnvironment
//   location: location
//   properties: {
//     subjectName: customDomain
//     domainControlValidation: 'TXT'
//   }
//   dependsOn: [
//     app
//   ]
// }

// resource app 'Microsoft.App/containerApps@2023-05-02-preview' existing = {
//   name: name
// }



output identityPrincipalId string = normalizedIdentityType == 'None' ? '' : (empty(identityName) ? containerAppModule.outputs.identityPrincipalId : userIdentity.properties.principalId)
output uri string = ingressEnabled ? 'https://${containerAppModule.outputs.fqdn}' : ''
output fqdn string = containerAppModule.outputs.fqdn
output defaultDomain string = containerAppsEnvironment.properties.defaultDomain
output staticIp string = containerAppsEnvironment.properties.staticIp
// output identityPrincipalId string = normalizedIdentityType == 'None' ? '' : (empty(identityName) ? app.identity.principalId : userIdentity.properties.principalId)
output imageName string = imageName
output name string = containerAppModule.outputs.appName
output serviceBind object = !empty(serviceType) ? { serviceId: containerAppModule.outputs.appId, name: name } : {}
// output uri string = ingressEnabled ? 'https://${app.properties.configuration.ingress.fqdn}' : ''
// output fqdn string = app.properties.configuration.ingress.fqdn
