const _without = require('lodash/without');

export default {
	namespaced: true,
	state: {
		selected: []
	},
	mutations: {
		ADD_FILE_SELECTION(state, file) {
			state.selected.push(file);
		},
		REMOVE_FILE_SELECTION(state, file) {
			if (state.selected.length > 1) {
				state.selected = _without(state.selected, file);
				return;
			}

			state.selected = [];
		},
		RESET_SELECTION(state) {
			state.selected = [];
		}
	},
	actions: {
		ADD_FILE_SELECTION(context, file) {
			context.commit('ADD_FILE_SELECTION', file);
		},
		REMOVE_FILE_SELECTION(context, file) {
			context.commit('REMOVE_FILE_SELECTION', file);
		},
		RESET_SELECTION(context) {
			context.commit('RESET_SELECTION');
		}
	},
	getters: {
		SELECTED: state => {
			if (state.selected.length === 0) {
				return false;
			} else {
				return state.selected;
			}
		}
	}
};
