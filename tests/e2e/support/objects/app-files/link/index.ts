import { Page } from 'playwright'
import * as PO from './actions'
import { LinksEnvironment } from '../../../environment'

export class Link {
  #page: Page
  #linksEnvironment: LinksEnvironment

  constructor({ page }: { page: Page }) {
    this.#page = page
    this.#linksEnvironment = new LinksEnvironment()
  }

  roleDisplayText = {
    internal: 'Only for invited people',
    viewer: 'Anyone with the link can view',
    contributor: 'Anyone with the link can upload',
    editor: 'Anyone with the link can edit',
    uploader: 'Secret File drop'
  }
  async create(args: Omit<PO.createLinkArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    const url = await PO.createLink({ ...args, page: this.#page })

    this.#linksEnvironment.createLink({
      key: args.name,
      link: { name: args.name, url }
    })

    await this.#page.goto(startUrl)
  }

  async changeName(args: Omit<PO.changeNameArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const name = await PO.changeName({ page: this.#page, ...args })
    const currentLink = this.#linksEnvironment.getLink({ name: 'Link' })

    this.#linksEnvironment.updateLinkName({
      key: currentLink.name,
      link: { ...currentLink, name }
    })
    await this.#page.goto(startUrl)
    return name
  }

  async addExpiration(args: Omit<PO.addExpirationArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    // const name =
    await PO.addExpiration({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
    // return
  }

  async addPassword(args: Omit<PO.addPasswordArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    // const name =
    await PO.addPassword({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
  }

  async changeRole(args: Omit<PO.changeRoleArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const role = await PO.changeRole({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
    return role
  }

  async delete(args: Omit<PO.deleteLinkArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.deleteLink({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  getPublicLinkUrl(
    args: Omit<po.publicLinkAndItsEditButtonVisibilityArgs, 'page'>
  ): Promise<string> {
    return po.getPublicLinkVisibility({
      ...args,
      page: this.#page
    })
  }

  async islinkEditButtonVisibile(linkName): Promise<boolean> {
    return await PO.getLinkEditButtonVisibility({ page: this.#page, linkName })
  }
}
