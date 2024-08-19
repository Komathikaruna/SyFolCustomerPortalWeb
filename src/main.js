import Vue from 'vue'
// import { decrypt } from './utils/crypto'
import App from './App.vue'
import router from './router/index'
import vuetify from './plugins/vuetify'
import './registerServiceWorker'
import vueEventBus from './plugins/events'
import formatter from './plugins/formatters'
import apiServices from './plugins/apiservices'
import moment from './plugins/moment'
import axios from 'axios'
import VueCookie from 'vue-cookie'
import { replaceDotWithComma, replaceCommaWithDot, filterDate, filterDateTime, formatFizeSize, nameToAvatarLetters } from './assets/js/filters'
import constants from './mixins/constants'
import helper from './mixins/index'
import store from './store/index'
import { i18n, loadLanguageAsync } from './lang/config'

Vue.config.productionTip = false
let plugins = { formatter, VueCookie, vueEventBus, apiServices, moment }
Object.keys(plugins).forEach(key => {
  Vue.use(plugins[key])
})
let mixins = { constants, helper }
Object.keys(mixins).forEach(key => {
  Vue.mixin(mixins[key])
})
const filters = {
  dateFormat: filterDate,
  dateTimeFormat: filterDateTime,
  replaceDotWithComma,
  replaceCommaWithDot,
  formatFizeSize,
  nameToAvatarLetters
}
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

axios.defaults.baseURL = process.env.VUE_APP_URL

// const user = (VueCookie.get(process.env.VUE_APP_USER)) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
const user = null
let timezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
timezone = (timezone && timezone !== 'undefined') ? JSON.parse(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone

axios.defaults.headers.common = {
  'Authorization': `Bearer ${VueCookie.get(process.env.VUE_APP_TOKEN)}`,
  'x-timezone': timezone
}
Vue.directive('sortable', {
  inserted: function (el, binding) {
    // eslint-disable-next-line
    new Sortable(el, binding.value || {})
  }
})
// if (process.env.VUE_APP_LOGO_ICONS_FOLDER) {
//   const LOGO_FOLDER = 'logofolder'
//   const APP_MANIFEST = 'appname'
//   const iconTags = document.getElementsByClassName('app-icon')
//   const iconTagsList = [...iconTags].filter(x => x.href.includes(LOGO_FOLDER))
//   iconTagsList.forEach(x => {
//     x.href = x.href.replace(LOGO_FOLDER, process.env.VUE_APP_LOGO_ICONS_FOLDER)
//   })
//   let manifestElement = document.getElementById('app-manifest')
//   if (manifestElement.href.includes(APP_MANIFEST)) manifestElement.href = manifestElement.href.replace(APP_MANIFEST, process.env.VUE_APP_LOGO_ICONS_FOLDER)
// }

// event-bus
const eventBus = new Vue()
Vue.prototype.$eventBus = eventBus
export default eventBus
const lang = 'en'

loadLanguageAsync({ lang, domain: 'processdrivecom_Default' })
  .then(() => {
    new Vue({
      router,
      store,
      i18n,
      vuetify,
      vueEventBus,
      render: h => h(App)
    }).$mount('#app')
  })
