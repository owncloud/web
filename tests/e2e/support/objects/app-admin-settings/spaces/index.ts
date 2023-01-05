import { Page } from 'playwright'
import { getDisplayedSpaces } from './actions'

export class Spaces {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  getDisplayedSpaces(): Promise<string[]> {
    return getDisplayedSpaces(this.#page)
  }
}
