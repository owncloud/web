import { Download } from 'playwright'
import { User, Actor, File } from '../../types'
import { filesCta } from '../../cta'
import path from 'path'

export class AllFilesPage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigate(): Promise<void> {
    const { page } = this.actor

    const allFilesBtn = page.locator('a[href="#/files/spaces/personal/home"] .text')
    await allFilesBtn.click()
  }

  async createFolder({ name }: { name: string }): Promise<void> {
    const { page } = this.actor

    const paths = name.split('/')
    const startUrl = page.url()

    for (const folderName of paths) {
      const folderExists = await filesCta.resourceExists({
        page: page,
        name: folderName
      })

      if (!folderExists) {
        await page.locator('#new-file-menu-btn').click()
        await page.locator('#new-folder-btn').click()
        await page.locator('.oc-modal input').fill(folderName)
        await Promise.all([
          page.waitForResponse(
            (resp) => resp.status() === 201 && resp.request().method() === 'MKCOL'
          ),
          page.locator('.oc-modal-body-actions-confirm').click()
        ])
      }

      await filesCta.navigateToFolder({ page: page, path: folderName })
    }

    await page.goto(startUrl)
    await page.waitForSelector('#files-personal-table')
  }

  async uploadFiles({
    files,
    folder,
    newVersion
  }: {
    files: File[]
    folder?: string
    newVersion?: boolean
  }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()

    if (folder) {
      await filesCta.navigateToFolder({ page: page, path: folder })
    }

    await page.locator('#new-file-menu-btn').click()
    await page.locator('#fileUploadInput').setInputFiles(files.map((file) => file.path))

    if (newVersion) {
      const fileName = files.map((file) => path.basename(file.name))
      await Promise.all([
        page.waitForResponse((resp) => resp.url().endsWith(fileName[0]) && resp.status() === 204),
        page.locator('.oc-modal-body-actions-confirm').click()
      ])
    }

    await filesCta.waitForResources({
      page: page,
      names: files.map((file) => path.basename(file.name))
    })

    await page.goto(startUrl)
    await page.locator('body').click()
  }

  async downloadFiles({ names, folder }: { names: string[]; folder: string }): Promise<Download[]> {
    const { page } = this.actor
    const startUrl = page.url()
    const downloads = []

    if (folder) {
      await filesCta.navigateToFolder({ page: page, path: folder })
    }

    for (const name of names) {
      await filesCta.sidebar.open({ page: page, resource: name })
      await filesCta.sidebar.openPanel({ page: page, name: 'actions' })

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('#oc-files-actions-sidebar .oc-files-actions-download-file-trigger').click()
      ])

      await filesCta.sidebar.close({ page: page })

      downloads.push(download)
    }

    await page.goto(startUrl)

    return downloads
  }

  async shareResource({
    folder,
    users,
    role,
    via
  }: {
    folder: string
    users: User[]
    role: string
    via: 'SIDEBAR_PANEL' | 'QUICK_ACTION'
  }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const folderPaths = folder.split('/')
    const folderName = folderPaths.pop()

    if (folderPaths.length) {
      await filesCta.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    switch (via) {
      case 'QUICK_ACTION':
        await page
          .locator(
            `//*[@data-test-resource-name="${folderName}"]/ancestor::tr//button[contains(@class, "files-quick-action-collaborators")]`
          )
          .click()
        break

      case 'SIDEBAR_PANEL':
        await filesCta.sidebar.open({ page: page, resource: folderName })
        await filesCta.sidebar.openPanel({ page: page, name: 'sharing' })
        break
    }

    for (const user of users) {
      const shareInputLocator = page.locator('#files-share-invite-input')
      await Promise.all([
        page.waitForResponse((resp) => resp.url().includes('sharees') && resp.status() === 200),
        shareInputLocator.fill(user.id)
      ])
      await shareInputLocator.focus()
      await page.waitForSelector('.vs--open')
      await page.locator('#files-share-invite-input').press('Enter')

      await page.locator('//*[@id="files-collaborators-role-button-new"]').click()
      await page.locator(`//*[@id="files-role-${role}"]`).click()
    }

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith('shares') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      page.locator('#new-collaborators-form-create-button').click()
    ])

    await filesCta.sidebar.close({ page: page })
    await page.goto(startUrl)
  }

  async renameResource({
    resource,
    newName
  }: {
    resource: string
    newName: string
  }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const { dir: resourceDir, base: resourceBase } = path.parse(resource)

    if (resourceDir) {
      await filesCta.navigateToFolder({ page: page, path: resourceDir })
    }

    await page.locator(`//*[@data-test-resource-name="${resourceBase}"]`).click({ button: 'right' })
    await page.locator('.oc-files-actions-rename-trigger').click()
    await page.locator('.oc-text-input').fill(newName)
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith(resourceBase) &&
          resp.status() === 201 &&
          resp.request().method() === 'MOVE'
      ),
      page.locator('.oc-modal-body-actions-confirm').click()
    ])

    await filesCta.waitForResources({
      page: page,
      names: [newName]
    })
    await page.goto(startUrl)
  }

  async moveOrCopyResource({
    resource,
    newLocation,
    action
  }: {
    resource: string
    newLocation: string
    action: 'copy' | 'move'
  }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const { dir: resourceDir, base: resourceBase } = path.parse(resource)

    if (resourceDir) {
      await filesCta.navigateToFolder({ page: page, path: resourceDir })
    }

    await page.locator(`//*[@data-test-resource-name="${resourceBase}"]`).click({ button: 'right' })
    await page.locator(`.oc-files-actions-${action}-trigger`).first().click()
    await page.locator('//ol[@class="oc-breadcrumb-list"]/li/*[1]').first().click()

    if (newLocation !== 'All files') {
      await filesCta.navigateToFolder({ page: page, path: newLocation })
    }

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith(resourceBase) &&
          resp.status() === 201 &&
          resp.request().method() === action.toUpperCase()
      ),
      page.locator('#location-picker-btn-confirm').click()
    ])

    await filesCta.waitForResources({
      page: page,
      names: [resourceBase]
    })
    await page.goto(startUrl)
  }

  async resourceExist({ name }: { name: string }): Promise<boolean> {
    const { page } = this.actor
    const folderPaths = name.split('/')
    const resourceName = folderPaths.pop()

    if (folderPaths.length) {
      await filesCta.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    return await filesCta.resourceExists({
      page: page,
      name: resourceName
    })
  }

  async deleteResource({ resource }: { resource: string }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const folderPaths = resource.split('/')
    const resourceName = folderPaths.pop()

    if (folderPaths.length) {
      await filesCta.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    const resourceCheckbox = page.locator(
      `//*[@data-test-resource-name="${resourceName}"]//ancestor::tr//input`
    )

    if (!(await resourceCheckbox.isChecked())) {
      await resourceCheckbox.check()
    }
    await page.locator('button.oc-files-actions-delete-trigger').first().click()
    await page.locator('.oc-modal-body-actions-confirm').click()
    await page.waitForResponse(
      (resp) => resp.url().includes(encodeURIComponent(resourceName)) && resp.status() === 204
    )

    await page.goto(startUrl)
  }

  async changeShareRole({
    folder,
    users,
    role
  }: {
    folder: string
    users: User[]
    role: string
  }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const folderPaths = folder.split('/')
    const folderName = folderPaths.pop()

    if (folderPaths.length) {
      await filesCta.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    await filesCta.sidebar.open({ page: page, resource: folderName })
    await filesCta.sidebar.openPanel({ page: page, name: 'sharing' })

    for (const user of users) {
      const userColumn = `//*[@data-testid="collaborator-user-item-${user.id}"]`
      await page.click(`${userColumn}//button[contains(@class,"files-recipient-role-select-btn")]`)
      await page.click(
        `${userColumn}//ul[contains(@class,"files-recipient-role-drop-list")]//button[@id="files-recipient-role-drop-btn-${role}"]`
      )
    }
    await page.goto(startUrl)
  }

  async deleteShare({ folder, users }: { folder: string; users: User[] }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const folderPaths = folder.split('/')
    const folderName = folderPaths.pop()

    if (folderPaths.length) {
      await filesCta.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    await filesCta.sidebar.open({ page: page, resource: folderName })
    await filesCta.sidebar.openPanel({ page: page, name: 'sharing' })

    for (const user of users) {
      const userColumn = `//*[@data-testid="collaborator-user-item-${user.id}"]`

      await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes('shares') &&
            resp.status() === 200 &&
            resp.request().method() === 'DELETE'
        ),
        page
          .locator(
            `${userColumn}//button[contains(@class,"collaborator-edit-dropdown-options-btn")]`
          )
          .first()
          .click(),
        page
          .locator(
            `${userColumn}//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"remove-share")]`
          )
          .click()
      ])
    }

    await page.goto(startUrl)
  }
}
