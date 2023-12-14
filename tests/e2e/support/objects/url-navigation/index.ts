import { Page } from '@playwright/test'
import * as po from './actions'
import {openResourceDirectlyInTheBrowser, openResourceDirectlyInTheBrowserArgs} from "./actions";

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

  async openResourceDirectlyInTheBrowser(args: Omit<po.openResourceDirectlyInTheBrowserArgs, 'page'>): Promise<void> {
    await po.openResourceDirectlyInTheBrowser({...args, page:this.#page})
  }
}
