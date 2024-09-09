import join from 'join-path'
import { checkResponseStatus, request } from '../http'
import { Group, User } from '../../types'
import { getSpaceIdBySpaceName } from '../graph'
import { getIdOfFileInsideSpace } from '../davSpaces'
import { LinksEnvironment, UsersEnvironment } from '../../environment'

export const shareTypes: Readonly<{
  user: string
  group: string
  public: string
  federated: string
  space: string
}> = {
  user: '0',
  group: '1',
  public: '3',
  federated: '6',
  space: '7'
}

export const shareRoles: Readonly<{
  'Invited people': string
  'Can upload': string
  'Can manage': string
  'Can edit': string
  'Can view': string
  'Secret File Drop': string
}> = {
  'Invited people': 'internal',
  'Can upload': 'contributor',
  'Can manage': 'manager',
  'Can edit': 'editor',
  'Can view': 'viewer',
  'Secret File Drop': 'uploader'
} as const

export const linkShareRoles: Readonly<{
  'Invited people': string
  'Can view': string
  'Can upload': string
  'Can edit': string
  'Secret File Drop': string
}> = {
  'Invited people': 'internal',
  'Can view': 'view',
  'Can upload': 'upload',
  'Can edit': 'edit',
  'Secret File Drop': 'createOnly'
} as const

const getPermissionsRoleIdByName = (permissionsRole: string): string => {
  switch (permissionsRole) {
    case 'viewer':
      return 'b1e2218d-eef8-4d4c-b82d-0f1a1b48f3b5'
    case 'space viewer':
      return 'a8d5fe5e-96e3-418d-825b-534dbdf22b99'
    case 'editor':
      return 'fb6c3e19-e378-47e5-b277-9732f9de6e21'
    case 'space editor':
      return '58c63c02-1d89-4572-916a-870abc5a1b7d'
    case 'file editor':
      return '2d00ce52-1fc2-4dbc-8b95-a73b73395f5a'
    case 'co owner':
      return '3a4ba8e9-6a0d-4235-9140-0e7a34007abe'
    case 'uploader':
      return '1c996275-f1c9-4e71-abdf-a42f6495e960'
    case 'manager':
      return '312c0871-5ef7-4b3a-85b6-0e4074c64049'
    case 'secure viewer':
      return 'aa97fe03-7980-45ac-9e50-b325749fd7e6'
    default:
      throw new Error(`Role ${permissionsRole} not found`)
  }
}

type ResourceType = 'file' | 'folder' | 'space'

const getRoleId = (role: string, resourceType: ResourceType): string => {
  let roleId: string
  const shareRole: string = shareRoles[role as keyof typeof shareRoles]
  if (shareRole === 'editor' && resourceType === 'file') {
    roleId = getPermissionsRoleIdByName('file editor')
  } else if (shareRole === 'editor' && resourceType === 'space') {
    roleId = getPermissionsRoleIdByName('space editor')
  } else if (shareRole === 'viewer' && resourceType === 'space') {
    roleId = getPermissionsRoleIdByName('space viewer')
  } else {
    roleId = getPermissionsRoleIdByName(shareRole)
  }
  return roleId
}

const getRecipientId = (shareType: string, shareWith: string): string => {
  const usersEnvironment: UsersEnvironment = new UsersEnvironment()
  let recipient: User | Group, recipientId: string
  if (shareType === 'user') {
    recipient = usersEnvironment.getUser({ key: shareWith })
    recipientId = usersEnvironment.getCreatedUser({ key: recipient.id }).uuid
  } else {
    recipient = usersEnvironment.getGroup({ key: shareWith })
    recipientId = usersEnvironment.getCreatedGroup({ key: recipient.id }).uuid
  }
  return recipientId
}

export const createShare = async ({
  user,
  path,
  shareType,
  shareWith,
  role
}: {
  user: User
  path: string
  shareType: string
  shareWith?: string
  role: string
}): Promise<void> => {
  const driveId: string = await getSpaceIdBySpaceName({
    user,
    spaceType: 'personal',
    spaceName: user.displayName
  })
  const itemId: string = await getIdOfFileInsideSpace({
    user,
    pathToFileName: path,
    spaceType: 'personal',
    spaceName: user.displayName
  })
  const recipientId: string = getRecipientId(shareType, shareWith)

  let resourceType: ResourceType
  if (path.includes('.')) {
    resourceType = 'file'
  } else {
    resourceType = 'folder'
  }
  const roleId: string = getRoleId(role, resourceType)

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1beta1', 'drives', driveId, 'items', itemId, 'invite'),
    body: JSON.stringify({
      recipients: [
        {
          '@libre.graph.recipient.type': shareType,
          objectId: recipientId
        }
      ],
      roles: [roleId]
    }),
    user
  })
  checkResponseStatus(response, 'Failed while creating share')
}

export const addMembersToTheProjectSpace = async ({
  user,
  spaceName,
  shareType,
  shareWith,
  role
}: {
  user: User
  spaceName: string
  shareType: string
  shareWith?: string
  role: string
}): Promise<void> => {
  const driveId: string = await getSpaceIdBySpaceName({
    user,
    spaceType: 'project',
    spaceName
  })
  const recipientId: string = getRecipientId(shareType, shareWith)
  const roleId: string = getRoleId(role, 'space')

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1beta1', 'drives', driveId, 'root', 'invite'),
    body: JSON.stringify({
      recipients: [
        {
          '@libre.graph.recipient.type': shareType,
          objectId: recipientId
        }
      ],
      roles: [roleId]
    }),
    user
  })

  checkResponseStatus(response, 'Failed while adding members to project space')
}

export const createLinkShare = async ({
  user,
  path,
  password,
  name,
  role = 'Can view',
  spaceName = 'Personal'
}: {
  user: User
  path: string
  password: string
  name: string
  role?: string
  spaceName?: string
}): Promise<void> => {
  let spaceType
  if (spaceName.toLowerCase() === 'personal') {
    spaceType = spaceName.toLowerCase()
    spaceName = user.displayName
  } else {
    spaceType = 'project'
  }

  const driveId: string = await getSpaceIdBySpaceName({
    user,
    spaceType,
    spaceName
  })
  const itemId: string = await getIdOfFileInsideSpace({
    user,
    pathToFileName: path,
    spaceType,
    spaceName
  })

  const roleType: string = linkShareRoles[role as keyof typeof linkShareRoles]

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1beta1', 'drives', driveId, 'items', itemId, 'createLink'),
    body: JSON.stringify({
      type: roleType,
      password,
      displayName: name
    }),
    user
  })

  const responseData = (await response.json()) as { link: { webUrl: string } }
  const webUrl = responseData.link.webUrl
  const linksEnvironment: LinksEnvironment = new LinksEnvironment()
  linksEnvironment.createLink({
    key: name,
    link: { name: name, url: webUrl }
  })

  checkResponseStatus(response, 'Failed while creating public link share')
}
