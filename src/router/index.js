import Vue from 'vue'
import Router from 'vue-router'
// import store from '@/store/index'
// import VueCookie from 'vue-cookie'
// import { loadLanguageAsync } from '@/lang/config'

Vue.use(Router)
// 23 to 26 - To not show the navigation duplicated issue in console
const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
const router = new Router({
  mode: 'history',
  // base: process.env.VUE_APP_ENV === 'production' || process.env.VUE_APP_ENV === 'dev' ? '/' : '/bflow/',
  routes: [{
    path: '*',
    redirect: '/login'
  }, {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Auth/Login.vue')
    // beforeEnter (from, to, next) {
    //   if (!VueCookie.get(process.env.VUE_APP_TOKEN)) {
    //     VueCookie.delete(process.env.VUE_APP_NAME + '_secondary_token')
    //     next()
    //   } else {
    //     next('/dashboard')
    //   }
    // }
  }, {
    path: '/confirmpassword',
    name: 'confirmpassword',
    component: () => import('@/views/Auth/ConfirmPassword.vue')
    // beforeEnter (from, to, next) {
    //   if (!VueCookie.get(process.env.VUE_APP_TOKEN)) {
    //     VueCookie.delete(process.env.VUE_APP_NAME + '_secondary_token')
    //     next()
    //   } else {
    //     next('/dashboard')
    //   }
    // }
  }, {
    path: '/landing',
    name: 'landing',
    component: () => import('@/views/Landing/Index.vue')
  }, {
    path: '/incident/:incidentname/:incidentid',
    name: 'incident',
    component: () => import('@/views/Incidents/Index.vue')
  }, {
    path: '/incident/action/:incidentname/:incidentid/:id',
    name: 'incident_action',
    component: () => import('@/views/Incidents/Action.vue')
  },{
    path: '/incident/create/:incidentname/:incidentid',
    name: 'incident_create',
    component: () => import('@/views/Incidents/Create.vue')
  }]
})

// router.beforeEach((to, from, next) => {
//   store.commit('isBookingPath', !!to.meta.isBookingPath)
//   const getLang = to.query.lang ? to.query.lang : VueCookie.get(process.env.VUE_APP_LOCALE) ? VueCookie.get(process.env.VUE_APP_LOCALE) : VueCookie.get(process.env.VUE_APP_LOCALE_DEFAULT)
//   loadLanguageAsync({ lang: getLang }).then(() => {
//     if (to.matched.some(record => record.meta.requiresAuth)) {
//       // eslint-disable-next-line eqeqeq
//       if (store.getters.userDetails && store.getters.userDetails._id == '-100') {
//         if (to.matched.some(record => record.meta.issuperadmin)) next()
//         else next('/tenants')
//       } else {
//         if (VueCookie.get(process.env.VUE_APP_TOKEN)) {
//           if (to.matched.some(record => record.meta.restrictedFeature)) { // Checking routes whether the restricted feature is available
//             let value = to.matched.find(record => record.meta.restrictedFeature).meta.value
//             if (store.getters.userDetails.allowedfeatures && store.getters.userDetails.allowedfeatures.length > 0) {
//               if (store.getters.userDetails.allowedfeatures.includes(value)) {
//                 if (to.matched.some(record => record.meta.adminLevel)) {
//                   store.commit('showSettingsLoader')
//                   next()
//                 } else next()
//               } else next('/notavailable')
//             } else next('/notavailable')
//           } else next()
//         } else {
//           store.dispatch('logout')
//           next({
//             path: '/login',
//             query: {
//               redirect: to.fullPath
//             }
//           })
//         }
//       }
//     } else {
//       // eslint-disable-next-line eqeqeq
//       if (store.getters.userDetails && store.getters.userDetails._id == '-100') {
//         if (to.matched.some(record => record.meta.issuperadmin)) next()
//         else next('/tenants')
//       } else next()
//     }
//   })
// })

export default router
