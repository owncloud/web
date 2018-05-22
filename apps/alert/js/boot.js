define({

	 /**
 	 * allow to setup the application
 	 *
 	 * @return promise
	 * @param self will feed back 'this' object
 	 */

	setup: () => {
		var p = new Promise((r, d) => {
			requirejs([OC.appJS('alert', 'alert.bundle')], () => {
				r({
					id: 'alert',
					start : true
				});
			});
		});
		return p;
	},

	boot: () => { return false }
});
