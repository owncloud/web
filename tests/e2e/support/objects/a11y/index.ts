import { Page } from '@playwright/test'
import * as po from './actions'

export class Accessibility {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  getSelectors(): { [key: string]: string } {
    return po.selectors
  }

  async getAccessibilityConformityViolations(include: string): Promise<any> {
    return await po.analyzeAccessibilityConformityViolations({ page: this.#page, include })
  }

  async getAccessibilityConformityViolationsWithExclusions(
    include: string,
    exclude: string | string[]
  ): Promise<any> {
    return await po.analyzeAccessibilityConformityViolationsWithExclusions({
      page: this.#page,
      include,
      exclude
    })
  }

  switchToCondensedTableView(): Promise<void> {
    return po.switchToCondensedTableView({ page: this.#page })
  }

  switchToDefaultTableView(): Promise<void> {
    return po.switchToDefaultTableView({ page: this.#page })
  }

  showDisplayOptions(): Promise<void> {
    return po.showDisplayOptions({ page: this.#page })
  }

  closeDisplayOptions(): Promise<void> {
    return po.closeDisplayOptions({ page: this.#page })
  }

  openFilesContextMenu(): Promise<void> {
    return po.openFilesContextMenu({ page: this.#page })
  }

  exitContextMenu(): Promise<void> {
    return po.exitContextMenu({ page: this.#page })
  }

  selectNew(): Promise<void> {
    return po.selectNew({ page: this.#page })
  }

  selectFolderOptionWithinNew(): Promise<void> {
    return po.selectFolderOptionWithinNew({ page: this.#page })
  }

  cancelCreatingNewFolder(): Promise<void> {
    return po.cancelCreatingNewFolder({ page: this.#page })
  }

  selectUpload(): Promise<void> {
    return po.selectUpload({ page: this.#page })
  }

  selectFileThroughCheckbox(): Promise<void> {
    return po.checkFileCheckbox({ page: this.#page })
  }

  deselectFileThroughCheckbox(): Promise<void> {
    return po.uncheckFileCheckbox({ page: this.#page })
  }
}
