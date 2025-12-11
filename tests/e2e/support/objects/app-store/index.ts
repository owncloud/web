import { Download, Page } from '@playwright/test'
import * as po from './actions'
import { World } from '../../../cucumber/environment/world'

export class AppStore {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async openAppStore(world?: World): Promise<void> {
    await po.openAppStore({ page: this.#page, world: world })
  }

  waitForAppStoreIsVisible(world?: World): Promise<void> {
    return po.waitForAppStoreIsVisible({ page: this.#page, world: world })
  }

  getAppsList(world: World): Promise<string[]> {
    return po.getAppsList({ page: this.#page, world })
  }

  setSearchTerm(searchTerm: string, world: World): Promise<void> {
    return po.setSearchTerm({ page: this.#page, searchTerm, world })
  }

  selectAppTag({ app, tag, world }: { app: string; tag: string; world: World }): Promise<void> {
    return po.selectAppTag({ page: this.#page, app, tag, world })
  }

  selectTag(tag, world: World): Promise<void> {
    return po.selectTag({ page: this.#page, tag, world })
  }

  selectApp(app: string, world?: World): Promise<void> {
    return po.selectApp({ page: this.#page, app, world })
  }

  waitForAppDetailsIsVisible(app: string, world: World): Promise<void> {
    return po.waitForAppDetailsIsVisible({ page: this.#page, app, world })
  }

  downloadApp(app: string, world: World): Promise<Download> {
    return po.downloadApp({ page: this.#page, app, world })
  }

  downloadAppVersion(version: string, world: World): Promise<string> {
    return po.downloadAppVersion({ page: this.#page, version, world })
  }

  async navigateToAppStoreOverview(world: World): Promise<void> {
    await po.navigateToAppStoreOverview({ page: this.#page, world })
  }
}
