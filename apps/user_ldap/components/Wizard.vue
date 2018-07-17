<template>
	<div v-if="!loading" uk-grid>
		<main class="uk-width-expand">
			<wizardServer :server="config.server" class="uk-margin"></wizardServer>
			<wizardUsers :users="config.users"></wizardUsers>
			<wizardLogin :login="config.login"></wizardLogin>
			<wizardGroups :groups="config.groups"></wizardGroups>
		</main>
		<aside class="uk-width-large uk-position-relative">
			<div class="uk-card uk-card-default uk-card-small uk-height-1-1">
				<div class="uk-card-body">

					<div uk-alert>
						<a class="uk-alert-close" uk-close></a>
						<h3>
							Getting started
						</h3>
						<p>
							Please setup basic Server settings to get the party started!
						</p>
					</div>

					<div uk-alert class="uk-alert-danger" v-if="errors.length > 0">
						<ul class="uk-list">
							<li v-for="err in errors">{{err.response}}</li>
						</ul>
					</div>

					<button v-for="(backup, bid) in history" type="button" class="uk-button uk-button-text uk-flex uk-flex-middle" @click="restore(bid)">
						<i class="material-icons uk-margin-small-right" style="font-size:18px">restore</i>
						<span>Restore from {{ backup.time | formDate }}</span>
					</button>
				</div>
			</div>
		</aside>
		<footer class="uk-width-1-1">
			<div class="uk-button-group">
				<div class="uk-inline">
					<button class="uk-button uk-button-default uk-flex uk-flex-middle" type="button">
						<i class="material-icons uk-margin-small-right">restore</i>
						<span>Restore</span>
					</button>
					<div uk-dropdown="mode: click; boundary: ! .uk-button-group; boundary-align: true;">
						<ul class="uk-nav uk-dropdown-nav">
							<li class="uk-active"><a href="#">Active</a></li>
							<li><a href="#">Item</a></li>
							<li class="uk-nav-header">Header</li>
							<li><a href="#">Item</a></li>
							<li><a href="#">Item</a></li>
							<li class="uk-nav-divider"></li>
							<li><a href="#">Item</a></li>
						</ul>
					</div>
				</div>
				<button type="button" @click="test" class="uk-button uk-button-primary">Test Settings</button>
				<button type="button" class="uk-button uk-button-default uk-flex uk-flex-middle">
					<i class="material-icons uk-margin-small-right">save</i>
					Save &amp; Close
				</button>
			</div>
		</footer>
	</div>
</template>
<script>

import $ 			from 'jquery';
import moment		from 'moment';

import WizardServer from "./Wizard-Server.vue";
import WizardUsers  from "./Wizard-Users.vue";
import WizardGroups from "./Wizard-Groups.vue";
import WizardLogin  from "./Wizard-Login.vue";

export default {
	data () {
		return {
			loading : true,
			config  : {},
			errors  : [],
			history : []
		}
	},
	mounted () {
		$.getJSON('/apps/user_ldap/ldap_config_demo.json', (config) => {
			this.config  = config;
			this.loading = false;
		});
	},
	components: {
		WizardServer,
		WizardUsers,
		WizardGroups,
		WizardLogin
	},
	filters : {
		formDate (date) {
			return moment.unix(date).format('LTS');
		}
	},
	methods : {

		validate() {
			this.errors = [];

			if (this.config.server.host.length === 0)
				this.errors.push({
					where    : 'server.host',
					response : "Hostname can't be empty!"
				});

			if (this.config.server.port == 0)
				this.errors.push({
					where    : 'server.port',
					response : 'Port 0 is not open or whatever'
				});

		},

		test () {

			this.validate();

			let valid  = (this.history.length === 0) ? false : true;
			let backup = {
				time   : moment().unix(),
				valid,
				string : JSON.stringify(this.config)
			}
			this.history.push(backup);
		},

		restore (state) {
			this.config = JSON.parse(this.history[state].string);
		}
	}
}
</script>
