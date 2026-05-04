import { Page } from '@playwright/test'
import * as po from './actions'
import { SpacesEnvironment } from '../../../environment'
import { Space } from '../../../types'
import { fileAction } from '../../../../environment/constants'

export class Spaces {
  #page: Page
  #spacesEnvironment: SpacesEnvironment
  #world?: World

  constructor({ page, world }: { page: Page; world?: World }) {
    this.#spacesEnvironment = new SpacesEnvironment()
    this.#world = world
    this.#page = page
  }

  getUUID({ key }: { key: string }): string {
    return this.getSpace({ key }).id
  }

  getDisplayedSpaces(): Promise<string[]> {
    return po.getDisplayedSpaces(this.#page)
  }

  getSpace({ key }: { key: string }): Space {
    return this.#spacesEnvironment.getSpace({ key, world: this.#world })
  }

  async changeQuota({
    spaceIds,
    value,
    via
  }: {
    spaceIds: string[]
    value: string
    via: typeof fileAction.contextMenu | typeof fileAction.batchAction
  }): Promise<void> {
    await po.changeSpaceQuota({ spaceIds, value, page: this.#page, via })
  }

  async disable({
    spaceIds,
    via
  }: {
    spaceIds: string[]
    via: typeof fileAction.contextMenu | typeof fileAction.batchAction
  }): Promise<void> {
    await po.disableSpace({ spaceIds, page: this.#page, via })
  }

  async enable({
    spaceIds,
    via
  }: {
    spaceIds: string[]
    via: typeof fileAction.contextMenu | typeof fileAction.batchAction
  }): Promise<void> {
    await po.enableSpace({ spaceIds, page: this.#page, via })
  }

  async delete({
    spaceIds,
    via
  }: {
    spaceIds: string[]
    via: typeof fileAction.contextMenu | typeof fileAction.batchAction
  }): Promise<void> {
    await po.deleteSpace({ spaceIds, page: this.#page, via })
  }

  async select({ key }: { key: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key, world: this.#world })
    await po.selectSpace({ page: this.#page, id })
  }

  async renameSpaceUsingContextMenu({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key, world: this.#world })
    await po.renameSpaceUsingContextMenu({ page: this.#page, id, value })
  }

  async changeSubtitleUsingContextMenu({
    key,
    value
  }: {
    key: string
    value: string
  }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key, world: this.#world })
    await po.changeSpaceSubtitleUsingContextMenu({ page: this.#page, id, value })
  }

  async openPanel({ key }: { key: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key, world: this.#world })
    await po.openSpaceAdminSidebarPanel({ page: this.#page, id })
  }

  async openActionSideBarPanel({ action }: { action: string }): Promise<void> {
    await po.openSpaceAdminActionSidebarPanel({ page: this.#page, action })
  }

  async listMembers({ filter }: { filter: string }): Promise<string[]> {
    return po.listSpaceMembers({ page: this.#page, filter })
  }
}
