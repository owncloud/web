import { DataTable, When, Then, world } from '@cucumber/cucumber'
import path from 'path'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'
import { config } from '../../../config'
import {
  createResourceTypes,
  displayedResourceType,
  shortcutType,
  ActionViaType
} from '../../../support/objects/app-files/resource/actions'
import { Public } from '../../../support/objects/app-files/page/public'
import { Resource } from '../../../support/objects/app-files'
import * as runtimeFs from '../../../support/utils/runtimeFs'
import { searchFilter } from '../../../support/objects/app-files/resource/actions'
import { File } from '../../../support/types'
import { substitute } from '../../../support/utils'

When(
  '{string} creates the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.create({
        name: info.resource,
        type: info.type as createResourceTypes,
        content: info.content,
        password: info.password,
        world: this
      })
    }
  }
)

When(
  '{string} uploads the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      await resourceObject.upload({
        to: info.to,
        resources: [this.filesEnvironment.getFile({ name: info.resource })],
        option: info.option,
        type: info.type,
        world: this
      })
    }
  }
)

When(
  '{string} tries to upload the following resource',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      await resourceObject.tryToUpload({
        to: info.to,
        resources: [this.filesEnvironment.getFile({ name: info.resource })],
        error: info.error,
        world: this
      })
    }
  }
)

When(
  '{string} starts uploading the following large resource(s) from the temp upload directory',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      await resourceObject.startUpload({
        to: info.to,
        resources: [
          this.filesEnvironment.getFile({
            name: path.join(runtimeFs.getTempUploadPath().replace(config.assets, ''), info.resource)
          })
        ],
        option: info.option,
        world: this
      })
    }
  }
)

When(
  '{string} {word} the file upload',
  async function (this: World, stepUser: string, action: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    switch (action) {
      case 'pauses':
        await resourceObject.pauseUpload()
        break
      case 'resumes':
        await resourceObject.resumeUpload()
        break
      case 'cancels':
        await resourceObject.cancelUpload()
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }
)

When(
  /^"([^"]*)" downloads the following resource(?:s)? using the (sidebar panel|batch action|preview topbar)$/,
  async function (this: World, stepUser: string, actionType: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await processDownload(stepTable, resourceObject, actionType, this)
  }
)

When(
  /^"([^"]*)" deletes the following resource(?:s)? using the (sidebar panel|batch action)$/,
  async function (this: World, stepUser: string, actionType: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await processDelete(stepTable, resourceObject, actionType)
  }
)

When(
  '{string} renames the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const { resource, as } of stepTable.hashes()) {
      await resourceObject.rename({ resource, newName: as })
    }
  }
)

When(
  /^"([^"]*)" (copies|moves) the following resource(?:s)? using (keyboard|drag-drop|drag-drop-breadcrumb|sidebar-panel|dropdown-menu|batch-action)$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    method: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    // drag-n-drop always does MOVE
    if (method.includes('drag-drop')) {
      expect(actionType).toBe('moves')
    }

    for (const { resource, to, option } of stepTable.hashes()) {
      await resourceObject[actionType === 'copies' ? 'copy' : 'move']({
        resource,
        newLocation: to,
        method,
        option: option,
        world: this
      })
    }
  }
)

When(
  /^"([^"]*)" (copies|moves) the following resources to "([^"]*)" at once using (keyboard|drag-drop|drag-drop-breadcrumb|dropdown-menu|batch-action)$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    newLocation: string,
    method: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    // drag-n-drop always does MOVE
    if (method.includes('drag-drop')) {
      expect(actionType).toBe('moves')
    }

    const resources = [].concat(...stepTable.rows())
    await resourceObject[
      actionType === 'copies' ? 'copyMultipleResources' : 'moveMultipleResources'
    ]({
      newLocation,
      method,
      resources,
      world: this
    })
  }
)

