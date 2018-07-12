module.exports = {
		url: function() {
			return this.api.launchUrl + "/#/files/list/home";
	},
	elements: {
		filesTable: {
			selector: '//div[@id="files-app"]//table',
			locateStrategy: 'xpath'
		},
		fileRows: {
			selector: '//div[@id="files-app"]//tbody/tr',
			locateStrategy: 'xpath'
		},
		loadingIndicator: {
			selector: '.oc-loader-spinner'
		},
	}
}