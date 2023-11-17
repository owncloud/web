import { Page } from '@playwright/test'
import * as po from './actions'
import { resourceIsNotOpenable, isAcceptedSharePresent, resourceIsSynced } from './utils'
import { createLinkArgs } from '../link/actions'
export class Share {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async create(args: Omit<po.createShareArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.createShare({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async accept(args: Omit<po.ShareStatusArgs, 'page'>): Promise<void> {
    await po.acceptShare({ ...args, page: this.#page })
  }

  async declineShare(args: Omit<po.ShareStatusArgs, 'page'>): Promise<void> {
    await po.declineShare({ ...args, page: this.#page })
  }

  async acceptAll(): Promise<void> {
    await po.acceptAllShare({ page: this.#page })
  }

  async changeShareeRole(args: Omit<po.ShareArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.changeShareeRole({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async removeSharee(args: Omit<po.removeShareeArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.removeSharee({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async checkSharee(args: Omit<po.ShareArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.checkSharee({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async isAcceptedSharePresent(resource: string, owner: string): Promise<boolean> {
    await this.#page.reload()
    return await isAcceptedSharePresent({ page: this.#page, resource, owner })
  }

  async hasPermissionToShare(resource: string): Promise<boolean> {
    return await po.hasPermissionToShare({ page: this.#page, resource })
  }

  async createQuickLink(args: Omit<createLinkArgs, 'page'>): Promise<void> {
    await po.createQuickLink({ ...args, page: this.#page })
  }

  async resourceIsNotOpenable(resource): Promise<boolean> {
    return await resourceIsNotOpenable({ page: this.#page, resource })
  }

  async resourceIsSynced(resource): Promise<boolean> {
    return await resourceIsSynced({ page: this.#page, resource })
  }

  async setDenyShare(args: Omit<po.setDenyShareArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.setDenyShare({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }
}
