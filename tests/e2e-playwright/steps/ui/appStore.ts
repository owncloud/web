import { ActorsEnvironment } from '../../../e2e/support/environment/index.js'
import { objects } from '../../../e2e/support'
import { Download } from '@playwright/test'
import { World } from '../../../e2e/cucumber/environment'

export async function openAppStore({
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

export async function waitForAppStoreIsVisible({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.waitForAppStoreIsVisible()
}

export async function selectApp({
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
export async function waitForAppDetailsIsVisible({
  actorsEnvironment,
  stepUser,
  app,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  app: string
  world?: World
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.waitForAppDetailsIsVisible(app, world)
}

export async function downloadAppVersion({
  actorsEnvironment,
  stepUser,
  version,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  version: string
  world?: World
}): Promise<string> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  return await pageObject.downloadAppVersion(version, world)
}

export async function downloadApp({
  actorsEnvironment,
  stepUser,
  app,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  app: string
  world?: World
}): Promise<Download> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  return await pageObject.downloadApp(app, world)
}

export async function navigateToAppStoreOverview({
  actorsEnvironment,
  stepUser,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  world?: World
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.navigateToAppStoreOverview(world)
}

export async function getAppsList({
  actorsEnvironment,
  stepUser,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  world?: World
}): Promise<Array<string>> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  return await pageObject.getAppsList(world)
}

export async function setSearchTerm({
  actorsEnvironment,
  stepUser,
  searchTerm,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  searchTerm: string
  world?: World
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.setSearchTerm(searchTerm, world)
}

export async function selectAppTag({
  actorsEnvironment,
  stepUser,
  tag,
  app,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  tag: string
  app: string
  world?: World
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.selectAppTag({ tag, app, world })
}

export async function selectTag({
  actorsEnvironment,
  stepUser,
  tag,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  tag: string
  world?: World
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.selectTag(tag, world)
}
