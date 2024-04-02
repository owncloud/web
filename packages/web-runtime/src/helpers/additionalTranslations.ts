// just a dummy function to trick gettext tools
function $gettext(msg: string): string {
  return msg
}

export const additionalTranslations = {
  admin: $gettext('Admin'),
  spaceAdmin: $gettext('Space Admin'),
  user: $gettext('User'),
  guest: $gettext('Guest'),
  activities: $gettext('Activities'),
  noActivities: $gettext('No activities'),
  virusDetectedActivity: $gettext(
    'Virus "%{description}" detected. Please contact your administrator for more information.'
  ),
  virusScan: $gettext('Scan for viruses'),
  requestErrorDeniedByPolicy: $gettext('Operation denied due to security policies'),
  ocsErrorPasswordOnBannedList: $gettext(
    'Unfortunately, your password is commonly used. please pick a harder-to-guess password for your safety'
  ),
  openAppFromSmartBanner: $gettext('OPEN'),
  shareRoleDescriptionViewer: $gettext('View and download.'),
  shareRoleDescriptionEditor: $gettext('View, download, upload, edit, add and delete.'),
  shareRoleDescriptionFileEditor: $gettext('View, download and edit.'),
  shareRoleDescriptionUploader: $gettext('View, download and upload.'),
  shareRoleDescriptionManager: $gettext(
    'View, download, upload, edit, add, delete and manage members.'
  ),
  shareRoleLabelViewer: $gettext('Can view'),
  shareRoleLabelEditor: $gettext('Can edit'),
  shareRoleLabelUploader: $gettext('Can upload'),
  shareRoleLabelManager: $gettext('Can manage')
}
