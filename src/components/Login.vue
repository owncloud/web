<template>
	<div id="oc-login-dialog" uk-modal>
		<div class="uk-modal-dialog uk-margin-auto-vertical uk-background-muted">
			<div class="uk-modal-body">
				<h2 class="uk-modal-title">
					Login
				</h2>
				<div class="uk-margin">
					<label>Select ownCloud</label>
					<select class="uk-select" v-model="instance">
						<option v-for="server in servers">{{ server }}</option>
					</select>
				</div>
				<div class="uk-margin">
					<label>User name</label>
					<input class="uk-input" type="text" v-model="username" autofocus @keyup.enter="login" />
				</div>
				<div class="uk-margin">
					<label>Password</label>
					<input class="uk-input" type="password" v-model="password" @keyup.enter="login"/>
				</div>
				<div class="uk-margin">
					<input v-if="!loading" class="uk-button uk-button-primary" type="button" value="Login" @click="login"/>
					<button v-else class="uk-button uk-button-default">Loading…</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	data () {
		return {
			loading : false,
			instance: null,
			username: '',
			password: ''
		};
	},
	props : ['user', 'servers'],
	mounted () {
		this.$parent.$bus.on('phoenix:request-login', () => {
			this._show();
		});
	},
	methods: {
		_resetForm () {
			this.username = '';
			this.password = '';
		},

		_show () {
			this._resetForm();
			this.$parent.$uikit.modal('#oc-login-dialog').show();
		},

		_hide () {
			this._resetForm();
			this.$parent.$uikit.modal('#oc-login-dialog').hide();
		},

		login () {
			this.loading = true;
			let OC = this.$parent;
			OC.$client.setInstance(this.instance);
			OC.$client.login(this.username, this.password).then( () => {
				OC.$client.users.getUser(this.username).then(user => {
					this.loading = false;
					this._hide();
					OC.setUser(user);
					OC.$bus.emit('phoenix:user-logged-in');
					OC.$uikit.notification({
						message: `Welcome  ${user.displayname}<br>We love you :-*`,
						status: 'primary'
					});
				});
			}).catch(error => {
				this.loading = false;
				OC.$uikit.notification({
					message: error,
					status: 'danger',
				});
			});
		},
	}
};
</script>
