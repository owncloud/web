import { expect, Page } from '@playwright/test'
import util from 'util'
import { federatedInvitationCode } from '../../store'

const generateInvitationButton =
  '//button[contains(@aria-label,"Generate invitation link that can be shared with one or more invitees")]'
const generateInvitationActionConfirmButton = '.oc-modal-body-actions-confirm'
const invitationToken = 'span:has-text("%s")'
const InvitationInput = '//input[starts-with(@id, "oc-textinput-")]'
const invitationConnectionRow =
  '//div[@id="sciencemesh-connections"]//td[text()="%s"]/parent::tr/td[text()="%s"]'
const institutionOptionDropdown = '.vs__open-indicator'
const acceptInvitationButton = 'button:has(span:has-text("Accept invitation"))'

export const generateInvitation = async (args: { page: Page; user: string }): Promise<void> => {
  const { page, user } = args
  await page.locator(generateInvitationButton).click()
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
  await expect(page.locator(util.format(invitationToken, inviteCode))).toBeVisible()
  federatedInvitationCode.set(user, { code: inviteCode })
}

export const acceptInvitation = async (args: { page: Page; sharer: string }): Promise<void> => {
  const { page, sharer } = args
  const invitation = federatedInvitationCode.get(sharer.toLowerCase())
  await page.locator(InvitationInput).fill(invitation.code)
  await page.locator(institutionOptionDropdown).click()
  await page.getByRole('option', { name: 'first-ocis-instance ocis-server:' }).click()
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('accept-invite') &&
        resp.status() === 200 &&
        resp.request().method() === 'POST'
    ),
    page.locator(acceptInvitationButton).click()
  ])
}

export const connectionExists = async (args: { page: Page; info }): Promise<boolean> => {
  const { page, info } = args
  await expect(
    page.locator(util.format(invitationConnectionRow, info.user, info.email))
  ).toBeVisible()
  return true
}
