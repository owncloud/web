const _without = require('lodash/without');

const namespaced = true

const state = {
	selected: []
}

const mutations = {
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
}

const actions = {
	addFileSelection(context, file) {
		context.commit('ADD_FILE_SELECTION', file);
	},
	removeFileSelection(context, file) {
		context.commit('REMOVE_FILE_SELECTION', file);
	},
	resetFileSelection(context) {
		context.commit('RESET_SELECTION');
	}
}

const getters = {
	selectedFiles: state => {
		if (state.selected.length === 0) {
			return false;
		} else {
			return state.selected;
		}
	}
}

export default {
	namespaced,
  state,
  actions,
  mutations,
  getters
}
