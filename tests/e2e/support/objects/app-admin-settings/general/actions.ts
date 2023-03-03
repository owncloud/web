import { resolve } from "path";

export const uploadLogo = async (path, page): Promise<void> => {
	await page.click('#logo-context-btn');

	const logoInput = await page.$('#logo-upload-input');
	await logoInput.setInputFiles(path);

	await page.waitForSelector('.oc-message-success');
}