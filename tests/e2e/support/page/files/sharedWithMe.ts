import { Actor } from '../../types'
import { filesCta } from '../../cta'
import path from 'path'

export class SharedWithMePage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigate(): Promise<void> {
    const { page } = this.actor
    await page
      .locator('//li[contains(@class, "oc-sidebar-nav-item")]//span[text()="Shared with me"]')
      .click()
  }

  async acceptShare({ name }: { name: string }): Promise<void> {
    const { page } = this.actor

    await page
      .locator(
        `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-status-accept")]`
      )
      .click()
    await page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200)

    /**
     * the next part exists to trick the backend, in some cases accepting a share can take longer in the backend.
     * therefore we're waiting for the resource to exist, navigate into it (if resource is a folder) to be really sure its there and then come back.
     * If the logic is needed more often it can be refactored into a shared helper.
     */
    await page
      .locator(`#files-shared-with-me-shares-table [data-test-resource-name="${name}"]`)
      .waitFor()
    if (!path.extname(name)) {
      await filesCta.navigateToFolder({ page, path: name })
      await this.navigate()
    }
  }

  async declineShare({ name }: { name: string }): Promise<void> {
    const { page } = this.actor

    await page
      .locator(
        `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-decline")]`
      )
      .click()
    await page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200)
  }
}
