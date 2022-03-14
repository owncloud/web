import { errors, Page } from 'playwright'
import util from 'util'
import { state } from '../../cucumber/environment/shared'
import { PublicLink } from './files/publicLink'

export class PublicLinkPage {
  private static page: Page
  private readonly passwordInput: string
  private readonly passwordSubmitButton: string
  private readonly fileUploadInput: string
  private publicResourceSelector: string
  private uploadedResourceSelector: string

  constructor() {
    this.passwordInput = 'input[type="password"]'
    this.passwordSubmitButton =
      '//*[@id="password-submit"]|//*[@id="oc-textinput-3"]/ancestor::div[contains(@class, "oc-mb-s")]/following-sibling::button'
    this.publicResourceSelector = `[data-test-resource-name="%s"]`
    this.uploadedResourceSelector = `//tbody/tr/td[contains(@class, "oc-pl-rm") and contains(text(), "%s")]`
    this.fileUploadInput = '//input[@id="file_upload_start" or @class="dz-hidden-input"]'
  }

  public static async setup(): Promise<PublicLinkPage> {
    PublicLinkPage.page = await state.browser
      .newContext({ ignoreHTTPSErrors: true })
      .then((context) => context.newPage())
    return new PublicLinkPage()
  }

  async navigateToPublicLink(): Promise<void> {
    await PublicLinkPage.page.goto(PublicLink.getLastCreatedPublicLink())
  }

  async authenticatePassword(password: string): Promise<void> {
    await PublicLinkPage.page.locator(this.passwordInput).fill(password)
    await PublicLinkPage.page.locator(this.passwordSubmitButton).click()
  }

  async resourceExists({ pageType, name, timeout = 500 }): Promise<boolean> {
    let exist = true
    let resourceSelector
    if (pageType === 'upload') {
      resourceSelector = this.uploadedResourceSelector
    } else {
      resourceSelector = this.publicResourceSelector
    }

    await PublicLinkPage.page
      .waitForSelector(util.format(resourceSelector, name), { timeout })
      .catch((e) => {
        if (!(e instanceof errors.TimeoutError)) {
          throw e
        }

        exist = false
      })

    return exist
  }

  async uploadFiles(filePath: string): Promise<void> {
    await PublicLinkPage.page.locator(this.fileUploadInput).setInputFiles(filePath)
  }

  async reload(): Promise<void> {
    await PublicLinkPage.page.reload()
  }
}
