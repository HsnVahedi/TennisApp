// @description('The name of the resource group')
// param resourceGroupName string

@description('Location for the Application Gateway')
param location string = resourceGroup().location

@description('Name for the Application Gateway')
param applicationGatewayName string

// @description('Name of the frontend container app')
// param frontendAppName string

@description('Subnet ID where Application Gateway will be deployed')
param appGatewaySubnetId string

@description('Frontend container app internal IP')
param frontendAppInternalIp string

@description('The public IP name for the Application Gateway')
param publicIpName string

@description('Name of the SSL certificate in Key Vault')
param sslCertificateName string

// @secure()
// @description('Key Vault secret ID containing the SSL certificate')
// param sslCertificateSecretId string

// @description('Log Analytics workspace ID for diagnostics')
// param logAnalyticsWorkspaceId string

param tags object = {}


resource sslCert 'Microsoft.KeyVault/vaults/certificates@2021-06-01-preview' = {
// resource sslCert 'Microsoft.KeyVault/vaults/certificates@2021-04-01-preview' = {
  name: '${sslCertificateName}-ssl-cert'
  location: location
  properties: {
    certificatePolicy: {
      keyProperties: {
        exportable: true
        keyType: 'RSA'
        keySize: 2048
        reuseKey: false
      }
      secretProperties: {
        contentType: 'application/x-pkcs12'
      }
      issuerParameters: {
        name: 'Self'
      }
      x509CertificateProperties: {
        subject: 'CN=${sslCertificateName}'
        validityInMonths: 12
        keyUsage: [
          'digitalSignature'
          'keyEncipherment'
        ]
        extendedKeyUsage: [
          'serverAuth'
        ]
      }
      lifetimeActions: [
        {
          trigger: {
            lifetimePercentage: 80
          }
          action: {
            actionType: 'AutoRenew'
          }
        }
      ]
    }
  }
}


resource publicIp 'Microsoft.Network/publicIPAddresses@2023-11-01' = {
  name: publicIpName
  location: location
  sku: {
    name: 'Standard'
  }
  zones: [
    '1'
  ]
  properties: {
    publicIPAllocationMethod: 'Static'
    publicIPAddressVersion: 'IPv4'
    dnsSettings: {
      domainNameLabel: toLower(applicationGatewayName)
    }
  }
}

resource appGateway 'Microsoft.Network/applicationGateways@2023-11-01' = {
  name: applicationGatewayName
  tags: tags
  location: location
  zones: [
    '1'
  ]
  properties: {
    sku: {
      tier: 'Standard_v2'
      capacity: 1
      name: 'Standard_v2'
    }
    gatewayIPConfigurations: [
      {
        name: 'appGatewayIpConfig'
        properties: {
          subnet: {
            id: appGatewaySubnetId
          }
        }
      }
    ]
    frontendIPConfigurations: [
      {
        name: 'appGatewayFrontendIp'
        properties: {
          publicIPAddress: {
            id: publicIp.id
          }
        }
      }
    ]
    frontendPorts: [
      {
        name: 'httpsPort'
        properties: {
          port: 443
        }
      }
    ]
    sslCertificates: [
      {
        name: sslCertificateName
        properties: {
          keyVaultSecretId: sslCert.properties.secretId
        }
      }
    ]
    backendAddressPools: [
      {
        name: 'backendPool'
        properties: {
          backendAddresses: [
            {
              ipAddress: frontendAppInternalIp
            }
          ]
        }
      }
    ]
    backendHttpSettingsCollection: [
      {
        name: 'httpSettings'
        properties: {
          port: 443
          protocol: 'Https'
          cookieBasedAffinity: 'Disabled'
          pickHostNameFromBackendAddress: false
          requestTimeout: 20
        }
      }
    ]
    httpListeners: [
      {
        name: 'httpsListener'
        properties: {
          frontendIPConfiguration: {
            id: resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', applicationGatewayName, 'appGatewayFrontendIp')
          }
          frontendPort: {
            id: resourceId('Microsoft.Network/applicationGateways/frontendPorts', applicationGatewayName, 'httpsPort')
          }
          protocol: 'Https'
          sslCertificate: {
            id: resourceId('Microsoft.Network/applicationGateways/sslCertificates', applicationGatewayName, sslCertificateName)
          }
        }
      }
    ]
    requestRoutingRules: [
      {
        name: 'rule1'
        properties: {
          ruleType: 'Basic'
          priority: 1
          httpListener: {
            id: resourceId('Microsoft.Network/applicationGateways/httpListeners', applicationGatewayName, 'httpsListener')
          }
          backendAddressPool: {
            id: resourceId('Microsoft.Network/applicationGateways/backendAddressPools', applicationGatewayName, 'backendPool')
          }
          backendHttpSettings: {
            id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', applicationGatewayName, 'httpSettings')
          }
        }
      }
    ]
    enableHttp2: true
  }
}

// resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2021-06-01' = {
//   name: logAnalyticsWorkspaceId
//   location: location
//   sku: {
//     name: 'PerGB2018'
//   }
//   retentionInDays: 30
// }

// resource diagnosticSetting 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
//   name: 'appGatewayDiag'
//   scope: appGateway
//   properties: {
//     workspaceId: logAnalytics.id
//     logs: [
//       {
//         category: 'ApplicationGatewayAccessLog'
//         enabled: true
//         retentionPolicy: {
//           enabled: true
//           days: 30
//         }
//       }
//       {
//         category: 'ApplicationGatewayPerformanceLog'
//         enabled: true
//         retentionPolicy: {
//           enabled: true
//           days: 30
//         }
//       }
//       {
//         category: 'ApplicationGatewayFirewallLog'
//         enabled: true
//         retentionPolicy: {
//           enabled: true
//           days: 30
//         }
//       }
//     ]
//   }
// }
