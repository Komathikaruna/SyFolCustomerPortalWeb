/* eslint-disable */
import { PAGINATION, DELETE_HANDLER, DELETE_SINGLE_RECORD_HANDLER, USERS, MODULE_LIST, SHAREPPOINT_LIST, WORKTYPES, RELOAD_NEW_CONTENT, GET_RUNNING, CHECKLIST_FORMS, USER_GROUPS,
  TIMER_FORM_SETTINGS, TIMECODES, TIMTER_SETTINGS, ABSENCETYPES, FETCH_INTEGRATIONS, SYSTEM_NOTIFICATION, UPDATE_USER_RESOURCEPLANNER_STATUS } from './actionsTypes'
import {
  SET_PAGINATION, SET_LISTVALUES, SHOW_DELETE_DIALOG, HIDE_DIALOG, SHOW_LOADER, HIDE_LOADER, MINIMIZEDMODAL, UPDATEMINIMIZEDMODAL, REMEMBER_LIST, SHAREPPOINT_FIELDS,
  SET_TIMER_VALUE, CLEAR_TIMER_VALUE, SET_TIMEROBJ, SITE_NEW_CONTENT, SHOW_SETTINGS_LOADER, HIDE_SETTINGS_LOADER, WARNING_CONTENT_SET, FILTERS_HISTORY_SET,
  SHAREPOINT_CONFIG_NOT_DONE, MULTIPLE_TENANTS, STOP_ROUTE_LOADER, START_ROUTE_LOADER, SHAREPOINT_CONFIG_NOT_DONE_HIDE, IS_BOOKING_PATH, SET_TENANT_PROFILE, SET_BOOKING_OBJ_FROM_ACCT, SET_SYSTEM_NOTIFICATION } from './mutationsTypes'
import { checklistApi, api } from '../plugins/axios_settings'
import { setTimeout } from 'core-js'
// import VueCookie from 'vue-cookie'
// import { decrypt } from '../utils/crypto'

const state = {
  isBookingPath: false,
  showDialog: false,
  deletePayload: {},
  showLoader: false,
  supportList: {},
  rememberOrder: {},
  isAdmin: false,
  FORM_TYPE: {
    TEXT: 'text',
    TEXTAREA: 'textarea',
    CHECKBOX: 'checkbox',
    TICKBOX: 'tickbox',
    RADIO: 'radio',
    SELECT: 'select',
    DATE: 'date',
    TIMEPICKER: 'timepicker',
    DIVIDER: 'divider',
    AUTO_COMPLETE: 'auto_complete',
    AUTO_COMPLETE_LIVE: 'auto_complete_live',
    AWB_AUTO_COMPLETE: 'auto_complete_search',
    COMBOBOX: 'combobox',
    PASSWORD: 'password',
    NUMBER: 'number',
    DATEPICKER: 'datepicker',
    QUICKADD: 'quickadd',
    FILES: 'files',
    ALERT: 'alert',
    COLORPICKER: 'color',
    BUTTON: 'btn',
    BTNDROPDOWN: 'btnDropdown',
    HEADING: 'heading',
    FOOTERINFORMATION: 'footerinfo',
    DATE_TIME_PICKER: 'datetime',
    HTMLFIELD: 'htmlfield',
    REWARDS: 'rewards',
    ATTACHMENT: 'attachment'
  },
  // List Pages
  USER_INDEX: {},
  CRM_INDEX: {},
  TENANTINDEX: {},
  COMMON_INDEX: {},
  TICKETSTATUS_INDEX: {},
  DOCUMENT_TEMPLATE_INDEX: {},
  TICKETTYPE_INDEX: {},
  PRIORITIES_INDEX: {},
  MAIL_CONFIG_INDEX: {},
  TICKETS_INDEX: {},
  ACCOUNT_TICKETS: {},
  PROJECT_ROLES_INDEX: {},
  LANGUAGES_INDEX: {},
  WEBHOOK_SUBSCRIPTIONS_INDEX: {},
  MODULES_INDEX: {},
  PROPS_INDEX: {},
  FORM_PROPS_INDEX: {},
  TIME_CODE_INDEX: {},
  TIMERANGE_INDEX: {},
  ABSENCETYPE_INDEX: {},
  MAILADDRESSFILTER_INDEX: {},
  WORKFLOW_INDEX: {},
  EVENTS_INDEX: {},
  TRIGGERS_INDEX: {},
  NOTIFICATIONS_INDEX: {},
  // Admin Portal
  ADMIN_PAGINATION_INDEX: {},
  // Filters
  F_TICKETS: {},
  F_ACCOUNT_TICKETS: {},
  // Common Lists
  listOfUsers: [],
  listOfModules: [],
  quickAddModules: [],
  bookableModules: [],
  listOfWorktypes: [],
  listOfAbsencetypes: [],
  // Modal minimize
  listOfMinimizedModal: [],
  sharepointFieldList: [],
  loadRouter: false,
  sharepointProperties: [],
  sharepointDynamicFields: [],
  // Stamp timer
  isTimerRunning: false,
  currentRunningTime: '',
  timerObj: {},
  // service worker
  isNewContentAvaliable: false,
  activeSW: {},
  listOfChecklistForms: [],
  listOfAccounts: [],
  listOfUserGroups: [],
  showPageLoader: false,
  crmWarningObj: null, // { title: String, type: String (error-warning), content: String, backLink: String (Proper Link with /)}
  timerFormSettingObj: {},
  timerSettingObj: {},
  integrationObj: {},
  listOfTimeCodes: [],
  listOfFiltersHistory: [],
  multipleTenant: [],
  hasMultipleTenant: false,
  showSharepointNotDoneDialog: false,
  tenantProfileObj: {},
  bookingObjAcct: {},
  listOfChecklistTemplates: [],
  listofSystemNotification: [],
  customerObj: {},
  listOfTenantsAndWorkspaces: []
}

