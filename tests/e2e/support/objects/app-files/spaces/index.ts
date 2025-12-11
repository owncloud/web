import { Locator, Page } from '@playwright/test'
import { SpacesEnvironment, LinksEnvironment } from '../../../environment'
import { File } from '../../../types'
import * as po from './actions'
import { spaceLocator } from './utils'
import { ICollaborator } from '../share/collaborator'
import { World } from '../../../../cucumber/environment/world'

export class Spaces {
  #page: Page
  #spacesEnvironment: SpacesEnvironment
  #linksEnvironment: LinksEnvironment

  constructor({ page }: { page: Page }) {
    this.#page = page
    this.#spacesEnvironment = new SpacesEnvironment()
    this.#linksEnvironment = new LinksEnvironment()
  }

  getSpaceID({ key }: { key: string }): string {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    return id
  }

  async create({
    key,
    space,
    world
  }: {
    key: string
    space: Omit<po.createSpaceArgs, 'page'>
    world: World
  }): Promise<void> {
    const id = await po.createSpace({ ...space, page: this.#page }, world)
    this.#spacesEnvironment.createSpace({ key, space: { name: space.name, id } })
  }

  async open({ key, world }: { key: string; world: World }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await po.openSpace({ page: this.#page, id, world })
  }

  async changeName({
    key,
    value,
    world
  }: {
    key: string
    value: string
    world: World
  }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await po.changeSpaceName({ id, value, page: this.#page, world })
  }

  async changeSubtitle({
    key,
    value,
    world
  }: {
    key: string
    value: string
    world: World
  }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await po.changeSpaceSubtitle({ id, value, page: this.#page, world })
  }

  async changeDescription({ value, world }: { value: string; world: World }): Promise<void> {
    await po.changeSpaceDescription({ value, page: this.#page, world: world })
  }

  async changeQuota({
    key,
    value,
    world
  }: {
    key: string
    value: string
    world: World
  }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await po.changeQuota({ id, value, page: this.#page, world })
  }

  async addMembers(args: Omit<po.SpaceMembersArgs, 'page'>): Promise<void> {
    await po.addSpaceMembers({ ...args, page: this.#page })
  }

  async removeAccessToMember(args: Omit<po.removeAccessMembersArgs, 'page'>): Promise<void> {
    await po.removeAccessSpaceMembers({ ...args, page: this.#page })
  }

  getSpaceLocator(space: string): Locator {
    const spaceID = this.getSpaceID({ key: space })
    return spaceLocator({ spaceID, page: this.#page })
  }

  async changeRoles(args: Omit<po.SpaceMembersArgs, 'page'>): Promise<void> {
    await po.changeSpaceRole({ ...args, page: this.#page })
  }

  async changeSpaceImage({
    key,
    resource,
    world
  }: {
    key: string
    resource: File
    world: World
  }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await po.changeSpaceImage({ id, resource, page: this.#page, world })
  }

  async createPublicLink({ password, world }: { password: string; world: World }): Promise<void> {
    const url = await po.createPublicLinkForSpace({ page: this.#page, password, world })
    this.#linksEnvironment.createLink({
      key: 'Unnamed link',
      link: { name: 'Unnamed link', url }
    })
  }

  async addExpirationDate({
    member,
    expirationDate,
    world
  }: {
    member: Omit<ICollaborator, 'role'>
    expirationDate: string
    world?: World
  }): Promise<void> {
    await po.addExpirationDateToMember({ member, expirationDate, page: this.#page, world })
  }

  async removeExpirationDate({
    member,
    world
  }: {
    member: Omit<ICollaborator, 'role'>
    world?: World
  }): Promise<void> {
    await po.removeExpirationDateFromMember({ member, page: this.#page, world })
  }

  downloadSpace(world: World): Promise<string> {
    return po.downloadSpace(this.#page, world)
  }

  async checkSpaceActivity({ activity, world }: { activity: string; world: World }): Promise<void> {
    await po.checkSpaceActivity({ page: this.#page, activity, world })
  }
}
