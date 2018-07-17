<template>
	<div class="uk-card uk-card-default uk-card-body">
		<slot name="above"></slot>
		<h4>
			Server setup
		</h4>
		<div class="uk-grid-small" uk-grid>
			<div class="uk-width-4-5 uk-position-relative">
				<input class="uk-input" type="url" placeholder="Hostname" ref="host" v-model="server.host">
			</div>
			<div class="uk-width-1-5">
				<input class="uk-input" type="number" min="0" max="65535" placeholder="Port" v-model="server.port">
			</div>
			<div v-if="expert" class="uk-width-4-5">
				<input class="uk-input" type="url" placeholder="Backup Hostname" v-model="server.backupHost">
			</div>
			<div v-if="expert" class="uk-width-1-5">
				<input class="uk-input" type="number" min="0" max="65535" placeholder="Backup Port" v-model="server.backupPort">
			</div>
			<div class="uk-width-1-1">
				<input class="uk-input" type="text" placeholder="User DN" v-model="server.userDN">
			</div>
			<div class="uk-width-1-1">
				<input class="uk-input" type="password" placeholder="Password" v-model="server.password">
			</div>
			<div v-if="expert" class="uk-width-1-1">
				<input class="uk-checkbox" type="checkbox" v-model="server.certCheck">
				<label>&nbsp;Turn off SSL certificate validation.</label>
			</div>
			<div v-if="expert" class="uk-width-1-1">
				<input class="uk-input" type="number" placeholder="Cache Time-To-Live" v-model="server.cacheTTL">
			</div>
		</div>
		<slot name="below"></slot>
	</div>
</template>
<script>
export default {
	props: ["server"],
	data () {
		return {
			expert : false,
			expanded : true
		}
	}
}
</script>
