import { Page } from '@playwright/test'
import * as po from './actions'

export class Accessibility {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async checkAccessibilityConformity(include: string): Promise<boolean> {
    return await po.checkAccessibilityConformity({ page: this.#page, include })
  }

  async checkAccessibilityConformityWithException(
    include: string,
    exclude: string
  ): Promise<boolean> {
    return await po.checkAccessibilityConformityWithException({
      page: this.#page,
      include,
      exclude
    })
  }

  async checkAccessibilityConformityWith2Exceptions(
    include: string,
    exclude: string,
    exclude2: string
  ): Promise<boolean> {
    return await po.checkAccessibilityConformityWith2Exceptions({
      page: this.#page,
      include,
      exclude,
      exclude2
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
