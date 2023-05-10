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
  copyQuickLink,
  setDenyShareArgs,
  setDenyShare
} from './actions'
import { resourceIsNotOpenable, isAcceptedSharePresent } from './utils'
import { copyLinkArgs } from '../link/actions'
export class Share {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
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
  }

  async resourceIsNotOpenable(resource): Promise<boolean> {
    return await resourceIsNotOpenable({ page: this.#page, resource })
  }

  async setDenyShare(args: Omit<setDenyShareArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await setDenyShare({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }
}
