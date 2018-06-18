import Vue  from "vue";
import Vuex from 'vuex';

Vue.use(Vuex);

const Store = new Vuex.Store({
	state: {
		user : {
			displayname : null,
			enabled : false
		}
	},
	mutations: {
		SET_USER (state, user) {
			state.user = user;
		}
	},
	actions : {
		SET_USER (context, user) {
			context.commit('SET_USER', user);
		}
	},
	getters: {
		USER_LOGGED_IN : state => {
			return state.user.enabled
		}
	}
});

export default Store