When(
  '{string} restores following resource(s) version',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const fileInfo = stepTable.hashes().reduce<Record<string, any>>((acc, stepRow) => {
      const { to, resource, version, openDetailsPanel } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.filesEnvironment.getFile({ name: resource }))

      if (version !== '1') {
        throw new Error('restoring is only supported for the most recent version')
      }
      acc[to]['openDetailsPanel'] = openDetailsPanel === 'true'

      return acc
    }, {})
    for (const folder of Object.keys(fileInfo)) {
      await resourceObject.restoreVersion({
        folder,
        files: fileInfo[folder],
        openDetailsPanel: fileInfo[folder]['openDetailsPanel'],
        world: this
      })
    }
  }
)

When(
  '{string} downloads old version of the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const fileInfo = stepTable.hashes().reduce<Record<string, File[]>>((acc, stepRow) => {
      const { to, resource } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.filesEnvironment.getFile({ name: resource }))

      return acc
    }, {})

    for (const folder of Object.keys(fileInfo)) {
      await resourceObject.downloadVersion({ folder, files: fileInfo[folder], world: this })
    }
  }
)

When(
  '{string} deletes the following resources from trashbin using the batch action',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const resources = [].concat(...stepTable.rows())
    await resourceObject.deleteTrashbinMultipleResources({ resources })
  }
)

When(
  '{string} empties the trashbin',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.emptyTrashbin({ page })
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to delete following resource(?:s)? from the trashbin?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      if (actionType === 'should') {
        const message = await resourceObject.deleteTrashBin({ resource: info.resource })
        const paths = info.resource.split('/')
        expect(message).toBe(`"${paths[paths.length - 1]}" was deleted successfully`)
      } else {
        await resourceObject.expectThatDeleteTrashBinButtonIsNotVisible({ resource: info.resource })
      }
    }
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to restore following resource(?:s)? from the trashbin?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      if (actionType === 'should') {
        const message = await resourceObject.restoreTrashBin({
          resource: info.resource
        })
        const paths = info.resource.split('/')
        expect(message).toBe(`${paths[paths.length - 1]} was restored successfully`)
      } else {
        await resourceObject.expectThatRestoreTrashBinButtonIsNotVisible({
          resource: info.resource
        })
      }
    }
  }
)

Then(
  /^"([^"]*)" restores the following resource(?:s)? from trashbin( using the batch action)?$/,
  async function (
    this: World,
    stepUser: string,
    batchAction: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    if (batchAction) {
      const resources = stepTable.hashes().map((info) => info.resource)
      const message = await resourceObject.batchRestoreTrashBin({ resources })
      expect(message).toBe(`${resources.length} files restored successfully`)
    } else {
      for (const info of stepTable.hashes()) {
        const message = await resourceObject.restoreTrashBin({ resource: info.resource })
        const paths = info.resource.split('/')
        expect(message).toBe(`${paths[paths.length - 1]} was restored successfully`)
      }
    }
  }
)

When(
  /^"([^"]*)" searches "([^"]*)" using the global search(?: and the "([^"]*)" filter)?( and presses enter)?$/,
  async function (
    this: World,
    stepUser: string,
    keyword: string,
    filter: string,
    command: string
  ): Promise<void> {
    keyword = keyword ?? ''
    const pressEnter = !!command && command.endsWith('presses enter')
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    // let search indexing to complete
    await page.waitForTimeout(1000)
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.searchResource({
      keyword,
      filter: filter as searchFilter,
      pressEnter
    })
  }
)

Then(
  /^following resources (should|should not) be displayed in the (search list|files list|Shares|trashbin) for user "([^"]*)"$/,
  async function (
    this: World,
    actionType: string,
    listType: string,
    stepUser: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const actualList = await resourceObject.getDisplayedResources({
      keyword: listType as displayedResourceType
    })
    for (const info of stepTable.hashes()) {
      expect(actualList.includes(info.resource)).toBe(actionType === 'should')
    }
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} opens file/folder {string}',
  async function (this: World, stepUser: string, resource: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.openFolder(resource)
  }
)

