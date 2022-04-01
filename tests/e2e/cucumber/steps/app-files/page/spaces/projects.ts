import { DataTable, When } from '@cucumber/cucumber'
import { World } from '../../../../environment'
import { objects } from '../../../../../support'

When(
  '{string} navigates to the projects space page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
    await pageObject.navigate()
  }
)

When(
  '{string} creates the following project spaces',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })

    for (const space of stepTable.hashes()) {
      await spacesObject.create({ key: space.id || space.name, space })
    }
  }
)

When(
  '{string} navigates to the project space {string}',
  async function (this: World, stepUser: string, key: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })

    await spacesObject.open({ key })
  }
)

When(
  /^"([^"]*)" (changes|updates) the space "([^"]*)" (name|subtitle|description|quota) to "([^"]*)"$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    key: string,
    action: string,
    value: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })

    switch (action) {
      case 'name':
        await spacesObject.changeName({ key, value })
        break
      case 'subtitle':
        await spacesObject.changeSubtitle({ key, value })
        break
      case 'description':
        await spacesObject.changeDescription({ value })
        break
      case 'quota':
        await spacesObject.changeQuota({ key, value })
        break
      default:
        throw new Error(`${action} not implemented`)
    }
  }
)
