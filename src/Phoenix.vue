<template>
	<v-app light id="Phoenix">
		<v-container fluid class="pa-0">
			<v-layout tag="header"  v-if="showHeader">
				<top-bar></top-bar>
			</v-layout>
			<v-layout tag="aside" v-if="showHeader">
				<side-menu></side-menu>
			</v-layout>
			<main>
				<router-view></router-view>
			</main>
		</v-container>
	</v-app>
</template>
<script>
import TopBar from './components/Top-Bar.vue';
import Menu   from './components/Menu.vue';

export default {
	components: {
		TopBar,
		'side-menu' : Menu
	},
	beforeMount () {
		let instance = this.$root.config.server || window.location.origin;
		this.$client.setInstance(instance);
    this.$store.dispatch('initAuth');
    },
	computed: {
  	showHeader() {
			if ( this.$route.meta.hideHeadbar === true) {
			 	return false
			}
			else{
				return true
			}
		}
	}
}
</script>
