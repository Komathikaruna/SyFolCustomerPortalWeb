import moment from 'moment'
import VueCookie from 'vue-cookie'
import { decrypt } from '../../utils/crypto'

// const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
// let dateformat = user.dateformat

const updateTimeZone = () => {
  const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
  let timezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
  timezone = (timezone && timezone !== 'undefined') ? JSON.parse(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone
  moment.tz.setDefault(timezone)
}

updateTimeZone()

const replaceDotWithComma = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return parseFloat(value).toFixed(2).toString().replace('.', ',')
}
const replaceCommaWithDot = (value) => {
  if (!value) return ''
  return value.toString().replace(',', '.')
}
const filterDate = (date) => {
  if (!date) return null
  return moment(date, 'DD.MM.YYYY').isValid() ? moment(date, 'DD.MM.YYYY').format('DD.MM.YYYY') : null
  // return moment(date, dateformat).isValid() ? moment(date, dateformat).format(dateformat) : null
}
const filterDateTime = (date) => {
  if (!date) return null
  return moment(date, 'DD.MM.YYYY HH:mm:ss').isValid() ? moment(date, 'DD.MM.YYYY HH:mm:ss').format('DD.MM.YYYY HH:mm:ss') : null
  // return moment(date, `${dateformat} HH:mm:ss`).isValid() ? moment(date, `${dateformat} HH:mm:ss`).format(`${dateformat} HH:mm:ss`) : null
}

const formatFizeSize = (bytes) => {
  if (bytes === 0) return ''
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
const nameToAvatarLetters = (name = '') => {
  return name.toString().match(/(\b\S)?/g).join('').match(/(^\S|\S$)?/g).join('').toUpperCase()
}

export { replaceDotWithComma, replaceCommaWithDot, filterDate, filterDateTime, updateTimeZone, formatFizeSize, nameToAvatarLetters }
