module.exports = {
	url: function() {
		return this.api.launchUrl;
	},
	elements: {
		body: 'body',
		openLoginDialogButton: {
			selector: '//div[@id="oc-head"]//span[.="Login"]',
			locateStrategy: 'xpath'
		},
		loginDialogDiv: '#oc-login-dialog',
		selectOwncloud: {
			selector: '//label[.="Select ownCloud"]/../select',
			locateStrategy: 'xpath'
		},
		selectOwncloudFirstOption: {
			selector: '//label[.="Select ownCloud"]/../select/option[1]',
			locateStrategy: 'xpath'
		},
		usernameInput: { 
			selector: '//label[.="User name"]/../input',
			locateStrategy: 'xpath'
		},
		passwordInput: { 
			selector: '//label[.="Password"]/../input',
			locateStrategy: 'xpath'
		},
		loginSubmitButton: {
			selector: '//input[@value="Login"]',
			locateStrategy: 'xpath'
		},
	}
}