const getters = {
  formType (stateObj) {
    return stateObj.FORM_TYPE
  },
  listOfTenantsAndWorkspaces (stateObj) {
    return stateObj.listOfTenantsAndWorkspaces
  },
  showDialog (stateObj) {
    return stateObj.showDialog
  },
  deletePayload (stateObj) {
    return stateObj.deletePayload
  },
  getUsers (stateObj) {
    return stateObj.listOfUsers
  },
  timerData (stateObj) {
    return { isTimeRunning: stateObj.isTimerRunning, runningTime: stateObj.currentRunningTime }
  },
  getWorktypes (stateObj) {
    return stateObj.listOfWorktypes
  },
  getAbsenceTypes (stateObj) {
    return stateObj.listOfAbsencetypes
  },
  showLoader (stateObj) {
    return stateObj.showLoader
  },
  listOfMinimizedModal (stateObj) {
    return stateObj.listOfMinimizedModal
  },
  listOfModules (stateObj) {
    return stateObj.listOfModules
  },
  listOfQuickaddModules (stateObj) {
    return stateObj.quickAddModules
  },
  listOfFields (stateObj) {
    return stateObj.sharepointFieldList
  },
  loadRouter (stateObj) {
    return stateObj.loadRouter
  },
  listOfProperties (stateObj) {
    return stateObj.sharepointProperties
  },
  getTimerObj (stateObj) {
    return stateObj.timerObj
  },
  getNewContentAvailable (stateObj) {
    return stateObj.isNewContentAvaliable
  },
  getAccountList (stateObj) {
    return stateObj.listOfAccounts
  },
  getUserGroups (stateObj) {
    return stateObj.listOfUserGroups
  },
  getPageLoader (stateObj) {
    return stateObj.showPageLoader
  },
  getWarningPageData (stateObj) {
    return stateObj.crmWarningObj
  },
  getTimerFormSettings (stateObj) {
    return stateObj.timerFormSettingObj
  },
  getTimeCodes (stateObj) {
    return stateObj.listOfTimeCodes
  },
  getTimerSettings (stateObj) {
    return stateObj.timerSettingObj
  },
  getIntegrations (stateObj) {
    return stateObj.integrationObj
  },
  getListOfFiltersHistory (stateObj) {
    return stateObj.listOfFiltersHistory
  },
  getTenantProfileObj (stateObj) {
    return stateObj.tenantProfileObj
  },
  showSharepointNotDoneDialog (stateObj) {
    return stateObj.showSharepointNotDoneDialog
  },
  getIsAdmin (stateObj) {
    return stateObj.isAdmin
  },
  getBookableModules (stateObj) {
    return stateObj.bookableModules
  },
  isBookingPath (stateObj) {
    return stateObj.isBookingPath
  },
  getBookingObj (stateObj) {
    return stateObj.bookingObjAcct
  },
  listofSystemNotification (stateObj) {
    return stateObj.listofSystemNotification
  },
  listOfGroupsAndUsers (stateObj) {
    return [...stateObj.listOfUserGroups, ...stateObj.listOfUsers]
  }
}

