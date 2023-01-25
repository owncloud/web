import { Page } from 'playwright'
import {
  changeSpaceQuota,
  deleteSpace,
  disableSpace,
  getDisplayedSpaces,
  selectSpace,
  clearSelection,
  disableSpaceButtonShouldBeGone
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

  async changeQuota({ key, value }: { key: string; value: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await changeSpaceQuota({ id, value, page: this.#page })
  }

  async disable({ key, context }: { key: string; context: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await disableSpace({ id, page: this.#page, context })
  }

  async delete({ key, context }: { key: string; context: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await deleteSpace({ id, page: this.#page, context })
  }

  async select({ key }: { key: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await selectSpace({ id, page: this.#page })
  }
  async clearSelection(): Promise<void> {
    await clearSelection({ page: this.#page })
  }
  async disableSpaceButtonShouldBeGone(): Promise<void> {
    await disableSpaceButtonShouldBeGone({ page: this.#page })
  }
}
