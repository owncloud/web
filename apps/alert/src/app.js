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
		this.$emit('mounted');
		OC.$on("demo:update:cookies", (count) => {
			app.counter = count;
		})
	}
});

OC.$once("demo:extend:below", (node, cookies) => {
	app.$mount(node);
	app.counter = cookies;
})

export default define(app);
