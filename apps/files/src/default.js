// ------------------------------------------------------------- Vue plugins ---

import Vue       from 'vue'
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import FilesApp  from './components/Files-App.vue'
import SharingIn from './components/Sharing-In.vue'

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
    },
    {
        path: '/sharing/in',
        component: SharingIn,
        name: 'sharing'
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
