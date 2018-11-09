// --- Libraries and Plugins ---

import Vue       from 'vue';

const _map     = require('lodash/map');
const _flatten = require('lodash/flatten');

// --- Components ---

import Phoenix   from './Phoenix.vue';

// --- Adding global libraries ---

import UIkit  from 'uikit';
import Vuetify from 'vuetify';
import Client from 'js-owncloud-client';
import Axios  from 'axios';

import store  from './store';
import router  from './router';

Vue.prototype.$uikit  = UIkit;
Vue.prototype.$axios  = Axios;
Vue.prototype.$client = new Client();

// --- Plugins ----

import VueEvents   from 'vue-events';
import VueRouter   from 'vue-router';
import VueAxios from 'vue-axios';

Vue.use(VueEvents);
Vue.use(VueRouter);
Vue.use(VueAxios, Axios);
Vue.use(Vuetify);

// --- Gettext ----

import GetTextPlugin from 'vue-gettext';
import translations from '../l10n/translations.json'

Vue.use(GetTextPlugin, {
    availableLanguages: {
        en: 'English',
        de: 'German',
    },
    defaultLanguage: navigator.language.substring(0,2),
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
            let routes = [{
                path: '/',
                redirect : to => arguments[0].navItems[0].route
            }];


            for (let app of arguments) {
                if (app.routes) routes.push(app.routes);
                if (app.plugins) plugins.push(app.plugins);
                if (app.navItems) navItems.push(app.navItems);
            }

            router.addRoutes(_flatten(routes));

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
            // inject custom config into vuex
            store.dispatch('loadConfig', config.data)
            // inject custom theme config into vuex
            let theme = Axios.get(`src/themes/${config.data.theme}.json`).then(res => {
              store.dispatch('loadTheme', res.data)
            })
        });
    }
    catch (err) {
        alert(err);
    }
})();
