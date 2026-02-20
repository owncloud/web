import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { getDynamicRoleIdByName, ResourceType } from '../../../e2e/support/api/share/share'
import {
  CollaboratorType,
  ICollaborator
} from '../../../e2e/support/objects/app-files/share/collaborator'
import { ActionViaType } from '../../../e2e/support/objects/app-files/share/actions'
import { substitute } from '../../../e2e/support/utils/substitute'

const parseShareTable = function (
  usersEnvironment: UsersEnvironment,
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
          ? usersEnvironment.getGroup({ key: recipient })
          : usersEnvironment.getUser({ key: recipient }),
      role,
      type: type as CollaboratorType,
      resourceType,
      expirationDate,
      shareType
    })

    return acc
  }, {})
}

export async function navigateToSharedWithMePage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.shares.WithMe({ page })
  await pageObject.navigate()
}

export async function userNavigatesToSharedWithOthersPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.shares.WithOthers({ page })
  await pageObject.navigate()
}

export async function updateShareeRole({
  usersEnvironment,
  actorsEnvironment,
  stepUser,
  resource,
  recipient,
  type,
  role,
  resourceType,
  expirationDate,
  shareType
}: {
  usersEnvironment: UsersEnvironment
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  recipient: string
  type: string
  role: string
  resourceType: string
  expirationDate?: string
  shareType?: string
}) {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const shareInfo = parseShareTable(
    usersEnvironment,
    resource,
    recipient,
    type,
    role,
    resourceType,
    expirationDate,
    shareType
  )
  const sharer = usersEnvironment.getUser({ key: stepUser })

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
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  actionType,
  shares
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
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
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const sharer = usersEnvironment.getUser({ key: stepUser })

  for (const resource of shares) {
    const shareRecipient = {
      collaborator:
        resource.type === 'group'
          ? usersEnvironment.getGroup({ key: resource.recipient })
          : usersEnvironment.getUser({ key: resource.recipient }),
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

export async function removeSharee({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  resource,
  recipient
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  recipient: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  await shareObject.removeSharee({
    resource,
    recipients: [{ collaborator: usersEnvironment.getUser({ key: recipient }) }]
  })
}

export async function addUserToProjectSpace({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  reciver,
  role,
  kind
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  space: string
  reciver: string
  role: string
  kind: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const sharer = usersEnvironment.getUser({ key: stepUser })

  const collaborator =
    kind === 'user'
      ? usersEnvironment.getUser({ key: reciver })
      : usersEnvironment.getGroup({ key: reciver })
  const roleId = await getDynamicRoleIdByName(sharer, role, 'space' as ResourceType)
  const collaboratorWithRole = {
    collaborator,
    role: roleId
  }
  await spacesObject.addMembers({ users: [collaboratorWithRole] })
}

export async function userShouldBeAbleToManageShareOfFile({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  resource,
  recipient
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  recipient: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const changeRole = shareObject.changeRoleLocator(usersEnvironment.getUser({ key: recipient }))
  const changeShare = shareObject.changeShareLocator(usersEnvironment.getUser({ key: recipient }))

  await shareObject.openSharingPanel(resource)

  const canChangeRole = !(await changeRole.isDisabled())
  const canChangeShare = !(await changeShare.isDisabled())

  expect(canChangeRole).toBe(true)
  expect(canChangeShare).toBe(true)
}

export async function userShouldNotBeAbleToManageShareOfFile({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  resource,
  recipient
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  recipient: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const changeRole = shareObject.changeRoleLocator(usersEnvironment.getUser({ key: recipient }))
  const changeShare = shareObject.changeShareLocator(usersEnvironment.getUser({ key: recipient }))

  await shareObject.openSharingPanel(resource)

  const canChangeRole = !(await changeRole.isDisabled())
  const canChangeShare = !(await changeShare.isDisabled())

  expect(canChangeRole).toBe(false)
  expect(canChangeShare).toBe(false)
}

export async function userDisablesSyncForShares({
  actorsEnvironment,
  stepUser,
  shares
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  shares: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  for (const share of shares) {
    await shareObject.disableSync({ resource: share })
  }
}

export async function userEnablesSyncForShares({
  actorsEnvironment,
  stepUser,
  shares
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  shares: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  for (const share of shares) {
    await shareObject.enableSync({ resource: share, via: 'CONTEXT_MENU' })
  }
}

export async function sharesShouldHaveSyncStatus({
  actorsEnvironment,
  stepUser,
  shares
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  shares: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  for (const share of shares) {
    expect(await shareObject.resourceIsSynced(share)).toBe(true)
  }
}

export async function sharesShouldNotHaveSyncStatus({
  actorsEnvironment,
  stepUser,
  shares
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  shares: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  for (const share of shares) {
    expect(await shareObject.resourceIsSynced(share)).toBe(false)
  }
}

export async function userShouldNotSeeShare({
  actorsEnvironment,
  stepUser,
  resource,
  owner
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  owner: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const isAcceptedSharePresent = await shareObject.isAcceptedSharePresent(
    resource,
    substitute(owner)
  )
  expect(isAcceptedSharePresent).toBe(false)
}

export async function userEnablesSyncForAllShares({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  await shareObject.syncAll()
}
