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
		 */

		_setupApps () {

			_.forEach(this.apps, (app, index) => {

				// TODO: Find better var name for 'foo'
				requirejs([this.appJS(app.id, 'boot')], ( a ) => {

					a.setup().then((appInfo) => {
						if (app.id != appInfo.id) {
							console.error(`PHOENIX: App ID missmatch! ${app.id} != ${appInfo.id}`);
							return false
						}

						this._registerApp(index, appInfo);

						if (appInfo.start)
							this.$bus.emit(app.id +':start');

						if (this.apps.length === ++index) {
							this.$emit('afterSetupApps');
						}
					})

				}, (err) => {
					this.warn(err);
				});
			});
		},

		/**
		 * Setup all available apps
		 *
		 * @param appInfo (object) return value on setup/boot
		 */

		_registerApp ( index, appInfo ) {

			let defaults = {
				enabled : true,
				start : false,
				styles  : []
			};

			let model = _.assignIn(defaults, appInfo);
			this.apps[index] = model;
		},

		_addStyles ( appId, array ) {
			let $head = $('head');
			_.forEach(array, style => {
				$('<link>', {
					rel        : 'stylesheet',
					href       : `apps/${appId}/${style}`,
					'data-rel' : appId
				}).appendTo($head);
			});
		},

		_removeStyles ( appId ) {
			$(`link[data-app-id="${appId}"]`).remove();
		},

		/**
		 * Boot an application
		 *
		 * @param obj app with appId as key
		 * @return Promise
		 */

		_bootApp (app) {

			if (app.styles.length > 0)
				this._addStyles(app.id, app.styles);

			requirejs([this.appJS(app.id, 'boot')], ( App ) => {
				App.boot(this._spawnAppContainer(), App).then( (val) => {
					this._appSet(app.id, val );
					this.$bus.emit(app.id +':start');
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
			let apps  = _.clone(this.apps),
				app   = this.getAppById(id),
				index = _.findIndex(app);

			apps[index] = _.assignIn(app, payload);

			this.apps = apps;
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
	computed : {
		appsRunning () {
			return _.filter(this.apps, 'start');
		},
		appsPending () {
			return _.filter(this.apps, ['start', false]);
		}
	}
})

export default OC;
