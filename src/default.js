// --- Libraries and Plugins ---

import Vue       from 'vue';

const _map     = require('lodash/map');
const _flatten = require('lodash/flatten');

// --- Components ---

import Phoenix   from './Phoenix.vue';

// --- Adding global libraries ---

import UIkit  from 'uikit';
import Client from 'js-owncloud-client';
import Axios  from 'axios';

import store  from './store.js';

Vue.prototype.$uikit  = UIkit;
Vue.prototype.$axios  = Axios;
Vue.prototype.$client = new Client();

// --- Plugins ----

import VueEvents   from 'vue-events';
import VueRouter   from 'vue-router';

Vue.use(VueEvents);
Vue.use(VueRouter);

// --- Gettext ----

import GetTextPlugin from 'vue-gettext';
import translations from '../l10n/translations.json'

Vue.use(GetTextPlugin, {
  availableLanguages: {
<<<<<<< HEAD
  en_US: 'American English',
  en_GB: 'British English',
  de_DE: 'German',
  },
  defaultLanguage: 'en_US',
=======
  en_GB: 'British English',
  de_DE: 'German',
  },
  defaultLanguage: 'en_GB',
>>>>>>> f432af080e16109d0ee99dccb1a02f8c1a6e17a5
  translations: translations,
})

// --- Drag Drop ----

import { Drag, Drop } from 'vue-drag-drop';

Vue.component('drag', Drag);
Vue.component('drop', Drop);

// --- Router ----

(async function () {

	try {
		let config = await Axios.get('config.json');

		let apps = _map(config.data.apps, (app) => {
			return `./apps/${app}/js/${app}.bundle.js`;
		});

		requirejs(apps, function() {

			let plugins  = [];
			let navItems = [];
			let routes   = [{
				path : '/',
				redirect : to => arguments[0].navItems[0].route
			}];

			for (let app of arguments) {
				if (app.routes) routes.push(app.routes);
				if (app.plugins) plugins.push(app.plugins);
				if (app.navItems) navItems.push(app.navItems);
			}

			const router = new VueRouter({
				routes: _flatten(routes)
			});

			const OC  = new Vue({
				el : '#owncloud',
				data : {
					config   : config.data,
					plugins  : _flatten(plugins),
					navItems : _flatten(navItems)
				},
				store,
				router,
				render: h => h(Phoenix)
			});
		});
	}
	catch (err) {
		alert(err);
	}
})();
