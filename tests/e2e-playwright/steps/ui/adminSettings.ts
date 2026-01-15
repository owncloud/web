import { objects } from '../../../e2e/support'
import { ActorsEnvironment, FilesEnvironment } from '../../../e2e/support/environment'

export async function navigateToGeneralManagementPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.General({ page })
  await pageObject.navigate()
}

export async function uploadLogoFromLocalPath({
  actorsEnvironment,
  stepUser,
  localFile,
  filesEnvironment
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  localFile: string
  filesEnvironment: FilesEnvironment
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const generalObject = new objects.applicationAdminSettings.General({ page })
  const logoPath = filesEnvironment.getFile({ name: localFile.split('/').pop() }).path
  await generalObject.uploadLogo({ path: logoPath })
}

export async function resetLogo({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const generalObject = new objects.applicationAdminSettings.General({ page })
  await generalObject.resetLogo()
}

export async function navigateToGroupsManagementPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.page.Groups({ page })
  await groupsObject.navigate()
}

export async function createGroups({
  actorsEnvironment,
  stepUser,
  groupIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  groupIds: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  for (const groupId of groupIds) {
    await groupsObject.createGroup({ key: groupId })
  }
}

export async function checkGroupsPresenceById({
  actorsEnvironment,
  stepUser,
  expectedGroupIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedGroupIds: string[]
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const actualGroupsIds = await groupsObject.getDisplayedGroupsIds()
  for (const group of expectedGroupIds) {
    if (!actualGroupsIds.includes(groupsObject.getUUID({ key: group }))) {
      return false
    }
  }
  return true
}

export async function groupDisplayNameExists({
  actorsEnvironment,
  stepUser,
  groupDisplayName
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  groupDisplayName: string
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const groups = await groupsObject.getGroupsDisplayName()
  return groups.includes(groupDisplayName)
}

export async function deleteGroups({
  actorsEnvironment,
  stepUser,
  actionType,
  groupsToBeDeleted
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionType: string
  groupsToBeDeleted: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const groupIds = []
  switch (actionType) {
    case 'batch actions':
      for (const group of groupsToBeDeleted) {
        groupIds.push(groupsObject.getUUID({ key: group }))
        await groupsObject.selectGroup({ key: group })
      }
      await groupsObject.deleteGroupUsingBatchAction({ groupIds })
      break
    case 'context menu':
      for (const group of groupsToBeDeleted) {
        await groupsObject.deleteGroupUsingContextMenu({ key: group })
      }
      break
    default:
      throw new Error(`'${actionType}' not implemented`)
  }
}

export async function changeGroup({
  actorsEnvironment,
  stepUser,
  key,
  attribute,
  value,
  action
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  attribute: string
  value: string
  action: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  await groupsObject.changeGroup({
    key,
    attribute: attribute,
    value,
    action
  })
}
