import { config } from '../../../e2e/config.js'
import {
  FilesEnvironment,
  UsersEnvironment,
  SpacesEnvironment
} from '../../../e2e/support/environment'
import { api, store } from '../../../e2e/support'
import { ResourceType } from '../../../e2e/support/api/share/share'
import { Group, Space, User } from '../../../e2e/support/types'
import fs from 'fs'
import { integer } from 'vscode-languageserver-types'

import { checkResponseStatus, request } from '../../../e2e/support/api/http'
import { join } from 'path'

export async function userHasBeenCreated({
  usersEnvironment,
  stepUser,
  userToBeCreated
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  userToBeCreated: string
}): Promise<void> {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const user = usersEnvironment.getUser({ key: userToBeCreated })
  // do not try to create users when using predefined users
  if (!config.predefinedUsers) {
    await api.provision.createUser({ user, admin })
  }
}

export async function deleteUser({
  usersEnvironment,
  stepUser,
  targetUser
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  targetUser: string
}): Promise<void> {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const user = usersEnvironment.getUser({ key: targetUser })
  await api.provision.deleteUser({ user, admin })
}

export async function userHasCreatedFolder({
  usersEnvironment,
  stepUser,
  folderName
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  folderName: string
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.dav.createFolderInsidePersonalSpace({ user, folder: folderName })
}

export async function userHasCreatedFolders({
  usersEnvironment,
  stepUser,
  folderNames
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  folderNames: string[]
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  for (const folderName of folderNames) {
    await api.dav.createFolderInsidePersonalSpace({
      user,
      folder: folderName
    })
  }
}

export async function userHasCreatedFile({
  usersEnvironment,
  stepUser,
  filename,
  content = 'This is a test file'
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  filename: string
  content?: string
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.dav.uploadFileInPersonalSpace({
    user,
    pathToFile: filename,
    content
  })
}

export async function userHasSharedResource({
  usersEnvironment,
  stepUser,
  resource,
  recipient,
  type,
  role,
  resourceType
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  recipient: string
  type: string
  role: string
  resourceType: ResourceType
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.share.createShare({
    user,
    path: resource,
    shareType: type,
    shareWith: recipient,
    role: role,
    resourceType: resourceType as ResourceType
  })
}

export async function userHasCreatedPublicLinkOfResource({
  usersEnvironment,
  stepUser,
  resource,
  role,
  name,
  password,
  space
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  role?: string
  name?: string
  password?: string
  space?: 'Personal'
}) {
  const user = usersEnvironment.getUser({ key: stepUser })

  await api.share.createLinkShare({
    user,
    path: resource,
    password: password,
    name: name ? name : 'Unnamed link',
    role: role,
    spaceName: space
  })
}

export async function userHasAssignRolesToUsers({
  usersEnvironment,
  stepUser,
  targetUserId,
  role
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  targetUserId: string
  role: string
}) {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const user = usersEnvironment.getUser({ key: targetUserId })
  /**
   The oCIS API request for assigning roles allows only one role per user,
    whereas the Keycloak API request can assign multiple roles to a user.
    If multiple roles are assigned to a user in Keycloak,
    oCIS map the highest priority role among Keycloak assigned roles.
    Therefore, we need to unassign the previous role before
    assigning a new one when using the Keycloak API.
  */
  await api.provision.unAssignRole({ admin, user })
  await api.provision.assignRole({ admin, user, role })
}

export async function userHasCreatedProjectSpace({
  usersEnvironment,
  spacesEnvironment,
  stepUser,
  name,
  id
}: {
  usersEnvironment: UsersEnvironment
  spacesEnvironment: SpacesEnvironment
  stepUser: string
  name: string
  id: string
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  const spaceId = await api.graph.createSpace({ user, space: { id, name } as unknown as Space })
  spacesEnvironment.createSpace({
    key: id || name,
    space: { name: name, id: spaceId }
  })
}

export async function userHasUploadedFilesInPersonalSpace({
  usersEnvironment,
  stepUser,
  filesEnvironment,
  filesToUpload
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  filesEnvironment: FilesEnvironment
  filesToUpload: { localFile: string; to: string }[]
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  for (const file of filesToUpload) {
    const fileInfo = filesEnvironment.getFile({ name: file.localFile.split('/').pop()! })
    const content = fs.readFileSync(fileInfo.path)
    await api.dav.uploadFileInPersonalSpace({
      user,
      pathToFile: file.to,
      content
    })
  }
}

export async function userHasCreatedFoldersInSpace({
  usersEnvironment,
  stepUser,
  numberOfFolders,
  space
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  numberOfFolders: integer
  space: string
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  for (let i = 1; i <= numberOfFolders; i++) {
    await api.dav.createFolderInsideSpaceBySpaceName({
      user,
      folder: `testFolder${i}`,
      spaceName: space
    })
  }
}

export async function userHasCreatedFolderInSpace({
  usersEnvironment,
  stepUser,
  spaceName,
  folder
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  spaceName: string
  folder: string
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.dav.createFolderInsideSpaceBySpaceName({
    user,
    folder,
    spaceName
  })
}

export async function createFilesInsideSpaceBySpaceName({
  usersEnvironment,
  stepUser,
  numberOfFiles,
  space
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  numberOfFiles: integer
  space: string
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  for (let i = 1; i <= numberOfFiles; i++) {
    await api.dav.uploadFileInsideSpaceBySpaceName({
      user,
      pathToFile: `testfile${i}.txt`,
      spaceName: space,
      content: `This is a test file${i}`
    })
  }
}

export async function createFileInsideSpaceBySpaceName({
  usersEnvironment,
  stepUser,
  fileName,
  space,
  content = 'This is a test file'
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  fileName: string
  space: string
  content?: string
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.dav.uploadFileInsideSpaceBySpaceName({
    user,
    pathToFile: fileName,
    spaceName: space,
    content: content
  })
}

export async function userHasCreatedGroup({
  usersEnvironment,
  stepUser,
  groupName
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  groupName: string
}) {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const group = usersEnvironment.getGroup({ key: groupName })
  await api.graph.createGroup({ group, admin })
}

export async function addUserToGroup({
  usersEnvironment,
  stepUser,
  groupName,
  userToAdd
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  groupName: string
  userToAdd: string
}) {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const group = usersEnvironment.getGroup({ key: groupName })
  const user = usersEnvironment.getUser({ key: userToAdd })
  await api.graph.addUserToGroup({ user, group, admin })
}

export async function userHasDeletedGroup({
  usersEnvironment,
  stepUser,
  name
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const group = usersEnvironment.getGroup({ key: name })
  await api.graph.deleteGroup({ group, admin })
}
export async function userHasDeletedProjectSpace({
  usersEnvironment,
  stepUser,
  name,
  id
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  name: string
  id: string
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.graph.deleteSpace({ user, space: { id, name } as unknown as Space })
  store.createdSpaceStore.clear()
}

export async function userHasAddedMembersToSpace({
  usersEnvironment,
  stepUser,
  space,
  shareType,
  role,
  sharee
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  space: string
  shareType: string
  role: string
  sharee: string
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.share.addMembersToTheProjectSpace({
    user,
    spaceName: space,
    shareType: shareType,
    shareWith: sharee,
    role: role
  })
}

export const groupsHaveBeenCreated = async ({
  groupIds,
  admin
}: {
  groupIds: string[]
  admin: User
}): Promise<Group[]> => {
  const usersEnvironment = new UsersEnvironment()
  const createdGroups: Group[] = []
  for (const id of groupIds) {
    const group = usersEnvironment.getGroup({ key: id })
    const body = JSON.stringify({
      displayName: group.displayName
    })

    const response = await request({
      method: 'POST',
      path: join('graph', 'v1.0', 'groups'),
      body,
      user: admin
    })

    checkResponseStatus(response, 'Failed while creating group')

    const resBody = (await response.json()) as Group
    usersEnvironment.storeCreatedGroup({ group: { ...group, uuid: resBody.id } })
    createdGroups.push({ ...group, uuid: resBody.id })
  }
  return createdGroups
}

export const cleanUpGroup = async (adminUser: User) => {
  if (config.predefinedUsers) {
    return
  }
  const requests: Promise<Group>[] = []
  store.createdGroupStore.forEach((group) => {
    if (!group.id.startsWith('keycloak')) {
      requests.push(api.graph.deleteGroup({ group, admin: adminUser }))
    }
  })

  await Promise.all(requests)
  store.createdGroupStore.clear()
}

export async function userHasAddedTagsToResource({
  usersEnvironment,
  stepUser,
  resource,
  tags
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  tags: string
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.dav.addTagToResource({ user, resource, tags })
}
