import { DataTable, Given, Then, When } from '@cucumber/cucumber'
import { World } from '../environment'
import { config } from '../../config'
import { FilesPage } from '../../support'
import { expect } from '@playwright/test'

When(
  '{string} navigates to the files page',
  async function (this: World, stepUser: string): Promise<void> {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()
  }
)

When(
  '{string} navigates to the shared with me page',
  async function (this: World, stepUser: string): Promise<void> {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { sharedWithMe: sharedWithMePage } = new FilesPage({ actor })

    await sharedWithMePage.navigate()
  }
)

When(
  '{string} creates the following folder(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const folders = stepTable.raw().map((f) => f[0])

    for (const folder of folders) {
      await allFilesPage.createFolder({ name: folder })
    }
  }
)

When(
  '{string} uploads the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()

    const uploadInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { to, resource } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.filesEnvironment.getFile({ name: resource }))

      return acc
    }, {})

    for (const folder of Object.keys(uploadInfo)) {
      await allFilesPage.uploadFiles({ folder, files: uploadInfo[folder] })
    }
  }
)

When(
  /^"([^"]*)" shares the following (resource|resources) via the (sidebar panel|quick action)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { users: [], role: '' }
      }

      acc[resource].users.push(this.usersEnvironment.getUser({ id: user }))
      acc[resource].role = role

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await allFilesPage.shareResource({
        folder,
        users: shareInfo[folder].users,
        role: shareInfo[folder].role,
        via: actionType === 'quick action' ? 'QUICK_ACTION' : 'SIDEBAR_PANEL'
      })
    }
  }
)

Given(
  '{string} downloads the following file(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()

    const downloadInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { resource, from } = stepRow

      if (!acc[from]) {
        acc[from] = []
      }

      acc[from].push(resource)

      return acc
    }, {})

    for (const folder of Object.keys(downloadInfo)) {
      const files = downloadInfo[folder]
      const downloads = await allFilesPage.downloadFiles({ folder, names: files })

      expect(files.length).toBe(downloads.length)
      downloads.forEach((download) => {
        expect(files).toContain(download.suggestedFilename())
      })
    }
  }
)

When(
  '{string} accepts the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    // Todo: implement explicit step definition for *.navigate()

    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { sharedWithMe: sharedWithMePage } = new FilesPage({ actor })
    const shares = stepTable.raw().map((f) => f[0])
    await sharedWithMePage.navigate()

    for (const share of shares) {
      await sharedWithMePage.acceptShare({ name: share })
    }
  }
)

When(
  '{string} renames the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()

    for (const { resource, as } of stepTable.hashes()) {
      await allFilesPage.renameResource({ resource, newName: as })
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
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()

    for (const { resource, to } of stepTable.hashes()) {
      await allFilesPage.moveOrCopyResource({
        resource,
        newLocation: to,
        action: actionType === 'copies' ? 'copy' : 'move'
      })
    }
  }
)

When(
  '{string} creates new version(s) of the following file(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const uploadInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { to, resource } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.filesEnvironment.getFile({ name: resource }))

      return acc
    }, {})

    for (const folder of Object.keys(uploadInfo)) {
      await allFilesPage.uploadFiles({ folder, files: uploadInfo[folder], newVersion: true })
    }
  }
)

When(
  '{string} declines the following resource share(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { sharedWithMe: sharedWithMePage } = new FilesPage({ actor })
    const shares = stepTable.raw().map((f) => f[0])

    for (const share of shares) {
      await sharedWithMePage.declineShare({ name: share })
    }
  }
)

Then(
  /^"([^"]*)" ensures that the following (resource|resources) (exist|does not exist)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const resources = stepTable.raw().map((f) => f[0])

    for (const resource of resources) {
      await allFilesPage.navigate()
      const resourceExist = await allFilesPage.resourceExist({ name: resource })

      if (actionType === 'exist' && !resourceExist) {
        throw new Error(`resource wasn't found: "${resource}"`)
      } else if (actionType === 'does not exist' && resourceExist) {
        throw new Error(`resource was found: "${resource}"`)
      }
    }
    await allFilesPage.navigate()
  }
)

Then(
  '{string} ensures that the resource {string} has {int} version(s)',
  async function (this: World, stepUser: string, resource: string, countOfVersion: number) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    // skipped in Oc10, since the version number in Oc10 is no more than 1
    if (config.ocis) {
      await expect(await allFilesPage.numberOfVersions({ resource })).toEqual(countOfVersion)
    }
    await allFilesPage.navigate()
  }
)

When(
  '{string} deletes the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const resources = stepTable.raw().map((f) => f[0])

    for (const resource of resources) {
      await allFilesPage.deleteResource({ resource })
    }
  }
)

When(
  '{string} changes the shared resource recipient role for the following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { users: [], role: '' }
      }

      acc[resource].users.push(this.usersEnvironment.getUser({ id: user }))
      acc[resource].role = role

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await allFilesPage.changeShareRole({
        folder,
        users: shareInfo[folder].users,
        role: shareInfo[folder].role
      })
    }
  }
)

When(
  '{string} removes following collaborator(s) from the share(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorsEnvironment.getActor({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource } = stepRow

      acc[resource] = []

      acc[resource].push(this.usersEnvironment.getUser({ id: user }))

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await allFilesPage.deleteShare({ folder, users: shareInfo[folder] })
    }
  }
)
