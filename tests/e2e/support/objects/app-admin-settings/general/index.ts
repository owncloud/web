import { Page } from 'playwright'
import * as PO from './actions'

export class General {
  #page: Page
  constructor({ page }: { page: Page }) {
    this.#page = page
  }
  async uploadLogo({ path }: { path: string }): Promise<void> {
    await PO.uploadLogo(path, this.#page)
  }
  async resetLogo(): Promise<void> {
    await PO.resetLogo(this.#page)
  }
}
