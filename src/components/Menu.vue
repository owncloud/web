<template>
	<div id="oc-nav" uk-offcanvas="mode: reveal">
		<div class="uk-offcanvas-bar uk-background-muted">
			<ul class="uk-nav-default uk-nav-parent-icon" uk-nav="">
				<li v-for="(n, nid) in nav" :key="nid">
					<router-link :to="n.route">
						<i v-if="n.iconMaterial" class="material-icons uk-margin-small-right" v-text="n.iconMaterial"></i>
						<span v-text="n.name"></span>
					</router-link>
				</li>
				<li class="uk-nav-divider"></li>
				<li class="uk-parent uk-margin-medium-top"><a href="#" uk-height-match=""><i class="material-icons uk-margin-small-right">account_circle</i>Personal</a>
					<ul class="uk-nav-sub">
						<li><a href="#">About Me</a></li>
						<li><a href="#">Sessions</a></li>
						<li><a href="#">App passwords</a></li>
						<li><a href="#">Sync clients</a></li>
						<li><a href="#">Activity</a></li>
						<li><a href="#">Federated Cloud</a></li>
					</ul>
				</li>
				<li class="uk-nav-divider"></li>
				<li class="uk-parent"><a href="#"><i class="material-icons uk-margin-small-right">help</i>Help</a>
					<ul class="uk-nav-sub">
						<li><a href="#">User documentation</a></li>
						<li><a href="#">Online documentation</a></li>
						<li><a href="#">Forum</a></li>
						<li><a href="#">Issue tracker</a></li>
						<li><a href="#">Commercial support</a></li>
					</ul>
				</li>
				<li class="uk-parent uk-margin-medium-top"><a href="#"><i class="material-icons uk-margin-small-right">settings</i>Administration</a>
					<ul class="uk-nav-sub">
						<li><a href="#">Sharing</a></li>
						<li><a href="#">External storage</a></li>
						<li><a href="#">Federation</a></li>
						<li><a href="#">File handling</a></li>
						<li><a href="#">EMail-templates</a></li>
					</ul>
				</li>
				<li class="uk-margin-medium-top"><a href="#"><i class="material-icons uk-margin-small-right">exit_to_app</i>Exit ownCloud</a></li>
			</ul>
		</div>
	</div>
</template>

<script>
export default {
	computed : {
		nav () {
			return this.$root.navItems;
		}
	}
};
</script>
