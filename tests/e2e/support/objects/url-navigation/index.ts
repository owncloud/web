import { Page } from '@playwright/test'
import * as po from './actions'

export class URLNavigation {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigateToDetailsPanelOfResource(
    args: Omit<po.navigateToDetailsPanelOfResourceArgs, 'page'>
  ): Promise<void> {
    await po.navigateToDetailsPanelOfResource({ ...args, page: this.#page })
  }

  async openResourceViaUrl(args: Omit<po.openResourceViaUrlArgs, 'page'>): Promise<void> {
    await po.openResourceViaUrl({ ...args, page: this.#page })
  }

  async openSpaceDirectlyInTheBrowser(
    args: Omit<po.openResourceDirectlyInTheBrowserArgs, 'page'>
  ): Promise<void> {
    await po.openSpaceDirectlyInTheBrowser({ ...args, page: this.#page })
  }
}
