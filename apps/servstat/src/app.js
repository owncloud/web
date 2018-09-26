const pkg = require('../package.json');


// --- Navigation Item(s) ------------------------------------------------------

const navItems = [{
	name         : 'Server Status',
	iconMaterial : 'network_check',
	route        : {
		name : 'servstat'
	}
}];


// --- Components --------------------------------------------------------------

import Indicator from './Indicator.vue';

const string = {
	name : 'ServstatStringPlugin',
	template : '<div class="uk-alert-primary" uk-alert><strong>Servstat Plugin:</strong> Telling you that the server URL is {{ server }}</div>',
	computed : {
		server () {
			return this.$root.config.server;
		}
	}
};

const ip = {
	name : "ServstatIp",
	template : "<h1>Backend URL: {{ server }}</h1>",
	computed : {
		server () {
			return this.$root.config.server;
		}
	}
};

// --- Routing -----------------------------------------------------------------

const routes = [{
	path : `/${pkg.name}`,
	component : ip,
	name : 'servstat'
}];

const plugins = [{
	extend: "phoenixNavbarRight",
	component: Indicator
}, {
	extend: "demoBelowTable",
	component: string
}];

export default define({
	routes,
	plugins,
	navItems
});
