import Vue from 'vue';

let tpl =	'<div class="uk-card uk-card-default uk-card-body uk-width-1-2@m uk-position-center uk-width-large">' +
			'	<div id="demo-extend-above"></div>' +
			'	<h3 class="uk-card-title"> I love Cookies</h3>' +
			'	<p>This is an App, that loves Cookies</p>' +
			'	<button @click="addCookie">Cookies: {{amountOfCookies}}</button>' +
			'	<div id="demo-extend-below"></div>' +
			'</div>';

let app = new Vue({
	name: 'demo',
	data: {
		amountOfCookies: 43,
	},
	template: tpl,
	mounted () {
		OC.$bus.emit('demo:mounted');

		OC.$bus.emit('demo:extends-above', '#demo-extend-above', this.amountOfCookies);
		OC.$bus.emit('demo:extends-below', '#demo-extend-below', this.amountOfCookies);
	},
	methods: {
		addCookie() {
			++this.amountOfCookies;
			OC.$bus.emit('demo:update-cookies', this.amountOfCookies);
		}
	}
});

export default define(app);
