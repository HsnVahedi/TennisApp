param location string
param customDomain string
param containerAppsEnvironmentName string

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
}

output managedCertId string = managedCert.id
