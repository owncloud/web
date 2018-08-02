<template>
	<section uk-grid id="user_ldap-wizard-server">
		<div class="uk-width-1-1">
			<h2 class="uk-heading-divider">
				LDAP Server setup
			</h2>
		</div>
		<main class="uk-width-expand">
			<div class="uk-card uk-card-default">
				<div class="uk-card-header uk-position-relative">
					<h3 class="uk-card-title uk-margin-remove">
						<span v-if="!server.host">Setup hostname</span>
						<span v-else v-text="server.host"></span>
					</h3>
					<i class="material-icons uk-position-small uk-position-center-right" @click="$parent.toggleTab('server')" style="cursor:pointer;">
						<span v-if="isActive">keyboard_arrow_down</span>
						<span v-else>keyboard_arrow_left</span>
					</i>
				</div>
				<div class="uk-card-body" v-if="isActive">
					<div class="uk-grid-small" uk-grid>
						<div class="uk-width-4-5">
							<div uk-grid class="uk-grid-collapse">
								<label class="uk-width-auto uk-form-label-sticky min-width-90" for="user_ldap-wizard-server-hostname">Hostname:</label>
								<input class="uk-width-expand uk-input" type="url" placeholder="ldaps://" ref="host" v-model="server.host" v-on:focus="toggleTip('host')" v-on:blur="toggleTip('host', false)">
							</div>
						</div>
						<div class="uk-width-1-5">
							<div uk-grid class="uk-grid-collapse">
								<label class="uk-width-auto uk-form-label-sticky" for="user_ldap-wizard-server-port">Port:</label>
								<input class="uk-width-expand uk-input" type="number" min="0" max="65535" v-model="server.port">
							</div>
						</div>
						<div class="uk-width-1-1">
							<div uk-grid class="uk-grid-collapse">
								<label class="uk-width-auto uk-form-label-sticky min-width-90" for="user_ldap-wizard-server-port">User-DN:</label>
								<input class="uk-width-expand uk-input" type="text" placeholder="User Distinguished Name" v-model="server.userDN" v-on:focus="toggleTip('userDN')" v-on:blur="toggleTip('userDN', false)">
							</div>
						</div>
						<div class="uk-width-1-1">
							<div uk-grid class="uk-grid-collapse">
								<label class="uk-width-auto uk-form-label-sticky min-width-90" for="user_ldap-wizard-server-password">Password:</label>
								<input class="uk-width-expand uk-input" type="password" v-model="server.password" v-on:focus="toggleTip('password')" v-on:blur="toggleTip('password', false)">
							</div>
						</div>
					</div>

					<div v-if="advancedMode" class="uk-grid-small uk-margin-medium-top uk-animation-slide-top-small" uk-grid>
						<div class="uk-width-4-5">
							<div uk-grid class="uk-grid-collapse">
								<label class="uk-width-auto uk-form-label-sticky" for="user_ldap-wizard-server-cache-ttl">Backup Host:</label>
								<input class="uk-width-expand uk-input" type="url" placeholder="ldaps://" v-model="server.backupHost" v-on:focus="toggleTip('host')" v-on:blur="toggleTip('host', false)">
							</div>
						</div>
						<div class="uk-width-1-5">
							<div uk-grid class="uk-grid-collapse">
								<label class="uk-width-auto uk-form-label-sticky" for="user_ldap-wizard-server-port">Port:</label>
								<input class="uk-width-expand uk-input" type="number" min="0" max="65535" placeholder="Autodetect" v-model="server.packupPort">
							</div>
						</div>
						<div class="uk-width-1-1">
							<div uk-grid class="uk-grid-collapse">
								<label class="uk-width-auto uk-form-label-sticky" for="user_ldap-wizard-server-cache-ttl">Cache TTL:</label>
								<input class="uk-width-expand uk-input" id="user_ldap-wizard-server-cache-ttl" type="number" placeholder="Cache TTL" v-model="server.cacheTTL">
							</div>
						</div>
						<div class="uk-width-1-1">
							<input class="uk-checkbox" type="checkbox" v-model="server.certCheckDisabled">
							<label class="uk-text-small">&nbsp;Turn off SSL certificate validation.</label>
						</div>
					</div>
				</div>
				<div class="uk-card-footer" v-if="isActive">
					<div class="uk-grid-small" uk-grid>
						<div class="uk-width-auto">
							<a v-if="advancedMode" @click="advancedMode=false" class="uk-text-meta">show basic settings</a>
							<a v-else @click="advancedMode=true" class="uk-text-meta">show advanced settings</a>
						</div>
						<div class="uk-width-expand uk-text-right">
							<button class="uk-button uk-button-small uk-button-default" disabled>restore</button>
							<button class="uk-button uk-button-small uk-button-primary">save &amp; test</button>
						</div>
					</div>
				</div>
			</div>
		</main>
		<aside class="uk-width-medium uk-width-large@l">
			<div uk-sticky="offset: 80; bottom: true">
				<div uk-alert class="uk-alert-primary">
					<a class="uk-alert-close" uk-close></a>
					<h3>
						1. Getting started
					</h3>
					<p>
						Please setup basic Server settings to get the party started!
					</p>
				</div>
				<div uk-alert v-if="tips.host" class="uk-alert-primary uk-animation-slide-top-small">
					<p>
						You can omit the protocol, except if you require SSL. Then start with <code class="uk-padding-remove">ldaps://</code>
					</p>
				</div>
				<div uk-alert v-if="tips.userDN" class="uk-alert-primary uk-animation-slide-top-small">
					<p>
						The <strong>Distinguished Name</strong> <i>(DN)</i> of the client user with which the bind shall be done. For anonymous access, leave DN and Password empty. For example:
					</p>
					<code class="uk-padding-remove">
						uid=agent,dc=example,dc=com
					</code>
				</div>
				<div uk-alert v-if="tips.password" class="uk-alert-primary uk-animation-slide-top-small">
					<p>
						Leave empty for anonymous access.
					</p>
				</div>
			</div>
		</aside>
	</section>
</template>
<script>
import mixins from '../src/mixins.js';

export default {
	mixins : [mixins],
	props: ["server", "is-active"],
	data () {
		return {
			advancedMode : false,
			tips : {
				host : false,
				userDN : false,
				password : false
			}
		}
	},
	methods : {
		toggleTip ( item, state = true ) {
			this.tips[item] = state;
		}
	}
}
</script>
<style scoped>
	.min-width-90 {
		min-width: 90px;
	}

	.uk-alert-primary code {
		background-color: transparent;
	}
</style>
