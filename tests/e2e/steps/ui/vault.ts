import { expect } from '@playwright/test'
import type { World } from '../../environment/world'
import { VaultPage } from '../../support/objects/vault/page/vaultPage'
import { generateOtpFromScreenshot } from '../../support/utils/mfa'

/**
 * Switch user from Drive → Vault mode
 */
export async function userSwitchesToVaultMode({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const vaultPage = new VaultPage(page)
  await vaultPage.userEntersVaultMode()
}

/**
 * Assert user is redirected to the MFA authenticator page
 */
export async function userIsRedirectedToAuthenticatorPage({
  world, 
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const vaultPage = new VaultPage(page)
  await expect(page).toHaveURL(/keycloak\.owncloud\.test/)
  await expect(vaultPage.authenticatorHeading).toBeVisible()
}

/**
 * Generate an OTP from the Vault QR code and authenticate the user
 */
export async function userAuthenticatesToVault({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const vaultPage = new VaultPage(page)
  const qrBuffer = await vaultPage.captureQrCodeScreenshot()
  const otp = await generateOtpFromScreenshot(qrBuffer)
  await vaultPage.userAuthenticatesWithOTP(otp)
}

/**
 * Assert user is in Vault mode
 */
export async function userIsInVaultMode({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const vaultPage = new VaultPage(page)
  await expect(page).toHaveURL(/ocis\.owncloud\.test\/vault/)
  await expect(vaultPage.vaultBreadcrumb).toBeVisible();
}

/**
 * Switch user from Vault → Drive mode
 */
export async function userSwitchesToDriveMode({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const vaultPage = new VaultPage(page)
  await vaultPage.userEntersDriveMode()
}

/**
 * Assert user is in Drive mode
 */
export async function userIsInDriveMode({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const vaultPage = new VaultPage(page)
  await expect(page).toHaveURL(/ocis\.owncloud\.test\/files/)
  await expect(vaultPage.driveBreadcrumb).toBeVisible();
}
