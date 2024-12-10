import { computed, ref, Ref } from 'vue'
import {
  getSettingsDefaultValue,
  SETTINGS_EMAIL_NOTIFICATION_BUNDLE_IDS,
  SETTINGS_NOTIFICATION_BUNDLE_IDS,
  SettingsBundle,
  SettingsNotificationBundle,
  SettingsValue
} from '../../helpers/settings'

export const useNotificationsSettings = (bundle: Ref<SettingsBundle>) => {
  const values = ref({
    [SettingsNotificationBundle.ShareCreated]: { mail: false, inapp: false },
    [SettingsNotificationBundle.ShareRemoved]: { mail: false, inapp: false },
    [SettingsNotificationBundle.ShareExpired]: { mail: false, inapp: false },
    [SettingsNotificationBundle.SpaceShared]: { mail: false, inapp: false },
    [SettingsNotificationBundle.SpaceUnshared]: { mail: false, inapp: false },
    [SettingsNotificationBundle.SpaceMembershipExpired]: { mail: false, inapp: false },
    [SettingsNotificationBundle.SpaceDisabled]: { mail: false, inapp: false },
    [SettingsNotificationBundle.SpaceDeleted]: { mail: false, inapp: false },
    [SettingsNotificationBundle.PostprocessingStepFinished]: { mail: false, inapp: false },
    [SettingsNotificationBundle.ScienceMeshInviteTokenGenerated]: { mail: false, inapp: false }
  })

  const defaultValues = computed(() => {
    if (!bundle.value) {
      return {}
    }

    return bundle.value.settings.reduce((acc, curr) => {
      if (!SETTINGS_NOTIFICATION_BUNDLE_IDS.includes(curr.id)) {
        return acc
      }

      acc[curr.id] = getSettingsDefaultValue(curr)

      return acc
    }, {})
  })

  const options = computed<SettingsBundle['settings']>(() => {
    if (!bundle.value) {
      return []
    }

    return bundle.value.settings.filter(({ id }) => SETTINGS_NOTIFICATION_BUNDLE_IDS.includes(id))
  })

  const emailOptions = computed<SettingsBundle['settings']>(() => {
    if (!bundle.value) {
      return []
    }

    return bundle.value.settings.filter(({ id }) =>
      SETTINGS_EMAIL_NOTIFICATION_BUNDLE_IDS.includes(id)
    )
  })

  const updateDefaultValues = (values: SettingsValue[], bundle: SettingsBundle) => {
    // TODO: process and return values
  }

  return { values, options, emailOptions, updateDefaultValues }
}
