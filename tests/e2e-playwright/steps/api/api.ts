import { config } from '../../../e2e/config.js'
import { api } from '../../../e2e/support'
import { ResourceType } from '../../../e2e/support/api/share/share'
import { Space } from '../../../e2e/support/types'
import fs from 'fs'
import { World } from '../../support/world'

export async function usersHaveBeenCreated({
  world,
  stepUser,
  users
}: {
  world: World
  stepUser: string
  users: Array<string>
}): Promise<void> {
  const admin = world.usersEnvironment.getUser({ key: stepUser, world })
  for (const userToBeCreated of users) {
    const user = world.usersEnvironment.getUser({ key: userToBeCreated, world })
    // do not try to create users when using predefined users
    if (!config.predefinedUsers) {
      await api.provision.createUser({ user, admin })
    }
  }
}

export async function userHasCreatedFolder({
  world,
  stepUser,
  folderName
}: {
  world: World
  stepUser: string
  folderName: string
}): Promise<void> {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  await api.dav.createFolderInsidePersonalSpace({ user, folder: folderName })
}

export async function userHasCreatedFolders({
  world,
  stepUser,
  folderNames
}: {
  world: World
  stepUser: string
  folderNames: string[]
}): Promise<void> {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const folderName of folderNames) {
    await api.dav.createFolderInsidePersonalSpace({
      user,
      folder: folderName
    })
  }
}

export async function userHasCreatedFiles({
  world,
  stepUser,
  files
}: {
  world: World
  stepUser: string
  files: { pathToFile: string; content: string; mtimeDeltaDays?: string }[]
}): Promise<void> {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const file of files) {
    await api.dav.uploadFileInPersonalSpace({
      user,
      pathToFile: file.pathToFile,
      content: file.content,
      mtimeDeltaDays: file.mtimeDeltaDays
    })
  }
}

export async function userHasSharedResources({
  world,
  stepUser,
  shares
}: {
  world: World
  stepUser: string
  shares: {
    resource: string
    recipient: string
    type: string
    role: string
    resourceType?: string
  }[]
}): Promise<void> {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const resource of shares) {
    await api.share.createShare({
      user,
      path: resource.resource,
      shareType: resource.type,
      shareWith: resource.recipient,
      role: resource.role,
      resourceType: resource.resourceType as ResourceType
    })
  }
}

export async function userHasCreatedPublicLinkOfResource({
  world,
  stepUser,
  resource,
  role,
  name,
  password,
  space
}: {
  world: World
  stepUser: string
  resource: string
  role?: string
  name?: string
  password?: string
  space?: 'Personal'
}) {
  const user = world.usersEnvironment.getUser({ key: stepUser })

  await api.share.createLinkShare({
    user,
    path: resource,
    password: password,
    name: name ? name : 'Unnamed link',
    role: role,
    spaceName: space
  })
}

export async function userHasCreatedPublicLinkOfSpace({
  world,
  stepUser,
  space,
  password,
  role,
  name
}: {
  world: World
  stepUser: string
  space: string
  password: string
  role?: string
  name?: string
}) {
  const user = world.usersEnvironment.getUser({ key: stepUser })

  await api.share.createSpaceLinkShare({
    user,
    spaceName: space,
    password: password,
    name: name ? name : 'Unnamed link',
    role: role
  })
}

export async function userHasAssignedRolesToUsers({
  world,
  stepUser,
  users
}: {
  world: World
  stepUser: string
  users: { id: string; role: string }[]
}) {
  const admin = world.usersEnvironment.getUser({ key: stepUser })
  for (const { id, role } of users) {
    const user = world.usersEnvironment.getUser({ key: id })
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
}

export async function userHasCreatedProjectSpaces({
  world,
  stepUser,
  spaces
}: {
  world: World
  stepUser: string
  spaces: Array<{ name: string; id: string }>
}) {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const space of spaces) {
    const spaceId = await api.graph.createSpace({
      user,
      space: { id: space.id, name: space.name } as unknown as Space
    })
    world.spacesEnvironment.createSpace({
      key: space.id || space.name,
      space: { name: space.name, id: spaceId }
    })
  }
}

export async function userHasUploadedFilesInPersonalSpace({
  world,
  stepUser,
  filesToUpload
}: {
  world: World
  stepUser: string
  filesToUpload: { localFile: string; to: string }[]
}) {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const file of filesToUpload) {
    const fileInfo = world.filesEnvironment.getFile({ name: file.localFile.split('/').pop()! })
    const content = fs.readFileSync(fileInfo.path)
    await api.dav.uploadFileInPersonalSpace({
      user,
      pathToFile: file.to,
      content
    })
  }
}

export async function userHasCreatedFoldersInSpace({
  world,
  stepUser,
  spaceName,
  folders
}: {
  world: World
  stepUser: string
  spaceName: string
  folders: Array<string>
}) {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const folder of folders) {
    await api.dav.createFolderInsideSpaceBySpaceName({
      user,
      folder,
      spaceName
    })
  }
}

export async function userHasCreatedFilesInsideSpace({
  world,
  stepUser,
  files
}: {
  world: World
  stepUser: string
  files: { name: string; space: string; content?: string }[]
}) {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const file of files) {
    await api.dav.uploadFileInsideSpaceBySpaceName({
      user,
      pathToFile: file.name,
      spaceName: file.space,
      content: file.content
    })
  }
}

export async function usersHaveBeenAddedToGroup({
  world,
  stepUser,
  usersToAdd
}: {
  world: World
  stepUser: string
  usersToAdd: { user: string; group: string }[]
}) {
  const admin = world.usersEnvironment.getUser({ key: stepUser })
  for (const info of usersToAdd) {
    const group = world.usersEnvironment.getGroup({ key: info.group })
    const user = world.usersEnvironment.getUser({ key: info.user })
    await api.graph.addUserToGroup({ user, group, admin })
  }
}

export async function userHasDeletedGroup({
  world,
  stepUser,
  name
}: {
  world: World
  stepUser: string
  name: string
}): Promise<void> {
  const admin = world.usersEnvironment.getUser({ key: stepUser })
  const group = world.usersEnvironment.getGroup({ key: name })
  await api.graph.deleteGroup({ group, admin })
}

export async function userHasAddedMembersToSpace({
  world,
  stepUser,
  space,
  sharee
}: {
  world: World
  stepUser: string
  space: string
  sharee: Array<{ user: string; shareType: string; role: string }>
}) {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const share of sharee) {
    await api.share.addMembersToTheProjectSpace({
      user,
      spaceName: space,
      shareType: share.shareType,
      shareWith: share.user,
      role: share.role
    })
  }
}

export async function groupsHaveBeenCreated({
  world,
  groupIds,
  stepUser
}: {
  world: World
  groupIds: string[]
  stepUser: string
}): Promise<void> {
  const admin = world.usersEnvironment.getUser({ key: stepUser, world })
  for (const groupId of groupIds) {
    const group = world.usersEnvironment.getGroup({ key: groupId, world })
    await api.graph.createGroup({ group, admin })
  }
}

export async function userHasAddedTagsToResources({
  world,
  stepUser,
  tags
}: {
  world: World
  stepUser: string
  tags: { resource: string; tags: string }[]
}): Promise<void> {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  for (const resource of tags) {
    await api.dav.addTagToResource({ user, resource: resource.resource, tags: resource.tags })
  }
}

export async function userHasDisabledAutoAcceptingShare({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const user = world.usersEnvironment.getUser({ key: stepUser })
  await api.settings.configureAutoAcceptShare({ user, state: false })
}
