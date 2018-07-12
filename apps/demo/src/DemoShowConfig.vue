<template lang="html">
	<div class="uk-padding">
		<h1>
			This app shows the current config
		</h1>
		<pre v-text="config"></pre>
		<component v-for="(plugin, pid) in extendPlugBelow" :is="plugin.component" :key="pid" v-if="extendPlugBelow.length > 0"></component>
	</div>
</template>
<script>
const _filter = require('lodash/filter');

export default {
	name: 'DemoShowConfig',
	computed: {
		extendPlugBelow() {
			return _filter(this.$root.plugins, ['extend', "demoBelowTable"]);
		},
		config() {
			return this.$root.config;
		}
	}
}
</script>
