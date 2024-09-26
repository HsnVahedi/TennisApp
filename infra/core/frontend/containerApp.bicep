param name string
param location string
param tags object
param identityName string
param normalizedIdentityType string
// param userIdentity object
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



resource artoftennisManagedCertificate 'Microsoft.App/managedEnvironments/managedCertificates@2024-03-01' existing = {
  // TODO: move this to github secrets
  name: 'aotweb-bwglio35ect2a-frontend-containerapps-env/artoftennis.us-aotweb-b-240925071323'
  // name: 'aotweb-bwglio35ect2a-frontend-containerapps-env/tennishub.pro-aotweb-b-240926192713'
  // name: 'artoftennis.us-aotweb-b-240925071323'
}

resource tennishubManagedCertificate 'Microsoft.App/managedEnvironments/managedCertificates@2024-03-01' existing = {
  // TODO: move this to github secrets
  // name: 'aotweb-bwglio35ect2a-frontend-containerapps-env/artoftennis.us-aotweb-b-240925071323'
  name: 'aotweb-bwglio35ect2a-frontend-containerapps-env/tennishub.pro-aotweb-b-240926192713'
  // name: 'artoftennis.us-aotweb-b-240925071323'
}


resource app 'Microsoft.App/containerApps@2023-05-02-preview' = {
  name: name
  location: location
  tags: tags
  // identity: {
  //   type: normalizedIdentityType
  //   userAssignedIdentities: !empty(identityName) && normalizedIdentityType == 'UserAssigned' ? {
  //     '${userIdentity.id}': {}
  //   } : null
  // }
  identity: {
    type: normalizedIdentityType
    userAssignedIdentities: !empty(identityName) && normalizedIdentityType == 'UserAssigned' ? {
      '${resourceId('Microsoft.ManagedIdentity/userAssignedIdentities', identityName)}': {}
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
        customDomains: [
          {
            name: 'artoftennis.us'
            bindingType: 'SniEnabled'
            certificateId: artoftennisManagedCertificate.id 
          }
          {
            name: 'tennishub.pro'
            bindingType: 'SniEnabled'
            certificateId: tennishubManagedCertificate.id 
          }
        ]
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
          // identity: userIdentity.id
          identity: resourceId('Microsoft.ManagedIdentity/userAssignedIdentities', identityName)
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

output identityPrincipalId string = normalizedIdentityType == 'UserAssigned' ? app.identity.userAssignedIdentities[resourceId('Microsoft.ManagedIdentity/userAssignedIdentities', identityName)].principalId : app.identity.principalId
output appId string = app.id
output fqdn string = app.properties.configuration.ingress.fqdn
output appName string = app.name
