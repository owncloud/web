<template>
	<div id="Phoenix">
		<header>
			<top-bar></top-bar>
		</header>
		<aside>
			<side-menu></side-menu>
		</aside>
		<login></login>
		<main id="oc-content" class="uk-offcanvas-content uk-background-muted">
			<router-view></router-view>
		</main>
	</div>
</template>
<script>
import TopBar from './components/Top-Bar.vue';
import Menu   from './components/Menu.vue';
import Login  from './components/Login.vue';

export default {
	components: {
		'top-bar'   : TopBar,
		'side-menu' : Menu,
		'login'     : Login
	},
	beforeMount () {
		this.$client.setInstance(this.$root.config.server);
	}
}
</script>
