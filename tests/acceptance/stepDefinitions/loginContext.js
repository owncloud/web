const { client } = require('nightwatch-api');
const { Given, Then, When } = require('cucumber');

Given(/^the user has browsed to the login page$/,
	() => {
		const loginPage = client.page.loginPage();
		return loginPage
		.navigate()
		.waitForElementVisible('@loginDialogDiv', 1000);
		//TODO we need a global const for waiting timeout
	});

When('the user logs in with username {string} and password {string} using the webUI',
	(username, password) => {
		const loginPage = client.page.loginPage();
		return loginPage
		.waitForElementVisible('@loginDialogDiv', 1000)
		.setValue('@usernameInput', username)
		.setValue('@passwordInput', password)
		.click('@loginSubmitButton')
		.waitForElementNotVisible('@loginDialogDiv',10000);
	});

Then('the files table should be displayed',
	() => {
		const filesPage = client.page.filesPage();
		return filesPage
		.waitForElementNotVisible('@loadingIndicator', 1000)
		.assert.visible('@filesTable');
	});

Then('the files table should not be empty',
	() => {
		const filesPage = client.page.filesPage();
		return filesPage
		.waitForElementNotVisible('@loadingIndicator', 1000)
		//even the loading indicator is gone the table might not be rendered yet
		.waitForElementVisible('@fileRows', 10000);
	});