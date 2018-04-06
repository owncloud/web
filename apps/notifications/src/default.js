import Vue from 'vue';

import Notifications from './App.vue';
import store from './Store.js';

const NotificationsVue = new Vue({
	store,
	el: '#notifications',
	render: h => h(Notifications),
});

