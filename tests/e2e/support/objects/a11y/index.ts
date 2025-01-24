import { Page } from '@playwright/test'
import * as po from './actions'

export class Accessibility {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async checkAccessibilityConformity(include: string, exclude: string | string[]): Promise<boolean> {
    return await po.checkAccessibilityConformity({ page: this.#page , include, exclude })
  }

  switchToCondensedTableView(): Promise<void> {
    return po.switchToCondensedTableView({ page: this.#page })
  }

  switchToDefaultTableView(): Promise<void> {
    return po.switchToDefaultTableView({ page: this.#page })
  }

  /*
  showDisplayOptions(): Promise<void> {
    return po.showDisplayOptions({ page: this.#page })
  }
    */
}