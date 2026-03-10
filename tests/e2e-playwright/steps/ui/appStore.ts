import { ActorsEnvironment } from '../../../e2e/support/environment/index.js'
import { objects } from '../../../e2e/support'
import { Download } from '@playwright/test'

export async function userOpensAppStore({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.openAppStore()
}

export async function userShouldSeeAppStore({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.waitForAppStoreToBeVisible()
}

export async function userSelectsApp({
  actorsEnvironment,
  stepUser,
  app
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  app: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.selectApp(app)
}
export async function userShouldSeeAppDetails({
  actorsEnvironment,
  stepUser,
  app
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  app: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.waitForAppDetailsToBeVisible(app)
}

export async function userDownloadsAppVersion({
  actorsEnvironment,
  stepUser,
  version
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  version: string
}): Promise<string> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  return await pageObject.downloadAppVersion(version)
}

export async function userDownloadsApp({
  actorsEnvironment,
  stepUser,
  app
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  app: string
}): Promise<Download> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  return await pageObject.downloadApp(app)
}

export async function userNavigatesToAppStoreOverview({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.navigateToAppStoreOverview()
}

export async function userShouldSeeApps({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<Array<string>> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  return await pageObject.getAppsList()
}

export async function userSetsSearchTerm({
  actorsEnvironment,
  stepUser,
  searchTerm
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  searchTerm: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.setSearchTerm(searchTerm)
}

export async function userSelectsAppTag({
  actorsEnvironment,
  stepUser,
  tag,
  app
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  tag: string
  app: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.selectAppTag({ tag, app })
}

export async function userSelectsTag({
  actorsEnvironment,
  stepUser,
  tag
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  tag: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.selectTag(tag)
}
