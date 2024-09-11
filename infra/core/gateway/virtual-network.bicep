// param vnetName string


// resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' existing = {
//   name: vnetName
// }


// resource gatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2023-11-01' = {
//   name: 'gateway'
//   parent: vnet
//   properties: {
//     addressPrefix: '10.0.8.0/24'
//     privateLinkServiceNetworkPolicies: 'Disabled'
//     serviceEndpoints: [
//       {
//         service: 'Microsoft.KeyVault'
//       }
//     ]
//   }
// }


// output subnetId string = gatewaySubnet.id
