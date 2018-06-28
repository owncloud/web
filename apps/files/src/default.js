// ------------------------------------------------------------- Vue plugins ---

import Vue       from 'vue'
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import { Drag, Drop } from 'vue-drag-drop';

Vue.component('drag', Drag);
Vue.component('drop', Drop);

import FilesApp  from './components/Files-App.vue'

// Routing
const routes = [
    {
        path: '/',
        redirect: '/list/home',
    },
    {
        path: '/list/:item',
        component: FilesApp,
        name: 'files'
    }
];

const router = new VueRouter({
    routes
});

const app = new Vue({
    router,
	template: '<router-view></router-view>',
	mounted () {
		this.$emit('mounted')
	}
});

export default define(app);
