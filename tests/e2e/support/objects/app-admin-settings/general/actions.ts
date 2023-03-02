import { resolve } from "path";

export const uploadLogo = async (page): Promise<void> => {
	await page.click('.oc-general-actions-upload-logo-trigger');

	const logoInput = await page.$('#logo-upload-input');
	await logoInput.setInputFiles('./path/to/supported/logo.png');
	console.log(1337, resolve(__dirname, "bar.png"))
}