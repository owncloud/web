import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '../pages/login.vue'
import ErrorPage from '../pages/error.vue'

import store from '../store'

Vue.use(Router)

const router = new Router({
//  mode: 'history',
  routes: [{
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { auth: false, title: 'Login to existing account', hideHeadbar: true } },
  {
    path: '/error',
    name: 'error',
    component: ErrorPage,
    meta: { auth: false, title: 'Oooops something went wrong', hideHeadbar: true }
  }
  ]
})

router.beforeEach(function (to, from, next) {
  let authRequired = true
  if (to.meta.auth === false) {
    authRequired = false
  }
  if (authRequired) {
    if (store.state.auth.isAuthenticated) {
      next()
    } else {
      router.push({ name: 'login' })
    }
  } else {
    next()
  }
})

export default router
