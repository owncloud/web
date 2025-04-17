import { DataTable, Then, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { substitute } from '../../../support/utils'
import { expect } from '@playwright/test'

Then(
  '{string} should see the following notification(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const application = new objects.runtime.Application({ page })
    const messages = await application.getNotificationMessages()
    for (const { message } of stepTable.hashes()) {
      const expectedMessage = substitute(message)
      expect(messages).toContain(expectedMessage)
    }
  }
)

Then(
  '{string} should see no notification(s)',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const application = new objects.runtime.Application({ page })
    const messages = await application.getNotificationMessages()
    expect(messages.length).toBe(0)
  }
)

When(
  '{string} marks all notifications as read',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const application = new objects.runtime.Application({ page })
    await application.markNotificationsAsRead()
  }
)
