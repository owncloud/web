import { Page } from 'playwright'
import * as po from '../search/actions'

export class Search {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async fullTextSearch(args: Omit<po.fullTextSearchArgs, 'page'>): Promise<void> {
    await po.fullTextSearch({ ...args, page: this.#page })
  }

  getSearchResultMessage(): Promise<string> {
    return po.getSearchResultMessage({ page: this.#page })
  }

  async selectTagFilter({ tag: string }): Promise<void> {
    await po.selectTagFilter({ tag: string, page: this.#page })
  }

  async clearTagFilter(): Promise<void> {
    await po.clearTagFilter({ page: this.#page })
  }

  async toggleSearchInFileContent({ enableOrDisable: string }): Promise<void> {
    await po.toggleSearchInFileContent({ enableOrDisable: string, page: this.#page })
  }
}
