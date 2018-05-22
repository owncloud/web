import Vue     from 'vue';
import $       from 'jquery';

let tpl =	'<div id="demo" class="uk-card uk-card-default uk-card-body uk-width-1-2@m uk-position-center uk-width-large">' +
			'	<h3 class="uk-card-title"> I love Cookies</h3>' +
			'	<p>This is an App, that loves Cookies</p>' +
			'	<button @click="addCookie">Cookies: {{amountOfCookies}}</button>' +
			'</div>';

let app = new Vue({
	name: 'demo',
	data: {
		amountOfCookies: 43,
	},
	template: tpl,
	created () {
		OC.$extend.provide('demo', 'above-the-line', this.extendAboveTheLine)
	},
	mounted () {
		OC.$extend.request('alert', 'funky').then(message => {
			console.log(message);
		});
	},
	methods: {
		addCookie() {
			++this.amountOfCookies;
			OC.$bus.emit('demo:update-cookies', this.amountOfCookies);
		},
		extendAboveTheLine () {
			let p = new Promise((resolve, defer) => {
				let id = "dfw2o3ifws";
				$('#demo').prepend( $('<div>', { id : id }));
				resolve(['#'+id, this.amountOfCookies]);
			});
			return p;
		}
	}
});

export default define(app);
