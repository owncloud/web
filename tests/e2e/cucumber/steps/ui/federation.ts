import { Given } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

Given(
  '{string} generates the federation share invitation token',
  async function (this: World, stepUser: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.scienceMesh.Federation({ page })
    await pageObject.generateInvitation()
  }
)

// And "Alice" has created the federation share invitation with email "brian@example.com" and description "a share invitation from Alice"
