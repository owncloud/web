import { Given, When } from '@cucumber/cucumber'
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

When(
  '{string} accept federation share invitation',
  async function (this: World, stepUser: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.scienceMesh.Federation({ page })
    await pageObject.generateInvitation()
  }
)