const actions = {
  [PAGINATION] (context, paginationObj) {
    context.commit(SET_PAGINATION, paginationObj)
  },
  [USERS] ({ commit }) {
    return new Promise((resolve) => {
      let model = [{
        $match: { $and: [{ IsActive: true }, { Deleted: false }] }
      }]
      // let currentUser = {}
      api.post('incidentcustomerportal/users/query', model)
        .then((response) => {
          response.data.forEach(element => {
            element.name = element.lastname ? `${element.firstname} ${element.lastname}` : `${element.firstname}`
            element.alternateid = JSON.parse(JSON.stringify(`user_${element._id}`))
            element.isUser = true
            // element.username = element.email
            // if (element._id === rootState.auth.userDetails._id) currentUser = element
          })
          response.data.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()))
          // let index = response.data.indexOf(currentUser)
          // response.data.splice(index, 1)
          // response.data.unshift(currentUser)
          let userModel = { type: 'listOfUsers', data: response.data }
          commit(SET_LISTVALUES, userModel)
          resolve()
        })
    })
  },
  [USER_GROUPS] ({ commit }) {
    return new Promise((resolve) => {
      const model = [{
        $project: { Name: 1, Description: 1, Is_Administrative_Level: 1, Is_Default: 1 }
      }]
      api.post('usergroups/query', model)
        .then((response) => {
          response.data.forEach(group => {
            group.alternateid = JSON.parse(JSON.stringify(`group_${group._id}`))
          })
          let userGroupModel = { type: 'listOfUserGroups', data: response.data }
          commit(SET_LISTVALUES, userGroupModel)
          resolve()
        })
    })
  },
  [FETCH_INTEGRATIONS] ({ commit }) {
    return new Promise((resolve) => {
      api.get('integrations')
        .then((response) => {
          let model = { type: 'integrationObj', data: response.data && response.data.length > 0 ? response.data[0] : {} }
          commit(SET_LISTVALUES, model)
          resolve()
        })
    })
  },
  [TIMTER_SETTINGS] ({ commit }) {
    return new Promise((resolve) => {
      api.get('timersettings')
        .then((response) => {
          let model = { type: 'timerSettingObj', data: response.data }
          commit(SET_LISTVALUES, model)
          resolve()
        })
    })
  },
  [DELETE_HANDLER] ({ commit }, model) {
    return new Promise((resolve, reject) => {
      if (model.ids && model.ids.length) {
        let modelObj = { data: { ids: model.ids } }
        const deleteAPI = model.fromCheckList ? checklistApi : api
        if (model.isSoftDelete) {
          api.post(model.url, { ids: model.ids }).then(() => {
            resolve()
          }).catch((error) => {
            reject(error)
          })
        } else {
          deleteAPI.delete(model.url, modelObj).then(() => {
            resolve()
          }).catch((error) => {
            reject(error)
          })
        }
      } else if (model.hasOnlyUrl) {
        const deleteAPI = model.fromCheckList ? checklistApi : api
        deleteAPI.delete(model.url).then(() => {
          resolve()
        }).catch((error) => {
          reject(error)
        })
      }
    })
  },
  [DELETE_SINGLE_RECORD_HANDLER] ({ commit }, model) {
    return new Promise((resolve, reject) => {
      let modelObj = { data: { moduleid: model.moduleid, recordid: model.recordid } }
      api.delete(model.url, model.moduleid ? modelObj : undefined)
        .then(() => {
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  async [MODULE_LIST] ({ commit }) {
    return new Promise((resolve, reject) => {
      let query = [{
        $sort: { Menu_Order: 1 }
      }]
      api.post('modules/query', query)
        .then((response) => {
          let userDetails = this.state.auth.userDetails
          let hasSaleAccess = userDetails.allowedfeatures && userDetails.allowedfeatures.length > 0 && userDetails.allowedfeatures.includes(5) // 5 -SALES AND MARKETING
          let groupsList = userDetails.groups
          if (groupsList && groupsList.length > 0) {
            // To  check whether user the is in admin level
            groupsList.forEach(group => {
              let result = this.state.common.listOfUserGroups.find(x => x._id === group)
              if (result) this.state.common.isAdmin = !!result.is_administrative_level
            })
          }
          response.data.forEach(module => {
            module.hasManagePermission = false
            module.hasPermission = false
            module.to = `/module/${module.name}/${module._id}`
            // console.log(JSON.parse(JSON.stringify(module)))
            module.submodule = module.submodules || []
            module = defineSubmoduleColumns(module, response.data)
            // Permission handling
            if (this.state.auth.userDetails.isadmin || this.state.auth.userDetails.iscontentadmin) {
              module.hasPermission = true
              this.state.common.isAdmin = true
              module.hasManagePermission = true
            } else {
              if (module && module.permissions && !module.permissions.length) module.hasPermission = true
              else if (module && module.permissions && module.permissions.length && groupsList) {
                module.hasPermission = module.accesscontrol.view
              }
            }
          })
          if (!hasSaleAccess) response.data = response.data.filter(x => x.name !== 'Sale') // Checking Allowed feature
          let data = JSON.parse(JSON.stringify(response.data))
          data = data.filter(x => x.hasPermission)
          let quickAddModules = response.data.filter(x => x.hasManagePermission && !x.showonlyassubmodule && x.isactive)
          // quickAddModules.forEach(module => {
          //   if (module.name === 'Sale' && hasSaleAccess) element.to = `/module/${element.name}/${element._id}`
          // })
          let bookableModulesList = data.filter(x => x.isbookable)
          let model = { type: 'listOfModules', data: data }
          let modules = { type: 'quickAddModules', data: quickAddModules }
          let bookableModules = { type: 'bookableModules', data: bookableModulesList }
          commit(SET_LISTVALUES, model)
          commit(SET_LISTVALUES, modules)
          commit(SET_LISTVALUES, bookableModules)
          resolve(data)
        }).catch((error) => {
          reject(error)
        })
    })
  },
  async [SHAREPPOINT_LIST] ({ commit }) {
    return new Promise((resolve, reject) => {
      api.get(`sharepoint/get_fields`)
        .then(({ data }) => {
          const model = (data && data.length) ? data.filter((field) => !(['Author', 'Editor'].includes(field.name))) : []
          commit(SHAREPPOINT_FIELDS, model)
          resolve()
        }).catch((err) => {
          reject(err)
          state.loadRouter = false
        })
    })
  },
  [WORKTYPES] ({ commit }) {
    return new Promise((resolve, reject) => {
      let query = [{ $match: { IsActive: true } }]
      api.get('worktypes', query)
        .then((response) => {
          let model = { type: 'listOfWorktypes', data: response.data }
          commit(SET_LISTVALUES, model)
          resolve()
        }).catch((error) => {
          reject(error)
        })
    })
  },
  [ABSENCETYPES] ({ commit }) {
    return new Promise((resolve, reject) => {
      let query = [{ $match: { IsActive: true } }]
      api.get('absencetypes', query)
        .then((response) => {
          let model = { type: 'listOfAbsencetypes', data: response.data }
          commit(SET_LISTVALUES, model)
          resolve()
        }).catch((error) => {
          reject(error)
        })
    })
  },
  [GET_RUNNING] ({ commit }, userId) {
    return new Promise((resolve, reject) => {
      const query = [{
        $match: { $and: [{ UserId: `${userId}` }, { Stopped_At: null }] }
      }, {
        $lookup: {
          let: { customerId: '$CustomerId' },
          from: 'Account',
          pipeline: [{
            $match: {
              $expr: { $eq: ['$_id', {
                $convert: {
                  input: '$$customerId',
                  to: 'objectId',
                  onError: { error: true },
                  onNull: { isnull: true }
                }
              }] }
            }
          }, {
            $project: { _id: 1, 'Data.name': 1 }
          }],
          as: 'customer_info'
        }
      }, {
        $lookup: {
          let: { projectId: '$ProjectId' },
          from: 'Project',
          pipeline: [{
            $match: {
              $expr: { $eq: ['$_id', {
                $convert: {
                  input: '$$projectId',
                  to: 'objectId',
                  onError: { error: true },
                  onNull: { isnull: true }
                }
              }] }
            }
          }, {
            $project: { _id: 1, 'Data.name': 1, 'Data.number': 1 }
          }],
          as: 'project_info'
        }
      }]
      api.post('stamptimes/query', query)
        .then(({ data }) => {
          if (data && data.length) {
            let model = data[0]
            if (model && model.start_at) {
              const getModel = { time: model.start_at, ...model }
              resolve(getModel)
            }
          } else resolve()
        }).catch(reject)
    })
  },
  [CHECKLIST_FORMS] ({ commit }, module) {
    return new Promise((resolve, reject) => {
      let query = [ { $match: { Is_Active: true } } ]
      checklistApi.post('forms/query', query)
        .then((response) => {
          let model = { type: 'listOfChecklistForms', data: response.data }
          commit(SET_LISTVALUES, model)
          resolve()
        })
    })
  },
  // [ACCOUNTS_LIST] ({ commit }, module) {
  //   return new Promise((resolve, reject) => {
  //     api.get('moduledata/Account/search')
  //       .then((response) => {
  //         let model = { type: 'listOfAccounts', data: response.data }
  //         commit(SET_LISTVALUES, model)
  //         resolve()
  //       })
  //   })
  // },
  [RELOAD_NEW_CONTENT] ({ state, commit }) {
    if (state.activeSW && state.activeSW.waiting) {
      state.activeSW.waiting.postMessage({ action: 'skipWaiting' })
      commit(RELOAD_NEW_CONTENT)
    }
  },
  /* Get TimerFormSettings */
  [TIMER_FORM_SETTINGS] ({ commit }) {
    return api.get('timerformsettings').then(response => {
      if (response && response.data) {
        let model = { type: 'timerFormSettingObj', data: response.data }
        commit(SET_LISTVALUES, model)
      }
    })
  },
  /* Get Timecodes */
  [TIMECODES] ({ commit }) {
    return new Promise((resolve, reject) => {
      let model = [{
        $match: { IsActive: true }
      }]
      api.post('timecodes/query', model)
        .then((response) => {
          let timeCodeModel = { type: 'listOfTimeCodes', data: response.data }
          commit(SET_LISTVALUES, timeCodeModel)
          resolve()
        })
    })
  },
  [SYSTEM_NOTIFICATION] ({ commit }) {
    return new Promise((resolve, reject) => {
      api.get(`systemnotification`).then(async response => {
        if (response && response.data) {
          window.localStorage.setItem(`${process.env.VUE_APP_NAME}_systemNotification`, JSON.stringify(response.data))
          await resolve(response.data)
          let listofSystemNotification = { type: 'listofSystemNotification', data: response.data }
          commit(SET_SYSTEM_NOTIFICATION, listofSystemNotification)
        }
      }).catch((err) => reject(err))
    })
  }
}
const mutations = {
  [SET_PAGINATION] (stateObj, paginationObj) {
    stateObj[paginationObj.type] = paginationObj.data
  },
  [SET_LISTVALUES] (stateObj, obj) {
    stateObj[obj.type] = obj.data
  },
  [SHAREPPOINT_FIELDS] (stateObj, obj) {
    stateObj.loadRouter = false
    stateObj.sharepointFieldList = obj
  },
  [REMEMBER_LIST]: (stateObj, pagination) => {
    stateObj[pagination.type] = pagination.data
  },
  [SHOW_DELETE_DIALOG]: (stateObj, data) => {
    stateObj.deletePayload = data
    stateObj.showDialog = true
  },
  [HIDE_DIALOG] (stateObj) {
    stateObj.showDialog = false
  },
  [SHOW_LOADER] (stateObj) {
    stateObj.showLoader = true
  },
  [HIDE_LOADER] (stateObj) {
    stateObj.showLoader = false
  },
  [MINIMIZEDMODAL] (stateObj, data) {
    data.isShow = true
    stateObj.listOfMinimizedModal.push(data)
  },
  [UPDATEMINIMIZEDMODAL] (stateObj, data) {
    if (stateObj.listOfMinimizedModal[data.index || 0]) stateObj.listOfMinimizedModal[data.index || 0]._id = data._id
  },
  [SET_TIMER_VALUE] (stateObj, time) {
    stateObj.isTimerRunning = true
    stateObj.currentRunningTime = time
  },
  [CLEAR_TIMER_VALUE] (stateObj) {
    stateObj.isTimerRunning = false
    stateObj.currentRunningTime = ''
    stateObj.timerObj = null
  },
  [SET_TIMEROBJ] (stateObj, obj) {
    stateObj.timerObj = obj
  },
  [SITE_NEW_CONTENT]: (stateObj, data) => {
    stateObj.activeSW = data
    stateObj.isNewContentAvaliable = true
  },
  [RELOAD_NEW_CONTENT]: (stateObj) => {
    stateObj.isNewContentAvaliable = false
  },
  [SHOW_SETTINGS_LOADER]: (stateObj) => {
    stateObj.showPageLoader = true
  },
  [HIDE_SETTINGS_LOADER]: (stateObj) => {
    stateObj.showPageLoader = false
  },
  [WARNING_CONTENT_SET]: (stateObj, obj) => {
    stateObj.crmWarningObj = JSON.parse(JSON.stringify(obj))
  },
  [FILTERS_HISTORY_SET]: (stateObj, obj) => {
    // let user = VueCookie.get(process.env.VUE_APP_USER)
    // user = (user && user !== 'undefined') ? decrypt(JSON.parse(user)) : null
    // const filtersList = (user) ? localStorage.getItem(`${process.env.VUE_APP_NAME}_${user.tenantname}_filtersHistory`) : null
    // stateObj.listOfFiltersHistory = (filtersList) ? JSON.parse(filtersList) : []

    const filtersList = stateObj.listOfFiltersHistory
    if (filtersList.find(x => x.name === obj.name)) {
      filtersList.find(x => x.name === obj.name)[obj.id] = obj.filters
    } else {
      const filterObj = { name: obj.name }
      filterObj[obj.id] = obj.filters
      filtersList.push(filterObj)
    }
    stateObj.listOfFiltersHistory = filtersList
  },
  [MULTIPLE_TENANTS]: (stateObj, obj) => {
    // eslint-disable-next-line
    stateObj.hasMultipleTenant = obj.tenants && obj.tenants.length > 0 ? true : false
    stateObj.multipleTenant = obj.tenants
    stateObj.tenantProfileObj = obj
    setTimeout(() => {
      stateObj.loadRouter = false
    }, 100)
  },
  [STOP_ROUTE_LOADER]: (stateObj) => {
    setTimeout(() => {
      stateObj.loadRouter = false
    }, 300)
  },
  [START_ROUTE_LOADER]: (stateObj) => {
    stateObj.loadRouter = true
  },
  [SHAREPOINT_CONFIG_NOT_DONE]: (stateObj) => {
    stateObj.showSharepointNotDoneDialog = true
  },
  [SHAREPOINT_CONFIG_NOT_DONE_HIDE]: (stateObj) => {
    stateObj.showSharepointNotDoneDialog = false
  },
  [IS_BOOKING_PATH]: (stateObj, value) => {
    stateObj.isBookingPath = value
  },
  [SET_TENANT_PROFILE] (stateObj, obj) {
    stateObj.tenantProfileObj = obj
  },
  [SET_BOOKING_OBJ_FROM_ACCT] (stateObj, obj) {
    stateObj.bookingObjAcct = obj
  },
  setListOfChecklistTemplates (stateObj, obj) {
    stateObj.listOfChecklistTemplates = obj
  },
  [SET_SYSTEM_NOTIFICATION] (stateObj, systemNotification) {
    stateObj[systemNotification.type] = systemNotification.data
  },
  [UPDATE_USER_RESOURCEPLANNER_STATUS] ({ listOfUsers }, { userid, status }) {
    let index = listOfUsers.findIndex((user) => user._id === userid)
    listOfUsers[index] = { ...listOfUsers[index], resourceplannerstatus: status }
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}

const defineSubmoduleColumns = (moduleItem, listOfModules) => {
  if (moduleItem.submodules && moduleItem.submodules.length) { // constructing value for manage columns in list  page with submodule fields
    let activesubmodules = []
    moduleItem.submodules.forEach((submodule) => {
      if (listOfModules.find(x => x.name === submodule && x.isactive)) activesubmodules.push(submodule)
    })
    if (moduleItem.submoduleascolumns && moduleItem.submoduleascolumns.length) {
      let activesubmodulescolumns = moduleItem.submoduleascolumns.filter(x => activesubmodules.includes(x.module))
      activesubmodulescolumns.map(x => { x.label = `Module_${x.module}`; x.isSubModule = true })
      moduleItem.submoduleascolumns = activesubmodulescolumns
    } else {
      moduleItem.submoduleascolumns = []
      moduleItem.submodules.forEach(submodule => {
        moduleItem.submoduleascolumns.push({
          label: `Module_${submodule}`,
          isSubModule: true,
          show_in_list: true,
          module: submodule
        })
      })
    }
  }
  return moduleItem
}
