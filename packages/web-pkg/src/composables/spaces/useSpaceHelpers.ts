import { SpaceResource } from '@ownclouders/web-client'
import { useClientService } from '../clientService'
import { useGettext } from 'vue3-gettext'

export const useSpaceHelpers = () => {
  const clientService = useClientService()
  const { $gettext } = useGettext()

  const checkSpaceNameModalInput = (name: string, setError: (value: string) => void) => {
    if (name.trim() === '') {
      return setError($gettext('Space name cannot be empty'))
    }
    if (name.length > 255) {
      return setError($gettext('Space name cannot exceed 255 characters'))
    }
    if (/[/\\.:?*"><|]/.test(name)) {
      return setError(
        $gettext('Space name cannot contain the following characters: / \\\\ . : ? * " > < |\'')
      )
    }
    return setError(null)
  }

  const getDefaultMetaFolder = async (space: SpaceResource) => {
    const { children } = await clientService.webdav.listFiles(space)
    return children.find(({ name }) => name === '.space')
  }

  return { checkSpaceNameModalInput, getDefaultMetaFolder }
}
