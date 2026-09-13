// targetScope = 'subscription'
targetScope = 'resourceGroup'

// param resource_group_name string
// param resource_group_location string
param sa_name string

@description ('The sku of the storage account')
@allowed ([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
  'Standard_ZRS'
  'Premium_LRS'
  'Premium_ZRS'
])
param sa_sku string = 'Standard_LRS'

@description ('The kind of the storage account')
@allowed ([
  'Storage'
  'StorageV2'
  'BlobStorage'
  'FileStorage'
  'BlockBlobStorage'
])
param sa_kind string = 'StorageV2'

// resource resourceGroup 'Microsoft.Resources/resourceGroups@2025-04-01' = {
//   name : resource_group_name
//   location : resource_group_location
// }

resource storageAccount 'Microsoft.Storage/storageAccounts@2026-04-01' = {
  name : sa_name
  location : resourceGroup().location
  sku : {
    name : sa_sku
  }
  kind : sa_kind
  // dependsOn : [
  //   resourceGroup
  // ]
}
