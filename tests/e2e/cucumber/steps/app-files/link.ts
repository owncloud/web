import { DataTable, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../environment'
import { objects } from '../../../support'

When(
  /^"([^"]*)" creates a public link for the following resource(s)? using the (sidebar panel|quick action)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const shareInfo = stepTable.hashes()
    for (const linkShare of shareInfo) {
      const { resource, name, role, dateOfExpiration, password } = linkShare
      await linkObject.create({
        resource,
        name,
        role,
        dateOfExpiration,
        password,
        via: actionType === 'quick action' ? 'QUICK_ACTION' : 'SIDEBAR_PANEL'
      })
    }
  }
)

When(
  '{string} edits the public link named {string} of resource {string} changing role to {string}',
  async function (
    this: World,
    stepUser: string,
    name: any,
    resource: string,
    role: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const actualRole = await linkObject.changeRole({ name, resource, role })
    expect(role).toBe(actualRole.toLowerCase())
  }
)
