import { computed, unref } from 'vue'
import { useAbility } from '../ability'
import { useCapabilityStore } from '../piniaStores'
import { SharingLinkType } from '@ownclouders/web-client/graph/generated'
import { useGettext } from 'vue3-gettext'
import { ShareRole } from '@ownclouders/web-client'

export const useLinkTypes = () => {
  const { $gettext } = useGettext()
  const capabilityStore = useCapabilityStore()
  const ability = useAbility()

  const canCreatePublicLinks = computed(() => ability.can('create-all', 'PublicLink'))

  const defaultLinkType = computed<SharingLinkType>(() => SharingLinkType.View)

  const isPasswordEnforcedForLinkType = (type: SharingLinkType) => {
    if (type === SharingLinkType.View) {
      return capabilityStore.sharingPublicPasswordEnforcedFor.read_only
    }
    if (type === SharingLinkType.Upload) {
      return capabilityStore.sharingPublicPasswordEnforcedFor.upload_only
    }
    if (type === SharingLinkType.CreateOnly) {
      return capabilityStore.sharingPublicPasswordEnforcedFor.read_write
    }
    if (type === SharingLinkType.Edit) {
      return capabilityStore.sharingPublicPasswordEnforcedFor.read_write_delete
    }
    return false
  }

  const getAvailableLinkTypes = ({ isFolder }: { isFolder: boolean }): SharingLinkType[] => {
    if (!unref(canCreatePublicLinks)) {
      return []
    }

    if (isFolder) {
      return [
        SharingLinkType.View,
        SharingLinkType.Upload,
        SharingLinkType.Edit,
        SharingLinkType.CreateOnly
      ]
    }

    return [SharingLinkType.View, SharingLinkType.Edit]
  }

  // links don't have roles in graph API, hence we need to define them here
  const linkShareRoles = [
    {
      id: SharingLinkType.Internal,
      displayName: $gettext('Invited people'),
      label: $gettext('Only for invited people'),
      description: $gettext('Link works only for invited people. Login is required.'),
      icon: 'user'
    },
    {
      id: SharingLinkType.View,
      displayName: $gettext('Can view'),
      label: $gettext('Anyone with the link can view'),
      description: $gettext('Anyone with the link can view and download.'),
      icon: 'eye'
    },
    {
      id: SharingLinkType.Upload,
      displayName: $gettext('Can upload'),
      label: $gettext('Anyone with the link can upload'),
      description: $gettext('Anyone with the link can view, download and upload.'),
      icon: 'upload'
    },
    {
      id: SharingLinkType.Edit,
      displayName: $gettext('Can edit'),
      label: $gettext('Anyone with the link can edit'),
      description: $gettext('Anyone with the link can view, download and edit.'),
      icon: 'pencil'
    },
    {
      id: SharingLinkType.CreateOnly,
      displayName: $gettext('Secret File Drop'),
      label: $gettext('Secret File Drop'),
      description: $gettext(
        'Anyone with the link can only upload, existing content is not revealed.'
      ),
      icon: 'inbox-unarchive'
    }
  ] satisfies ShareRole[]

  const getLinkRoleByType = (type: SharingLinkType): ShareRole => {
    return linkShareRoles.find(({ id }) => id === type)
  }

  return {
    defaultLinkType,
    isPasswordEnforcedForLinkType,
    getAvailableLinkTypes,
    linkShareRoles,
    getLinkRoleByType
  }
}
