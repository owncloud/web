<template>
	<div id="oc-dialog-login" uk-modal>
		<div class="uk-modal-dialog uk-margin-auto-vertical">
			<div class="uk-modal-title">Login required</div>
			<div class="uk-modal-body">
				<login-form />
			</div>
		</div>
	</div>
</template>

<script>
import LoginForm from './Login-Form.vue';

export default {
	components: {
		LoginForm
	}
};
</script>

<style>
</style>
