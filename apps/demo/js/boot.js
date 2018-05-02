define({

	 /**
 	 * supply basic infos about the app
 	 */

	 info: {
		 id      : "demo",
		 name    : "Demonstration",
		 author  : "Felix Heidecke",
		 version : "0.1.0"
	 },


	 /**
 	 * allow to setup the application
 	 *
 	 * @return promise
	 * @param self will feed back 'this' object
 	 */

	setup: (self) => {

		var my = self.info;
		var p = new Promise((resolve, defer) => {

			OC.registerNav(my.id, {
				name: my.name,
				iconMaterial: 'face',
				route: '/'
			});

			resolve();
		});
		return p;
	},


	/**
	 * Start the application by mounting it to the respective DOM element
	 *
	 * @return promise
	 */

	boot: (container, self) => {
		var my = self.info;
		var p = new Promise((resolve, defer) => {

			requirejs([OC.appJS(my.id, my.id + '.bundle')], (app) => {

				// mount the app
				app.$mount(container);

				// listen to 'mounted' event
				app.$once('mounted', resolve());
			});
		});
		return p;
	}
});
