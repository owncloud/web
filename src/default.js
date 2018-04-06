
import LoginDialog from './components/Login-Dialog.vue';

const $        = require("jquery");
const Vue      = require('vue');

// a few lodash methods
const isEmpty  = require('lodash/isEmpty');
const assignIn = require('lodash/assignIn');

const ocHead = new Vue({
    el : '#oc-head',
    data: {
        core: {
            theme       : 'owncloud',
            installed   : true,
            version     : null,
            instanceid  : null,
            startApp    : null,
            apps        : {
                installed : [],
                enabled   : []
            }
        },
        app: {
            name    : null,
            title   : null,
            icon    : null,
            menu    : [],
            plugins : {},
            assets  : {
                js  : null,
                css : null
            }
        }
    },
    mounted () {
        // load core package data
        this.getCoreConfig().then(()=> {
            // TODO: load all apps from config.json
            this._loadAppAssets('notifications', 'js/notifications.bundle.js');
            this.getAppConfig().then(() => {
                this._loadAppAssets(this.app.name, this.app.assets.js);
            });
        });
    },

    computed: {
        coreIsLoading() {
            return this.core.instanceid.length != null
        },

        pageTitle () {
            return `${this.core.title} &ndash; ${this.app.title}`;
        },

        appName () {
            // determine app by path
            let pathname = document.location.pathname.substr(1);

            if (pathname.length > 0)
                return pathname

            if (this.core.startApp)
                return this.core.startApp

            return null;
        }
    },

    methods: {
        getApp () {
            // determine app by path
            let pathname = document.location.pathname.substr(1);

            if (!isEmpty(pathname.length))
                return pathname

            if (this.core.startApp)
                return this.core.startApp

            return null;
        },

        // reading data from the core API
        getCoreConfig () {
            return new Promise((resolve, reject) => {
                this._readPackage('config.json').then((data) => {
                    this.core = assignIn(this.core, data);

                    OC.config = data;
                    if (!OC.config.backendUrl) {
                        OC.config.backendUrl = location.protocol + '//' + location.host + location.pathname;
                    }
                    OC.client = new OwncloudClient(OC.config.backendUrl);

                    resolve();
                }).catch(function(err) {
                    reject('can not getCoreConfig ' + err);
                });
            });
        },

        getAppConfig () {
            return new Promise((resolve, reject) => {
                this._readPackage(`apps/${this.getApp()}/package.json`).then((app) => {
                    this.app = {
                        name        : app.name,
                        title       : app.title,
                        icon        : app.icon,
                        version     : app.version,
                        author      : app.author,
                        license     : app.license,
                        description : app.description,
                        menu        : app.menu,
                        assets      : {
                            js  : app.main,
                            css : app.css
                        }
                    }
                    resolve();
                }).catch(function() {
                    reject(`failed to load /apps/${path}/package.json`);
                });
            });
        },

        _readPackage( pathToAPI ) {
            return new Promise((resolve, reject) => {
                $.getJSON(pathToAPI, (data) => {
                    resolve(data);
                }).fail(function() {
                    reject(`can't read: ${pathToAPI}`);
                });
            });
        },

        _loadAppAssets(name, bundle) {

            let $main = $('<script>', {
                "src"   : `apps/${name}/${bundle}`,
                "defer" : true
            });

            $('body').append($main);
        }
    }
});

const ocDialogs = new Vue({
	el: '#oc-dialogs',
	components: {
		LoginDialog
	},

	mounted () {
        //uncomment to test login
		//UIkit.modal('#oc-dialog-login').show();
	}
});

const OwncloudClient = require('js-owncloud-client');

// TODO: define in separate file

// global namespace
window.OC = {
	client: null
};

