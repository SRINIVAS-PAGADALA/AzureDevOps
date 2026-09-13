using './mainVM.bicep'

param sa_name = 'azdevstorage12345'
param vmName = 'azdev-vm'
param adminUsername = 'azureadmin'
param adminPassword = readEnvironmentVariable('AZURE_VM_ADMIN_PASSWORD')
param location = 'eastus'
