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


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Custom Domain
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// resource customDomain 'Microsoft.Web/domains@2022-03-01' = {
//   name: 'artoftennis.ai'
//   location: resourceGroup().location
//   properties: {
//     managedDomain: true
//   }
// }
// resource certificate 'Microsoft.Web/certificates@2021-02-01' existing = {
//   name: 'artoftennis.ai'
// }

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Custom Domain
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

resource app 'Microsoft.App/containerApps@2023-05-02-preview' = {
  name: name
  location: location
  tags: tags
  // It is critical that the identity is granted ACR pull access before the app is created
  // otherwise the container app will throw a provision error
  // This also forces us to use an user assigned managed identity since there would no way to 
  // provide the system assigned identity with the ACR pull access before the app is created
  // dependsOn: usePrivateRegistry ? [ containerRegistryAccess ] : []
  identity: {
    type: normalizedIdentityType
    userAssignedIdentities: !empty(identityName) && normalizedIdentityType == 'UserAssigned' ? { '${userIdentity.id}': {} } : null
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      maxInactiveRevisions: 0
      activeRevisionsMode: revisionMode
      ingress: ingressEnabled ? {
        external: external
        targetPort: targetPort
        transport: 'auto'
        corsPolicy: {
          allowedOrigins: union([ 'https://portal.azure.com', 'https://ms.portal.azure.com' ], allowedOrigins)
        }
        customDomains: [
          {
            name: customDomain
            // certificateId: managedCert.id
          }
        ]
        // customDomains: [
        //   {
        //     name: certificate.name 
        //     // certificateId: '${certificate.id}-art-of-t-240909021124'
        //     certificateId: certificate.id
        //     bindingType: 'SniEnabled'
        //   }
        //   // {
        //   //   name: managedEnvironmentManagedCertificate.properties.subjectName
        //   //   certificateId: managedEnvironmentManagedCertificate.id
        //   //   bindingType: 'SniEnabled'
        //   // }
        // ]
      } : null
      dapr: daprEnabled ? {
        enabled: true
        appId: daprAppId
        appProtocol: daprAppProtocol
        appPort: ingressEnabled ? targetPort : 0
      } : { enabled: false }
      secrets: concat(keyvalueSecrets, keyvaultIdentitySecrets)
      service: !empty(serviceType) ? { type: serviceType } : null
      registries: usePrivateRegistry ? [
        {
          server: '${containerRegistryName}.${containerRegistryHostSuffix}'
          identity: userIdentity.id
        }
      ] : []
    }
    template: {
      serviceBinds: !empty(serviceBinds) ? serviceBinds : null
      containers: [
        {
          image: !empty(imageName) ? imageName : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          name: containerName
          env: env
          resources: {
            cpu: json(containerCpuCoreCount)
            memory: containerMemory
          }
        }
      ]
      scale: {
        minReplicas: containerMinReplicas
        maxReplicas: containerMaxReplicas
      }
    }
  }
}


resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerAppsEnvironmentName
}

resource managedCert 'Microsoft.App/managedEnvironments/managedCertificates@2023-05-01' = {
  name: '${uniqueString(containerAppsEnvironment.id, customDomain)}-cert'
  parent: containerAppsEnvironment
  location: location
  properties: {
    subjectName: customDomain
    domainControlValidation: 'TXT'
  }
  dependsOn: [
    app
  ]
}




// resource managedEnvironmentManagedCertificate 'Microsoft.App/managedEnvironments/managedCertificates@2022-11-01-preview' = {
//   parent: containerAppsEnvironment
//   name: '${containerAppsEnvironment.name}-certificate'
//   location: location
//   tags: tags
//   properties: {
//     subjectName: 'artoftennis.ai' 
//     domainControlValidation: 'CNAME'
//   }
// }

output defaultDomain string = containerAppsEnvironment.properties.defaultDomain
output staticIp string = containerAppsEnvironment.properties.staticIp
output identityPrincipalId string = normalizedIdentityType == 'None' ? '' : (empty(identityName) ? app.identity.principalId : userIdentity.properties.principalId)
output imageName string = imageName
output name string = app.name
output serviceBind object = !empty(serviceType) ? { serviceId: app.id, name: name } : {}
output uri string = ingressEnabled ? 'https://${app.properties.configuration.ingress.fqdn}' : ''
output fqdn string = app.properties.configuration.ingress.fqdn
