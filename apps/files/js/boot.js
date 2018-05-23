define({

	 	/**
		 * allow to setup the application
		 *
		 * @return promise
		 * @param self will feed back 'this' object
		 */

	 	setup: () => {
	 		var my = self.info;
	 		var p = new Promise((resolve, defer) => {
	 			OC.registerNavItem('files', {
	 				name: 'Files',
	 				iconMaterial: 'folder',
	 				route: '/'
	 			});
				resolve( { id : 'files' } );
	 		});
	 		return p;
	 	},


		/**
		 * Start the application by mounting it to the respective DOM element
		 *
		 * @return promise
		 */

		boot: (container) => {
			var p = new Promise((resolve, defer) => {
				requirejs([OC.appJS('files', 'files.bundle')], (app) => {
					app.$mount(container);
					app.$once('mounted', resolve( { start: true } ) );
				});
			});
			return p;
		}
});