When(
  '{string} navigates to folder {string} via breadcrumb',
  async function (this: World, stepUser: string, resource: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.openFolderViaBreadcrumb(resource)
  }
)

When(
  '{string} enables the option to display the hidden file',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.showHiddenFiles(this)
  }
)

When('{string} enables flat list', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.toggleFlatList(this)
})

Then(
  '{string} should see files being sorted in alphabetic order',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const allFiles: string[] = await resourceObject.getAllFiles()
    const sortedFiles = [...allFiles].sort((a, b) =>
      a.localeCompare(b, 'en-us', { numeric: true, ignorePunctuation: true })
    )
    expect(allFiles).toEqual(sortedFiles)
  }
)

When(
  '{string} switches to the tiles-view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.switchToTilesViewMode(this)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} sees the resources displayed as tiles',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.expectThatResourcesAreTiles(this)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

export const processDelete = async (
  stepTable: DataTable,
  pageObject: Public | Resource,
  actionType: string
) => {
  let files, parentFolder
  const deleteInfo = stepTable
    .hashes()
    .reduce<Record<string, { name: string }[]>>((acc, stepRow) => {
      const { resource, from } = stepRow
      const resourceInfo = {
        name: resource
      }
      if (!acc[from]) {
        acc[from] = []
      }
      acc[from].push(resourceInfo)
      return acc
    }, {})

  for (const folder of Object.keys(deleteInfo)) {
    files = deleteInfo[folder]
    parentFolder = folder !== 'undefined' ? folder : null
    await pageObject.delete({
      folder: parentFolder,
      resourcesWithInfo: files,
      via: actionType === 'batch action' ? 'BATCH_ACTION' : 'SIDEBAR_PANEL',
      world: this
    })
  }
}

export const processDownload = async (
  stepTable: DataTable,
  pageObject: Public | Resource,
  actionType: string,
  world: World
) => {
  let downloads, files, parentFolder
  const downloadedResources: string[] = []
  const downloadInfo = stepTable
    .hashes()
    .reduce<Record<string, { name: string; type: string }[]>>((acc, stepRow) => {
      const { resource, from, type } = stepRow
      const resourceInfo = {
        name: resource,
        type: type
      }
      if (!acc[from]) {
        acc[from] = []
      }

      acc[from].push(resourceInfo)

      return acc
    }, {})

  for (const folder of Object.keys(downloadInfo)) {
    files = downloadInfo[folder]
    parentFolder = folder !== 'undefined' ? folder : null

    let via: ActionViaType = 'SINGLE_SHARE_VIEW'
    switch (actionType) {
      case 'batch action':
        via = 'BATCH_ACTION'
        break
      case 'sidebar panel':
        via = 'SIDEBAR_PANEL'
        break
      case 'preview topbar':
        via = 'PREVIEW_TOPBAR'
        break
      default:
        break
    }

    downloads = await pageObject.download({
      folder: parentFolder,
      resources: files,
      via,
      world
    })

    downloads.forEach((download) => {
      const { name } = path.parse(download.suggestedFilename())
      downloadedResources.push(name)
    })

    if (actionType === 'sidebar panel' || actionType === 'preview topbar') {
      expect(downloads.length).toBe(files.length)
      for (const resource of files) {
        const fileOrFolderName = path.parse(resource.name).name
        if (resource.type === 'file') {
          expect(downloadedResources).toContain(fileOrFolderName)
        } else {
          expect(downloadedResources).toContain('download')
        }
      }
    }
  }

  if (actionType === 'batch action') {
    expect(downloads.length).toBe(1)
    downloads.forEach((download) => {
      const { name } = path.parse(download.suggestedFilename())
      expect(name).toBe('download')
    })
  }
}

When(
  '{string} edits the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.editResource({
        name: info.resource,
        type: info.type,
        content: info.content,
        world: this
      })
      const a11yObject = new objects.a11y.Accessibility({ page })
      const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
      this.currentStepData = {
        a11yViolations
      }
      expect(a11yViolations).toMatchObject([])
    }
  }
)

