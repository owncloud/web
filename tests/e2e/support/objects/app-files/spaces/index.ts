import { Page } from 'playwright'
import { SpacesEnvironment, LinksEnvironment } from '../../../environment'
import { File } from '../../../types'
import * as PO from './actions'
import { spaceWithSpaceIDNotExist } from './utils'
import { ICollaborator } from '../share/collaborator'

export class Spaces {
  #page: Page
  #spacesEnvironment: SpacesEnvironment
  #linksEnvironment: LinksEnvironment

  constructor({ page }: { page: Page }) {
    this.#page = page
    this.#spacesEnvironment = new SpacesEnvironment()
    this.#linksEnvironment = new LinksEnvironment()
  }

  async create({
    key,
    space
  }: {
    key: string
    space: Omit<PO.createSpaceArgs, 'page'>
  }): Promise<void> {
    const id = await PO.createSpace({ ...space, page: this.#page })
    this.#spacesEnvironment.createSpace({ key, space: { name: space.name, id } })
  }

  async open({ key }: { key: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await PO.openSpace({ page: this.#page, id })
  }

  async changeName({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await PO.changeSpaceName({ id, value, page: this.#page })
  }

  async changeSubtitle({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await PO.changeSpaceSubtitle({ id, value, page: this.#page })
  }

  async changeDescription({ value }: { value: string }): Promise<void> {
    await PO.changeSpaceDescription({ value, page: this.#page })
  }

  async changeQuota({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await PO.changeQuota({ id, value, page: this.#page })
  }

  async addMembers(args: Omit<PO.SpaceMembersArgs, 'page'>): Promise<void> {
    await PO.addSpaceMembers({ ...args, page: this.#page })
  }

  async removeAccessToMember(args: Omit<PO.removeAccessMembersArgs, 'page'>): Promise<void> {
    await PO.removeAccessSpaceMembers({ ...args, page: this.#page })
  }

  getSpaceID({ key }: { key: string }): string {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    return id
  }

  async expectThatSpacesIdNotExist(spaceID: string): Promise<void> {
    await spaceWithSpaceIDNotExist({ spaceID, page: this.#page })
  }

  async canUserEditResource(args: Omit<PO.canUserEditSpaceResourceArgs, 'page'>): Promise<boolean> {
    const startUrl = this.#page.url()
    const canEdit = await PO.canUserEditSpaceResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return canEdit
  }

  async changeRoles(args: Omit<PO.SpaceMembersArgs, 'page'>): Promise<void> {
    await PO.changeSpaceRole({ ...args, page: this.#page })
  }

  async reloadPage(): Promise<void> {
    await PO.reloadSpacePage(this.#page)
  }

  async changeSpaceImage({ key, resource }: { key: string; resource: File }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await PO.changeSpaceImage({ id, resource, page: this.#page })
  }

  async createPublicLink(): Promise<void> {
    const url = await PO.createPublicLinkForSpace({ page: this.#page })
    this.#linksEnvironment.createLink({
      key: 'Link',
      link: { name: 'Link', url }
    })
  }

  async addExpirationDate({
    member,
    expirationDate
  }: {
    member: Omit<ICollaborator, 'role'>
    expirationDate: string
  }): Promise<void> {
    await PO.addExpirationDateToMember({ member, expirationDate, page: this.#page })
  }

  async removeExpirationDate({ member }: { member: Omit<ICollaborator, 'role'> }): Promise<void> {
    await PO.removeExpirationDateFromMember({ member, page: this.#page })
  }
}
