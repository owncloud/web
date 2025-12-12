import { DataTable, Then, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'

When(
  '{string} navigates to the app store',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.openAppStore(this)
  }
)

Then(
  '{string} should see the app store',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.waitForAppStoreIsVisible(this)
  }
)

Then(
  '{string} should see the following apps(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    const apps = await pageObject.getAppsList()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
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
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} clicks on the tag {string} of the app {string}',
  async function (this: World, stepUser: string, tag: string, app: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.selectAppTag({ tag, app })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} clicks on the tag {string}',
  async function (this: World, stepUser: string, tag: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.selectTag(tag)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} clicks on the app {string}',
  async function (this: World, stepUser: string, app: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.selectApp(app, this)
  }
)

Then(
  '{string} should see the app details of {string}',
  async function (this: World, stepUser: string, app: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.waitForAppDetailsIsVisible(app)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('#app-store')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} downloads app version {string}',
  async function (this: World, stepUser: string, version: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    expect(await pageObject.downloadAppVersion(version)).toContain(version)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('#app-store')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)
Then(
  '{string} downloads the latest version of the app {string}',
  async function (this: World, stepUser: string, app: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    expect(await pageObject.downloadApp(app)).toBeDefined()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('#app-store')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} navigates back to the app store overview',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.appStore.AppStore({ page })
    await pageObject.navigateToAppStoreOverview()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('#app-store')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)
