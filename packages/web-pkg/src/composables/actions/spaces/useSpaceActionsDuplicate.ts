import { SpaceResource } from '@ownclouders/web-client'
import { computed, unref } from 'vue'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'
import { useRoute, useRouter } from '../../router'
import { useStore } from '../../store'
import { useAbility } from '../../ability'
import { useClientService } from '../../clientService'
import { useLoadingService } from '../../loadingService'
import { Store } from 'vuex'
import { buildSpace, isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'
import { useCreateSpace } from '../../spaces'
import { Drive } from '@ownclouders/web-client/src/generated'
import { resolveFileNameDuplicate } from '../../../helpers'

export const useSpaceActionsDuplicate = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const loadingService = useLoadingService()

  const duplicateSpace = async (spaces: SpaceResource[]) => {
    const originalSpace = spaces[0]
    console.log(originalSpace)
    const projectSpaces: SpaceResource[] = store.getters['runtime/spaces/spaces'].filter(
      (space: SpaceResource) => isProjectSpaceResource(space)
    )
    let newSpace: SpaceResource = null
    const newSpaceName = resolveFileNameDuplicate(originalSpace.name, '', projectSpaces)

    try {
      const { data: createdSpace } = await clientService.graphAuthenticated.drives.createDrive(
        {
          name: newSpaceName,
          description: originalSpace.description
        },
        {}
      )
      newSpace = buildSpace(createdSpace)

      await clientService.webdav.copyFiles(originalSpace, { path: '/' }, newSpace, { path: '/' })

      if (originalSpace.spaceReadmeData || originalSpace.spaceImageData) {
        const specialRequestData = {
          special: []
        }

        if (originalSpace.spaceReadmeData) {
          const newSpaceReadmeFile = await clientService.webdav.getFileInfo(newSpace, {
            path: `.space/${originalSpace.spaceReadmeData.name}`
          })
          specialRequestData.special.push([
            {
              specialFolder: {
                name: 'readme'
              },
              id: newSpaceReadmeFile.id as string
            }
          ])
        }

        if (originalSpace.spaceImageData) {
          const newSpaceImageFile = await clientService.webdav.getFileInfo(newSpace, {
            path: `.space/${originalSpace.spaceImageData.name}`
          })
          specialRequestData.special.push([
            {
              specialFolder: {
                name: 'image'
              },
              id: newSpaceImageFile.id as string
            }
          ])
        }

        const { data: updatedDriveData } =
          await clientService.graphAuthenticated.drives.updateDrive(
            newSpace.id as string,
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
        return ability.can('create-all', 'Drive')
      },
      componentType: 'button',
      class: 'oc-files-actions-disable-trigger'
    }
  ])

  return {
    actions
  }
}
