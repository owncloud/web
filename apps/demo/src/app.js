import Vue from 'vue';

let tpl =	'<div class="uk-card uk-card-default uk-card-body uk-width-1-2@m uk-position-center uk-width-large">' +
			'	<div id="demo-extend-above"></div>' +
			'	<h3 class="uk-card-title"> I love Cookies</h3>' +
			'	<p>This is an App, that loves Cookies</p>' +
			'	<button @click="addCookie">Cookies: {{amountOfCookies}}</button>' +
			'	<div id="demo-extend-below"></div>' +
			'</div>';


// Emits events
// *	update: cookies, payload: amountOfCookies

// Listens to
// *	update: cookies, payload: amountOfCookies


let app = new Vue({
	name: 'demo',
	data: {
		amountOfCookies: 43,
	},
	template: tpl,
	mounted () {
		this.$emit('mounted');

		OC.$emit(this.i('extend:above'), '#demo-extend-above', this.amountOfCookies);
		OC.$emit(this.i('extend:below'), '#demo-extend-below', this.amountOfCookies);
	},
	methods: {
		addCookie() {
			++this.amountOfCookies;
			OC.$emit(this.i('update:cookies'), this.amountOfCookies);
		},

		// --- helper ----

		i (e) {
			return 'demo:' + e;
		}
	}
});

export default define(app);
