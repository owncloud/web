<template lang="html">
	<li>
		<a href="#">
			<i v-if="failed" class="material-icons uk-text-inverse" uk-tooltip="Request timed out">wifi_off</i>
			<i v-else-if="loading" class="material-icons uk-text-inverse">network_check</i>
			<i v-else :uk-toggle="'target:#'+modalId" class="material-icons uk-text-inverse">wifi</i>
			<div :id="modalId" uk-modal>
				<div class="uk-modal-dialog uk-modal-body">
					<div class="uk-alert-primary" uk-alert>
						<strong>Servstat Plugin</strong>
					</div>
					<h2 class="uk-modal-title">
						{{ status.productname }} {{ status.edition }} {{ status.versionstring }}
					</h2>
					<table class="uk-table uk-table-striped uk-table-small">
						<tr>
							<td>Server URL:</td>
							<td v-text="server"></td>
						</tr>
						<tr>
							<td>Installed:</td>
							<td v-text="status.installed"></td>
						</tr>
						<tr>
							<td>Maintenance Mode:</td>
							<td v-text="status.maintenance"></td>
						</tr>
						<tr>
							<td>Version:</td>
							<td v-text="status.version"></td>
						</tr>
						<tr>
							<td>Product/Edition:</td>
							<td>
								{{ status.productname }} {{ status.edition }}
							</td>
						</tr>
					</table>
				</div>
			</div>
		</a>
	</li>
</template>
<script>
const _uniqueId = require('lodash/uniqueId');

export default {
	name : 'ServstatIndicator',
	data () {
		return {
			loading : true,
			failed  : false,
			status  : {}
		}
	},
	computed : {
		modalId () {
			return _uniqueId('servstat-modal-');
		},
		server () {
			return this.$root.config.server;
		}
	},
	mounted () {
		this.fetchStatus();

		setInterval(() => {
			this.fetchStatus();
		}, 30000);
	},
	methods : {
		fetchStatus () {
			this.loading = true;
			this.failed  = false;
			this.$axios.get( this.server + '/status.php').then(status => {
				this.loading = false;
				this.failed  = false;
				this.status  = status.data;
			}).catch(err => {
				this.loading = false;
				this.failed  = true;
				this.status  = {};
			})
		}
	}
};
</script>
