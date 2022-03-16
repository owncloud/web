import { Page } from 'playwright'
import { createLink, createLinkArgs } from './actions'
import { linkStore } from '../../../store'

export class Link {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async create(args: Omit<createLinkArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    const url = await createLink({ page: this.#page, ...args })

    linkStore.set(args.name, { name: args.name, url, password: args.password })
    await this.#page.goto(startUrl)
  }
}
