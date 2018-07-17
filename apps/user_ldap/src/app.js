const pkg = require('../package.json');

// --- Navigation Item(s) ------------------------------------------------------

const navItems = [{
	name         : 'LDAP Integration',
	iconMaterial : 'supervised_user_circle',
	route        : {
		name : pkg.name
	}
}]

import App from './App.vue';
// import Wizard from './Wizard.vue';

// --- Routing -----------------------------------------------------------------

const routes = [{
	path : `/${pkg.name}`,
	component : App,
	name : 'user_ldap'
}]

export default define({
	routes,
	navItems
})
