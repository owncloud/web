import { expect, Page } from '@playwright/test'

const generateInvitationButton =
  '//button[contains(@aria-label,"Generate invitation link that can be shared with one or more invitees")]'
const descriptionInput = '#invite_token_description'
const emailInput = '#invite_token_recipient'
const generateInvitationActionConfirmButton = '.oc-modal-body-actions-confirm'
const emptyInvitationToken = '#invite-tokens-empty'

export const generateInvitation = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  await page.locator(generateInvitationButton).click()
  await page.locator(descriptionInput).fill('hello')
  await page.locator(emailInput).fill('a@e.com')
  await page.locator(generateInvitationActionConfirmButton).click()
  await expect(page.locator(emptyInvitationToken)).not.toBeVisible()
}
