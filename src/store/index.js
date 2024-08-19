import Vue from 'vue'
import Vuex from 'vuex'

import common from './common'
import auth from './authModule'
import ticket from './ticketModule'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    common,
    auth,
    ticket
  }
})
