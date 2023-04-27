import { Page } from 'playwright'
import {
  addExpiration,
  addExpirationArgs,
  addPassword,
  addPasswordArgs,
  changeName,
  changeNameArgs,
  changeRole,
  changeRoleArgs,
  createLink,
  createLinkArgs,
  deleteLink,
  deleteLinkArgs,
  getLinkEditButtonVisibility,
  getPublicLinkVisibility,
  publicLinkAndItsEditButtonVisibilityArgs
} from './actions'
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
  async create(args: Omit<createLinkArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    const url = await createLink({ ...args, page: this.#page })

    this.#linksEnvironment.createLink({
      key: args.name,
      link: { name: args.name, url }
    })

    await this.#page.goto(startUrl)
  }

  async changeName(args: Omit<changeNameArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const name = await changeName({ page: this.#page, ...args })
    const currentLink = this.#linksEnvironment.getLink({ name: 'Link' })

    this.#linksEnvironment.updateLinkName({
      key: currentLink.name,
      link: { ...currentLink, name }
    })
    await this.#page.goto(startUrl)
    return name
  }

  async addExpiration(args: Omit<addExpirationArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    // const name =
    await addExpiration({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
    // return
  }

  async addPassword(args: Omit<addPasswordArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    // const name =
    await addPassword({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
  }

  async changeRole(args: Omit<changeRoleArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const role = await changeRole({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
    return role
  }

  async delete(args: Omit<deleteLinkArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await deleteLink({ ...args, page: this.#page })
    this.#linksEnvironment.deleteLink({
      key: args.name
    })
    await this.#page.goto(startUrl)
  }

  async getPublicLinkUrl(
    args: Omit<publicLinkAndItsEditButtonVisibilityArgs, 'page'>
  ): Promise<string[]> {
    const linkUrl = this.#linksEnvironment.getLink({ name: args.linkName })
    const publicLink = await getPublicLinkVisibility({
      ...args,
      page: this.#page
    })
    return [linkUrl.url, publicLink]
  }

  async islinkEditButtonVisibile(linkName): Promise<boolean> {
    return await getLinkEditButtonVisibility({ page: this.#page, linkName })
  }
}
