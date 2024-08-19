/* eslint-disable */
import { LOGIN, LOGOUT, LOGININTIALSETUP, APPLANGUAGES } from './actionsTypes'
import { SET_AUTH, RESET_AUTH, XSETSETUPTOKEN, SET_LOGO, SET_SYSTEM_CONFIG, SET_TENANT_CONFIG, SET_PROFILE_IMAGE, SET_TWILIO_ENABLED, SET_USER_DETAILS } from './mutationsTypes'
import cookie from 'vue-cookie'
import { api } from '../plugins/axios_settings'
import { encrypt } from '../utils/crypto'

const state = {
  isAuthenticated: false,
  showLoader: false,
  authToken: '',
  userDetails: {},
  listOfAppLanguages: [],
  logRocket: {}
}
const getters = {
  userDetails (stateObj) {
    return stateObj.userDetails
  },
  getuserDetails (stateObj) {
    return stateObj.userDetails
  },
  isAuthenticated (stateObj) {
    return stateObj.isAuthenticated
  },
  systemDetails ({ userDetails }) {
    return {
      logo: '',
      themecolor: userDetails && userDetails.systemconfig && userDetails.systemconfig.themecolor ? userDetails.systemconfig.themecolor : '#1976d2',
      textcolor: userDetails && userDetails.systemconfig && userDetails.systemconfig.textcolor ? userDetails.systemconfig.textcolor : '#FFFFFF',
      isenabledtwilio: !!userDetails.isenabledtwilio
    }
  },
  languages () {
    return state.listOfAppLanguages
  }
}
const actions = {
  [LOGIN] (context, model) {
    var date = new Date()
    date.setDate(date.getDate() + 4)
    cookie.set(process.env.VUE_APP_TOKEN, model.token, { expires: date })
    cookie.set(process.env.VUE_APP_LOCALE_DEFAULT, 'en')
    cookie.set(process.env.VUE_APP_USER, JSON.stringify(encrypt({name: 'Komathi', domain: 'processdrivecom_Default'})), { expires: date })
    // cookie.set(process.env.VUE_APP_LOCALE_DEFAULT, data.languagecode || 'en')
    // cookie.delete(process.env.VUE_APP_NAME + '_secondary_token')
    api.defaults.headers.common['Authorization'] = `Bearer ${model.token}`
    api.defaults.headers.common['x-timezone'] = (model && model.timezone) ? model.timezone : 'Europe/Berlin'
    api.defaults.headers.common['x-app-lang'] = model.languagecode || 'en'
  },
  async [LOGININTIALSETUP] (context, model) {
    var date = new Date()
    date.setDate(date.getDate() + 4)
    let user = {
      _id: model._id,
      name: model.name,
      tenantname: model.tenantname,
      tenantcreatedby: model.tenantcreatedby,
      tenantid: model.tenantid,
      companyname: model.companyname,
      whocanaccess: model.whocanaccess,
      isadmin: model.isadmin,
      email: model.email,
      username: model.email,
      departmentid: model.departmentid,
      userimage: model.userimage,
      groups: model.groups,
      domain: model.domain,
      customerdomain: model.customerdomain,
      systemconfig: model.systemconfig,
      integrations: model.integrations,
      allowedfeatures: model.allowedfeatures,
      iscontentadmin: model.iscontentadmin,
      issharepointuser: model.issharepointuser,
      tenants: model.tenants,
      sharepointconfigdone: model.sharepointconfigdone,
      landingpageafterlogin: model.landingpageafterlogin,
      languagecode: model.languagecode,
      issuperadmin: model.issuperadmin,
      isenabledtwilio: model.isenabledtwilio,
      userpagination: model.userpagination,
      isdomainadmin: model.isdomainadmin,
      issharepointstorage: model.issharepointstorage,
      dateformat: model.dateformat || 'DD.MM.YYYY'
    }
    cookie.set(process.env.VUE_APP_TOKEN, model.token, { expires: date })
    cookie.set(process.env.VUE_APP_USER, JSON.stringify(encrypt(user)), { expires: date })
    cookie.set(process.env.VUE_APP_LOCALE_DEFAULT, model.languagecode || 'en')
    cookie.delete(process.env.VUE_APP_NAME + '_secondary_token')
    localStorage.setItem((`${process.env.VUE_APP_NAME}_${model.tenantname}_tz`), JSON.stringify(model.timezone))
    api.defaults.headers.common['Authorization'] = `Bearer ${model.token}`
    api.defaults.headers.common['x-app-lang'] = model.languagecode || 'en'
    api.defaults.headers.common['x-timezone'] = model.timezone
    context.commit(SET_AUTH, { authToken: model.token, user })
  },
  [LOGOUT] ({ commit, state }) {
    localStorage.removeItem(`${process.env.VUE_APP_NAME}_globalsearchterm`)
    localStorage.removeItem(`${process.env.VUE_APP_NAME}_kanbanview_preselect_group`)
    localStorage.removeItem(`${process.env.VUE_APP_NAME}_${state.userDetails.tenantname}_filtersHistory`)
    // localStorage.removeItem(`${process.env.VUE_APP_NAME}_filtersHistory`)
    // localStorage.removeItem(`${process.env.VUE_APP_NAME}_systemNotification`)
    cookie.delete(process.env.VUE_APP_TOKEN)
    cookie.delete(process.env.VUE_APP_USER)
    cookie.delete(process.env.VUE_APP_LOCALE_DEFAULT)
    cookie.delete(process.env.VUE_APP_LOCALE)
    commit(RESET_AUTH)
  },
  [APPLANGUAGES] ({ commit, state }) {
    return new Promise((resolve, reject) => {
      api.get(`languages/get_by_domain?domain=${state.userDetails.domain}`)
        .then(async ({ data }) => {
          state.listOfAppLanguages = []
          await data.forEach(element => {
            if (element.isactive) state.listOfAppLanguages.push({ title: element.name, code: element.code, click: element.code })
          })
          resolve(data)
        })
        .catch((err) => reject(err))
    })
  }
}

