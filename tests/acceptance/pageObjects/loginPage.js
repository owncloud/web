module.exports = {
	url: function() {
		return this.api.launchUrl;
	},
	elements: {
		body: 'body',
        authenticateButton: {
            selector: '#authenticate',
		}
	}
}