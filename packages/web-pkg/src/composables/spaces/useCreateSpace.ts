import { buildSpace, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { Drive } from '@ownclouders/web-client/src/generated'
import { useGettext } from 'vue3-gettext'
import { useClientService } from '../clientService'
import { useConfigStore } from '../piniaStores'

export const useCreateSpace = () => {
  const clientService = useClientService()
  const { $gettext } = useGettext()
  const configStore = useConfigStore()

  const createSpace = async (name: string) => {
    const { graphAuthenticated } = clientService
    const { data: createdSpace } = await graphAuthenticated.drives.createDrive(
      { name },
      { params: { template: 'default' } }
    )

    console.log(
      buildSpace({
        ...createdSpace,
        serverUrl: configStore.serverUrl
      })
    )

    return buildSpace({
      ...createdSpace,
      serverUrl: configStore.serverUrl
    })
  }

  return { createSpace }
}