When(
  '{string} clicks the tag {string} on the resource {string}',
  async function (
    this: World,
    stepUser: string,
    tagName: string,
    resourceName: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.clickTag({ resource: resourceName, tag: tagName.toLowerCase() })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  /^"([^"].*)" opens the following file(?:s)? in (mediaviewer|pdfviewer|texteditor|Collabora|OnlyOffice)$/,
  async function (this: World, stepUser: string, actionType: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.openFileInViewer({
        name: info.resource,
        actionType: actionType as
          | 'mediaviewer'
          | 'pdfviewer'
          | 'texteditor'
          | 'Collabora'
          | 'OnlyOffice'
      })
      const a11yObject = new objects.a11y.Accessibility({ page })
      const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
      this.currentStepData = {
        a11yViolations
      }
      expect(a11yViolations).toMatchObject([])
    }
  }
)

Then(
  'the following resource(s) should contain the following tag(s) in the files list for user {string}',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const { resource, tags } of stepTable.hashes()) {
      const isVisible = await resourceObject.areTagsVisibleForResourceInFilesTable({
        resource,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase()),
        world: this
      })
      expect(isVisible).toBe(true)
    }
  }
)

Then(
  'the following resource(s) should contain the following tag(s) in the details panel for user {string}',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const { resource, tags } of stepTable.hashes()) {
      const isVisible = await resourceObject.areTagsVisibleForResourceInDetailsPanel({
        resource,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase()),
        world: this
      })
      const a11yObject = new objects.a11y.Accessibility({ page })
      const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
      this.currentStepData = {
        a11yViolations
      }
      expect(a11yViolations).toMatchObject([])
      expect(isVisible).toBe(true)
    }
  }
)

When(
  '{string} adds the following tag(s) for the following resource(s) using the sidebar panel',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const { resource, tags } of stepTable.hashes()) {
      await resourceObject.addTags({
        resource,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase()),
        world: this
      })
      const a11yObject = new objects.a11y.Accessibility({ page })
      const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
      this.currentStepData = {
        a11yViolations
      }
      expect(a11yViolations).toMatchObject([])
    }
  }
)

When(
  '{string} removes the following tag(s) for the following resource(s) using the sidebar panel',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const { resource, tags } of stepTable.hashes()) {
      await resourceObject.removeTags({
        resource,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase()),
        world: this
      })
      const a11yObject = new objects.a11y.Accessibility({ page })
      const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
      this.currentStepData = {
        a11yViolations
      }
      expect(a11yViolations).toMatchObject([])
    }
  }
)

When(
  '{string} tries to add the following tag(s) for the following resources using the sidebar panel',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const { resource, tags } of stepTable.hashes()) {
      await resourceObject.tryToAddTags({
        resource,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase()),
        world: this
      })
    }
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should see the following tag validation message:',
  async function (this: World, stepUser: string, message: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const actualMessage = await resourceObject.getTagValidationMessage()
    expect(actualMessage).toBe(message)
  }
)

