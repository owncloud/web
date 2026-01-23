import { Page } from '@playwright/test'
import * as po from './actions'
import { World } from '../../../../cucumber/environment'

export class General {
  #page: Page
  constructor({ page }: { page: Page }) {
    this.#page = page
  }
  async uploadLogo({ path, world }: { path: string; world?: World }): Promise<void> {
    await po.uploadLogo(path, this.#page, world)
  }
  async resetLogo(world?: World): Promise<void> {
    await po.resetLogo(this.#page, world)
  }
}
