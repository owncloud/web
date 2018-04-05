<template>
	<form>
		<div class="uk-margin">
			<label>User name</label>
			<input class="uk-input" type="text" v-model="userName" autofocus />
		</div>
		<div class="uk-margin">
			<label>Password</label>
			<input class="uk-input" type="password" v-model="password" />
		</div>
		<div class="uk-margin">
			<input type="button" value="Login" @click="login"/>
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
		login () {
			let client = OC.client;
			client.login(this.userName, this.password).then(() => {
				console.log('success');
			});
		}
	}
};
</script>

<style>
</style>
