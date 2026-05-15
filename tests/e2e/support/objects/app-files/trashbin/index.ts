import { Page } from '@playwright/test'
import * as po from './actions'
import { SpacesEnvironment } from '../../../environment'
import { World } from '../../../../environment/world'

export class Trashbin {
  #page: Page
  #spacesEnvironment: SpacesEnvironment
  #world?: World

  constructor({ page, world }: { page: Page; world?: World }) {
    this.#page = page
    this.#world = world
    this.#spacesEnvironment = new SpacesEnvironment()
  }

  async open(key: string): Promise<void> {
    const { id } = this.#spacesEnvironment.getSpace({ key, world: this.#world })
    await po.openTrashbin({ page: this.#page, id })
  }
}
