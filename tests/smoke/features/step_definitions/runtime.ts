import { When } from '@cucumber/cucumber'
import { World, RuntimePage } from '../../support'

When('{string} opens the {string} app', async function(
  this: World,
  stepUser: string,
  stepApp: string
): Promise<void> {
  const actor = this.actorContinent.get({ id: stepUser })
  const runtimePage = new RuntimePage({ actor })

  await runtimePage.navigateToApp({ name: stepApp })
})
