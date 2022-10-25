// just a dummy function to trick gettext tools
function $gettext(msg: string): string {
  return msg
}

export const additionalTranslations = {
  fileNotAvailable: $gettext('The requested file is not yet available, please try again later.'),
  activities: $gettext('Activities'),
  noActivities: $gettext('No activities'),
  virusDetectedActivity: $gettext(
    'Virus "%{description}" detected. Please contact your administrator for more information.'
  )
}
