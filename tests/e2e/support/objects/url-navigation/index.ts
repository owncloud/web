import { Page } from '@playwright/test'
import * as po from './actions'

export class URLNavigation {
    #page: Page

    constructor({ page }: { page: Page }) {
        this.#page = page
    }

    navigateToDetailsPanelOfResource(args: Omit<po.navigateToDetailsPanelOfResourceArgs, 'page'>): Promise<void> {
        await po.navigateToDetailsPanelOfResource({ ...args, page: this.#page })
    }
}
