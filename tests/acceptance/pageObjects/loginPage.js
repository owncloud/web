module.exports = {
	url: 'http://localhost:8300/',
	//TODO need to pass this URL in from outside as baseUrl paramter
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