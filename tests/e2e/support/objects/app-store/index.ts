import { Download, Page } from '@playwright/test'
import * as po from './actions'

export class AppStore {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async openAppStore(): Promise<void> {
    await po.openAppStore({ page: this.#page })
  }

  waitForAppStoreIsVisible(): Promise<void> {
    return po.waitForAppStoreIsVisible({ page: this.#page })
  }

  getAppsList(): Promise<string[]> {
    return po.getAppsList({ page: this.#page })
  }

  setSearchTerm(searchTerm: string): Promise<void> {
    return po.setSearchTerm({ page: this.#page, searchTerm })
  }

  selectAppTag({ app, tag }: { app: string; tag: string }): Promise<void> {
    return po.selectAppTag({ page: this.#page, app, tag })
  }

  selectTag(tag): Promise<void> {
    return po.selectTag({ page: this.#page, tag })
  }

  selectApp(app: string): Promise<void> {
    return po.selectApp({ page: this.#page, app })
  }

  waitForAppDetailsIsVisible(app: string): Promise<void> {
    return po.waitForAppDetailsIsVisible({ page: this.#page, app })
  }

  downloadApp(app: string): Promise<Download> {
    return po.downloadApp({ page: this.#page, app })
  }

  downloadAppVersion(version: string): Promise<string> {
    return po.downloadAppVersion({ page: this.#page, version })
  }

  async navigateToAppStoreOverview(): Promise<void> {
    await po.navigateToAppStoreOverview({ page: this.#page })
  }
}
