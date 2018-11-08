module.exports = {
	url: function() {
		return this.api.launchUrl + '/#/login';
	},
	elements: {
		body: 'body',
        authenticateButton: {
            selector: '#authenticate',
		}
	}
}
