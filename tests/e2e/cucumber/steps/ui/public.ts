import { DataTable, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { kebabCase } from 'lodash'
import { DateTime } from 'luxon'
import { World } from '../../environment'
import { objects } from '../../../support'
import { processDelete, processDownload } from './resources'
import { createdLinkStore } from '../../../support/store'

When(
  '{string} opens the public link {string}',
  async function (this: World, stepUser: string, name: string): Promise<void> {
    let user
    try {
      user = this.usersEnvironment.getUser({ key: stepUser })
    } catch (e) {}

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
    const { url } = this.linksEnvironment.getLink({ name })
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
    await pageObject.dropUpload({ resources })
  }
)

When(
  '{string} refreshes the old link',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await pageObject.reload()
  }
)

When(
  /^"([^"]*)" downloads the following public link resource(s)? using the (sidebar panel|batch action|single share view)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await processDownload(stepTable, pageObject, actionType)
  }
)

When(
  '{string} renames the following public link resource(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    for (const { resource, as } of stepTable.hashes()) {
      await pageObject.rename({ resource, newName: as })
    }
  }
)

When(
  '{string} uploads the following resource(s) in public link page',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    for (const info of stepTable.hashes()) {
      await pageObject.upload({
        to: info.to,
        resources: [this.filesEnvironment.getFile({ name: info.resource })],
        option: info.option
      })
    }
  }
)

When(
  '{string} uploads the following resource(s) in internal link named {string}',
  async function (
    this: World,
    stepUser: string,
    link: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    const { url } = this.linksEnvironment.getLink({ name: link })
    for (const info of stepTable.hashes()) {
      await pageObject.uploadInternal({
        to: info.to,
        resources: [this.filesEnvironment.getFile({ name: info.resource })],
        option: info.option,
        link: url
      })
    }
  }
)

Then(
  '{string} should not be able to open the old link {string}',
  function (this: World, stepUser: string, name: string): void {
    expect(createdLinkStore.has(name)).toBe(false)
  }
)

When(
  /^"([^"]*)" deletes the following resources from public link using (sidebar panel| batch action)$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.Public({ page })
    await processDelete(stepTable, pageObject, actionType)
  }
)
