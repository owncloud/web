import { DataTable, When, Then } from '@cucumber/cucumber'
import path from 'path'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'
import { config } from '../../../config'
import { displayedResourceType } from '../../../support/objects/app-files/resource/actions'

When(
  '{string} creates the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.create({ name: info.resource, type: info.type, content: info.content })
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
        option: info.option
      })
    }
  }
)

When(
  /^"([^"]*)" downloads the following resource(s)? using the (sidebar panel|batch action)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await processDownload(stepTable, resourceObject, actionType)
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
  /^"([^"]*)" (copies|moves) the following resource(?:s)?( using (keyboard|drag-drop|sidebar)(?: panel)?)?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    method: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const { resource, to } of stepTable.hashes()) {
      await resourceObject[actionType === 'copies' ? 'copy' : 'move']({
        resource,
        newLocation: to,
        method: method ?? 'menu'
      })
    }
  }
)

When(
  '{string} restores following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const fileInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { to, resource, version } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.filesEnvironment.getFile({ name: resource }))

      if (version !== '1') {
        throw new Error('restoring is only supported for the most recent version')
      }

      return acc
    }, {})

    for (const folder of Object.keys(fileInfo)) {
      await resourceObject.restoreVersion({ folder, files: fileInfo[folder] })
    }
  }
)

When(
  '{string} deletes the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.delete({ resource: info.resource })
    }
  }
)

When(
  '{string} downloads old version of the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const fileInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { to, resource } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.filesEnvironment.getFile({ name: resource }))

      return acc
    }, {})

    for (const folder of Object.keys(fileInfo)) {
      await resourceObject.downloadVersion({ folder, files: fileInfo[folder] })
    }
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to empty the trashbin?$/,
  async function (this: World, stepUser: string, actionType: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    const message = await resourceObject.emptyTrashBin()
    if (actionType === 'should not') {
      expect(message).toBe('failed to delete all files permanently')
    } else {
      expect(message).toBe('all deleted files were removed')
    }
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to delete following resource(s) from the trashbin?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    _: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      if (actionType === 'should not') {
        const isVisible = await resourceObject.isDeleteTrashBinButtonVisible({
          resource: info.resource
        })
        expect(isVisible).toBe(false)
      } else {
        const message = await resourceObject.deleteTrashBin({ resource: info.resource })
        const paths = info.resource.split('/')
        expect(message).toBe(`"${paths[paths.length - 1]}" was deleted successfully`)
      }
    }
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to restore following resource(s) from the trashbin?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    _: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const info of stepTable.hashes()) {
      if (actionType === 'should not') {
        const isVisible = await resourceObject.isRestoreTrashBinButtonVisible({
          resource: info.resource
        })
        expect(isVisible).toBe(false)
      } else {
        const message = await resourceObject.restoreTrashBin({
          resource: info.resource
        })
        const paths = info.resource.split('/')
        expect(message).toBe(`${paths[paths.length - 1]} was restored successfully`)
      }
    }
  }
)
When(
  '{string} searches {string} using the global search',
  async function (this: World, stepUser: string, keyword: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.searchResource({ keyword })
  }
)

Then(
  /^following resources (should|should not) be displayed in the (search list|files list) for user "([^"]*)"?$/,
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
      const found = actualList.includes(info.resource)
      if (actionType === 'should') {
        expect(found).toBe(true)
      } else {
        expect(found).toBe(false)
      }
    }
  }
)

When(
  '{string} opens folder {string}',
  async function (this: World, stepUser: string, resource: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.openFolder(resource)
  }
)

When(
  '{string} enables the option to display the hidden file',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    await resourceObject.showHiddenFiles()
  }
)

export const processDownload = async (
  stepTable: DataTable,
  pageObject: any,
  actionType: string
) => {
  let downloads, files, parentFolder
  const downloadInfo = stepTable.hashes().reduce((acc, stepRow) => {
    const { resource, from } = stepRow

    if (!acc[from]) {
      acc[from] = []
    }

    acc[from].push(resource)

    return acc
  }, {})

  for (const folder of Object.keys(downloadInfo)) {
    files = downloadInfo[folder]
    parentFolder = folder !== 'undefined' ? folder : null
    downloads = await pageObject.download({
      folder: parentFolder,
      names: files,
      via: actionType === 'batch action' ? 'BATCH_ACTION' : 'SIDEBAR_PANEL'
    })
    if (actionType === 'sidebar panel') {
      expect(files.length).toBe(downloads.length)
      downloads.forEach((download) => {
        expect(files).toContain(download.suggestedFilename())
      })
    }
  }
  if (actionType === 'batch action') {
    if (files.length === 1) {
      expect(files.length).toBe(downloads.length)
      downloads.forEach((download) => {
        expect(files[0]).toBe(download.suggestedFilename())
      })
    } else {
      expect(downloads.length).toBe(1)
      downloads.forEach((download) => {
        const { name } = path.parse(download.suggestedFilename())
        if (config.ocis) {
          expect(name).toBe('download')
        } else {
          if (parentFolder) {
            expect(name).toBe(parentFolder)
          } else {
            expect(name).toBe('download')
          }
        }
      })
    }
  }
}

When(
  '{string} edits the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.editResourse({ name: info.resource, content: info.content })
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
  }
)

When(
  /^"([^"]*)" opens the following file(s)? in (mediaviewer|pdfviewer)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      await resourceObject.openFileInViewer({
        name: info.resource,
        actionType: actionType === 'mediaviewer' ? 'mediaviewer' : 'pdfviewer'
      })
    }
  }
)

Then(
  'the following resource(s) should contain the following tag(s) in the files list for user {string}',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    console.log('stepUser', stepUser)
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })
    for (const { resource, tags } of stepTable.hashes()) {
      const isVisible = await resourceObject.areTagsVisibleForResourceInFilesTable({
        resource,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase())
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
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase())
      })
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
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase())
      })
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
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase())
      })
    }
  }
)
