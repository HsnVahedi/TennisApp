@description('The name of the App Gateway that will be deployed')
param appGatewayName string

@description('The name of the IP address that will be deployed')
param ipAddressName string

@description('The subnet ID that will be used for the App Gateway configuration')
param subnetId string

@description('The subnet ID of the Container App Environment that will be used for the Private Link service')
param envSubnetId string

@description('The FQDN of the Container App')
param containerAppFqdn string

// @description('The name of the Private Link Service')
// param privateLinkServiceName string

@description('The location where the App Gateway will be deployed')
param location string

@description('The tags that will be applied to the App Gateway')
param tags object



// resource publicIp 'Microsoft.Network/publicIPAddresses@2023-11-01' = {
//   name: ipAddressName
//   location: location
//   sku: {
//     name: 'Standard'
//   }
//   zones: [
//     '1'
//   ]
//   properties: {
//     publicIPAddressVersion: 'IPv4'
//     publicIPAllocationMethod: 'Static'
//   }
// }
