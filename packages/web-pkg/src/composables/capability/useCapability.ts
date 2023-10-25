import { Store } from 'vuex'
import get from 'lodash-es/get'
import { computed, ComputedRef } from 'vue'
import { useStore } from '../store'
import {
  AppProviderCapability,
  LastModifiedFilterCapability,
  PasswordPolicyCapability
} from '@ownclouders/web-client/src/ocs/capabilities'

export const useCapability = <T>(
  store: Store<any>,
  name: string,
  defaultValue?: T
): ComputedRef<T> => {
  return computed((): T => {
    const value = get(store, `getters.capabilities.${name}`, defaultValue) as T
    if (value === undefined) {
      throw new Error('useCapability: capability is not defined and no default was provided')
    }
    return value
  })
}

const createCapabilityComposable = <T>(
  name: string,
  defaultValue?: T
): ((store?: Store<any>) => ComputedRef<T>) => {
  return (store?: Store<any>) => useCapability<T>(store || useStore(), name, defaultValue)
}

export const useCapabilityCoreSupportUrlSigning = createCapabilityComposable(
  'core.support-url-signing',
  false
)
export const useCapabilityCoreSSE = createCapabilityComposable('core.support-sse', false)
export const useCapabilityGraphPersonalDataExport = createCapabilityComposable(
  'graph.personal-data-export',
  false
)
export const useCapabilityFilesSharingQuickLinkDefaultRole = createCapabilityComposable(
  'files_sharing.quick_link.default_role',
  'viewer'
)
export const useCapabilityFilesSharingResharing = createCapabilityComposable(
  'files_sharing.resharing',
  true
)
export const useCapabilityFilesSharingResharingDefault = createCapabilityComposable(
  'files_sharing.resharing_default',
  true
)

export const useCapabilitySpacesEnabled = createCapabilityComposable('spaces.enabled', false)
export const useCapabilitySpacesMaxQuota = createCapabilityComposable('spaces.max_quota', 0)

export const useCapabilityProjectSpacesEnabled = createCapabilityComposable(
  'spaces.projects',
  false
)
export const useCapabilityShareJailEnabled = createCapabilityComposable('spaces.share_jail', false)

export const useCapabilityReadOnlyUserAttributes = createCapabilityComposable(
  'graph.users.read_only_attributes',
  []
)

export const useCapabilityCreateUsersDisabled = createCapabilityComposable(
  'graph.users.create_disabled',
  false
)

export const useCapabilityDeleteUsersDisabled = createCapabilityComposable(
  'graph.users.delete_disabled',
  false
)

export const useCapabilityChangeSelfPasswordDisabled = createCapabilityComposable(
  'graph.users.change_password_self_disabled',
  true
)

export const useCapabilityFilesFavorites = createCapabilityComposable('files.favorites', false)

export const useCapabilityFilesTusSupportHttpMethodOverride = createCapabilityComposable<boolean>(
  'files.tus_support.http_method_override',
  false
)
export const useCapabilityFilesTusSupportMaxChunkSize = createCapabilityComposable<number>(
  'files.tus_support.max_chunk_size',
  0
)
export const useCapabilityFilesTusExtension = createCapabilityComposable<string>(
  'files.tus_support.extension',
  ''
)
export const useCapabilityFilesPermanentDeletion = createCapabilityComposable(
  'files.permanent_deletion',
  true
)
export const useCapabilityFilesTags = createCapabilityComposable('files.tags', false)
export const useCapabilityPrivateLinks = createCapabilityComposable<boolean>(
  'files.privateLinks',
  false
)
export const useCapabilityFilesAppProviders = createCapabilityComposable<AppProviderCapability[]>(
  'files.app_providers',
  []
)
export const useCapabilityFilesFullTextSearch = createCapabilityComposable(
  'files.full_text_search',
  false
)
export const useCapabilityFilesSharingCanDenyAccess = createCapabilityComposable(
  'files_sharing.deny_access',
  false
)
export const useCapabilityFilesSharingCanRename = createCapabilityComposable(
  'files_sharing.can_rename',
  true
)
export const useCapabilityFilesSharingAllowCustomPermissions = createCapabilityComposable(
  'files_sharing.allow_custom',
  true
)
export const useCapabilityFilesSharingPublicCanEdit = createCapabilityComposable(
  'files_sharing.public.can_edit',
  false
)
export const useCapabilityFilesSharingPublicCanContribute = createCapabilityComposable(
  'files_sharing.public.can_contribute',
  true
)
export const useCapabilityFilesSharingPublicAlias = createCapabilityComposable(
  'files_sharing.public.alias',
  false
)
export const useCapabilityNotifications = createCapabilityComposable(
  'notifications.ocs-endpoints',
  []
)
export const useCapabilityPasswordPolicy = createCapabilityComposable<PasswordPolicyCapability>(
  'password_policy',
  {}
)

export const useCapabilitySearchModifiedDate =
  createCapabilityComposable<LastModifiedFilterCapability>('search.property.mtime', {})
