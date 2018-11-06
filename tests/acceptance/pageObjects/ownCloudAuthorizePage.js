module.exports = {
	url: function() {
		return this.api.launchUrl;
	},
	elements: {
		body: 'body',
		authorizeButton: {
			selector: 'button[type=submit]',
		},
	}
}