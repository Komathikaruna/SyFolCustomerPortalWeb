import axios from 'axios'
import VueCookie from 'vue-cookie'
import moment from 'moment'
import momentTz from 'moment-timezone'
// import { decrypt } from '../utils/crypto'

const getUpdatedTimeZone = () => {
  const user = null
  let savedTimezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
  savedTimezone = (savedTimezone && savedTimezone !== 'undefined') ? JSON.parse(savedTimezone) : Intl.DateTimeFormat().resolvedOptions().timeZone
  moment.tz.setDefault(savedTimezone)
  return savedTimezone
}
let timezone = getUpdatedTimeZone()

const api = axios.create({
  baseURL: process.env.VUE_APP_URL,
  headers: {
    common: {
      Authorization: `Bearer ${VueCookie.get(process.env.VUE_APP_TOKEN) || VueCookie.get(process.env.VUE_APP_NAME + '_secondary_token')}`,
      'x-web-version': process.env.VUE_APP_VERSION,
      'x-timezone': timezone
    }
  }
})

const $_UtcToLocal = (date, fromFormat, toFormat) => { // eslint-disable-line camelcase
  if (!date) return null
  timezone = getUpdatedTimeZone()
  return (date) ? momentTz.utc(date, (fromFormat || 'DD.MM.YYYYTHH.mm.ss')).tz(timezone).format((toFormat || 'DD.MM.YYYYTHH.mm.ss')) : null
}

const $_recursiveUpdate = (obj, options) => { // eslint-disable-line camelcase
  if (obj && (typeof obj === 'object' && !(obj instanceof FormData))) {
    if (Array.isArray(obj) && obj.length) {
      for (const arrayItemIndex in obj) {
        obj[arrayItemIndex] = $_recursiveUpdate(obj[arrayItemIndex], options)
      }
      return obj
    } else if ((typeof obj === 'object') && Object.keys(obj).length) {
      const newobj = {}
      for (const key in obj) {
        if (obj[key] && (typeof obj[key] === 'object')) newobj[key] = $_recursiveUpdate(obj[key], options)
        else {
          if ((obj[key] && (typeof (obj[key]) === 'string'))) {
            if (options.utcToLocal) {
              if (moment(obj[key], 'DD.MM.YYYYTHH.mm.ss', true).isValid()) newobj[key] = $_UtcToLocal(obj[key]) // common datetime
              else if (moment(obj[key].replace('Z', ''), 'YYYY-MM-DDTHH:mm:ss', true).isValid()) newobj[key] = $_UtcToLocal(obj[key], 'YYYY-MM-DDTHH:mm:ss') // sharepoint datetime
              else newobj[key] = obj[key]
            } else if (options.dateToDateTime) newobj[key] = (moment(obj[key], 'DD.MM.YYYY', true).isValid()) ? moment(obj[key], 'DD.MM.YYYY').format('YYYY-MM-DDT23:59:59') : obj[key]
            else newobj[key] = obj[key].trim()
          } else newobj[key] = obj[key]
        }
      }
      return newobj
    } else return obj
  } else return obj
}

api.interceptors.response.use((res) => {
  if (res.status.toString().charAt(0) === '2' && res.data) res.data = $_recursiveUpdate(res.data, { utcToLocal: true })
  return res
})

api.interceptors.request.use((req) => {
  // let queryString = req.url.split('?')[1]
  // let result = {}
  // if (queryString) {
  //   queryString = queryString.split('&').map((item) => item.split('='))
  //   for (const item of queryString) result[item[0]] = item[1]
  // } else result = {}
  if (req.data && !req.data.template_values) req.data = $_recursiveUpdate(req.data, { dateToDateTime: true })
  return req
})

const urlSearchParams = new URLSearchParams(window.location.search)
const params = Object.fromEntries(urlSearchParams.entries())
const code = params['accessId'] || ''
const type = params['type'] || ''
let common = {}
if (code) localStorage.setItem('Bflow365_Booking_accessId', code)
if (type) localStorage.setItem('Bflow365_Booking_portalType', type)
common[localStorage.getItem('Bflow365_Booking_portalType') === 'bp' ? 'x-booking-ui-hv' : 'x-cp-auth-token'] = localStorage.getItem('Bflow365_Booking_accessId')

const bookingApi = axios.create({
  baseURL: process.env.VUE_APP_URL,
  headers: {
    common
  }
})

const checklistApi = axios.create({
  baseURL: process.env.VUE_APP_CHECKLIST_URL,
  headers: {
    common: {
      'X-AccessToken': process.env.VUE_APP_CHECKLIST_ACCESS_TOKEN,
      'x-auth-token': 'e163b8af-1fe0-4713-bddc-f68558e08f389a396082-3ff6-4d1c-a976-9a30fa68e4f83f31de55-01eb-4960-8b21-aed271289493'
    }
  }
})

// eslint-disable-next-line
const document_url = 'https://checklistapi.apphouse.no/'
// eslint-disable-next-line
export { api, checklistApi, document_url, bookingApi, getUpdatedTimeZone }
