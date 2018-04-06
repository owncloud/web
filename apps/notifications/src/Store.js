import Vue from "vue";
import Vuex from "vuex";
import _ from "lodash";
import $ from "jquery";

Vue.use(Vuex);

const state = {
	notifications: {
 		records: {}
	}
};

// Retrieve computed values from state.
const getters = {
	notifications (state) {
		return state.notifications.records;
	},
	number_of_notifications (state) {
		return _.size(state.notifications.records);
	}
};

// Manipulate from the current state.
const mutations = {

	LOADING_NOTIFICATIONS (state) {
		_.extend(state["notifications"], {
			loading: true,
			failed: false,
		})
	},

	FAILED_NOTIFICATIONS (state) {
		_.extend(state["notifications"], {
			loading: false,
			failed: true,
		})
	},

	FINISH_NOTIFICATIONS (state) {
		_.extend(state["notifications"], {
			loading: false,
			failed: false
		})
	},

	ADD_NOTIFICATION (state, notification) {
		state.notifications.records.push(notification);
	},

	UPDATE_NOTIFICATIONS (state, notifications) {
		notifications.forEach(function(obj) {
			Vue.set(state.notifications.records, obj.notification_id, obj);
			//state.notifications.records['not-' + obj.notification_id] = obj;
		});
	}
};

// Request content from the remote API.
const actions = {

	FETCH_NOTIFICATIONS (context) {
		context.commit("LOADING_NOTIFICATIONS")

		OC.client.helpers._makeOCSrequest('GET', 'apps/notifications/api/v1', 'notifications?format=json')
			.then(data => {
		 	context.commit("UPDATE_NOTIFICATIONS", data.data.ocs.data);
		 	context.commit("FINISH_NOTIFICATIONS")
		}).catch(error => {
			console.log(error);
		 	context.commit("FAILED_NOTIFICATIONS")
		});

		// $.getJSON('apps/notifications/data1.json', (data) => {
		// 	context.commit("ADD_NOTIFICATION", data.ocs.data[0]);
		// 	context.commit("FINISH_NOTIFICATIONS")
		// }).fail(function() {
		// 	context.commit("FAILED_NOTIFICATIONS")
		// });
	}
};

export default new Vuex.Store({
	state,
	getters,
	mutations,
	actions
})
