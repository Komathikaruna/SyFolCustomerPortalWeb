// i18n-setup.js
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import cookie from 'vue-cookie'
import { decrypt } from '../utils/crypto'

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: cookie.get(process.env.VUE_APP_LOCALE) ? cookie.get(process.env.VUE_APP_LOCALE) : cookie.get(process.env.VUE_APP_LOCALE_DEFAULT),
  fallbackLocale: cookie.get(process.env.VUE_APP_LOCALE) ? cookie.get(process.env.VUE_APP_LOCALE) : cookie.get(process.env.VUE_APP_LOCALE_DEFAULT),
  silentTranslationWarn: true
})
let loadedLanguages = []
let lastLanguage = {}
function setI18nLanguage (lang = 'en') {
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}
export function loadLanguageAsync ({ lang, domain, forceUpdate } = {}) {
  if (!lang) lang = 'en'
  if (loadedLanguages.includes(lang) && !forceUpdate) {
    if (i18n.locale !== lang) setI18nLanguage(lang)
    return Promise.resolve()
  }

  if (Object.entries(lastLanguage).length && lastLanguage.constructor === Object) {
    i18n.setLocaleMessage(cookie.get(process.env.VUE_APP_LOCALE_DEFAULT || process.env.VUE_APP_LOCALE), lastLanguage)
  }

  const details = (cookie.get(process.env.VUE_APP_USER)) ? decrypt(JSON.parse(cookie.get(process.env.VUE_APP_USER))) : null
  if (!domain) domain = (details) ? details.domain : null
    console.log('in')
    return axios.get(`${process.env.VUE_APP_LOCALE_URL}processdrivecom_Default/en.json?t=${new Date().getMilliseconds()}`)
      .then(async ({ data }) => {
        i18n.setLocaleMessage(lang, data)
        if (!loadedLanguages.includes(lang)) loadedLanguages.push(lang)
        if (Object.entries(lastLanguage).length === 0 && lastLanguage.constructor === Object) lastLanguage = data
        setI18nLanguage(lang)
      })
  // if (domain) {
  // } else return Promise.resolve()
}
