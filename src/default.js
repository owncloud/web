// --- Libraries ---

import Vue      from 'vue';
import _        from 'lodash';
import $        from 'jquery';
import filesize from 'filesize';


// --- Components ---

import TopBar   from './components/Top-Bar.vue';
import Menu     from './components/Menu.vue';
import Login    from './components/Login.vue';


// --- Plugins ---

import VueBus from 'vue-bus';
Vue.use(VueBus);

// --- Mixins ---

import Helper from './mixins/helper.js';

// --- Adding global libraries ---

import UIkit  from 'uikit';
import Client from 'js-owncloud-client';
import Extend from './libs/extend.js';

Vue.prototype.$uikit  = UIkit;
Vue.prototype.$client = new Client();
Vue.prototype.$extend = Extend;

OC = new Vue({
	el       : "#oc-scaffold",
	name     : "phoenix",
	mixins   : [Helper],
	components: {
		'top-bar'   : TopBar,
		'side-menu' : Menu,
		'login'    : Login
	},
	data     : {
		appPath : '/apps',

		// config settings
		config  : {},
		server : {},

		// models
		nav        : [],
		apps       : [],
		eventQueue : [],
		user    : {
			displayname : null,
			email       : null,
			enabled     : false,
			home        : null
		}
	},

	mounted () {
		// Start with loading the config
		this._loadConfig();

		this.$once('afterLoadConfig', () => {
			this._setupApps()
		});

		this.$once('afterSetupApps', () => {
			this._bootApp(_.head(this.apps))
		});

		this.$once('afterBootApp', () => {
			this._runEventQueue();
		});

	},

	methods: {

		/**
		 * Write apps.json to this.apps
		 *
		 * @return Promise
		 */

		_loadConfig () {
			$.getJSON('config.json', (config) => {
				this.config = config;
				this.apps   = config.apps;
				this.$emit('afterLoadConfig');
			}).fail((err) => {
				if (err.status === 404) {
					this.$uikit.notification({
						message: '<strong>config.json missing!</strong><br>Make sure to have this file in your root folder.',
						status: 'danger',
						timeout: 0
					});
				}
			});
		},


		/**
		 * Setup all available apps
		 *
		 * @return Promise
		 */

		_setupApps () {

			_.forEach(this.apps, (app, i) => {

				// TODO: Find better var name for 'foo'
				requirejs([this.appJS(app.id, 'boot')], ( foo ) => {

					let defaults = {
						enabled : true,
						running : false,
					};

					if (foo.info.plugin)
						this.eventQueue.push(foo.info.id + ':booted');

					this.apps[i] = _.assignIn(defaults, foo.info);

					// inject self
					foo.setup(foo).then(() => {
						if (this.apps.length === ++i) {
							this.$emit('afterSetupApps');
						}
					})

				}, (err) => {
					this.warn(err);
				});
			});
		},


		/**
		 * Boot an application
		 *
		 * @param obj app with appId as key
		 * @return Promise
		 */

		_bootApp (app) {
			requirejs([this.appJS(app.id, 'boot')], ( App ) => {
				App.boot(this._spawnAppContainer(), App).then( () => {
					this._appSet(app.id, { 'running' : true } );
					this.eventQueue.push(app.id + ':booted');
					this.$emit('afterBootApp');
				})
			})
		},

		_runEventQueue () {
			_.forEach(this.eventQueue, (event, i) => {
				this.$bus.emit(event);
			});
		},

		_spawnAppContainer () {

			let attr = {
				id    : this.createRandom(),
				class : 'oc-app-container',
				text  : 'Loading ...'
			};

			// Reset app container
			$('#oc-content').html( $('<div>', attr ) );
			return `#${attr.id}`;
		},

		/**
		 * Change the model object of an app
		 *
		 * @param id appId
		 * @param payload object
		 */

		_appSet (id, payload) {

			let app   = this.getAppById(id),
				index = _.findIndex(app);

			this.apps[index] = _.assignIn(app, payload);
		},

		// ----------------------------------------------------------- USERS ---

		// setters

		setUser (user) {
			this.user = user;
		},

		// getters

		getUser () {
			return this.user
		},

		getUserDisplayname () {
			return this.user.displayname;
		},

		getUserEmail () {
			return this.user.email;
		},

		getUserQuota (formatted = false) {
			if (!this.user.quota)
				return null

			if (!formatted)
				return this.user.quota;

			let form = {
				free  : filesize(this.user.quota.free),
				total : filesize(this.user.quota.total),
				used  : filesize(this.user.quota.used)
			};

			return _.assignIn(this.user.quota, form);
		},

		userEnabled () {
			return this.user.enabled;
		},

		// ---------------------------------------------------------- helper ---

		getAppById( id ) {
			return _.find(this.apps, ["id", id] );
		},

		appJS( app, file ) {
			return ['apps', app, 'js', file + '.js'].join('/');
		},

		// -------------------------------------------- registration methods ---

		registerNavItem ( app, payload ) {
			this.nav.push(_.assign( { app }, payload ));
		},

	},
})

export default OC;
