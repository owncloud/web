import { DataTable, Given, Then, When } from '@cucumber/cucumber'
import { FilesPage, World, config } from '../../support'
import { expect } from '@playwright/test'

When(
  '{string} navigates to the files page',
  async function (this: World, stepUser: string): Promise<void> {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()
  }
)

When(
  '{string} navigates to the shared with me page',
  async function (this: World, stepUser: string): Promise<void> {
    const actor = this.actorContinent.get({ id: stepUser })
    const { sharedWithMe: sharedWithMePage } = new FilesPage({ actor })

    await sharedWithMePage.navigate()
  }
)

When(
  '{string} creates following folder(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const folders = stepTable.raw().map((f) => f[0])

    for (const folder of folders) {
      await allFilesPage.createFolder({ name: folder })
    }
  }
)

When(
  '{string} uploads following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()

    const uploadInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { to, resource } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.fileContinent.get({ name: resource }))

      return acc
    }, {})

    for (const folder of Object.keys(uploadInfo)) {
      await allFilesPage.uploadFiles({ folder, files: uploadInfo[folder] })
    }
  }
)

When(
  '{string} shares following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { users: [], role: '' }
      }

      acc[resource].users.push(this.userContinent.get({ id: user }))
      acc[resource].role = role

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await allFilesPage.shareFolder({
        folder,
        users: shareInfo[folder].users,
        role: shareInfo[folder].role
      })
    }
  }
)

Given(
  '{string} downloads following files',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
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
  '{string} accepts following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    // Todo: implement explicit step definition for *.navigate()

    const actor = this.actorContinent.get({ id: stepUser })
    const { sharedWithMe: sharedWithMePage } = new FilesPage({ actor })
    const shares = stepTable.raw().map((f) => f[0])
    await sharedWithMePage.navigate()

    for (const share of shares) {
      await sharedWithMePage.acceptShare({ name: share })
    }
  }
)

When(
  '{string} renames following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()

    for (const { resource, as } of stepTable.hashes()) {
      await allFilesPage.renameResource({ resource, newName: as })
    }
  }
)

When(
  /^"([^"]*)" (copies|moves) following (resource|resources)$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    _: string,
    stepTable: DataTable
  ): Promise<void> {
    const actor = this.actorContinent.get({ id: stepUser })
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
  '{string} creates new versions of the following file(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const uploadInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { to, resource } = stepRow

      if (!acc[to]) {
        acc[to] = []
      }

      acc[to].push(this.fileContinent.get({ name: resource }))

      return acc
    }, {})

    for (const folder of Object.keys(uploadInfo)) {
      await allFilesPage.uploadFiles({ folder, files: uploadInfo[folder], newVersion: true })
    }
  }
)

When(
  '{string} declines following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { sharedWithMe: sharedWithMePage } = new FilesPage({ actor })
    const shares = stepTable.raw().map((f) => f[0])

    for (const share of shares) {
      await sharedWithMePage.declineShare({ name: share })
    }
  }
)

Then(
  '{string} ensures that the following resource(s) exist',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const resources = stepTable.raw().map((f) => f[0])

    await allFilesPage.navigate()

    for (const resource of resources) {
      const resourceExist = await allFilesPage.resourceExist({ name: resource })

      if (!resourceExist) {
        throw new Error(`resource wasn't find: "${resource}"`)
      }

      await allFilesPage.navigate()
    }
  }
)

Then(
  '{string} ensures that the following resource(s) do(es) not exist',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const resources = stepTable.raw().map((f) => f[0])

    await allFilesPage.navigate()

    for (const resource of resources) {
      await allFilesPage.resourceExist({ name: resource })
    }
  }
)

Then(
  '{string} ensure that resource {string} has {int} versions',
  async function (this: World, stepUser: string, resource: string, countOfVersion: number) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    // skipped in Oc10, since the version number in Oc10 is no more than 1
    if (config.ocis) {
      await expect(await allFilesPage.numberOfVersions({ resource: resource })).toEqual(
        countOfVersion
      )
    }
    await allFilesPage.navigate()
  }
)

When(
  '{string} deletes following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const resources = stepTable.raw().map((f) => f[0])

    for (const resource of resources) {
      await allFilesPage.deleteResourses({ resource: resource })
    }
  }
)

When(
  '{string} shares following resource(s) using main menu',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { users: [], role: '' }
      }

      acc[resource].users.push(this.userContinent.get({ id: user }))
      acc[resource].role = role

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await allFilesPage.shareFolder({
        folder,
        users: shareInfo[folder].users,
        role: shareInfo[folder].role,
        mainMenu: true
      })
    }
  }
)

When(
  '{string} opens file in Mediaviewer',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const resource = stepTable.raw().map((f) => f[0])

    await allFilesPage.openFileInMediaviewer({ resource: resource[0] })
  }
)

When(
  '{string} changes role for the following shared resources(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { users: [], role: '' }
      }

      acc[resource].users.push(this.userContinent.get({ id: user }))
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
  '{string} deletes share(s) following resource(s) with user(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource } = stepRow

      acc[resource] = []

      acc[resource].push(this.userContinent.get({ id: user }))

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await allFilesPage.deleteShare({ folder, users: shareInfo[folder] })
    }
  }
)
