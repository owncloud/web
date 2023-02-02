import { Page } from 'playwright'
import {
  createShare,
  createShareArgs,
  acceptShare,
  changeShareeRole,
  removeShareeArgs,
  removeSharee,
  ShareArgs,
  ShareStatusArgs,
  declineShare,
  checkSharee,
  hasPermissionToShare,
  copyQuickLink
} from './actions'
import { resourceIsNotOpenable, isAcceptedSharePresent } from './utils'
import { copyLinkArgs } from '../link/actions'
import { LinksEnvironment } from '../../../environment'

export class Share {
  #page: Page
  #linksEnvironment: LinksEnvironment

  constructor({ page }: { page: Page }) {
    this.#page = page
    this.#linksEnvironment = new LinksEnvironment()
  }

  async create(args: Omit<createShareArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await createShare({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    // why? o_O
    await this.#page.locator('body').click()
  }

  async accept(args: Omit<ShareStatusArgs, 'page'>): Promise<void> {
    await acceptShare({ ...args, page: this.#page })
  }

  async declineShare(args: Omit<ShareStatusArgs, 'page'>): Promise<void> {
    await declineShare({ ...args, page: this.#page })
  }

  async changeShareeRole(args: Omit<ShareArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await changeShareeRole({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async removeSharee(args: Omit<removeShareeArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await removeSharee({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async checkSharee(args: Omit<ShareArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await checkSharee({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async isAcceptedSharePresent(resource: string, owner: string): Promise<boolean> {
    await this.#page.reload()
    return await isAcceptedSharePresent({ page: this.#page, resource, owner })
  }

  async hasPermissionToShare(resource: string): Promise<boolean> {
    return await hasPermissionToShare({ page: this.#page, resource })
  }

  async copyQuickLink(args: Omit<copyLinkArgs, 'page'>): Promise<void> {
    await copyQuickLink({ ...args, page: this.#page })
    const quickLink = await this.#page.evaluate(() => navigator.clipboard.readText())
    this.#linksEnvironment.createLink({
      key: 'Quicklink',
      link: { name: 'Quicklink', url: quickLink }
    })
  }

  async resourceIsNotOpenable(resource): Promise<boolean> {
    return await resourceIsNotOpenable({ page: this.#page, resource })
  }
}
