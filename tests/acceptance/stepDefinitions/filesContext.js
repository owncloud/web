const { client } = require('nightwatch-api');
const { Given, Then, When } = require('cucumber');

When('the user browses to the files page',
	() => {
		const filesPage = client.page.filesPage();
		return filesPage
		.navigate()
		.waitForElementNotVisible('@loadingIndicator', 1000);
	});