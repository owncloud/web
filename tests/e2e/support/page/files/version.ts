import { Actor, File } from '../../types'
import { filesCta } from '../../cta'
import { expect, Locator } from '@playwright/test'
import path from 'path'

export class VersionPage {
  private readonly actor: Actor
  private readonly fileVersionSidebarXPath: Locator
  private readonly fileVersionSizeXPath: Locator
  private readonly fileVersionRevertButtonXPath: Locator
  private fileSizeXPath: Locator
  private static olderVersionSize: string

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
    this.fileVersionSidebarXPath = this.actor.page.locator(
      '//*[@id="oc-file-versions-sidebar"]/table/tbody/tr'
    )
    this.fileVersionSizeXPath = this.actor.page.locator(
      '//*[@data-testid="file-versions-file-size"]'
    )
    this.fileVersionRevertButtonXPath = this.actor.page.locator(
      '//*[@data-testid="file-versions-revert-button"]'
    )
  }

  async numberOfVersions({ resource }: { resource: string }): Promise<number> {
    const { page } = this.actor
    const folderPaths = resource.split('/')
    const resourceName = folderPaths.pop()

    if (folderPaths.length) {
      await filesCta.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    await filesCta.sidebar.open({ page: page, resource: resourceName })
    await filesCta.sidebar.openPanel({ page: page, name: 'versions' })

    const elements = this.fileVersionSidebarXPath
    return await elements.count()
  }

  async restoreOlderVersion({ files, folder }: { files: File[]; folder?: string }) {
    const { page } = this.actor
    const fileName = files.map((file) => path.basename(file.name))
    await filesCta.navigateToFolder({ page: page, path: folder })
    await filesCta.sidebar.open({ page: page, resource: fileName[0] })
    await filesCta.sidebar.openPanel({ page: page, name: 'versions' })
    const fileSize = await this.fileVersionSizeXPath.textContent()
    VersionPage.olderVersionSize = fileSize.trim()
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/v/') && resp.status() === 204 && resp.request().method() === 'COPY'
      ),
      await this.fileVersionRevertButtonXPath.click()
    ])
    // Files details page does not update after restore button is clicked
    // This is the issue: https://github.com/owncloud/web/issues/6361
    await page.reload()
  }

  async checkOlderVersionRestored({ resource }: { resource: string }) {
    const { page } = this.actor
    this.fileSizeXPath = page.locator(
      `//*[@data-test-resource-name="${resource}"]/ancestor::tr//*[@class="oc-resource-size"]`
    )
    const fileSize = await this.fileSizeXPath.textContent()
    expect(fileSize.length).toBe(VersionPage.olderVersionSize.length)
  }
}
