import Vue from 'vue';

let tpl =	'<div class="uk-alert-danger" uk-alert>' +
			'	<a class="uk-alert-close" uk-close></a>' +
			'	<h4>I am the alert plugin</h4>' +
			'	<p>The event bus told me, you have {{ counter }} cookies</p>' +
			'</div>';

let app = new Vue({
	name: 'alert',
	data: {
		counter: 0
	},
	template: tpl,
	mounted () {
		OC.$bus.on("demo:update-cookies", count => {
			this.counter = count;
		});

		OC.$extend.provide('alert', 'funky', this.youSuck);
	},
	methods : {
		youSuck() {
			let p = new Promise((r, d) => {
				r('You suck!');
			});
			return p;
		}
	}
});

OC.$extend.request('demo', 'above-the-line').then( payload => {
	app.$mount(payload[0]);
	app.counter = payload[1];
});

export default define(app);
