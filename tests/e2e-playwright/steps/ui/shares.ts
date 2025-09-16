import { objects } from '../../../e2e/support'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { getDynamicRoleIdByName, ResourceType } from '../../../e2e/support/api/share/share'
import {
  CollaboratorType,
  ICollaborator
} from '../../../e2e/support/objects/app-files/share/collaborator'

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
