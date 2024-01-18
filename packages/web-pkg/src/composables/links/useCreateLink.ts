import { unref } from 'vue'
import { useStore } from '../store'
import { useGettext } from 'vue3-gettext'
import { useDefaultLinkPermissions } from './useDefaultLinkPermissions'
import {
  Resource,
  Share,
  SpaceResource,
  isProjectSpaceResource
} from '@ownclouders/web-client/src/helpers'
import { useExpirationRules } from './useExpirationRules'
import { useClientService } from '../clientService'
import { useSharesStore } from '../piniaStores'

export const useCreateLink = () => {
  const store = useStore()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const { defaultLinkPermissions } = useDefaultLinkPermissions()
  const { expirationRules } = useExpirationRules()
  const { addLink } = useSharesStore()

  const getStorageId = ({ resource, space }: { resource: Resource; space?: SpaceResource }) => {
    if (isProjectSpaceResource(resource)) {
      return resource.id
    }

    if (space) {
      return space.id
    }

    return null
  }

  const createLink = ({
    resource,
    name = $gettext('Link'),
    quicklink = false,
    space = undefined,
    permissions = undefined,
    password = undefined,
    expireDate = undefined,
    notifyUploads = undefined,
    notifyUploadsExtraRecipients = undefined
  }): Promise<Share> => {
    const params: Record<string, unknown> = {
      name,
      quicklink,
      spaceRef: resource.fileId || resource.id,
      storageId: getStorageId({ resource, space }),
      ...(permissions !== undefined && { permissions: permissions.toString() }),
      ...(password && { password }),
      ...(expireDate && { expireDate }),
      notifyUploads,
      notifyUploadsExtraRecipients
    }

    if (permissions === undefined) {
      params.permissions = unref(defaultLinkPermissions).toString()
    }

    if (expireDate === undefined && unref(expirationRules).enforced) {
      params.expireDate = unref(expirationRules).default
    }

    let path = resource.path
    // sharing a share root from the share jail -> use resource name as path
    if (resource.isReceivedShare() && path === '/') {
      path = `/${resource.name}`
    }

    return addLink({
      path,
      clientService,
      params,
      storageId: resource.fileId || resource.id,
      vuexStore: store
    })
  }

  return { createLink }
}
