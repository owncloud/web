// just a dummy function to trick gettext tools
function $gettext(msg: string): string {
  return msg
}

export const additionalTranslations = {
  fileInProcessing: $gettext(
    'This file is currently being processed and is not yet available for use. Please try again shortly.'
  ),
  activities: $gettext('Activities'),
  noActivities: $gettext('No activities'),
  virusDetectedActivity: $gettext(
    'Virus "%{description}" detected. Please contact your administrator for more information.'
  ),
  tagsUpsert: $gettext('Add or edit tags'),
  virusScan: $gettext('Scan for viruses')
}