When(
  /^"([^"].*)" creates a file from template file "([^"].*)" via "([^"].*)" using the (sidebar panel|context menu)$/,
  async function (
    this: World,
    stepUser: string,
    file: string,
    webOffice: string,
    via: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.createFileFromTemplate(file, webOffice, via, this)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} opens template file {string} via {string} using the context menu',
  async function (this: World, stepUser: any, file: any, webOffice: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.openTemplateFile(file, webOffice)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} creates space {string} from folder {string} using the context menu',
  async function (this: World, stepUser: string, spaceName: string, folderName: string) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const space = await resourceObject.createSpaceFromFolder({
      folderName: folderName,
      spaceName: spaceName
    })
    this.spacesEnvironment.createSpace({
      key: space.name,
      space: { name: space.name, id: space.id }
    })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} creates space {string} from resources using the context menu',
  async function (this: World, stepUser: string, spaceName: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const resources = stepTable.hashes().map((item) => item.resource)
    const space = await resourceObject.createSpaceFromSelection({ resources, spaceName })
    this.spacesEnvironment.createSpace({
      key: space.name,
      space: { name: space.name, id: space.id }
    })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should not see the version of the file(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const fileInfo = stepTable.hashes().reduce<Record<string, File[]>>((acc, stepRow) => {
      const { to, resource } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.filesEnvironment.getFile({ name: resource }))

      return acc
    }, {})

    for (const folder of Object.keys(fileInfo)) {
      await resourceObject.checkThatFileVersionIsNotAvailable({
        folder,
        files: fileInfo[folder],
        world: this
      })
    }
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should not see the version panel for the file(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const fileInfo = stepTable.hashes().reduce<Record<string, File[]>>((acc, stepRow) => {
      const { to, resource } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.filesEnvironment.getFile({ name: resource }))

      return acc
    }, {})

    for (const folder of Object.keys(fileInfo)) {
      await resourceObject.checkThatFileVersionPanelIsNotAvailable({
        folder,
        files: fileInfo[folder],
        world: this
      })
      const a11yObject = new objects.a11y.Accessibility({ page })
      const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
      this.currentStepData = {
        a11yViolations
      }
      expect(a11yViolations).toMatchObject([])
    }
  }
)

When(
  '{string} navigates to page {string} of the personal/project space files view',
  async function (this: World, stepUser: string, pageNumber: string) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.changePage({ pageNumber })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should be on page "{int}"',
  async function (this: World, stepUser: any, pageNumber: any) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const currentPage = await resourceObject.getCurrentPageNumber({ pageNumber })
    expect(currentPage).toBe(pageNumber.toString())
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} changes the items per page to {string}',
  async function (this: World, stepUser: string, itemsPerPage: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.changeItemsPerPage({ itemsPerPage, world: this })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should see the text {string} at the footer of the page',
  async function (this: World, stepUser: string, expectedText: string) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const actualText = await resourceObject.getFileListFooterText()
    expect(actualText).toBe(expectedText)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should see {int} resources in the personal/project space files view',
  async function (this: World, stepUser: string, expectedNumberOfResources: number) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const actualNumberOfResources = await resourceObject.countNumberOfResourcesInThePage()
    expect(actualNumberOfResources).toBe(expectedNumberOfResources)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should not see the pagination in the personal/project space files view',
  async function (this: World, stepUser: string) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.expectPageNumberNotToBeVisible()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} uploads the following resource(s) via drag-n-drop',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const resources = stepTable
      .hashes()
      .map((item) => this.filesEnvironment.getFile({ name: item.resource }))
    await resourceObject.dropUpload({ resources, world: this })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} uploads {int} small files in personal space',
  async function (this: World, stepUser: string, numberOfFiles: number): Promise<void> {
    const files = []
    for (let i = 0; i < numberOfFiles; i++) {
      const file = `file${i}.txt`
      runtimeFs.createFile(file, 'test content')

      files.push(
        this.filesEnvironment.getFile({
          name: path.join(runtimeFs.getTempUploadPath().replace(config.assets, ''), file)
        })
      )
    }

    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    await resourceObject.uploadLargeNumberOfResources({ resources: files, world: this })
  }
)

When(
  '{string} creates a shortcut for the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.createShotcut({
        resource: info.resource,
        name: info.name,
        type: info.type as shortcutType
      })
    }
  }
)

When(
  '{string} opens a shortcut {string}',
  async function (this: World, stepUser: string, name: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.openShotcut({ name: name })
  }
)

