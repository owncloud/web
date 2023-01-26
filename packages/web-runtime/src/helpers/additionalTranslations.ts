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
  virusScan: $gettext('Scan for viruses')
}
