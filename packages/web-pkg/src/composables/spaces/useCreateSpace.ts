import { buildSpace } from 'web-client/src/helpers'
import { Drive } from 'web-client/src/generated'
import { useGettext } from 'vue3-gettext'
import { useClientService } from '../clientService'
import { useConfigurationManager } from '../configuration'

export const useCreateSpace = () => {
  const clientService = useClientService()
  const { $gettext } = useGettext()
  const configurationManager = useConfigurationManager()

  const createSpace = async (name: string) => {
    const { graphAuthenticated, webdav } = clientService
    const { data: createdSpace } = await graphAuthenticated.drives.createDrive({ name }, {})
    const spaceResource = buildSpace({
      ...createdSpace,
      serverUrl: configurationManager.serverUrl
    })

    await webdav.createFolder(spaceResource, { path: '.space' })
    const markdown = await webdav.putFileContents(spaceResource, {
      path: '.space/readme.md',
      content: $gettext('Here you can add a description for this Space.')
    })

    const { data: updatedSpace } = await graphAuthenticated.drives.updateDrive(
      createdSpace.id,
      {
        special: [
          {
            specialFolder: {
              name: 'readme'
            },
            id: markdown.id as string
          }
        ]
      } as Drive,
      {}
    )

    return buildSpace({ ...updatedSpace, serverUrl: configurationManager.serverUrl })
  }

  return { createSpace }
}
