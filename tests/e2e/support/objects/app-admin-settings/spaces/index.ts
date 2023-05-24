import { Page } from 'playwright'
import * as PO from './actions'
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
    return PO.getDisplayedSpaces(this.#page)
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
    await PO.changeSpaceQuota({ spaceIds, value, page: this.#page, context })
  }

  async disable({ spaceIds, context }: { spaceIds: string[]; context: string }): Promise<void> {
    await PO.disableSpace({ spaceIds, page: this.#page, context })
  }

  async enable({ spaceIds, context }: { spaceIds: string[]; context: string }): Promise<void> {
    await PO.enableSpace({ spaceIds, page: this.#page, context })
  }

  async delete({ spaceIds, context }: { spaceIds: string[]; context: string }): Promise<void> {
    await PO.deleteSpace({ spaceIds, page: this.#page, context })
  }

  async select({ key }: { key: string }): Promise<void> {
    await PO.selectSpace({ page: this.#page, id: this.getUUID({ key }) })
  }

  async rename({ key, value }: { key: string; value: string }): Promise<void> {
    await PO.renameSpace({ page: this.#page, id: this.getUUID({ key }), value })
  }

  async changeSubtitle({ key, value }: { key: string; value: string }): Promise<void> {
    await PO.changeSpaceSubtitle({ page: this.#page, id: this.getUUID({ key }), value })
  }

  async openPanel({ key }: { key: string }): Promise<void> {
    await PO.openSpaceAdminSidebarPanel({ page: this.#page, id: this.getUUID({ key }) })
  }

  async openActionSideBarPanel({ action }: { action: string }): Promise<void> {
    await PO.openSpaceAdminActionSidebarPanel({ page: this.#page, action })
  }

  listMembers({ filter }: { filter: string }): Promise<Array<string>> {
    return PO.listSpaceMembers({ page: this.#page, filter })
  }
}
