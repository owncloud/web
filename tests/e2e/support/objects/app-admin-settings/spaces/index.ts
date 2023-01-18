import { Page } from 'playwright'
import { changeSpaceQuota, deleteSpace, disableSpace, getDisplayedSpaces } from './actions'
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

  async disable({ key }: { key: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await disableSpace({ id, page: this.#page })
  }

  async delete({ key }: { key: string }): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await deleteSpace({ id, page: this.#page })
  }
}
