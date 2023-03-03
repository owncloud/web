import { Page } from "playwright"
import { uploadLogo } from "./actions"

export class General {
	#page: Page
	constructor({ page }: { page: Page }) {
		this.#page = page
	}
	async uploadLogo({ path }: { path: string }): Promise<void> {
		await uploadLogo(path, this.#page)
	}
}