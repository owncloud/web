import { When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

When(
  '{string} navigates to {string} details panel of file {string} through the URL',
  async function (
    this: World,
    stepUser: string,
    detailsPanel: string,
    resource: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const user = this.usersEnvironment.getUser({ key: stepUser })
    const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
    await urlNavObject.navigateToDetailsPanelOfResource({ resource, detailsPanel, user })
  }
)

When('{string} opens the file/folder {string} directly in the browser', async function (this: World, stepUser: string, resource: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const user = this.usersEnvironment.getUser({ key: stepUser })
    const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
    await urlNavObject.openResourceDirectlyInTheBrowser({resource,user})
});