const mutations = {
  [SET_AUTH] (stateObj, user) {
    stateObj.isAuthenticated = true
    stateObj.authToken = user.authToken
    stateObj.userDetails = user.user
  },
  [RESET_AUTH] (stateObj) {
    stateObj.isAuthenticated = false
    stateObj.userDetails = {}
  },
  [XSETSETUPTOKEN] (stateObj, token) {
    api.defaults.headers.common['x-setup-user-token'] = token
  },
  [SET_LOGO] (stateObj, systemLogo) {
    stateObj.userDetails.systemconfig.systemlog = null
    stateObj.userDetails.systemconfig.systemlogo = systemLogo
  },
  [SET_SYSTEM_CONFIG] (stateObj, systemConfiguration) {
    stateObj.userDetails.systemconfig = systemConfiguration
  },
  [SET_TENANT_CONFIG] (stateObj, tenantConfiguration) {
    let tenant = tenantConfiguration
    tenant['tenantname'] = tenantConfiguration.name
    tenant['whocanaccess'] = tenantConfiguration.whocanaccess
    tenant['allowedfeatures'] = tenantConfiguration.allowedfeatures
    tenant['tenantcreatedby'] = tenantConfiguration.createdby
    let { tenantname, whocanaccess, allowedfeatures, tenantcreatedby } = tenant
    if (tenantname) stateObj.userDetails.tenantname = tenantname
    if (whocanaccess) stateObj.userDetails.whocanaccess = whocanaccess
    if (tenantcreatedby) stateObj.tenantcreatedby = tenantcreatedby
    if (allowedfeatures) {
      let features = []
      allowedfeatures.forEach((tenantFeatures) => {
        features.push(tenantFeatures.id)
      })
      stateObj.userDetails.allowedfeatures = features
    }
  },
  [SET_PROFILE_IMAGE] (stateObj, profileImage) {
    stateObj.userDetails.userimage = profileImage
  },
  [SET_TWILIO_ENABLED] ({ userDetails }, value) {
    userDetails.isenabledtwilio = value
  },
  [SET_USER_DETAILS] (stateObj, payload) {
    stateObj.userDetails = payload
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
