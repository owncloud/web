import { DataTable, When } from '@cucumber/cucumber'
import { kebabCase } from 'lodash'
import { DateTime } from 'luxon'
import { World } from '../../../environment'
import { objects } from '../../../../support'

When(
  '{string} opens the public link {string}',
  async function (this: World, stepUser: string, name: string): Promise<void> {
    try {
      this.usersEnvironment.createUser({
        id: stepUser,
        displayName: stepUser,
        password: '',
        email: ''
      })
    } catch (e) {}
    const { page } = await this.actorsEnvironment.createActor({
      id: stepUser,
      namespace: kebabCase(
        [this.feature.name, stepUser, DateTime.now().toFormat('yyyy-M-d-hh-mm-ss')].join('-')
      )
    })
    const { url } = this.linksEnvironment.getLink({ name })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await pageObject.open({ url })
  }
)

When(
  '{string} unlocks the public link with password {string}',
  async function (this: World, stepUser: string, password: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ id: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await pageObject.authenticate({ password })
  }
)

When(
  '{string} drop uploads following resources',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ id: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })

    const resources = stepTable
      .hashes()
      .map((f) => this.filesEnvironment.getFile({ name: f.resource }))
    await pageObject.upload({ resources })
  }
)
