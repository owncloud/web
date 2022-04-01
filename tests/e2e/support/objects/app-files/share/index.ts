import { Page } from 'playwright'
import {
  createShare,
  createShareArgs,
  acceptShare,
  changeShareeRole,
  changeShareeRoleArgs,
  removeShareeArgs,
  removeSharee,
  acceptShareArgs,
  declineShareArgs,
  declineShare
} from './actions'

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

  async accept(args: Omit<acceptShareArgs, 'page'>): Promise<void> {
    await acceptShare({ ...args, page: this.#page })
  }

  async declineShare(args: Omit<declineShareArgs, 'page'>): Promise<void> {
    await declineShare({ ...args, page: this.#page })
  }

  async changeShareeRole(args: Omit<changeShareeRoleArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await changeShareeRole({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async removeSharee(args: Omit<removeShareeArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await removeSharee({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }
}
