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
    await page.click('a[href="#/files/list/all"]')
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
        await page.click('#new-file-menu-btn')
        await page.click('#new-folder-btn')
        await page.fill('.oc-modal input', folderName)
        await page.click('.oc-modal-body-actions-confirm')
      }

      await cta.files.navigateToFolder({ page: page, path: folderName })
    }

    await page.goto(startUrl)
    await page.waitForSelector('#files-personal-table')
  }

  async uploadFiles({ files, folder }: { files: File[]; folder?: string }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()

    if (folder) {
      await cta.files.navigateToFolder({ page: page, path: folder })
    }
    await page.click('#new-file-menu-btn')
    await page.setInputFiles(
      '#fileUploadInput',
      files.map(file => file.path)
    )

    await cta.files.waitForResources({
      page: page,
      names: files.map(file => path.basename(file.name))
    })

    await page.goto(startUrl)
    await page.click('body')
  }

  async downloadFiles({ names, folder }: { names: string[]; folder: string }): Promise<Download[]> {
    const { page } = this.actor
    const startUrl = page.url()
    const downloads = []

    if (folder) {
      await cta.files.navigateToFolder({ page: page, path: folder })
    }

    for (const name of names) {
      await cta.files.sidebar.open({ page: page, resource: name })
      await cta.files.sidebar.openPanel({ page: page, name: 'actions' })

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('.oc-files-actions-download-trigger')
      ])

      await cta.files.sidebar.close({ page: page })

      downloads.push(download)
    }

    await page.goto(startUrl)

    return downloads
  }

  async shareFolder({
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
    await page.click('.files-collaborators-open-add-share-dialog-button')

    for (const user of users) {
      await page.fill('#files-share-invite-input', user.displayName)
      await page.waitForSelector('.vs--open')
      await page.press('#files-share-invite-input', 'Enter')

      await page.click('//*[@id="files-collaborators-role-button"]')
      await page.click(`//*[@id="files-role-${role}"]`)
    }

    await page.click('#files-collaborators-collaborator-save-new-share-button')
    await cta.files.sidebar.close({ page: page })

    await page.goto(startUrl)
  }

  async renameObject({ folder, name }: { folder: string; name: string }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const folderPaths = folder.split('/')
    const folderName = folderPaths.pop()

    if (folderPaths.length) {
      await cta.files.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    await page.click(`//*[@data-test-resource-name="${folderName}"]`, { button: 'right' })
    await page.click('.oc-files-actions-rename-trigger')
    await page.fill('.oc-text-input', name[0])
    await page.click('.oc-modal-body-actions-confirm')
    await page.reload()
    await page.goto(startUrl)
  }

  async moveOrCopyFiles({
    folder,
    moveTo,
    action
  }: {
    folder?: string
    moveTo: string
    action: string
  }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()
    const folderPaths = folder.split('/')
    const folderName = folderPaths.pop()
    const moveToPaths = moveTo[0].split('/')
    const folderToMoveName = moveToPaths.pop()

    if (folderPaths.length) {
      await cta.files.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    await page.click(`//*[@data-test-resource-name="${folderName}"]`, { button: 'right' })
    await page.click(`.oc-files-actions-${action}-trigger`)
    await page.click('//ol[@class="oc-breadcrumb-list"]/li/*[1]')

    if (moveToPaths.length) {
      await cta.files.navigateToFolder({ page: page, path: moveToPaths.join('/') })
    }

    if (folderToMoveName.length && folderToMoveName !== 'All files') {
      await page.click(`//*[@data-test-resource-name="${folderToMoveName}"]`)
    }
    await page.click('#location-picker-btn-confirm')
    await page.goto(startUrl)
  }
}
