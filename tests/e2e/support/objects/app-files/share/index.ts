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
    await createShare({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
    // why? o_O
    await this.#page.locator('body').click()
  }

  async accept(args: Omit<acceptShareArgs, 'page'>): Promise<void> {
    await acceptShare({ page: this.#page, ...args })
  }

  async declineShare(args: Omit<declineShareArgs, 'page'>): Promise<void> {
    await declineShare({ page: this.#page, ...args })
  }

  async changeShareeRole(args: Omit<changeShareeRoleArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await changeShareeRole({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
  }

  async removeSharee(args: Omit<removeShareeArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await removeSharee({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
  }
}
