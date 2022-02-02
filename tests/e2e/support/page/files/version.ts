import { Actor } from '../../types'
import { filesCta } from '../../cta'
import { Locator } from '@playwright/test'

export class VersionPage {
  private readonly actor: Actor
  private readonly fileVersionSidebarXPath: Locator

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
    this.fileVersionSidebarXPath = this.actor.page.locator(
      '//*[@id="oc-file-versions-sidebar"]/table/tbody/tr'
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
}
