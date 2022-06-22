import { DataTable, When, Then } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'
import { config } from '../../../config'

When(
  '{string} creates the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const info of stepTable.hashes()) {
      if (info.type !== 'folder') {
        throw new Error('resource creation is currently only supported for folders ')
      }

      await resourceObject.create({ name: info.resource, type: info.type })
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
        to: info.to !== 'undefined' ? info.to : null,
        resources: [this.filesEnvironment.getFile({ name: info.resource })],
        createVersion: info.create_version === 'true'
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
  /^"([^"]*)" (copies|moves) the following (resource|resources)$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    _: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const resourceObject = new objects.applicationFiles.Resource({ page })

    for (const { resource, to } of stepTable.hashes()) {
      await resourceObject[actionType === 'copies' ? 'copy' : 'move']({
        resource,
        newLocation: to
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
      const message = await resourceObject.deleteTrashBin({ resource: info.resource })
      const paths = info.resource.split('/')
      if (actionType === 'should not') {
        expect(message).toBe(`failed to delete "${paths[paths.length - 1]}"`)
      } else {
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
      const message = await resourceObject.restoreTrashBin({
        resource: info.resource,
        actionType
      })
      const paths = info.resource.split('/')
      if (actionType === 'should not') {
        expect(message).toBe(`failed to restore "${paths[paths.length - 1]}"`)
      } else {
        expect(message).toBe(`${paths[paths.length - 1]} was restored successfully`)
      }
    }
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
        if (config.ocis) {
          expect(download.suggestedFilename()).toBe('download.tar')
        } else {
          if (parentFolder) {
            expect(download.suggestedFilename()).toBe(parentFolder + '.zip')
          } else {
            expect(download.suggestedFilename()).toBe('download.zip')
          }
        }
      })
    }
  }
}
