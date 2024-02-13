import { mock } from 'vitest-mock-extended'
import { ExtensionPreferenceItem, useExtensionPreferencesStore } from '../../../web-pkg'

export const useExtensionPreferencesStoreMock = (
  options: Partial<ReturnType<typeof useExtensionPreferencesStore>> = {}
): ReturnType<typeof useExtensionPreferencesStore> => {
  return {
    ...mock<ReturnType<typeof useExtensionPreferencesStore>>(),
    extractDefaultExtensionIds: () => [],
    getExtensionPreference: () => mock<ExtensionPreferenceItem>(),
    setSelectedExtensionIds: () => {},
    ...options
  }
}
