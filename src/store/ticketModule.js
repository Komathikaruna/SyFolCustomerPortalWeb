import { MAILBOX, TICKETSTATUS, TICKETPRIORITY, GROUPS, TICKETCATEGORY, ESTABLISHSIGNALRCONNECTION } from './actionsTypes'
import { SET_LISTVALUES, SINGANLRENABLED, SET_SIGNALR_CONNECTION_ID } from './mutationsTypes'
import { api } from '../plugins/axios_settings'
import cookie from 'vue-cookie'
import store from './index'
import eventBus from '../main'

const state = {
  listOfMailboxes: [],
  listOfPriorities: [],
  listOfStatus: [],
  listOfTypes: [],
  listOfGroups: [],
  listOfTicketCategory: [],
  signalRConnection: {},
  signalRConnectionId: null,
  // Filters
  F_ALL_TICETS: {},
  F_OPEN_TICETS: {},
  F_UNASSIGNED_TICETS: {},
  F_MY_ACTIVE: {},
  F_CLOSED: {},
  F_ACCOUNT_TICKETS: {}
}

const getters = {
  getListOfMailboxes (stateObj) {
    return stateObj.listOfMailboxes
  },
  getListOfTicketPriorities (stateObj) {
    return stateObj.listOfPriorities
  },
  getListOfTicketStatus (stateObj) {
    return stateObj.listOfStatus
  },
  getListOfTicketType (stateObj) {
    return stateObj.listOfTypes
  },
  getsignalRConnection (stateObj) {
    return stateObj.signalRConnection
  },
  getListOfGroups (stateObj) {
    return stateObj.listOfGroups
  },
  getListOfTicketCategory (stateObj) {
    return stateObj.listOfTicketCategory
  },
  getsignalRConnectionId (state) {
    return state.signalRConnectionId
  }
}

const actions = {
  [MAILBOX] ({ commit }) {
    return new Promise((resolve) => {
      let model = [{
        $project: { Name: 1, Signature: 1, Accessible_To_Groups: 1, UserName: 1, TypeOfAuth: 1, isDefault: 1 }
      }]
      api.post('mailconfigurations/query', model)
        .then((response) => {
          let mailboxModel = { type: 'listOfMailboxes', data: response.data }
          commit(SET_LISTVALUES, mailboxModel)
          resolve()
        })
    })
  },
  [TICKETSTATUS] ({ commit }) {
    return new Promise((resolve) => {
      // let model = [{
      //   $match: { IsActive: true }
      // }]
      api.post('incidentcustomerportal/ticketstatus/get_active')
        .then((response) => {
          let ticketStatusModel = { type: 'listOfStatus', data: response.data }
          commit(SET_LISTVALUES, ticketStatusModel)
          resolve()
        })
    })
  },
  [TICKETPRIORITY] ({ commit }) {
    return new Promise((resolve) => {
      // let model = [{
      //   $match: { IsActive: true }
      // }]
      api.post('incidentcustomerportal/ticketpriorities/get_active')
        .then((response) => {
          response.data.sort((a, b) => a.position - b.position)
          let ticketPriorityModel = { type: 'listOfPriorities', data: response.data }
          commit(SET_LISTVALUES, ticketPriorityModel)
          resolve()
        })
    })
  },
  [TICKETCATEGORY] ({ commit }) {
    return new Promise((resolve) => {
      // let model = [{
      //   $match: { IsActive: true }
      // }]
      api.post('incidentcustomerportal/ticketcategories/get_active')
        .then((response) => {
          const ticketCategoryModel = { type: 'listOfTicketCategory', data: response.data }
          commit(SET_LISTVALUES, ticketCategoryModel)
          resolve()
        })
    })
  },
  [GROUPS] ({ commit }) {
    return new Promise((resolve) => {
      api.get('usergroups')
        .then((response) => {
          response.data.forEach(element => {
            element.alternateid = JSON.parse(JSON.stringify(`group_${element._id}`))
            element.isGroup = true
          })
          const model = { type: 'listOfGroups', data: response.data }
          commit(SET_LISTVALUES, model)
          resolve()
        })
    })
  },
  [ESTABLISHSIGNALRCONNECTION] ({ commit }) {
    const signalR = require('@aspnet/signalr')
    const connection = new signalR.HubConnectionBuilder().withUrl(`${process.env.VUE_APP_API_URL}/CrmHub`, {
      transport: signalR.HttpTransportType.WebSockets,
      accessTokenFactory: () => cookie.get(process.env.VUE_APP_TOKEN)
      // skipNegotiation: true, // Skip automatic negotiation
      // transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling, // Fallback to SSE and Long Polling if WebSocket is not supported
      // accessTokenFactory: () => cookie.get(process.env.VUE_APP_TOKEN)
    }).configureLogging(signalR.LogLevel.Information).build()

    connection
      .start()
      .then(() => {
        // const url = connection.connection.transport._webSocket.url
        const url = connection.connection.transport.webSocket.url
        const searchParams = new URLSearchParams(new URL(url).search)
        var { id: connectionId } = Object.fromEntries(searchParams.entries()) || {}
        if (connectionId) {
          console.info('SignalR connected:', connectionId)
          commit('setSignalRConnectionId', connectionId)
        }

        connection.onclose(() => {
          console.error('SignalR connection closed', navigator.onLine, new Date())
          commit('setSignalRConnectionId', null)
          store.dispatch('establishSignalR')
        })
        commit('signalREnable', connection)
      })
      .catch((er) => {
        console.warn('SignalR not connected.', er)
      })

    if (!connection) return
    connection.on('LoadNotification', (notifyTo) => { // app notification emitter
      // console.log('inside emit-notification')
      eventBus.$emit('new-notification', notifyTo)
    })
    let contents = []
    let mailNotificationHandler = (notifyBody, ticketId, mailboxid, conversationid) => {
      if (!contents.includes(notifyBody)) {
        eventBus.$emit('new-mail-notification', notifyBody, ticketId, mailboxid, conversationid)

        contents.push(notifyBody)
      }
      // connection.off('SendMailNotification', mailNotificationHandler) // Remove the event handler after the first invocation
    }
    connection.on('SendMailNotification', mailNotificationHandler)
    connection.on('SendTicketNotification', mailNotificationHandler)
    connection.on('ReceiveTicketNotification', mailNotificationHandler)
  }
}

const mutations = {
  [SET_LISTVALUES] (stateObj, obj) {
    stateObj[obj.type] = obj.data
  },
  [SINGANLRENABLED] (stateObj, data) {
    stateObj.signalRConnection = data
  },
  [SET_SIGNALR_CONNECTION_ID] (stateObj, id) {
    stateObj.signalRConnectionId = id
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
