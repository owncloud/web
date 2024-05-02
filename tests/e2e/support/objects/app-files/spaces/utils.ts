import { Locator, Page } from '@playwright/test'
import util from 'util'

const spaceIdSelector = `[data-item-id="%s"]`
const showInvitedPeopleButton =
  '//span[@data-test-resource-name="%s"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@data-test-indicator-type, "user-direct")]'
const showLinkButton =
  '//span[@data-test-resource-name="%s"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@data-test-indicator-type, "link-direct")]'

export interface searchForSpacesIdsArgs {
  spaceID: string
  page: Page
}

export const spaceLocator = (args: searchForSpacesIdsArgs): Locator => {
  const { page, spaceID } = args
  return page.locator(util.format(spaceIdSelector, spaceID))
}

export const showShareButtonSelector = (args: {
  page: Page
  buttonLabel: string
  resource: string
}): Locator => {
  const { page, buttonLabel, resource } = args
  const buttonLocator =
    buttonLabel === 'show invited people'
      ? page.locator(util.format(showInvitedPeopleButton, resource))
      : page.locator(util.format(showLinkButton, resource))
  return buttonLocator
}
