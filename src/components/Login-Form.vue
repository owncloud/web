<template>
	<form>
		<div class="uk-margin">
			<label>User name</label>
			<input class="uk-input" type="text" v-model="userName" autofocus @keyup.enter="submit" />
		</div>
		<div class="uk-margin">
			<label>Password</label>
			<input class="uk-input" type="password" v-model="password" @keyup.enter="submit"/>
		</div>
		<div class="uk-margin">
			<input class="uk-button uk-button-default" type="button" value="Login" @click="submit"/>
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
		submit () {
			let client = OC.client;
			client.login(this.userName, this.password).then(() => {
				this.password = '';
				this.$parent.loginSuccess();
			});
			// TODO: fail
		}
	}
};
</script>

<style>
</style>
