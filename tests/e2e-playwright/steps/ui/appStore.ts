import { ActorsEnvironment } from '../../../e2e/support/environment/index.js'
import { objects } from '../../../e2e/support'
import { Download } from '@playwright/test'

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
  app
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  app: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.appStore.AppStore({ page })
  await pageObject.waitForAppDetailsIsVisible(app)
}

export async function downloadAppVersion({
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

export async function downloadApp({
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

export async function navigateToAppStoreOverview({
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
