const extend = {

	request (appId, exp) {
		let p = new Promise((resolve, defer) => {
			let returnEvent = btoa(Math.random()).toLowerCase().substring(1, 17);
			OC.$bus.on( [appId, 'start'].join(':'), () => {
				OC.$bus.emit( [appId, 'request-extension', exp].join(':'), returnEvent);
				OC.$bus.once(returnEvent, payload => {
					resolve(payload)
				})
			});
		});

		return p;
	},

	provide (myId, exp, method) {
		OC.$bus.on( [myId, 'request-extension', exp].join(':'), returnEvent => {
			method().then( (data) => {
				OC.$bus.emit(returnEvent, data);
			})
		})
	}
}

export default extend;
