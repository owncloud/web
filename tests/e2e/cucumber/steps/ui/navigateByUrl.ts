import { When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

When(
  '{string} navigates to {string} details panel of file {string} of space {string} through the URL',
  async function (
    this: World,
    stepUser: string,
    detailsPanel: string,
    resource: string,
    space: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const user = this.usersEnvironment.getUser({ key: stepUser })
    const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
    await urlNavObject.navigateToDetailsPanelOfResource({ resource, detailsPanel, user, space })
  }
)

When(
  /^"([^"]*)" opens the (?:resource|file|folder)? "([^"]*)" of space "([^"]*)" through the URL$/,
  async function (this: World, stepUser: string, resource: string, space: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const user = this.usersEnvironment.getUser({ key: stepUser })
    const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
    await urlNavObject.openResourceViaUrl({ resource, user, space })
  }
)

When(
  '{string} opens space {string} through the URL',
  async function (this: World, stepUser: string, space: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const user = this.usersEnvironment.getUser({ key: stepUser })
    const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
    await urlNavObject.openSpaceViaUrl({ user, space })
  }
)
