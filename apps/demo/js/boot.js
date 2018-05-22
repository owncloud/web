define({

	 /**
 	 * allow to setup the application
 	 *
 	 * @return promise
	 * @param self will feed back 'this' object
 	 */

	setup: () => {
		let p = new Promise((resolve, defer) => {
			OC.registerNavItem('demo', {
				name         : "Demonstration",
				iconMaterial : 'face',
				route        : '/'
			});
			resolve({
				id : 'demo',
				styles : [
					"css/demo.css"
				]
			});
		});
		return p;
	},

	/**
	 * Start the application by mounting it to the respective DOM element
	 *
	 * @return promise
	 */

	boot: (container) => {
		var p  = new Promise((resolve, defer) => {
			requirejs([OC.appJS('demo', 'demo.bundle')], (app) => {

				setTimeout(() => {
					app.$mount(container);
					app.$once('mounted', resolve( { start: true } ) );
				}, 5000);
			});
		});
		return p;
	}
});
