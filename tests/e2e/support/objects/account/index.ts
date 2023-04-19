import { Page } from 'playwright'

import {
  getQuotaValue,
  getUserInfo,
  openAccountPage,
  requestGdprExport,
  downloadGdprExport
} from './actions'

export class Account {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async getQuotaValue(): Promise<string> {
    return getQuotaValue({ page: this.#page })
  }

  async getUserInfo(key: string): Promise<string> {
    return getUserInfo({ page: this.#page, key })
  }

  async openAccountPage(): Promise<void> {
    await openAccountPage({ page: this.#page })
  }

  async requestGdprExport(): Promise<void> {
    await requestGdprExport({ page: this.#page })
  }

  async downloadGdprExport(): Promise<void> {
    await downloadGdprExport({ page: this.#page })
  }
}
