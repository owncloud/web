const pkg = require('../package.json');
const store = require('./store.js')

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

const appName = "files"

import FilesApp from './components/Files-App.vue';

const routes = [{
	path: `/${pkg.name}/list/:item`,
	component: FilesApp,
	name: 'file-list',
	meta: { 'hideHeadbar': false }
}];

export default define({
	appName,
	store,
	routes,
	navItems
});
