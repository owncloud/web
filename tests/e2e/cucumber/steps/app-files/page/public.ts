import { DataTable, When } from '@cucumber/cucumber'
import { kebabCase } from 'lodash'
import { DateTime } from 'luxon'
import { World } from '../../../environment'
import { objects } from '../../../../support'

When(
  '{string} opens the public link {string}',
  async function (this: World, stepUser: string, name: string): Promise<void> {
    let user
    try {
      user = this.usersEnvironment.getUser({ key: stepUser })
    } catch (e) {}

    if (!user) {
      user = this.usersEnvironment.createUser({
        key: stepUser,
        user: {
          id: stepUser,
          displayName: stepUser,
          password: '',
          email: ''
        }
      })
    }

    let actor
    try {
      actor = this.actorsEnvironment.getActor(user)
    } catch (e) {}

    if (!actor) {
      actor = await this.actorsEnvironment.createActor({
        key: stepUser,
        namespace: kebabCase(
          [this.feature.name, stepUser, DateTime.now().toFormat('yyyy-M-d-hh-mm-ss')].join('-')
        )
      })
    }

    const { page } = actor
    const { url } = this.linksEnvironment.getLink({ key: name })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await pageObject.open({ url })
  }
)

When(
  '{string} unlocks the public link with password {string}',
  async function (this: World, stepUser: string, password: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await pageObject.authenticate({ password })
  }
)

When(
  '{string} drop uploads following resources',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })

    const resources = stepTable
      .hashes()
      .map((f) => this.filesEnvironment.getFile({ name: f.resource }))
    await pageObject.upload({ resources })
  }
)
