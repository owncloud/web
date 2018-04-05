<template>
	<form>
		<div class="uk-margin">
			<label>User name</label>
			<input class="uk-input" type="text" v-bind="userName" autofocus />
		</div>
		<div class="uk-margin">
			<label>Password</label>
			<input class="uk-input" type="password" v-bind="password" />
		</div>
		<div class="uk-margin">
			<input type="button" value="Login"/>
		</div>
	</form>
</template>

<script>
export default {
	data () {
		return {
			userName: '',
			password: ''
		};
	},
	mounted () {
	},
	methods: {
	}
};
</script>

<style>
</style>
