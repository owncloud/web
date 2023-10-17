import { buildSpace, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { Drive } from '@ownclouders/web-client/src/generated'
import { useGettext } from 'vue3-gettext'
import { useClientService } from '../clientService'
import { useConfigurationManager } from '../configuration'

export const useCreateSpace = () => {
  const clientService = useClientService()
  const { $gettext } = useGettext()
  const configurationManager = useConfigurationManager()

  const createSpace = async (name: string) => {
    const { graphAuthenticated } = clientService
    const { data: createdSpace } = await graphAuthenticated.drives.createDrive({ name }, {})
    const spaceResource = buildSpace({
      ...createdSpace,
      serverUrl: configurationManager.serverUrl
    })

    return await createDefaultConfigFolder(spaceResource)
  }

  const createDefaultConfigFolder = async (space: SpaceResource) => {
    await clientService.webdav.createFolder(space, { path: '.space' })
    await clientService.webdav.putFileContents(space, {
      path: '.space/readme.md',
      content: $gettext('Here you can add a description for this Space.')
    })
    const file = await clientService.webdav.getFileInfo(space, {
      path: '.space/readme.md'
    })
    const { data: updatedDriveData } = await clientService.graphAuthenticated.drives.updateDrive(
      space.id as string,
      {
        special: [
          {
            specialFolder: {
              name: 'readme'
            },
            id: file.id
          }
        ]
      } as Drive,
      {}
    )
    return buildSpace({ ...updatedDriveData, serverUrl: configurationManager.serverUrl })
  }

  return { createSpace, createDefaultConfigFolder }
}
