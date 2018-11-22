const { client } = require('nightwatch-api');
const { Given, Then, When } = require('cucumber');

Given(/^the user has browsed to the login page$/,
	() => {
		const loginPage = client.page.loginPage();
		return loginPage
		.navigate();
	});

When('the user clicks the authenticate button',
	() => {
        const loginPage = client.page.loginPage();
        return loginPage
			.waitForElementVisible('@authenticateButton')
            .click('@authenticateButton');
	});

When('the user logs in with username {string} and password {string} using the webUI',
	(username, password) => {
        const loginPage = client
            .windowHandles(function(result) {
                var temp = result.value[1];
                this.switchWindow(temp);
            })
			.page.ownCloudLoginPage();
		return loginPage
		.waitForElementVisible('@usernameInput', 1000)
		.setValue('@usernameInput', username)
		.setValue('@passwordInput', password)
		.click('@loginSubmitButton');
	});

When('the user authorizes access to phoenix',
	() => {
        const loginPage = client
            .windowHandles(function(result) {
                var temp = result.value[1];
                this.switchWindow(temp);
            })
            .page.ownCloudAuthorizePage();
        return loginPage
            .waitForElementVisible('@authorizeButton', 1000)
            .click('@authorizeButton');
	});

Then('the files table should be displayed',
	() => {
		const filesPage = client.page.filesPage();
		return filesPage
		.assert.visible('@filesTable');
	});

Then('the files table should not be empty',
	() => {
		const filesPage = client.page.filesPage();
		return filesPage
		//even the loading indicator is gone the table might not be rendered yet
		.waitForElementVisible('@fileRows', 10000);
	});
