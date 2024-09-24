// param location string
// param tags object
// param defaultDomain string
// param envStaticIp string
// param vnetName string
// param vnetId string


// resource gateWayPrivateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
//   name: defaultDomain
//   location: 'global' 
//   tags: tags
// }

// resource starRecordSet 'Microsoft.Network/privateDnsZones/A@2020-06-01' = {
//   name: '*'
//   parent: gateWayPrivateDnsZone
//   properties: {
//     ttl: 3600
//     aRecords: [
//       { 
//         ipv4Address: envStaticIp
//       }
//     ]
//   }
// }

// resource atRecordSet 'Microsoft.Network/privateDnsZones/A@2020-06-01' = {
//   name: '@'
//   parent: gateWayPrivateDnsZone
//   properties: {
//     ttl: 3600
//     aRecords: [
//       { 
//         ipv4Address: envStaticIp
//       }
//     ]
//   }
// }

// resource privateDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
//   name: '${vnetName}-pdns-link'
//   parent: gateWayPrivateDnsZone
//   tags: tags
//   location: 'global'
//   // location: location
//   properties: {
//     registrationEnabled: false
//     virtualNetwork: {
//       id: vnetId
//     }
//   }
// }
