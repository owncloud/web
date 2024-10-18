import { expect, Page } from '@playwright/test'
import { federatedInvitationCode } from '../../store'

const generateInvitationButton =
  '//button[contains(@aria-label,"Generate invitation link that can be shared with one or more invitees")]'
const descriptionInput = '#invite_token_description'
const emailInput = '#invite_token_recipient'
const generateInvitationActionConfirmButton = '.oc-modal-body-actions-confirm'
const emptyInvitationToken = '#invite-tokens-empty'
const acceptFederatedInvitation = '//input[starts-with(@id, "oc-textinput-")]'
const institutionOptionDropdown = '.vs__open-indicator'

export const generateInvitation = async (args: { page: Page; user: string }): Promise<void> => {
  const { page, user } = args
  await page.locator(generateInvitationButton).click()
  await page.locator(descriptionInput).fill('hello')
  await page.locator(emailInput).fill('a@e.com')
  let inviteCode = ''
  await Promise.all([
    page.waitForResponse(async (resp) => {
      if (
        resp.url().endsWith('generate-invite') &&
        resp.status() === 200 &&
        resp.request().method() === 'POST'
      ) {
        const responseBody = await resp.json()
        inviteCode = responseBody.token
        return true
      }
      return false
    }),
    page.locator(generateInvitationActionConfirmButton).click()
  ])
  await expect(page.locator(emptyInvitationToken)).not.toBeVisible()
  federatedInvitationCode.set(user, { code: inviteCode })
  console.log(federatedInvitationCode)
}

export const acceptInvitation = async (args: { page: Page; user: string }): Promise<Response> => {
  const { page, user } = args
  const invitation = federatedInvitationCode.get(user)
  await page.locator(acceptFederatedInvitation).fill(invitation.code)
  await page.locator(institutionOptionDropdown).click()
  await page.getByRole('option', { name: 'first-ocis-instance ocis-server:' }).click()
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('accept-invite') &&
        resp.status() === 200 &&
        resp.request().method() === 'POST'
    ),
    // async (resp) => {
    //   if (
    //     resp.url().endsWith('find-accepted-users') &&
    //     resp.status() === 200 &&
    //     resp.request().method() === 'GET'
    //   ) {
    //     // Extract and store the API response value
    //     return await resp.json()
    //   }
    //   return false
    // },
    page.locator('button:has(span:has-text("Accept invitation"))').click()
  ])
}

// export const isConnectionVisible = async (args: {
//   page: Page
//   connectionInfo: Response
// }): Promise<void> => {
//   const { page, connectionInfo } = args
// }
// first-ocis-instance ocis-server:9200
