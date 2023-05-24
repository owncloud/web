import { Page } from 'playwright'
import * as PO from './actions'

export class Account {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  getQuotaValue(): Promise<string> {
    return PO.getQuotaValue({ page: this.#page })
  }

  getUserInfo(key: string): Promise<string> {
    return PO.getUserInfo({ page: this.#page, key })
  }

  async openAccountPage(): Promise<void> {
    await PO.openAccountPage({ page: this.#page })
  }

  async requestGdprExport(): Promise<void> {
    await PO.requestGdprExport({ page: this.#page })
  }

  async downloadGdprExport(): Promise<void> {
    await PO.downloadGdprExport({ page: this.#page })
  }
}
