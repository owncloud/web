const extend = {

	request (appId, exp) {
		let p = new Promise((resolve, defer) => {

			let returnEvent  = btoa(Math.random()).toLowerCase().substring(1, 17),
				reqApp       = OC.getAppById(appId),
				extPointName = [appId, 'request-extension', exp].join(':');

			// Is the app running?
			if (reqApp && reqApp.start) {
				this._processRequest(extPointName, returnEvent, resolve, defer);
			}

			// Wait for app:start event
			else {
				OC.$bus.on( [appId, 'start'].join(':'), () => {
					this._processRequest(extPointName, returnEvent, resolve, defer);
				});
			}
		});
		return p;
	},

	provide (myId, exp, method) {
		OC.$bus.on( [myId, 'request-extension', exp].join(':'), returnEvent => {
			method().then( (data) => {
				OC.$bus.emit(returnEvent, data);
			})
		})
	},

	_processRequest (extPointName, returnEvent, resolve, defer) {
		OC.$bus.emit(extPointName, returnEvent);
		OC.$bus.once(returnEvent, payload => {
			resolve(payload)
		});
	}
}

export default extend;
