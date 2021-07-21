# Steps that this installer will perform
$installedRegistry = no
$installedCertificate = no
$installedPublicKey = no

# Manually add/change registry entries
# https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_registry_provider?view=powershell-7.1
$path = 'HKLM:\SOFTWARE\WOW6432Node\EACom\AuthAuth'

New-Item -Path $path -Force | Out-Null

Set-ItemProperty -Path "$path\foo" -Name 'postInstallExecTimeout' -Value 30 -Force
Set-ItemProperty -Path $path -Name 'ConfigApplyAllSettingsForModels' -Value ''
Set-ItemProperty -Path $path -Name 'ConfigApplyAllSettingsForQueueNames' -Value ''
Set-ItemProperty -Path $path -Name 'ConfigApplyPreferencesOnlyForQueueNames' -Value ''
Set-ItemProperty -Path $path -Name 'OURestrictFailureCaption' -Value ''
Set-ItemProperty -Path $path -Name 'OURestrictFailureText' -Value ''

# Import a certificate
# https://docs.microsoft.com/en-us/powershell/module/pki/import-certificate?view=windowsserver2019-ps
Import-Certificate -FilePath "$env:USERPROFILE\Downloads\mcouniverse.crt" -CertStoreLocation Cert:\CurrentUser\Root

# Create a dialog box
# https://docs.microsoft.com/en-us/dotnet/api/system.windows.messagebox?view=net-5.0
# Line break reference: https://social.technet.microsoft.com/Forums/lync/en-US/87f0a802-c7af-4517-85e1-be122c17ddb7/powershell-gui-popup-box-line-break
Add-Type -AssemblyName PresentationFramework
$msgBoxInput = [System.Windows.MessageBox]::Show("Would you like to install the SSL Root Certificate?`n(Choosing `"no`" will exit)",'Game  input','YesNo','Information')

switch  ($msgBoxInput) {

  'Yes' {

  ## Do something 

  }

  'No' {

  ## Do something

  }

