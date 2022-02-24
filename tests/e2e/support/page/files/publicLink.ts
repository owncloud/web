import { Actor } from '../../types'
import { filesCta } from '../../cta'
import { Locator } from '@playwright/test'
import { getActualExpiryDate } from '../../utils/datePicker'
import util = require('util')

export class PublicLink {
  private readonly actor: Actor
  private readonly publicLinkButtonLocator: Locator
  private readonly publicLinkPasswordLocator: Locator
  private readonly publicLinkNameLocator: Locator
  private readonly roleDropdownLocator: Locator
  private readonly expirationDateDropdownLocator: Locator
  private readonly createLinkButtonLocator: Locator
  private readonly publicLinkLocator: Locator
  private readonly yearButtonLocator: Locator
  private readonly nextSpanYearLocator: Locator
  private readonly monthAndYearDropdownLocator: Locator
  private readonly daySelector: string
  private readonly monthSelector: string
  private readonly yearSelector: string
  private readonly publicLinkListSelector: string
  private readonly roleSelector: string
  private readonly folderSelector: string
  private dateType: string

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
    this.publicLinkButtonLocator = this.actor.page.locator('#files-file-link-add')
    this.publicLinkPasswordLocator = this.actor.page.locator('#oc-files-file-link-password')
    this.publicLinkNameLocator = this.actor.page.locator('#oc-files-file-link-name')
    this.roleDropdownLocator = this.actor.page.locator('#files-file-link-role-button')
    this.expirationDateDropdownLocator = this.actor.page.locator('#files-links-expiration-btn')
    this.createLinkButtonLocator = this.actor.page.locator('#oc-files-file-link-create')
    this.publicLinkLocator = this.actor.page.locator(
      '//a[@class = "oc-files-file-link-url oc-text-truncate"]'
    )
    this.yearButtonLocator = this.actor.page.locator(
      `//div[@class = "vc-nav-container"]/div[@class="vc-nav-header"]//span[position()=2]`
    )
    this.nextSpanYearLocator = this.actor.page.locator(
      `//div[@class = "vc-nav-container"]/div[@class="vc-nav-header"]//span[position()=3]`
    )
    this.monthAndYearDropdownLocator = this.actor.page.locator(`//div[@class = 'vc-title']`)
    // for changing values of selector the below selectors are made string for passing value
    this.daySelector = `//span[@tabindex='-1' or @tabindex='0'][@aria-label='%s']`
    this.monthSelector = `//span[@data-id='%s.%s']`
    this.yearSelector = `//div[@class = "vc-nav-container"]/div[@class="vc-nav-items"]//span[contains(text(),'%s')]`
    this.publicLinkListSelector = `//ul[@class = 'oc-list oc-list-divider oc-overflow-hidden oc-m-rm']/li`
    this.roleSelector = `//span[@id="files-role-%s"]`
    this.folderSelector = `//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "files-quick-action-collaborators")]`
  }

  async selectRole(role: string): Promise<void> {
    await this.roleDropdownLocator.click()
    await this.actor.page.locator(util.format(this.roleSelector, role)).click()
  }

  async selectExpiryMonth(year: string, month: string): Promise<void> {
    await this.actor.page.locator(util.format(this.monthSelector, year, month)).click()
  }

  async selectExpiryDay(dayMonthYear: string): Promise<void> {
    await this.actor.page.locator(util.format(this.daySelector, dayMonthYear)).click()
  }

  getDateType = (expiryDate: string): string => {
    if (expiryDate.charAt(0).includes('-')) {
      throw new Error('The provided date is negative and has already expired !!')
    } else if (expiryDate.charAt(0).includes('+')) {
      return expiryDate.toLowerCase().match(/[dayrmonthwek]+/)[0]
    }
  }

  async selectDate(dateOfExpiration: string): Promise<void> {
    const newExpiryDate = getActualExpiryDate(this.dateType, dateOfExpiration)
    const expiryDay = newExpiryDate.getDate()
    const expiryMonth = ('0' + (newExpiryDate.getMonth() + 1)).slice(-2)
    const expiryYear = newExpiryDate.getFullYear().toString()
    await this.expirationDateDropdownLocator.click()
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    const dayMonthYear =
      days[newExpiryDate.getDay()] +
      ', ' +
      months[newExpiryDate.getMonth()] +
      ' ' +
      expiryDay +
      ', ' +
      expiryYear
    await this.monthAndYearDropdownLocator.click()
    if ((await this.yearButtonLocator.innerText()) !== expiryYear) {
      await this.yearButtonLocator.click()
      while (true) {
        const nextYearSpanValue = await this.yearButtonLocator.innerText()
        const splitNextSpanYear = nextYearSpanValue.split('-')
        if (
          newExpiryDate.getFullYear() >= parseInt(splitNextSpanYear[0]) &&
          newExpiryDate.getFullYear() <= parseInt(splitNextSpanYear[1])
        ) {
          const yearLocator = await this.actor.page.locator(
            util.format(this.yearSelector, expiryYear)
          )
          await yearLocator.click()
          break
        }
        await this.nextSpanYearLocator.click()
      }
    }

    await this.selectExpiryMonth(expiryYear, expiryMonth)
    await this.selectExpiryDay(dayMonthYear)
  }

  async getLinksCount(): Promise<number> {
    await this.actor.page.waitForSelector(this.publicLinkListSelector)
    return await this.actor.page.locator(this.publicLinkListSelector).count()
  }

  async fillThePublicLinkForm({
    name,
    password,
    role,
    dateOfExpiration
  }: {
    name: string
    password: string
    role: string
    dateOfExpiration: string
  }): Promise<void> {
    if (name) {
      await this.publicLinkNameLocator.fill(name)
    }
    if (role) {
      await this.selectRole(role)
    }
    if (dateOfExpiration) {
      await this.selectDate(dateOfExpiration)
    }
    if (password) {
      await this.publicLinkPasswordLocator.fill(password)
    }
  }

  async createPublicLinkForResource({
    resource,
    name,
    role,
    dateOfExpiration,
    password,
    via
  }: {
    resource: string
    name: string
    role: string
    dateOfExpiration: string
    password: string
    via: 'SIDEBAR_PANEL' | 'QUICK_ACTION'
  }): Promise<void> {
    this.dateType = this.getDateType(dateOfExpiration)
    const { page } = this.actor
    const resourcePaths = resource.split('/')
    const resourceName = resourcePaths.pop()
    if (resourcePaths.length) {
      await filesCta.navigateToFolder({ page: page, path: resourcePaths.join('/') })
    }

    switch (via) {
      case 'QUICK_ACTION':
        await page.locator(util.format(this.folderSelector, resourceName)).click()
        break

      case 'SIDEBAR_PANEL':
        await filesCta.sidebar.open({ page: page, resource: resourceName })
        await filesCta.sidebar.openPanel({ page: page, name: 'links' })
        break
    }
    await this.publicLinkButtonLocator.click()
    await this.fillThePublicLinkForm({ name, password, role, dateOfExpiration })
    await this.createLinkButtonLocator.click()
  }
}
