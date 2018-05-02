define({

	 /**
 	 * supply basic infos about the app
 	 */

	 info: {
		 id      : "alert",
		 name    : "Let's ring some bells",
		 author  : "Max Mustermann",
		 version : "0.2.11"
	 },


	 /**
 	 * allow to setup the application
 	 *
 	 * @return promise
	 * @param self will feed back 'this' object
 	 */

	setup: (self) => {
		var p = new Promise((resolve, defer) => {
			requirejs([OC.appJS(self.info.id, 'alert.bundle')], () => {
				resolve();
			});
		});
		return p;
	},

	boot: () => { return true }
});
