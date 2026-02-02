import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { getDynamicRoleIdByName, ResourceType } from '../../../e2e/support/api/share/share'
import {
  CollaboratorType,
  ICollaborator
} from '../../../e2e/support/objects/app-files/share/collaborator'
import { ActionViaType } from '../../../e2e/support/objects/app-files/share/actions'

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

export async function shareResource({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  resource,
  recipient,
  type,
  role,
  resourceType,
  actionType,
  expirationDate,
  shareType
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  actionType: ActionViaType
  resource: string
  recipient: string
  type: string
  role: string
  resourceType: string
  expirationDate?: string
  shareType?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const shareObject = new objects.applicationFiles.Share({ page })
  const sharer = usersEnvironment.getUser({ key: stepUser })

  const shareRecipient = {
    collaborator:
      type === 'group'
        ? usersEnvironment.getGroup({ key: recipient })
        : usersEnvironment.getUser({ key: recipient }),
    role,
    type: type as CollaboratorType,
    resourceType,
    expirationDate,
    shareType
  }

  shareRecipient.role = await getDynamicRoleIdByName(sharer, role, resourceType as ResourceType)
  await shareObject.create({
    resource,
    recipients: [shareRecipient],
    via: actionType
  })
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
