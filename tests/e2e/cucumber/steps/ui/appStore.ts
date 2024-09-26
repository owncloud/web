import { DataTable, Then, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'

When(
  '{string} navigates to the app store',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.openAppStore()
  }
)

Then(
  '{string} should see the app store',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.waitForAppStoreIsVisible()
  }
)

Then(
  '{string} should see the following apps(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    const apps = await pageObject.getAppsList()
    for (const { app } of stepTable.hashes()) {
      expect(apps).toContain(app)
    }
  }
)

When(
  '{string} enters the search term {string}',
  async function (this: World, stepUser: string, searchTerm: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.setSearchTerm(searchTerm)
  }
)

When(
  '{string} clicks on the tag {string} of the app {string}',
  async function (this: World, stepUser: string, tag: string, app: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.selectAppTag({ tag, app })
  }
)

When(
  '{string} clicks on the tag {string}',
  async function (this: World, stepUser: string, tag: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.selectTag(tag)
  }
)

When(
  '{string} clicks on the app {string}',
  async function (this: World, stepUser: string, app: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.selectApp(app)
  }
)

Then(
  '{string} should see the app details of {string}',
  async function (this: World, stepUser: string, app: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.waitForAppDetailsIsVisible(app)
  }
)

Then(
  '{string} downloads app version {string}',
  async function (this: World, stepUser: string, version: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    expect(await pageObject.downloadAppVersion(version)).toContain(version)
  }
)
Then(
  '{string} downloads the latest version of the app {string}',
  async function (this: World, stepUser: string, app: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    expect(await pageObject.downloadApp(app)).toBeDefined()
  }
)

When(
  '{string} navigates back to the app store overview',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.navigateToAppStoreOverview()
  }
)
