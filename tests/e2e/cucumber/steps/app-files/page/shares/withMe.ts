import { When } from '@cucumber/cucumber'
import { World } from '../../../../environment'
import { objects } from '../../../../../support'

When(
  '{string} navigates to the shared with me page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ id: stepUser })
    const pageObject = new objects.applicationFiles.page.shares.WithMe({ page })
    await pageObject.navigate()
  }
)
