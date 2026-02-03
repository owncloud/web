import { objects } from '../../../e2e/support'
import {
  ActorsEnvironment,
  LinksEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { substitute } from '../../../e2e/support/utils'

export async function openPublicLink({
  actorsEnvironment,
  linksEnvironment,
  stepUser,
  name
}: {
  actorsEnvironment: ActorsEnvironment
  linksEnvironment: LinksEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = await actorsEnvironment.createActor({
    key: stepUser,
    namespace: actorsEnvironment.generateNamespace(stepUser, stepUser)
  })

  const { url } = linksEnvironment.getLink({ name })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.open({ url })
}

export async function createPublicLink({
  actorsEnvironment,
  stepUser,
  resource,
  password
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  password: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const publicObject = new objects.applicationFiles.Link({ page })
  await publicObject.create({ resource, password: substitute(password) })
}

export async function anonymousUserOpensPublicLink({
  actorsEnvironment,
  linksEnvironment,
  stepUser,
  name
}: {
  actorsEnvironment: ActorsEnvironment
  linksEnvironment: LinksEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = await actorsEnvironment.createActor({
    key: stepUser,
    namespace: actorsEnvironment.generateNamespace(`${stepUser} user language change`, 'Anonymous')
  })

  const { url } = linksEnvironment.getLink({ name })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.open({ url })
}

export async function anonymousUserUnlocksPublicLink({
  actorsEnvironment,
  stepUser,
  password
}: {
  actorsEnvironment: ActorsEnvironment
  password: string
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.authenticate({ password: substitute(password) })
}

export async function userDownloadsPublicLinkResource({
  actorsEnvironment,
  stepUser,
  password,
  actionType
}: {
  actorsEnvironment: ActorsEnvironment
  password: string
  stepUser: string
  actionType: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  // wating for shortcut pr
  // await processDownload(stepTable, pageObject, actionType)
}

export async function userUploadsResourceInPublicLink({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resource,
  to,
  option,
  type
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  to: string
  resource: string
  option: string
  type: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.upload({
    to: to,
    resources: [filesEnvironment.getFile({ name: resource })],
    option: option,
    type: type
  })
}

export async function userRenamesResourceOfPublicLink({
  actorsEnvironment,
  stepUser,
  resource,
  newName,
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  newName: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.rename({ resource, newName })
}
