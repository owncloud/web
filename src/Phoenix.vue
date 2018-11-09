<template>
	<v-app id="Phoenix">
		<header  v-if="showHeader">
			<top-bar></top-bar>
		</header>
		<aside  v-if="showHeader">
			<side-menu></side-menu>
		</aside>
		<main id="oc-content" class="uk-offcanvas-content">
			<router-view></router-view>
		</main>
	</v-app>
</template>
<script>
import TopBar from './components/Top-Bar.vue';
import Menu   from './components/Menu.vue';

export default {
	components: {
		'top-bar'   : TopBar,
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
