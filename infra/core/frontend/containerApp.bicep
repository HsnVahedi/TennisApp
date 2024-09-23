param name string
param location string
param tags object
param identityName string
param normalizedIdentityType string
param userIdentity object
param containerAppsEnvironmentId string
param revisionMode string
param ingressEnabled bool
param external bool
param targetPort int
param allowedOrigins array
param daprEnabled bool
param daprAppId string
param daprAppProtocol string
param env array
param containerCpuCoreCount string
param containerMemory string
param containerMinReplicas int
param containerMaxReplicas int
param containerName string
param imageName string
param keyvalueSecrets array
param keyvaultIdentitySecrets array
param serviceType string
param usePrivateRegistry bool
param containerRegistryName string
param containerRegistryHostSuffix string

resource app 'Microsoft.App/containerApps@2023-05-02-preview' = {
  name: name
  location: location
  tags: tags
  identity: {
    type: normalizedIdentityType
    userAssignedIdentities: !empty(identityName) && normalizedIdentityType == 'UserAssigned' ? {
      '${userIdentity.id}': {}
    } : null
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironmentId
    configuration: {
      maxInactiveRevisions: 0
      activeRevisionsMode: revisionMode
      ingress: ingressEnabled ? {
        external: external
        targetPort: targetPort
        transport: 'auto'
        corsPolicy: {
          allowedOrigins: union([
            'https://portal.azure.com'
            'https://ms.portal.azure.com'
          ], allowedOrigins)
        }
        // No customDomains here
      } : null
      dapr: daprEnabled ? {
        enabled: true
        appId: daprAppId
        appProtocol: daprAppProtocol
        appPort: ingressEnabled ? targetPort : 0
      } : {
        enabled: false
      }
      secrets: concat(keyvalueSecrets, keyvaultIdentitySecrets)
      service: !empty(serviceType) ? {
        type: serviceType
      } : null
      registries: usePrivateRegistry ? [
        {
          server: '${containerRegistryName}.${containerRegistryHostSuffix}'
          identity: userIdentity.id
        }
      ] : []
    }
    template: {
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

output appId string = app.id
