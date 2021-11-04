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

    if (!config.ocis) {
      // Todo: add switch info in case of oc10 autoAccept shares
      return
    }

    const actor = this.actorContinent.get({ id: stepUser })
    const { sharedWithMe: sharedWithMePage } = new FilesPage({ actor })
    const shares = stepTable.raw().map((f) => f[0])
    await sharedWithMePage.navigate()

    for (const share of shares) {
      await sharedWithMePage.acceptShares({ name: share })
    }
  }
)

When(
  '{string} renames following resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })

    await allFilesPage.navigate()

    for (const { resource, newName } of stepTable.hashes()) {
      await allFilesPage.renameResource({ resource, newName })
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
  '{string} creates new versions of the folowing file(s)',
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
      await sharedWithMePage.declineShares({ name: share })
    }
  }
)

Then(
  '{string} checks whether the following resource(s) exist',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const resources = stepTable.raw().map((f) => f[0])

    for (const resource of resources) {
      await allFilesPage.checkThatResourceExist({ name: resource })
    }
  }
)

Then(
  '{string} checks the number of versions of the file',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const actor = this.actorContinent.get({ id: stepUser })
    const { allFiles: allFilesPage } = new FilesPage({ actor })
    const countInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { count, resource } = stepRow

      if (!acc[resource]) {
        acc[resource] = []
      }

      acc[resource].push(count)

      return acc
    }, {})

    for (const folder of Object.keys(countInfo)) {
      await allFilesPage.checkVersionCount({ folder, count: countInfo[folder] })
    }
  }
)

When('{string} creates new versions of the folowing file(s)', async function(
  this: World,
  stepUser: string,
  stepTable: DataTable
): Promise<void> {
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
})

When('{string} declines following resource(s)', async function(
  this: World,
  stepUser: string,
  stepTable: DataTable
) {
  const actor = this.actorContinent.get({ id: stepUser })
  const { sharedWithMe: sharedWithMePage } = new FilesPage({ actor })
  const shares = stepTable.raw().map(f => f[0])

  for (const share of shares) {
    await sharedWithMePage.declineShares({ name: share })
  }
})

Then('{string} checks whether the following resource(s) exist', async function(
  this: World,
  stepUser: string,
  stepTable: DataTable
) {
  const actor = this.actorContinent.get({ id: stepUser })
  const { allFiles: allFilesPage } = new FilesPage({ actor })
  const resources = stepTable.raw().map(f => f[0])

  for (const resource of resources) {
    await allFilesPage.resourceExist({ name: resource })
  }
})

Then('{string} checks whether the following resource(s) not exist', async function(
  this: World,
  stepUser: string,
  stepTable: DataTable
) {
  const actor = this.actorContinent.get({ id: stepUser })
  const { allFiles: allFilesPage } = new FilesPage({ actor })
  const resources = stepTable.raw().map(f => f[0])

  for (const resource of resources) {
    await allFilesPage.resourceExist({ name: resource, notExist: true })
  }
})

Then('{string} checks that new version exists', async function(
  this: World,
  stepUser: string,
  stepTable: DataTable
) {
  const actor = this.actorContinent.get({ id: stepUser })
  const { allFiles: allFilesPage } = new FilesPage({ actor })
  const resources = stepTable.raw().map(f => f[0])

  for (const resource of resources) {
    await allFilesPage.resourceExist({ name: resource, version: true })
  }
})

When('{string} removes following resource(s)', async function(
  this: World,
  stepUser: string,
  stepTable: DataTable
) {
  const actor = this.actorContinent.get({ id: stepUser })
  const { allFiles: allFilesPage } = new FilesPage({ actor })
  const resources = stepTable.raw().map(f => f[0])

  for (const resource of resources) {
    await allFilesPage.removeResourses({ resource: resource })
  }
})
