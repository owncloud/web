import { DataTable, Then, When } from '@cucumber/cucumber'
import { Page, expect } from '@playwright/test'
import { World } from '../../environment'
import { objects } from '../../../support'
import { processDelete, processDownload } from './resources'
import { editor } from '../../../support/objects/app-files/utils'
import { securePassword } from '../../../support/store'

When(
  '{string} opens the public link {string}',
  async function (this: World, stepUser: string, name: string): Promise<void> {
    let page: Page
    try {
      page = this.actorsEnvironment.getActor({ key: stepUser }).page
    } catch {
      await this.actorsEnvironment
        .createActor({
          key: stepUser,
          namespace: this.actorsEnvironment.generateNamespace(this.feature.name, stepUser)
        })
        .then((actor) => (page = actor.page))
    }

    const { url } = this.linksEnvironment.getLink({ name })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await pageObject.open({ url })
  }
)

When(
  '{string} unlocks the public link with password {string}',
  async function (this: World, stepUser: string, password: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    if (password === '%copied_password%') {
      password = await page.evaluate('navigator.clipboard.readText()')
    } else {
      password = password === '%public%' ? securePassword : password
    }
    await pageObject.authenticate({ password })
  }
)

When(
  '{string} closes the file viewer',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    await editor.close(page)
  }
)

When(
  '{string} saves the file viewer',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    await editor.save(page)
  }
)

Then(
  /^"([^"]*)" is in a (text-editor|pdf-viewer|media-viewer)$/,
  async function (this: World, stepUser: string, fileViewerType: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const fileViewerLocator = editor.fileViewerLocator({ page, fileViewerType })
    await expect(fileViewerLocator).toBeVisible()
  }
)

When(
  '{string} enters the text {string} in editor {string}',
  async function (this: World, stepUser: string, text: string, editor: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await pageObject.fillDocumentContent({
      page,
      text,
      editor
    })
  }
)

When(
  '{string} should see the content {string} in editor {string}',
  async function (
    this: World,
    stepUser: string,
    expectedContent: string,
    editor: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    const actualFileContent = await pageObject.getDocumentContent({
      page,
      editor
    })
    expect(actualFileContent.trim()).toBe(expectedContent)
  }
)

When(
  '{string} drop uploads following resources',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })

    const resources = stepTable
      .hashes()
      .map((f) => this.filesEnvironment.getFile({ name: f.resource }))
    await pageObject.dropUpload({ resources })
  }
)

When(
  '{string} refreshes the old link',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await pageObject.reload()
  }
)

When(
  /^"([^"]*)" downloads the following public link resource(?:s)? using the (sidebar panel|batch action|single share view)$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await processDownload(stepTable, pageObject, actionType)
  }
)

When(
  '{string} renames the following public link resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    for (const { resource, as } of stepTable.hashes()) {
      await pageObject.rename({ resource, newName: as })
    }
  }
)

When(
  '{string} uploads the following resource(s) in public link page',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    for (const info of stepTable.hashes()) {
      await pageObject.upload({
        to: info.to,
        resources: [this.filesEnvironment.getFile({ name: info.resource })],
        option: info.option,
        type: info.type
      })
    }
  }
)

When(
  '{string} uploads the following resource(s) in internal link named {string}',
  async function (
    this: World,
    stepUser: string,
    link: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    const { url } = this.linksEnvironment.getLink({ name: link })
    for (const info of stepTable.hashes()) {
      await pageObject.uploadInternal({
        to: info.to,
        resources: [this.filesEnvironment.getFile({ name: info.resource })],
        option: info.option,
        link: url
      })
    }
  }
)

Then(
  '{string} should not be able to open the old link {string}',
  async function (this: World, stepUser: string, name: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    const { url } = this.linksEnvironment.getLink({ name })
    await pageObject.expectThatLinkIsDeleted({ url })
  }
)

When(
  /^"([^"]*)" deletes the following resources from public link using (sidebar panel|batch action)$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await processDelete(stepTable, pageObject, actionType)
  }
)

Then(
  'for {string} file {string} should be selected',
  async function (this: World, stepUser: string, fileName: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.expectFileToBeSelected({ fileName: fileName })
  }
)
