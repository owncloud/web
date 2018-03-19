import $   from "jquery";
import _   from "lodash";
import Vue from "vue";

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
                js  : [],
                css : []
            }
        }
    },
    mounted () {
        // load core package data
        this.getCoreConfig().then(()=> {

            this.getAppConfig();

        });
    },

    computed: {
        coreIsLoading() {
            return this.core.instanceid.length != null
        },

        pageTitle () {
            return `${this.core.title} &ndash; ${this.app.title}`;
        },

        appFromPath () {
            let pathname = document.location.pathname.substr(1);
            return (_.isEmpty(pathname)) ? false : pathname;
        }
    },

    methods: {

        // reading data from the core API
        getCoreConfig () {
            return new Promise((resolve, reject) => {
                this._readPackage('https://next.json-generator.com/api/json/get/V1nS9lcYV').then((data) => {
                    this.core = {
                        theme      : data.theme,
                        installed  : data.installed,
                        version    : data.version,
                        instanceid : data.instanceid,
                        apps       : data.apps
                    }
                    resolve();
                }).catch(function() {
                    reject();
                });
            });
        },

        getAppConfig () {
            return new Promise((resolve, reject) => {
                let path = this.appFromPath;
                if (!path)
                    path = this.core.startApp;

                this._readPackage(`/apps/${path}/package.json`).then((app) => {
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
                            js  : [app.main],
                            css : []
                        }
                    }
                    resolve();
                }).catch(function() {
                    reject(`failed to load /apps/${path}/package.json`);
                });
            });
        },

        appToLoad () {
        },

        _readPackage( pathToAPI ) {
            return new Promise((resolve, reject) => {
                $.getJSON(pathToAPI, (data) => {
                    resolve(data);
                }).fail(function() {
                    reject(`can't read: ${pathToAPI}`);
                });
            });
        }
    }
});
