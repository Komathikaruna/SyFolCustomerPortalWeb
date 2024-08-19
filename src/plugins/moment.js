import VueCookie from 'vue-cookie'
import moment from 'moment'
import { decrypt } from '../utils/crypto'

const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
let timezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
timezone = (timezone && timezone !== 'undefined') ? JSON.parse(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone
moment.tz.setDefault(timezone)

export default {
  install (Vue) {
    Vue.prototype.$moment = moment
  }
}
