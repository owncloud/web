// ------------------------------------------------------------- Vue plugins ---

import Vue       from 'vue'
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import App       from './App.vue'
import FilesApp  from './components/Files-App.vue'
import SharingIn from './components/Sharing-In.vue'

// Routing
const routes = [
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

const Main = new Vue({
    router,
    el : '#oc-app-container',
    render: h => h(App)
});