Then(
  '{string} can open a shortcut {string} with external url {string}',
  async function (this: World, stepUser: string, name: string, url: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.openShotcut({ name: name, url: url })
  }
)

Then(
  /^for "([^"]*)" file "([^"]*)" (should|should not) be locked$/,
  async function (this: World, stepUser: string, file: string, actionType: string) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const lockLocator = resourceObject.getLockLocator({ resource: file })

    actionType === 'should'
      ? await expect(lockLocator).toBeVisible()
      : // can take more than 5 seconds for lock to be released in case of OnlyOffice
        await expect(lockLocator).not.toBeVisible({ timeout: config.timeout * 1000 })
  }
)

When(
  /^"([^"]*)" navigates to the (next|previous) media resource$/,
  async function (this: World, stepUser: string, navigationType: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.navigateMediaFile(navigationType)
  }
)

When(
  '{string} opens a file {string} in the media-viewer using the sidebar panel',
  async function (this: World, stepUser: any, file: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.previewMediaFromSidebarPanel(file, this)
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to edit (?:folder|file) "([^"]*)"$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    resource: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const userCanEdit = await resourceObject.canManageResource({ resource, world: this })
    expect(userCanEdit).toBe(actionType === 'should' ? true : false)
  }
)

Then(
  /^"([^"]*)" (should|should not) see (link-direct|link-indirect|user-direct|user-indirect) indicator on the (?:folder|file) "([^"]*)"$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    buttonLabel: string,
    resource: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const showShareIndicator = resourceObject.showShareIndicatorSelector({
      buttonLabel,
      resource
    })
    actionType === 'should'
      ? await expect(showShareIndicator).toBeVisible()
      : await expect(showShareIndicator).not.toBeVisible()
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to edit content of following resources?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      const canEdit = await resourceObject.canEditDocumentContent({ type: info.type })
      expect(canEdit).toBe(actionType === 'should')
    }
  }
)

Then(
  /^"([^"]*)" (should|should not) see following actions for (?:folder|file) "([^"]*)"$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    resource: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      const actions = await resourceObject.getAllAvailableActions({ resource, world: this })
      if (actionType === 'should') {
        expect(actions.some((action) => action.startsWith(info.action))).toBe(true)
      } else {
        expect(actions.some((action) => action.startsWith(info.action))).toBe(false)
      }
    }
  }
)

Then(
  /^"([^"]*)" (should|should not) see (thumbnail and preview|preview) for file "([^"]*)"$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    action: string,
    resource: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    if (actionType === 'should') {
      action === 'thumbnail and preview' &&
        (await expect(resourceObject.getFileThumbnailLocator(resource)).toBeVisible())
      await resourceObject.shouldSeeFilePreview({ resource, world: this })
    } else {
      action === 'thumbnail and preview' &&
        (await expect(resourceObject.getFileThumbnailLocator(resource)).not.toBeVisible())
      await resourceObject.shouldNotSeeFilePreview({ resource, world: this })
    }
  }
)

Then(
  '{string} should see activity of the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.checkActivity({
        resource: info.resource,
        activity: substitute(info.activity),
        world: this
      })
    }
  }
)

Then(
  '{string} should not see any activity of the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.checkEmptyActivity({ resource: info.resource, world: this })
    }
  }
)

When(
  /^"([^"]*)" duplicates the following resource(?:s)? using (sidebar-panel|dropdown-menu|batch-action)$/,
  async function (
    this: World,
    stepUser: string,
    method: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      await resourceObject.duplicate(info.resource, method, this)
    }
  }
)

When(
  /^"([^"]*)" duplicates the following resource(?:s)? at once using (dropdown-menu|batch-action)$/,
  async function (
    this: World,
    stepUser: string,
    method: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const resources = [].concat(...stepTable.rows())
    await resourceObject.duplicateMultipleResources(resources, method)
  }
)
