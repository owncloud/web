import { Page } from 'playwright'
import { uploadLogo, resetLogo } from './actions'

export class General {
  #page: Page
  constructor({ page }: { page: Page }) {
    this.#page = page
  }
  async uploadLogo({ path }: { path: string }): Promise<void> {
    await uploadLogo(path, this.#page)
  }
  async resetLogo(): Promise<void> {
    await resetLogo(this.#page)
  }
}
