import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import { getDynamicRoleIdByName, ResourceType } from '../../../e2e/support/api/share/share'
import {
  CollaboratorType,
  ICollaborator
} from '../../../e2e/support/objects/app-files/share/collaborator'
import { ActionViaType } from '../../../e2e/support/objects/app-files/share/actions'
import { substitute } from '../../../e2e/support/utils/substitute'
import { World } from '../../support/world'

const parseShareTable = function (
  world: World,
  resource: string,
  recipient: string,
  type: string,
  role: string,
  resourceType: string,
  expirationDate?: string,
  shareType?: string
) {
  const stepTable = [
    {
      resource,
      recipient,
      type,
      role,
      resourceType,
      expirationDate,
      shareType
    }
  ]
  return stepTable.reduce<Record<string, ICollaborator[]>>((acc, stepRow) => {
    const { resource, recipient, type, role, resourceType, expirationDate, shareType } = stepRow

    if (!acc[resource]) {
      acc[resource] = []
    }

    acc[resource].push({
      collaborator:
        type === 'group'
          ? world.usersEnvironment.getGroup({ key: recipient })
          : world.usersEnvironment.getUser({ key: recipient }),
      role,
      type: type as CollaboratorType,
      resourceType,
      expirationDate,
      shareType
    })

    return acc
  }, {})
}

export async function userNavigatesToSharedWithMePage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.shares.WithMe({ page })
  await pageObject.navigate()
}

export async function userNavigatesToSharedWithOthersPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.shares.WithOthers({ page })
  await pageObject.navigate()
}

export async function userUpdatesShareeRole({
  world,
  stepUser,
  resource,
  recipient,
  type,
  role,
  resourceType,
  expirationDate,
  shareType
}: {
  world: World
  stepUser: string
  resource: string
  recipient: string
  type: string
  role: string
  resourceType: string
  expirationDate?: string
  shareType?: string
}) {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const shareInfo = parseShareTable(
    world,
    resource,
    recipient,
    type,
    role,
    resourceType,
    expirationDate,
    shareType
  )
  const sharer = world.usersEnvironment.getUser({ key: stepUser })

  for (const [resource, shareObj] of Object.entries(shareInfo)) {
    const roleId = await getDynamicRoleIdByName(
      sharer,
      shareObj[0].role,
      shareObj[0].resourceType as ResourceType
    )
    shareObj.forEach((item) => (item.role = roleId))
    await shareObject.changeShareeRole({
      resource,
      recipients: shareObj
    })
  }
}

