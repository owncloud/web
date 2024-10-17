import { Given, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

Given(
  '{string} generates the federation share invitation token',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.scienceMesh.Federation({ page })
    const user = await this.usersEnvironment.getUser({ key: stepUser })
    await pageObject.generateInvitation(user.id)
  }
)

When(
  '{string} accepts federated share invitation by {string}',
  async function (this: World, stepUser: string, sharee: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.scienceMesh.Federation({ page })
    const user = this.usersEnvironment.getUser({ key: sharee })
    await pageObject.acceptInvitation(user.id)
  }
)

// And "Alice" has created the federation share invitation with email "brian@example.com" and description "a share invitation from Alice"
