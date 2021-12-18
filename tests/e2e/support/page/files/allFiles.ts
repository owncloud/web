import { Download } from 'playwright'
import { User, Actor, File } from '../../types'
import { cta } from '../../cta'
import path from 'path'

export class AllFilesPage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigate(): Promise<void> {
    const { page } = this.actor

    await page.locator('a[href="#/files/list/all"]').click()
  }

  async createFolder({ name }: { name: string }): Promise<void> {
    const { page } = this.actor

    const paths = name.split('/')
    const startUrl = page.url()

    for (const folderName of paths) {
      const folderExists = await cta.files.resourceExists({
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

      await cta.files.navigateToFolder({ page: page, path: folderName })
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
      await cta.files.navigateToFolder({ page: page, path: folder })
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

    await cta.files.waitForResources({
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
    const sidebarActionsDownloadBtn = page.locator(
      '#oc-files-actions-sidebar .oc-files-actions-download-file-trigger'
    )

    if (folder) {
      await cta.files.navigateToFolder({ page: page, path: folder })
    }

    for (const name of names) {
      await cta.files.sidebar.open({ page: page, resource: name })
      await cta.files.sidebar.openPanel({ page: page, name: 'actions' })

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        sidebarActionsDownloadBtn.click()
      ])

      await cta.files.sidebar.close({ page: page })

      downloads.push(download)
    }

    await page.goto(startUrl)

    return downloads
  }

  async shareResouce({
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

    await page.addStyleTag({
      content: `
      *,
      *::before,
      *::after {
      transition: none !important;
      }
      `
    })

    if (folderPaths.length) {
      await cta.files.navigateToFolder({ page: page, path: folderPaths.join('/') })
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
        await cta.files.sidebar.open({ page: page, resource: folderName })
        await cta.files.sidebar.openPanel({ page: page, name: 'sharing' })
        break
    }
    await page.locator('.files-collaborators-open-add-share-dialog-button').click()

    for (const user of users) {
      const shareInputLocator = page.locator('#files-share-invite-input')
      await Promise.all([
        page.waitForResponse((resp) => resp.url().includes('sharees') && resp.status() === 200),
        shareInputLocator.fill(user.displayName)
      ])
      await shareInputLocator.focus()
      await page.waitForSelector('.vs--open')
      await page.locator('#files-share-invite-input').press('Enter')

      await page.locator('//*[@id="files-collaborators-role-button"]').click()
      await page.locator(`//*[@id="files-role-${role}"]`).click()
    }

    await page.locator('#files-collaborators-collaborator-save-new-share-button').click()
    await cta.files.sidebar.close({ page: page })

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
      await cta.files.navigateToFolder({ page: page, path: resourceDir })
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

    await cta.files.waitForResources({
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
      await cta.files.navigateToFolder({ page: page, path: resourceDir })
    }

    await page.locator(`//*[@data-test-resource-name="${resourceBase}"]`).click({ button: 'right' })
    await page.locator(`.oc-files-actions-${action}-trigger`).first().click()
    await page.locator('//ol[@class="oc-breadcrumb-list"]/li/*[1]').first().click()

    if (newLocation !== 'All files') {
      await cta.files.navigateToFolder({ page: page, path: newLocation })
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

    await cta.files.waitForResources({
      page: page,
      names: [resourceBase]
    })
    await page.goto(startUrl)
  }

  async resourceExist({ name }: { name: string }): Promise<boolean> {
    const { page } = this.actor
    const folderPaths = name.split('/')
    const resouceName = folderPaths.pop()

    if (folderPaths.length) {
      await cta.files.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    return await cta.files.resourceExists({
      page: page,
      name: resouceName
    })
  }

  async numberOfVersions({ resource }: { resource: string }): Promise<number> {
    const { page } = this.actor
    const folderPaths = resource.split('/')
    const resouceName = folderPaths.pop()

    if (folderPaths.length) {
      await cta.files.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    await cta.files.sidebar.open({ page: page, resource: resouceName })
    await cta.files.sidebar.openPanel({ page: page, name: 'versions' })

    const elements = page.locator('//*[@id="oc-file-versions-sidebar"]/table/tbody/tr')
    return await elements.count()
  }

  async deleteResource({ resource }: { resource: string }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const folderPaths = resource.split('/')
    const resouceName = folderPaths.pop()

    if (folderPaths.length) {
      await cta.files.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    const resourceCheckbox = page.locator(
      `//*[@data-test-resource-name="${resouceName}"]//ancestor::tr//input`
    )

    if (!(await resourceCheckbox.isChecked())) {
      await resourceCheckbox.check()
    }
    await page.locator('button.oc-files-actions-delete-trigger').first().click()
    await page.locator('.oc-modal-body-actions-confirm').click()
    await page.waitForResponse(
      (resp) => resp.url().includes(encodeURIComponent(resouceName)) && resp.status() === 204
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
      await cta.files.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    await cta.files.sidebar.open({ page: page, resource: folderName })
    await cta.files.sidebar.openPanel({ page: page, name: 'sharing' })

    for (const user of users) {
<<<<<<< HEAD
      const userColumn = `//*[@data-testid="collaborator-user-item-${user.id}"]`
      await page.click(`${userColumn}//button[contains(@class,"files-recipient-role-select-btn")]`)
      await page.click(
        `${userColumn}//ul[contains(@class,"files-recipient-role-drop-list")]//button[@id="files-recipient-role-drop-btn-${role}"]`
      )
=======
      await page.locator(`//*[@data-testid="recipient-${user.id}-btn-edit"]`).click()
      await page.locator('//*[@id="files-collaborators-role-button"]').click()
      await page.locator(`//*[@id="files-role-${role}"]`).click()
      await page.locator('//*[@data-testid="recipient-edit-btn-save"]').click()
>>>>>>> 7305909f3 (prefer locators api over others)
    }
    await page.goto(startUrl)
  }

  async deleteShare({ folder, users }: { folder: string; users: User[] }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const folderPaths = folder.split('/')
    const folderName = folderPaths.pop()

    if (folderPaths.length) {
      await cta.files.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    await cta.files.sidebar.open({ page: page, resource: folderName })
    await cta.files.sidebar.openPanel({ page: page, name: 'sharing' })

<<<<<<< HEAD
    for (const user of users) {
      const userColumn = `//*[@data-testid="collaborator-user-item-${user.id}"]`
=======
    await page.locator('//*[@data-testid="collaborators-show-people"]').click()
>>>>>>> 7305909f3 (prefer locators api over others)

    for (const user of users) {
      await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes('shares') &&
            resp.status() === 200 &&
            resp.request().method() === 'DELETE'
        ),
        page
          .locator(
            `//*[@data-testid="collaborator-item-${user.id}"]//button[contains(@class,"files-collaborators-collaborator-delete")]`
          )
          .click()
      ])
    }
    await page.goto(startUrl)
  }
}
