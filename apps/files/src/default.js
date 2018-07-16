const pkg = require('../package.json');

// --- Navigation Item(s) ------------------------------------------------------

const navItems = [{
	name: 'Files',
	iconMaterial: 'folder',
	route: {
		name: 'file-list',
		params: {
			item: 'home'
		}
	}
}];

import FilesApp from './components/Files-App.vue';

const routes = [{
	path: `/${pkg.name}/list/:item`,
	component: FilesApp,
	name: 'file-list'
}];

export default define({
	routes,
	navItems
});
