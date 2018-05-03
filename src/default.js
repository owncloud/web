import Vue   from 'vue';
import _     from 'lodash';
import $     from 'jquery';
import UIkit from 'uikit';

OC = new Vue({
	el  : "#oc",
	name : "phoenix",
	data: {
		appPath : '/apps',

		// config settings
		config  : {},

		// models
		nav     : [],
		apps    : []
	},

	mounted () {
		// Start with loading the config
		this._loadConfig();

		this.$on('phoenix:configLoaded', () => {
			this._setupApps()
		});

		this.$on('phoenix:appsSetup', () => {
			this._bootApp(_.head(this.apps))
		});

	},

	methods: {

		/**
		 * Write apps.json to this.apps
		 *
		 * @return Promise
		 */

		_loadConfig () {
			$.getJSON('/config.json', (config) => {
				this.config = config;
				this.apps   = config.apps;
				this.$emit('phoenix:configLoaded');
			}).fail((err) => {
				if (err.status === 404) {
					UIkit.notification({
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

					this.apps[i] = _.assignIn(defaults, foo.info);

					// inject self
					foo.setup(foo).then(() => {
						if (this.apps.length === ++i) {
							this.$emit('phoenix:appsSetup')
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
					this._appSet(app.id, { 'running' : true });
					this.$emit(app.id + ':booted');
				})
			})
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

		// ---------------------------------------------------------- helper ---

		pathBootJs( app ) {

			let id = (typeof app === 'object') ? app.id : app;

			return `${this.appPath}/${id}/js/boot.js`;
		},

		getAppById( id ) {
			return _.find(this.apps, ["id", id] );
		},

		appJS( app, file ) {
			return ['/apps', app, 'js', file + '.js'].join('/');
		},


		/**
		 * Create random string
		 * will start with "c4…"
		 *
		 * @param prefix any string, number
		 * @return 16 char string
		 */

		createRandom (prefix = '') {
			// will always start with "c4…"
			return prefix + btoa(Math.random()).toLowerCase().substring(1, 17);
		},


		// ------------------------------------------------ logging, warning ---

		log ( message ) {
			console.log( message );
		},

		warn ( message ) {
			console.warn( message );
		},


		// -------------------------------------------- registration methods ---

		registerNav ( app, payload ) {
			this.nav.push(_.assign( { app }, payload ));
		},

		registerExp( app, payload) {

			if (typeof payload != 'object' && _.isEmpty( payload.name ))
				return false

			this.exp.push( _.assignIn( { app }, payload ))
		},

		// --------------------------------------------------------- GETTERS ---

		getNavItems () {
			return this.nav;
		}
	},
})

export default OC;
