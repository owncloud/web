import { Page } from 'playwright'
import {
  changeSpaceQuota,
  deleteSpace,
  disableSpace,
  getDisplayedSpaces,
  renameSpace,
  changeSpaceSubtitle,
  selectSpace,
  enableSpace,
  openSpaceAdminSidebarPanel,
  openSpaceAdminActionSidebarPanel,
  listSpaceMembers
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

  getUUID({ key }: { key: string }): string {
    return this.getSpace({ key }).id
  }

  getDisplayedSpaces(): Promise<string[]> {
    return getDisplayedSpaces(this.#page)
  }

  getSpace({ key }: { key: string }): Space {
    return this.#spacesEnvironment.getSpace({ key })
  }

  async changeQuota({
    spaceIds,
    value,
    context
  }: {
    spaceIds: string[]
    value: string
    context: string
  }): Promise<void> {
    await changeSpaceQuota({ spaceIds, value, page: this.#page, context })
  }

  async disable({ spaceIds, context }: { spaceIds: string[]; context: string }): Promise<void> {
    await disableSpace({ spaceIds, page: this.#page, context })
  }

  async enable({ spaceIds, context }: { spaceIds: string[]; context: string }): Promise<void> {
    await enableSpace({ spaceIds, page: this.#page, context })
  }

  async delete({ spaceIds, context }: { spaceIds: string[]; context: string }): Promise<void> {
    await deleteSpace({ spaceIds, page: this.#page, context })
  }

  async select({ key }: { key: string }): Promise<void> {
    await selectSpace({ page: this.#page, id: this.getUUID({ key }) })
  }

  async rename({ key, value }: { key: string; value: string }): Promise<void> {
    await renameSpace({ page: this.#page, id: this.getUUID({ key }), value })
  }

  async changeSubtitle({ key, value }: { key: string; value: string }): Promise<void> {
    await changeSpaceSubtitle({ page: this.#page, id: this.getUUID({ key }), value })
  }

  async openPanel({ key }: { key: string }): Promise<void> {
    await openSpaceAdminSidebarPanel({ page: this.#page, id: this.getUUID({ key }) })
  }

  async openActionSideBarPanel({ action }: { action: string }): Promise<void> {
    await openSpaceAdminActionSidebarPanel({ page: this.#page, action })
  }

  listMembers({ filter }: { filter: string }): Promise<Array<string>> {
    return listSpaceMembers({ page: this.#page, filter })
  }
}
