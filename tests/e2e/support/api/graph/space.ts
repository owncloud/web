import { checkResponseStatus, request } from '../http'
import { Space, User } from '../../types'
import join from 'join-path'
import { createFolderInsideSpace, getFileId, uploadFileInsideSpace } from '../dav/space'

export const createSpace = async ({
  spaceAdmin,
  space
}: {
  spaceAdmin: User
  space: Space
}): Promise<string> => {
  // create a space with this function
  const body = JSON.stringify({
    id: space.id,
    name: space.name
  })

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1.0', 'drives'),
    body,
    user: spaceAdmin
  })

  // to make api request work consistently with UI we need to create a hidden folder '.space'
  // inside .space it consist of files that may be required to update the space (e.g. change description of space (stored by readme.md), change image of space)

  checkResponseStatus(response, 'Failed while creating a space project')

  const result = await response.json()
  // api call to make a hidden file when the space creation in successful
  await createFolderInsideSpace({ spaceAdmin, spaceId: result.id, folderName: '.space' })
  // again make an api call to create a readme.md file so that the edit description is shown in the web UI
  await uploadFileInsideSpace({ spaceAdmin, spaceId: result.id, fileName: '.space/readme.md' })
  // again make an api call to get file id of the uploaded file `readme.md`
  const fileId = await getFileId({ spaceAdmin, spaceId: result.id, fileName: '.space/readme.md' })
  // after getting file id make a patch request to update space special section
  await updateSpaceSpecialSection({
    spaceAdmin,
    spaceId: result.id,
    type: 'description',
    fileId: fileId
  })

  return result.id
}

export const updateSpaceSpecialSection = async ({
  spaceAdmin,
  spaceId,
  type,
  fileId
}: {
  spaceAdmin: User
  spaceId: string
  type: string
  fileId: string
}): Promise<void> => {
  if (type === 'description') {
    type = 'readme'
  } else {
    type = 'image'
  }
  const body = JSON.stringify({
    special: [
      {
        specialFolder: {
          name: type
        },
        id: fileId
      }
    ]
  })

  const response = await request({
    method: 'PATCH',
    path: join('graph', 'v1.0', 'drives', spaceId),
    body: body,
    user: spaceAdmin
  })
  checkResponseStatus(
    response,
    `Failed while creating special section ${type} inside space project`
  )
}
