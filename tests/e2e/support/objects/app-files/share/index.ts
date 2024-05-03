import { Page, Locator } from '@playwright/test'
import * as po from './actions'
import { resourceIsNotOpenable, isAcceptedSharePresent, resourceIsSynced } from './utils'
import { createLinkArgs } from '../link/actions'
import { ICollaborator, IAccessDetails } from './collaborator'
import { User } from '../../../types'
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

  async enableSync(args: Omit<po.ShareStatusArgs, 'page'>): Promise<void> {
    await po.enableSync({ ...args, page: this.#page })
  }

  async disableSync(args: Omit<po.ShareStatusArgs, 'page'>): Promise<void> {
    await po.disableSync({ ...args, page: this.#page })
  }

  async syncAll(): Promise<void> {
    await po.syncAllShares({ page: this.#page })
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

  async addExpirationDate({
    resource,
    collaborator,
    expirationDate
  }: {
    resource: string
    collaborator: Omit<ICollaborator, 'role'>
    expirationDate: string
  }): Promise<void> {
    const startUrl = this.#page.url()
    await po.addExpirationDate({ resource, collaborator, expirationDate, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async getAccessDetails({
    resource,
    collaborator
  }: {
    resource: string
    collaborator: Omit<ICollaborator, 'role'>
  }): Promise<IAccessDetails> {
    const startUrl = this.#page.url()
    const accessDetails = await po.getAccessDetails({ resource, collaborator, page: this.#page })
    await this.#page.goto(startUrl)
    return accessDetails
  }

  getMessage(): Promise<string> {
    return po.getMessage({ page: this.#page })
  }

  changeRoleLocator(recipient: User): Locator {
    return po.changeRoleLocator({ page: this.#page, recipient })
  }

  changeShareLocator(recipient: User): Locator {
    return po.changeRoleLocator({ page: this.#page, recipient })
  }
}
