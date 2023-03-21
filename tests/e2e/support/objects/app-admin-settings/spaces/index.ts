import { Page } from 'playwright'
import {
  changeSpaceQuota,
  deleteSpace,
  disableSpace,
  getDisplayedSpaces,
  renameSpace,
  changeSpaceSubtitle,
  selectSpace,
  enableSpace, openSpaceAdminSidebarPanel, openSpaceAdminActionSidebarPanel, listSpaceMambers
} from './actions'
import { SpacesEnvironment } from '../../../environment'
import { Space } from '../../../types'

export class Spaces {
  #page: Page
  #spacesEnvironment: SpacesEnvironment

  constructor({ page }: { page: Page }) {
    this.#spacesEnvironment = new SpacesEnvironment()
    this.#page = page
  }

  getDisplayedSpaces(): Promise<string[]> {
    return getDisplayedSpaces(this.#page)
  }

  async getSpace({ key }: { key: string }): Promise<Space> {
    return this.#spacesEnvironment.getSpace({ key })
  }

  async changeQuota({
    key,
    value,
    context
  }: {
    key: string
    value: string
    context: string
  }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await changeSpaceQuota({ id, value, page: this.#page, context })
  }

  async disable({ key, context }: { key: string; context: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await disableSpace({ id, page: this.#page, context })
  }

  async enable({ key, context }: { key: string; context: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await enableSpace({ id, page: this.#page, context })
  }

  async delete({ key, context }: { key: string; context: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await deleteSpace({ id, page: this.#page, context })
  }

  async select({ key }: { key: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await selectSpace({ id, page: this.#page })
  }

  async rename({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await renameSpace({ id, page: this.#page, value })
  }

  async changeSubtitle({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await changeSpaceSubtitle({ id, page: this.#page, value })
  }

  async openPanel({key}:{key:string}): Promise<void>{
    const { id } = this.#spacesEnvironment.getSpace({key})
    await openSpaceAdminSidebarPanel({page: this.#page,id})
  }

  async openActionSideBarPanel({action}:{action:string}): Promise<void>{
    await openSpaceAdminActionSidebarPanel({page:this.#page,action})
  }

  async listMembers({filter}:{filter:string}):Promise<void>{
    await listSpaceMambers({page:this.#page, filter})
  }
}
