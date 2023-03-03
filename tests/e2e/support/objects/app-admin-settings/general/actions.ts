export const uploadLogo = async (path, page): Promise<void> => {
  await page.click('#logo-context-btn')

  const logoInput = await page.$('#logo-upload-input')
  await logoInput.setInputFiles(path)

  await page.waitForSelector('text=Logo was uploaded successfully')
}

export const resetLogo = async (page): Promise<void> => {
  await page.click('#logo-context-btn')

  await page.click('.oc-general-actions-reset-logo-trigger')

  await page.waitForSelector('text=Logo was reset successfully. Reloading page...')
}
