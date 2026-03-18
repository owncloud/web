import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import { World } from '../../support/world'

export async function userOpensAppStore({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.openAppStore()
}

export async function userShouldSeeAppStore({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.waitForAppStoreToBeVisible()
}

export async function userSelectsApp({
  world,
  stepUser,
  app
}: {
  world: World
  stepUser: string
  app: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.selectApp(app)
}
export async function userShouldSeeAppDetails({
  world,
  stepUser,
  app
}: {
  world: World
  stepUser: string
  app: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.waitForAppDetailsToBeVisible(app)
}

export async function userDownloadsAppVersion({
  world,
  stepUser,
  version
}: {
  world: World
  stepUser: string
  version: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  const downloadedVersion = await pageObject.downloadAppVersion(version)
  expect(downloadedVersion).toContain(version)
}

export async function userDownloadsApp({
  world,
  stepUser,
  app
}: {
  world: World
  stepUser: string
  app: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  const download = await pageObject.downloadApp(app)
  expect(download).toBeDefined()
}

export async function userNavigatesToAppStoreOverview({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.navigateToAppStoreOverview()
}

export async function userShouldSeeApps({
  world,
  stepUser,
  expectedApps
}: {
  world: World
  stepUser: string
  expectedApps: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  const apps = await pageObject.getAppsList()
  for (const app of expectedApps) {
    expect(apps).toContain(app)
  }
}

export async function userSetsSearchTerm({
  world,
  stepUser,
  searchTerm
}: {
  world: World
  stepUser: string
  searchTerm: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.setSearchTerm(searchTerm)
}

export async function userSelectsAppTag({
  world,
  stepUser,
  tag,
  app
}: {
  world: World
  stepUser: string
  tag: string
  app: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.selectAppTag({ tag, app })
}

export async function userSelectsTag({
  world,
  stepUser,
  tag
}: {
  world: World
  stepUser: string
  tag: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.selectTag(tag)
}
