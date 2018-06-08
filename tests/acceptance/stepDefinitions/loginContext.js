const { client } = require('nightwatch-cucumber');
const { Given, Then, When } = require('cucumber');

Given(/^the user has browsed to the login page$/,
	() => {
		const loginPage = client.page.loginPage();
		return loginPage
		.navigate()
		.waitForElementVisible('@openLoginDialogButton', 1000)
		.click('@openLoginDialogButton')
		.waitForElementVisible('@loginDialogDiv', 1000);
		//TODO we need a global const for waiting timeout
	});

When('the user logs in with username {string} and password {string} using the webUI',
	(username, password) => {
		const loginPage = client.page.loginPage();
		return loginPage
		.waitForElementVisible('@loginDialogDiv', 1000)
		.click('@selectOwncloud',()=>{
			loginPage.click("option:nth-child(1)");
		})
		.setValue('@usernameInput', username)
		.setValue('@passwordInput', password)
		.click('@loginSubmitButton');
	});

Then('the files table should be displayed',
	() => {
		const filesPage = client.page.filesPage();
		return filesPage
		.waitForElementVisible('@filesTable', 1000);
	});
