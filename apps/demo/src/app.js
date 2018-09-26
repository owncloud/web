const pkg = require('../package.json');


// --- Navigation Item(s) ------------------------------------------------------

const navItems = [{
	name: 'Demo',
	iconMaterial: 'extension',
	route: {
		name: 'demo-show-config'
	}
}];


// --- Components --------------------------------------------------------------

const ShowConfig = () => ({
	component: import ('./DemoShowConfig.vue')
});

import ButtonRowItem from './ButtonRowItem.vue';

// --- Routing -----------------------------------------------------------------

const routes = [{
	path: `/${pkg.name}`,
	component: ShowConfig,
	name: 'demo-show-config'
}];

const plugins = [{
	extend: "filesDetailsButtonRow",
	component: ButtonRowItem,
	title: 'Demo'
}];

export default define({
	routes,
	navItems,
	plugins
});
