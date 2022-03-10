import { When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

When(
  '{string} opens the {string} app',
  async function (this: World, stepUser: string, stepApp: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ id: stepUser })
    const applicationObject = new objects.runtime.Application({ page })

    await applicationObject.open({ name: stepApp })
  }
)