export async function userSharesResources({
  world,
  stepUser,
  actionType,
  shares
}: {
  world: World
  stepUser: string
  actionType: ActionViaType
  shares: {
    resource: string
    recipient: string
    type: string
    role: string
    resourceType: string
    expirationDate?: string
    shareType?: string
  }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const sharer = world.usersEnvironment.getUser({ key: stepUser })

  for (const resource of shares) {
    const shareRecipient = {
      collaborator:
        resource.type === 'group'
          ? world.usersEnvironment.getGroup({ key: resource.recipient })
          : world.usersEnvironment.getUser({ key: resource.recipient }),
      role: resource.role,
      type: resource.type as CollaboratorType,
      resourceType: resource.resourceType,
      expirationDate: resource.expirationDate,
      shareType: resource.shareType
    }

    shareRecipient.role = await getDynamicRoleIdByName(
      sharer,
      resource.role,
      resource.resourceType as ResourceType
    )
    await shareObject.create({
      resource: resource.resource,
      recipients: [shareRecipient],
      via: actionType
    })
  }
}

export async function userRemovesSharee({
  world,
  stepUser,
  resource,
  recipient
}: {
  world: World
  stepUser: string
  resource: string
  recipient: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  await shareObject.removeSharee({
    resource,
    recipients: [{ collaborator: world.usersEnvironment.getUser({ key: recipient }) }]
  })
}

export async function userAddsUsersToProjectSpace({
  world,
  stepUser,
  space,
  members
}: {
  world: World
  stepUser: string
  space: string
  members: { reciver: string; role: string; kind: 'user' | 'group' }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const sharer = world.usersEnvironment.getUser({ key: stepUser })

  for (const member of members) {
    const collaborator =
      member.kind === 'user'
        ? world.usersEnvironment.getUser({ key: member.reciver })
        : world.usersEnvironment.getGroup({ key: member.reciver })
    const roleId = await getDynamicRoleIdByName(sharer, member.role, 'space' as ResourceType)
    const collaboratorWithRole = {
      collaborator,
      role: roleId
    }
    await spacesObject.addMembers({ users: [collaboratorWithRole] })
  }
}

export async function userShouldBeAbleToManageShareOfFile({
  world,
  stepUser,
  resource,
  recipient
}: {
  world: World
  stepUser: string
  resource: string
  recipient: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const changeRole = shareObject.changeRoleLocator(
    world.usersEnvironment.getUser({ key: recipient })
  )
  const changeShare = shareObject.changeShareLocator(
    world.usersEnvironment.getUser({ key: recipient })
  )

  await shareObject.openSharingPanel(resource)

  const canChangeRole = !(await changeRole.isDisabled())
  const canChangeShare = !(await changeShare.isDisabled())

  expect(canChangeRole).toBe(true)
  expect(canChangeShare).toBe(true)
}

export async function userShouldNotBeAbleToManageShareOfFile({
  world,
  stepUser,
  resource,
  recipient
}: {
  world: World
  stepUser: string
  resource: string
  recipient: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const changeRole = shareObject.changeRoleLocator(
    world.usersEnvironment.getUser({ key: recipient })
  )
  const changeShare = shareObject.changeShareLocator(
    world.usersEnvironment.getUser({ key: recipient })
  )

  await shareObject.openSharingPanel(resource)

  const canChangeRole = !(await changeRole.isDisabled())
  const canChangeShare = !(await changeShare.isDisabled())

  expect(canChangeRole).toBe(false)
  expect(canChangeShare).toBe(false)
}

export async function userDisablesSyncForShares({
  world,
  stepUser,
  shares
}: {
  world: World
  stepUser: string
  shares: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  for (const share of shares) {
    await shareObject.disableSync({ resource: share })
  }
}

export async function userEnablesSyncForShares({
  world,
  stepUser,
  shares
}: {
  world: World
  stepUser: string
  shares: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  for (const share of shares) {
    await shareObject.enableSync({ resource: share, via: 'CONTEXT_MENU' })
  }
}

export async function sharesShouldHaveSyncStatus({
  world,
  stepUser,
  shares
}: {
  world: World
  stepUser: string
  shares: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  for (const share of shares) {
    expect(await shareObject.resourceIsSynced(share)).toBe(true)
  }
}

export async function sharesShouldNotHaveSyncStatus({
  world,
  stepUser,
  shares
}: {
  world: World
  stepUser: string
  shares: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  for (const share of shares) {
    expect(await shareObject.resourceIsSynced(share)).toBe(false)
  }
}

export async function userShouldNotSeeShare({
  world,
  stepUser,
  resource,
  owner
}: {
  world: World
  stepUser: string
  resource: string
  owner: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const isAcceptedSharePresent = await shareObject.isAcceptedSharePresent(
    resource,
    substitute(owner)
  )
  expect(isAcceptedSharePresent).toBe(false)
}

export async function userEnablesSyncForAllShares({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  await shareObject.syncAll()
}

export async function userChecksAccessDetailsOfShare({
  world,
  stepUser,
  resource,
  sharee,
  accessDetails
}: {
  world: World
  stepUser: string
  resource: string
  sharee: { name: string; type: 'user' | 'group' }
  accessDetails: { Name: string; Type: string }
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })

  let selectorType = sharee.name
  // NOTE: external users have group type element selector
  if (accessDetails.hasOwnProperty('Type') && accessDetails.Type === 'External') {
    selectorType = 'group'
  }
  accessDetails.Name = substitute(accessDetails.Name)

  const actualDetails = await shareObject.getAccessDetails({
    resource,
    collaborator: {
      collaborator:
        sharee.type === 'group'
          ? world.usersEnvironment.getGroup({ key: sharee.name })
          : world.usersEnvironment.getUser({ key: sharee.name }),
      type: selectorType
    } as ICollaborator
  })

  expect(actualDetails).toMatchObject(accessDetails)
}

export async function userShouldSeeAccessDetailsOfShareForFederatedUser({
  world,
  stepUser,
  resource,
  collaboratorName,
  detail
}: {
  world: World
  stepUser: string
  resource: string
  collaboratorName: string
  detail: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })

  const actualDetails = await shareObject.getAccessDetails({
    resource,
    collaborator: {
      collaborator: world.usersEnvironment.getUser({ key: collaboratorName }),
      type: 'group'
    } as ICollaborator
  })

  expect(actualDetails).toHaveProperty(detail)
}
