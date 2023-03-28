import { Page } from 'playwright'
import { SpacesEnvironment, LinksEnvironment } from '../../../environment'
import { File } from '../../../types'
import {
  addSpaceMembers,
  canUserEditSpaceResource,
  canUserEditSpaceResourceArgs,
  changeQuota,
  changeSpaceDescription,
  changeSpaceName,
  changeSpaceSubtitle,
  changeSpaceImage,
  createSpace,
  createSpaceArgs,
  openSpace,
  reloadSpacePage,
  removeAccessMembersArgs,
  removeAccessSpaceMembers,
  SpaceMembersArgs,
  changeSpaceRole,
  createPublicLinkForSpace,
  addExpirationDateToMember,
  removeExpirationDateFromMember
} from './actions'
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
    space: Omit<createSpaceArgs, 'page'>
  }): Promise<void> {
    const id = await createSpace({ ...space, page: this.#page })
    this.#spacesEnvironment.createSpace({ key, space: { name: space.name, id } })
  }

  async open({ key }: { key: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await openSpace({ page: this.#page, id })
  }

  async changeName({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await changeSpaceName({ id, value, page: this.#page })
  }

  async changeSubtitle({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await changeSpaceSubtitle({ id, value, page: this.#page })
  }

  async changeDescription({ value }: { value: string }): Promise<void> {
    await changeSpaceDescription({ value, page: this.#page })
  }

  async changeQuota({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await changeQuota({ id, value, page: this.#page })
  }

  async addMembers(args: Omit<SpaceMembersArgs, 'page'>): Promise<void> {
    await addSpaceMembers({ ...args, page: this.#page })
  }

  async removeAccessToMember(args: Omit<removeAccessMembersArgs, 'page'>): Promise<void> {
    await removeAccessSpaceMembers({ ...args, page: this.#page })
  }

  getSpaceID({ key }: { key: string }): string {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    return id
  }

  async expectThatSpacesIdNotExist(spaceID: string): Promise<void> {
    await spaceWithSpaceIDNotExist({ spaceID, page: this.#page })
  }

  async canUserEditResource(args: Omit<canUserEditSpaceResourceArgs, 'page'>): Promise<boolean> {
    const startUrl = this.#page.url()
    const canEdit = await canUserEditSpaceResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return canEdit
  }

  async changeRoles(args: Omit<SpaceMembersArgs, 'page'>): Promise<void> {
    await changeSpaceRole({ ...args, page: this.#page })
  }

  async reloadPage(): Promise<void> {
    await reloadSpacePage(this.#page)
  }

  async changeSpaceImage({ key, resource }: { key: string; resource: File }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await changeSpaceImage({ id, resource, page: this.#page })
  }

  async createPublicLink(): Promise<void> {
    const url = await createPublicLinkForSpace({ page: this.#page })
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
    await addExpirationDateToMember({ member, expirationDate, page: this.#page })
  }

  async removeExpirationDate({ member }: { member: Omit<ICollaborator, 'role'> }): Promise<void> {
    await removeExpirationDateFromMember({ member, page: this.#page })
  }
}
