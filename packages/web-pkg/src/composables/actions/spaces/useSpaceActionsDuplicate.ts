import { SpaceResource } from '@ownclouders/web-client'
import { computed } from 'vue'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'
import { useStore } from '../../store'
import { useAbility } from '../../ability'
import { useClientService } from '../../clientService'
import { useLoadingService } from '../../loadingService'
import { Store } from 'vuex'
import { buildSpace, isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'
import { Drive } from '@ownclouders/web-client/src/generated'
import { resolveFileNameDuplicate } from '../../../helpers'

export const useSpaceActionsDuplicate = ({
  store
}: {
  store?: Store<any>
} = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const loadingService = useLoadingService()

  const duplicateSpace = async (spaces: SpaceResource[]) => {
    const existingSpace = spaces[0]
    const projectSpaces: SpaceResource[] = store.getters['runtime/spaces/spaces'].filter(
      (space: SpaceResource) => isProjectSpaceResource(space)
    )
    const newSpaceName = resolveFileNameDuplicate(existingSpace.name, '', projectSpaces)

    try {
      const { data: createdSpace } = await clientService.graphAuthenticated.drives.createDrive(
        {
          name: newSpaceName,
          description: existingSpace.description
        },
        {}
      )
      let newSpace = buildSpace(createdSpace)

      const existingSpaceFiles = await clientService.webdav.listFiles(existingSpace)
      for (const file of existingSpaceFiles.children) {
        await clientService.webdav.copyFiles(existingSpace, file, newSpace, { path: file.name })
      }

      if (existingSpace.spaceReadmeData || existingSpace.spaceImageData) {
        const specialRequestData = {
          special: []
        }

        if (existingSpace.spaceReadmeData) {
          const newSpaceReadmeFile = await clientService.webdav.getFileInfo(newSpace, {
            path: `.space/${existingSpace.spaceReadmeData.name}`
          })
          specialRequestData.special.push({
            specialFolder: {
              name: 'readme'
            },
            id: newSpaceReadmeFile.id
          })
        }

        if (existingSpace.spaceImageData) {
          const newSpaceImageFile = await clientService.webdav.getFileInfo(newSpace, {
            path: `.space/${existingSpace.spaceImageData.name}`
          })
          specialRequestData.special.push({
            specialFolder: {
              name: 'image'
            },
            id: newSpaceImageFile.id
          })
        }

        const { data: updatedDriveData } =
          await clientService.graphAuthenticated.drives.updateDrive(
            newSpace.id.toString(),
            specialRequestData as Drive,
            {}
          )
        newSpace = buildSpace(updatedDriveData)
      }

      store.commit('runtime/spaces/UPSERT_SPACE', newSpace)
      store.dispatch('showMessage', {
        title: $gettext('Space was duplicated successfully')
      })
    } catch (error) {
      console.error(error)
      store.dispatch('showErrorMessage', {
        title: $gettext('Failed to duplicate space'),
        error
      })
    }
  }

  const handler = ({ resources }: SpaceActionOptions) => {
    return duplicateSpace(resources)
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'duplicate',
      icon: 'folders',
      label: () => $gettext('Duplicate'),
      handler: (args) => loadingService.addTask(() => handler(args)),
      isEnabled: ({ resources }) => {
        if (resources?.length !== 1) {
          return false
        }

        if (resources[0].disabled) {
          return false
        }

        return ability.can('create-all', 'Drive')
      },
      componentType: 'button',
      class: 'oc-files-actions-duplicate-trigger'
    }
  ])

  return {
    actions,
    duplicateSpace
  }
}
