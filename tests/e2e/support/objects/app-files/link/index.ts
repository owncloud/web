import { Page } from 'playwright'
import { createLink, createLinkArgs } from './actions'
import { LinksEnvironment } from '../../../environment'

export class Link {
  #page: Page
  #linksEnvironment: LinksEnvironment

  constructor({ page }: { page: Page }) {
    this.#page = page
    this.#linksEnvironment = new LinksEnvironment()
  }

  async create(args: Omit<createLinkArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    const url = await createLink({ ...args, page: this.#page })

    this.#linksEnvironment.createLink({
      key: args.name,
      link: { name: args.name, url, password: args.password }
    })

    await this.#page.goto(startUrl)
  }
}
