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
import path from 'path'
import { clickResource } from '../resource/actions'

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
    const startUrl = this.#page.url()
    await acceptShare({ page: this.#page, ...args })

    /**
     * the next part exists to trick the backend, in some cases accepting a share can take longer in the backend.
     * therefore we're waiting for the resource to exist, navigate into it (if resource is a folder) to be really sure its there and then come back.
     * If the logic is needed more often it can be refactored into a shared helper.
     */
    await this.#page
      .locator(`#files-shared-with-me-shares-table [data-test-resource-name="${args.name}"]`)
      .waitFor()

    if (!path.extname(args.name)) {
      await clickResource({ page: this.#page, path: args.name })
    }

    await this.#page.goto(startUrl)
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
