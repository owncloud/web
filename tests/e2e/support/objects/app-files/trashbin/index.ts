import { Page } from 'playwright'
import * as PO from './actions'
import { SpacesEnvironment } from '../../../environment'
export class Trashbin {
  #page: Page
  #spacesEnvironment: SpacesEnvironment

  constructor({ page }: { page: Page }) {
    this.#page = page
    this.#spacesEnvironment = new SpacesEnvironment()
  }

  async open(key: string): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key })
    await PO.openTrashbin({ page: this.#page, id })
  }
}
