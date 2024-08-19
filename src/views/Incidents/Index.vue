<template>
  <div>
    <v-app-bar v-if="true"
      app
      color="#0184e2"
    >
      <v-app-bar-nav-icon dark></v-app-bar-nav-icon>
      <span class="pt-1 white--text">SYFol</span>
      <v-spacer></v-spacer>
      <v-btn icon dark>
        <v-icon>mdi-translate</v-icon>
      </v-btn>
      <v-btn icon dark @click="$router.push('/login')">
        <v-icon>mdi-logout-variant</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-card class="ma-3">
        <v-card-title class="pa-1">
          <v-btn color="#0184e2" height="27" width="27" outlined icon class="ml-3" @click="$router.go(-1)">
            <v-icon color="#0184e2" size="16" > mdi-arrow-left </v-icon>
          </v-btn>
          <v-row no-gutters>
            <v-col cols="1">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title><v-icon v-text="incident.icon" class="pr-3"></v-icon>{{ incident.name }}</v-list-item-title>
                  <v-list-item-subtitle class="ml-9">{{ incident.description }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="2" class="text-end pt-3">
              <v-text-field @keydown="preventSpecialCharacters($event)" ref="searchField" clearable append-icon="mdi-magnify"
                @keyup.enter="filter.search = ticketSearchTerm" @click:append="filter.search = ticketSearchTerm" outlined rounded hide-details
                dense single-line v-model="ticketSearchTerm" :label="$t('Search')" class="text-xs-right"
                id="searchbtn" @click:clear="filter.search = ''" :loading="loading"></v-text-field>
            </v-col>
            <v-col cols="2" class="text-end pt-4">
              <v-btn
                outlined small
                dense class="mr-3"
                color="#0184e2"
              >
                <v-icon color="#0184e2" size="16"> mdi-filter </v-icon>
                Filters
              </v-btn>
              <v-btn outlined small :color="systemDetails.themecolor" dark @click="$router.push(`/incident/create/${$route.params.incidentname}/${$route.params.incidentid}`)" class="mx-1">{{ $t('create') }} {{ incident.name }}</v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-card flat class="ma-1">
            <v-card-text :class="hideFilterTabItem ? 'pa-0': 'pa-0'">
              <template v-if="hideFilters && (accesscontrol ? accesscontrol.edit : true)">
                <div style="flex-basis: 20%">
                  <v-toolbar flat dense :color="$vuetify.theme.dark ? '' : 'grey lighten-2'">
                    <v-btn class="ma-2"  @click="storePath('TASK')" tile text color="primary">
                      <v-icon left>mdi-plus</v-icon> {{ $t('createTask') }}
                    </v-btn>
                    <v-btn class="ma-2" @click="storePath()" tile text color="success">
                      <v-icon left>mdi-plus</v-icon> {{ $t('createTicket') }}
                    </v-btn>
                  </v-toolbar>
                </div>
              </template>
              <v-card-text class="pa-0">
                <v-data-table fixed-header v-model="selected" :headers="headers" :items="listOfTickets" item-key="id" show-select class="common checkboxPaddingTicket" :class="{ 'dark-theme': $vuetify.theme.dark }"
                  :items-per-page="pagination.itemsPerPage"
                  :server-items-length="total >= 0 ? total : undefined"
                  :page="pagination.page"
                  :footer-props="paginationList"
                  :loading="loading" :must-sort="true"
                  @update:options="paginationOptionsChanged"
                >
                  <template #top v-if="selected.length">
                    <v-toolbar :elevation="5" :color="!!selected.length ? systemDetails.themecolor : 'white'" dense>
                      <v-slide-y-transition v-if="selected.length">
                        <v-btn icon @click="clearSelected">
                          <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                      </v-slide-y-transition>
                      <v-slide-y-transition>
                        <v-toolbar-title v-if="selected.length">
                          <div class="white--text">{{ `${selected.length} ${$t('selected')}` }}</div>
                        </v-toolbar-title>
                      </v-slide-y-transition>
                      <v-row class="text-end">
                        <v-col cols="12">
                          <v-btn class="ml-2" v-for="(item, index) in menuList" @click="menuActions(item.value)" :key="index" small>
                            <v-icon>{{ item.icon }}</v-icon>
                            {{ item.title }}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-toolbar>
                  </template>
                  <template v-slot:body="{ items }" v-if="listOfTickets.length > 0">
                    <tbody :style="loading ? 'pointer-events: none;' : 'pointer-events: all;'">
                      <tr v-for="(ticket, index) in items" :key="index" :disabled="loading">
                        <td style="width:1%">
                          <div class="d-flex">
                            <v-checkbox v-model="ticket.isSelected" @change="addToSelected($event, ticket)" hide-details color="primary"></v-checkbox>
                            <v-icon v-if="!ticket.is_task" small>mdi-palette-swatch</v-icon>
                            <v-icon v-if="ticket.is_task" small>mdi-clipboard-check</v-icon>
                          </div>
                        </td>
                        <td style="width:4%">
                          <a @click="navigateToTicket(ticket.id,ticket.mailboxid,ticket.outlookconversationid)" class="underline">{{ ticket.number }}</a>
                          <!-- <a @click="navigateToTicket(ticket.id)" class="underline">{{ ticket.number }} {{!ticket.is_task ? `(${ticket.totalmailcount})`: ''}}</a> -->
                          <v-icon v-if="!ticket.lastmailfromcustomer" small> mdi-reply</v-icon>
                          <!-- {{ incident.name }} {{ incident.icon }} {{  incident.name !== 'Ticket' }} -->
                          <v-icon v-if="incident.name !== 'Ticket'" small>{{ incident.icon }}</v-icon>
                          <v-icon v-if="ticket.hasattachments" small>mdi-attachment mdi-rotate-315</v-icon>
                        </td>
                        <td style="width:6%" @click="ticket.showStatus = true">
                          <template v-if="ticket.showStatus">
                            <v-autocomplete v-model="ticket.status" :items="getListOfTicketStatus.filter(x => x.incidenttypeid === $route.query.incidenttypeid)" item-text="name" item-value="_id" dense hide-details full-width class="select-font"
                              @change="updateTickets(ticket.id, index, 'status')" @blur="ticket.showStatus = false"></v-autocomplete>
                          </template>
                          <template v-else>
                            <v-chip class="ma-2" :color="ticket.statuscolor" dark small :text-color="$formatter.foreGroundColor(ticket.statuscolor)" v-if="ticket.statusname">{{ ticket.statusname }}</v-chip>
                          </template>
                        </td>
                        <td style="width:3%">
                          <a @click="openCommentsDialog(ticket.id)">{{ticket.totalcommentscount}}</a>
                        </td>
                        <td style="width:6%" v-if="incidenttype === 'Ticket'">{{ ticket.from  }}</td>
                        <td class="v-toolbar__title overflow-td" style="width:8%" :class="ticket.hasunread ? 'font-weight-black': ''">
                          <a @click="navigateToTicket(ticket.id,ticket.mailboxid,ticket.outlookconversationid)" class="underline">{{ ticket.subject }}</a>
                        </td>
                        <td  style="width:7%"  @click="ticket.showAssignedTo = true">
                          <template v-if="ticket.showAssignedTo">
                            <v-autocomplete v-model="ticket.assignedto" :items="listOfUserAndGroups" item-text="name" item-value="alternateid" dense hide-details full-width class="select-font"
                              @change="updateTickets(ticket.id, index, 'assignedto')" @blur="ticket.showAssignedTo = false"></v-autocomplete>
                          </template>
                          <template v-else>
                            <span>{{ticket.assignedtoname}}</span>
                            <span>{{ticket.assignedto_group_name}}</span>
                          </template>
                        </td>
                        <td @click="showAccount(index)" v-if="!fromSubmodule || !accountId" style="width:6%">
                          <template v-if="ticket.showAccount">
                            <v-autocomplete v-model="ticket.account_id" :items="getAccountListName" :ref="`ticket_assignedTo_${index}`"
                              item-value="_id" dense hide-details full-width class="select-font" item-text="name"
                              @blur="ticket.showAccount = false"
                              @click="searchTerm ? '' : getAccountListValue()"
                              @change="updateTickets(ticket.id, index, 'account')"  @keydown="preventSpecialCharacters($event)" :search-input.sync="searchTerm"
                              @keyup="$event.keyCode !== 13 && $event.keyCode !== 38 && $event.keyCode !== 40 ? getAccountListValue() : ''" >
                              <template v-slot:append-item>
                                <div v-intersect="onIntersect" class="pa-0 teal--text" />
                              </template>
                              <!-- <template v-slot:append-item v-if="shouldShowLoadMore">
                                <div class="pl-4 teal--text" @mousedown.prevent @click="loadMore()">Load more</div>
                              </template> -->
                            </v-autocomplete>
                          </template>
                          <template v-else>
                            {{ ticket.account_name }} {{ticket.account_type ? `(${$t(ticket.account_type)})` : ''}}
                          </template>
                        </td>
                        <td style="width:6%" @click="ticket.showPriority = true">
                          <template v-if="ticket.showPriority">
                            <v-autocomplete v-model="ticket.priority" :items="getListOfTicketPriorities.filter(x => x.incidenttypeid === $route.query.incidenttypeid)" item-text="name" item-value="_id" dense hide-details full-width class="select-font"
                              @change="updateTickets(ticket.id, index, 'priority')" @blur="ticket.showPriority = false"></v-autocomplete>
                          </template>
                          <template v-else>
                            <v-chip v-if="ticket.prioritycolor" class="ma-2" :color="ticket.prioritycolor" dark small :text-color="$formatter.foreGroundColor(ticket.prioritycolor)">
                              {{ ticket.priorityname }}
                            </v-chip>
                          </template>
                        </td>
                        <td style="width:6%" @click="ticket.showCategory = true">
                          <template v-if="ticket.showCategory">
                            <v-autocomplete v-model="ticket.category_id" :items="getListOfTicketCategory.filter(x => x.incidenttypeid === $route.query.incidenttypeid)" item-text="name" item-value="_id" dense hide-details full-width class="select-font"
                              @change="updateTickets(ticket.id, index, 'category')" @blur="ticket.showCategory = false"></v-autocomplete>
                          </template>
                          <template v-else>
                            {{ ticket.categoryname }}
                          </template>
                        </td>
                        <td style="width:7%">{{ $formatter.formatDate(ticket.modified_at, 'DD.MM.YYYYTHH.mm.ss', `DD.MM.YYYY HH:mm`) }}</td>
                        <td style="width:7%" v-if="incidenttype === 'Ticket'">{{ $formatter.formatDate(ticket.lastrepliedon,'DD.MM.YYYYTHH.mm.ss', `${userDetails.dateformat} HH:mm`) }}</td>
                        <td style="width:7%">{{ ticket.modifiedbyname }}</td>
                      </tr>
                    </tbody>
                  </template>
                  <template v-slot:no-data>
                      <span>{{ $t('noData') }}</span>
                  </template>
                  <template v-slot:footer v-if="incidenttype == 'Ticket'">
                    <p style="position: absolute" class="ml-3 mt-5" h3>{{$t('missingTickets')}}
                      <a v-if="!ticketSyncing" style="text-decoration:underline" @click="syncTickets">{{ $t('doSync') }}</a>
                      <v-progress-circular v-else indeterminate  size="15" color="#0D47A1"></v-progress-circular>
                    </p>
                  </template>
                </v-data-table>
              </v-card-text>
              <!-- Status close confirm -->
              <v-dialog v-model="cancloseDialog" persistent width="400" class="mt-0">
                <v-card>
                  <v-card-title>
                  {{ $t('confirmation') }}
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-5">
                    <h4>{{ $t('noUserAssigned') }}</h4>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-flex class="text-center">
                      <v-btn class="mr-3" color="info" @click="updateCanCloseStatusHandler()" :loading="cancloseLoading">{{ $t('yes') }}</v-btn>
                      <v-btn color="error" @click="closeConfirmDialog">{{ $t('close') }}</v-btn>
                    </v-flex>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <!-- Comments dialog-->
              <v-dialog v-model="commentsDialog" persistent width="500">
                <v-card flat class="pa-0">
                  <v-card-title :style="`background-color: ${systemDetails.themecolor}; color: ${systemDetails.textcolor}`">
                    {{ $t('comments') }}
                    <v-spacer></v-spacer>
                    <v-btn small dark @click="commentsDialog = false" icon :color="systemDetails.textcolor"><v-icon>mdi-close-circle-outline</v-icon></v-btn>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-progress-linear class="mt-1" color="primary" indeterminate v-if="loadingComments"></v-progress-linear>
                    <!-- <comments-section class="pt-2" :isView="true" @reloadComments="reloadCommentCount(ticketId)" :ticket_id="ticketId" :ticketNumber="0" :assignedto="0" :key="reloadCommentDialog"></comments-section> -->
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-flex class="text-center">
                      <v-btn color="error" @click="commentsDialog = false">{{ $t('close')}}</v-btn>
                    </v-flex>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-text>
              <v-snackbar color="black" v-model="newTicketPopup" :timeout="-1" top class="pa-2">
                <v-alert class="pa-2 mb-0 white--text" color="black">{{ $t('newTicketFound') }}</v-alert>
                <template v-slot:action="{ attrs }">
                  <v-btn color="red" class="mr-9" text v-bind="attrs" icon @click="syncTickets()">
                    {{ $t('refresh') }}
                  </v-btn>
                  <v-icon class="white--text mr-3" @click="newTicketPopup=false">mdi-close</v-icon>
                </template>
              </v-snackbar>
          </v-card>
        </v-card-text>
      </v-card>
    </v-main>
  </div>
</template>
<script>
/* eslint-disable */
import { mapGetters } from 'vuex'
import { TICKETPRIORITY, TICKETSTATUS, MAILBOX } from '@/store/actionsTypes'

import mixins from '@/mixins/custommodulelist'
export default {
  props: ['fromSubmodule', 'moduleInfo', 'hideFilters', 'recordId', 'moduleName', 'accesscontrol'],
  mixins: [mixins],
  data () {
    return {
      showFilterIcon: false,
      navbar: false,
      value: '',
      filter: {
        assignedto: 0,
        priority: 0,
        status: [],
        type: 0,
        mailbox: this.mailbox ? this.mailbox : 0,
        category: 0,
        search: '',
        account_id: null,
        modulerelation: this.fromSubmodule && !this.accountId ? this.moduleRelations : undefined
      },
      menu: {
        assignedto: 0,
        assignedtogroup: 0,
        priority: 0,
        status: [],
        type: 0,
        mailbox: 0,
        category: 0,
        filterType: 0,
        ticketType: 0
      },
      fab: false,
      selectedTab: 0,
      listOfTickets: [],
      search: '',
      searchUser: '',
      setUserFilter: false,
      closeUserFilter: false,
      searchPriority: '',
      closePriorityFilter: false,
      setPriority: false,
      searchStatus: '',
      setStatus: false,
      closeStatusFilter: false,
      searchType: '',
      searchCategory: '',
      closeCategoryFilter: false,
      setType: false,
      setCategory: false,
      closeTypeFilter: false,
      selected: [],
      loading: false,
      total: 0,
      editTicketItems: [],
      MODULE_URL: 'tickets',
      backupTicketList: [],
      listOfUserAndGroups: [],
      pagination: !this.$formatter.isEmptyObject(this.$store.state.common.TICKETS_INDEX) ? this.$store.state.common.TICKETS_INDEX : { page: 1, sortBy: ['modified_at'], itemsPerPage: 25, sortDesc: [true], search: '' },
      initKey: 0,
      cancloseDialog: false,
      cancloseLoading: false,
      statusItem: {},
      loadingComments: false,
      commentsDialog: false,
      listOfComments: [],
      currentStorageName: '',
      workspaceBasedStorageName: '',
      ticketSearchTerm: '',
      searchTerm: '',
      searchValue: '',
      skip: 0,
      limit: 30,
      getAccountListName: [],
      listData: [],
      data: '',
      reRender: 0,
      mergeItems: [],
      parentticketid: 0,
      mergeTicketDialog: false,
      statusDialog: false,
      priorityDialog: false,
      assignedDialog: false,
      changedStatusId: 0,
      changedPriorityId: 0,
      assignedtoId: 0,
      deleteMails: false,
      deleteDialog: false,
      statusLoading: false,
      mailbox: window.localStorage.getItem('ticketmailbox') ? window.localStorage.getItem('ticketmailbox') === '0' ? 0 : window.localStorage.getItem('ticketmailbox') : 0,
      archiveItem: {},
      usersAndGroupsList: [],
      istabDisabled: false,
      accountId: '',
      moduleRelations: {},
      hideFilterTabItem: false,
      ticketItem: {},
      newTicketPopup: false,
      ticketSyncing: false,
      totalItems: 0,
      ticketId: '',
      isInitial: 0,
      isMountedCall: true,
      reloadCommentDialog: 0,
      isFilterStoredInLocalStorage: false,
      defaultTicketFilter: { assignedto: 0, status: [], priority: 0, category: 0, mailbox: 0, type: 0 }, // empty filter by default
      incident: [],
      incidenttypeid: this.$route.query.incidenttypeid,
      incidenttype: this.$route.query.incidenttype
    }
  },
  // components: {
  //   'comments-section': () => import('./Comments.vue')
  // },
  async created () {
    if (this.moduleName === this.ACCOUNT) {
      this.accountId = this.recordId
    } else this.moduleRelations = { id: this.recordId, module: this.moduleName }

    this.hideFilterTabItem = this.hideFilters
    // Set the localstorage name
    this.currentStorageName = !(this.hideFilters || this.fromSubmodule) ? `${process.env.VUE_APP_NAME}_ticketTabFilters` : `${process.env.VUE_APP_NAME}_${this.$route.params.name}_ticketTabFilters`
    this.workspaceBasedStorageName = `${this.currentStorageName}_${this.userDetails.domain}`
    this.readAndSetLocalStorageValues()
    // await this.getIncidentDetails()
    // await this.fetchTicketStatus()
  },
  mounted () {
    console.log(this.$route)
    this.getIncidentDetails()
    this.getListHandler()
    this.isMountedCall = true
    if (!this.fromSubmodule && this.incidenttype === 'Ticket') {
      this.syncTicketsInterval()
    }
    // this.$store.dispatch(MAILBOX)
    this.$root.$on('showStatusDialog', (data) => {
      this.cancloseDialog = true
      this.archiveItem = data
    })
    this.$root.$on('enableorDisableTab', (data) => {
      this.istabDisabled = data
    })
    this.$root.$on('mailboxChanged', (data) => {
      this.filter.mailbox = data
    })
    this.$root.$on('closeEdit', (data) => {
      this.listOfTickets.find(x => {
        if (x.id === data.ticketid) {
          x.showStatus = false
        }
      })
    })
    this.$root.$on('loadTickets', () => {
      this.getListHandler()
    })
    setTimeout(() => {
      if (this.$refs.searchField && this.$refs.searchField.$refs) {
        this.$refs.searchField.$refs.input.focus()
      }
    })
  },
  computed: {
    ...mapGetters(['getListOfTicketPriorities', 'getTicketPriority', 'getListOfTicketStatus', 'getUsers', 'getListOfTicketCategory', 'getsignalRConnection', 'getListOfGroups', 'getListOfTicketType', 'getAccountList', 'userDetails', 'systemDetails', 'getUserGroups', 'getListOfMailboxes']),
    headers () {
      let items = [
        { text: this.$t('number'), value: 'number', width: '110' },
        { text: this.$t('status'), value: 'status', width: '100' },
        { text: this.$t('comments'), value: 'totalcommentscount', width: '120' },
        { text: this.$t('subject'), value: 'subject', width: '100' },
        { text: this.$t('assignedTo'), value: 'assignedtoname', width: '120' },
        { text: this.$t('account'), value: 'account_name', width: '100' },
        { text: this.$t('priority'), value: 'priority', width: '100' },
        { text: this.$t('category'), value: 'type', width: '120' },
        { text: this.$t('lastModified'), value: 'modified_at', width: '140' },
        { text: this.$t('modifiedBy'), value: 'modified_name', width: '120' }
      ]
      if (this.incidenttype === 'Ticket') {
        items.push({ text: this.$t('from'), value: 'mailfrom', width: '100' })
        items.push({ text: this.$t('lastReceivedorsent'), value: 'lastrepliedon', width: '180' })
      }
      if (this.fromSubmodule && this.accountId) items.splice(6, 1)
      return items
    },
    paginationList () {
      return {
        itemsPerPageOptions: [10, 25, 50, 100, 250],
        itemsPerPageText: this.$t('resultsPerPage')
      }
    },
    listOfPrioritiesForFilter () {
      let list = this.$formatter.cloneVariable(this.getListOfTicketPriorities)
      list.splice(0, 0, { _id: 0, name: this.$t('all') })
      return list
    },
    listOfTypesForFilter () {
      let list = this.$formatter.cloneVariable(this.getListOfTicketType)
      list.splice(0, 0, { _id: 0, name: this.$t('all') })
      return list
    },
    listOfStatusForFilter () {
      let list = this.$formatter.cloneVariable(this.getListOfTicketStatus)
      if (this.filter.status.length > 0) {
        this.filter.status.forEach(element => {
          list.forEach(status => {
            if (status._id === element) {
              status.selected = true
            }
          })
        })
      }
      // list.splice(0, 0, { id: 0, name: this.$t('message.tickets.all') })
      return list
    },
    listOfUsersForFilter () {
      let list = this.$formatter.cloneVariable(this.getUsers)
      let users = this.$formatter.cloneVariable(list)
      // users = [ ...users, ...this.getListOfGroups ]
      users = [ ...users, ...this.getUserGroups ]
      this.listOfUserAndGroups = users
      list.splice(0, 0, { alternateid: 0, name: this.$t('all') })
      list.splice(1, 0, { alternateid: -1, name: this.$t('notAssigned') })
      return list
    },
    listOfTypes () {
      return [{
        _id: 0,
        name: this.$t('all')
      }, {
        _id: 1,
        name: this.$t('tickets')
      }, {
        _id: 2,
        name: this.$t('tasks')
      }]
    },
    listOfCategoryForFilter () {
      let list = this.$formatter.cloneVariable(this.getListOfTicketCategory)
      list.splice(0, 0, { _id: 0, name: this.$t('all') })
      return list
    },
    listOfUserMenu () {
      // let userMenu = [ ...this.listOfUsersForFilter, ...this.getListOfGroups]
      let userMenu = [ ...this.listOfUsersForFilter, ...this.getUserGroups ]
      return userMenu.filter(item => {
        if (!this.searchUser) return userMenu
        return (item.name.toLowerCase().includes(this.searchUser.toLowerCase()))
      })
    },
    listOfPriorities () {
      return this.listOfPrioritiesForFilter.filter(item => {
        if (!this.searchPriority) return this.listOfPrioritiesForFilter
        return (item.name.toLowerCase().includes(this.searchPriority.toLowerCase()))
      })
    },
    listOfStatus () {
      return this.listOfStatusForFilter.filter(item => {
        if (!this.searchStatus) return this.listOfStatusForFilter
        return (item.name.toLowerCase().includes(this.searchStatus.toLowerCase()))
      })
    },
    listOfCategory () {
      return this.listOfCategoryForFilter.filter(item => {
        if (!this.searchType) return this.listOfCategoryForFilter
        return (item.name.toLowerCase().includes(this.searchType.toLowerCase()))
      })
    },
    menuList () {
      return [
        { title: this.$t('merge'), value: 'merge', icon: 'mdi-call-merge' },
        { title: this.$t('changeStatus'), value: 'changeStatus', icon: 'mdi-priority-low' },
        { title: this.$t('changePriority'), value: 'changePriority', icon: 'mdi-currency-sign ' },
        { title: this.$t('assignTo'), value: 'assignTo', icon: 'mdi-account-circle' },
        { title: this.$t('delete'), value: 'delete', icon: 'mdi-delete' }
      ]
    },
    tabItem () {
      const incidentName = this.incident.name ? this.incident.name.toLowerCase() : ''
      return [
        { id: 0, text: this.$t('allActive'), icon: 'mdi-check-circle' },
        { id: 1, text: this.$t('MyOpen ' + incidentName), icon: 'mdi-ticket-confirmation' },
        { id: 2, text: this.$t('Unassinged '+ incidentName), icon: 'mdi-ticket-outline' },
        { id: 3, text: this.$t('closed'), icon: 'mdi-close-circle' },
        { id: 4, text: this.$t('All ' + incidentName), icon: 'mdi-ticket' }
      ]
    },
    listOfMailBoxForFilter () {
      let list = this.$formatter.cloneVariable(this.getListOfMailboxes)
      let newlist = list.filter(x => x.typeofauth === 'microsoft')
      newlist.splice(0, 0, { _id: 0, name: this.$t('all') })
      // list.splice(1, 0, { id: -1, name: this.$t('message.timer.tasks') })
      return newlist
    },
    localStoragePrefix () {
      return `${this.userDetails.domain}_${this.userDetails._id}`
    },
    computedFilterToWatch () {
      return Object.assign({}, this.filter)
    }
    // shouldShowLoadMore() {
    //   return (this.skip + this.limit) < this.totalItems;
    // }
  },
  watch: {
    listOfMailBoxForFilter () {
      setTimeout(() => {
        const isMailboxMatching = this.getListOfMailboxes.some(mailbox => mailbox._id === this.filter.mailbox)
        if (!isMailboxMatching) {
          this.filter.mailbox = 0
        }
      })
    },
    // search: function (newValue, oldValue) {
    //   this.getListHandler()
    // },
    computedFilterToWatch: {
      handler (newValue, oldValue) {
        if (this.initKey !== 0 && (newValue || oldValue)) {
          if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
            this.$set(this.pagination, 'page', 1)
            setTimeout(() => {
              this.paginationOptionsChanged(this.pagination)
            })
          }
        }
      },
      deep: true
    },
    selected (val) {
      if (val.length === this.listOfTickets.length) {
        this.listOfTickets.forEach(element => {
          element.isSelected = true
        })
      } else if (val.length === 0) {
        this.listOfTickets.forEach(element => {
          element.isSelected = false
        })
      }
    },
    mailbox (val) {
      window.localStorage.setItem('ticketmailbox', val)
      this.$root.$emit('mailboxChanged', val)
    },
    selectedTab (val) {
      if (val) {
        this.showFilterIcon = false
      }
    },
    getListOfTicketStatus () {
      if (this.isMountedCall) this.loadList()
    }
  },
  methods: {
    setFilterInLocalStorage () {
      const data = { type: this.findTabName(), data: { filter: this.filter } }
      let storedFilters = window.localStorage.getItem(this.currentStorageName) ? JSON.parse(window.localStorage.getItem(this.currentStorageName)) : {}
      storedFilters[data.type] = data.data
      storedFilters.tab = this.selectedTab
      const storeValue = { tab: this.selectedTab || 0, filter: this.filter }
      window.localStorage.setItem(this.currentStorageName, JSON.stringify(storedFilters)) // need to remove this on next live update
      window.localStorage.setItem(this.workspaceBasedStorageName, JSON.stringify(storeValue)) // domain based storage
    },
    readAndSetLocalStorageValues () {
      this.isFilterStoredInLocalStorage = false
      // Get the localstorage filter value and set it
      const oldStorageFilterValues = window.localStorage.getItem(this.currentStorageName) ? JSON.parse(window.localStorage.getItem(this.currentStorageName)) : ''
      const newStorageFilterValues = window.localStorage.getItem(this.workspaceBasedStorageName) ? JSON.parse(window.localStorage.getItem(this.workspaceBasedStorageName)) : ''
      if (newStorageFilterValues) {
        this.selectedTab = newStorageFilterValues.tab || 0 // if not found from storage then set to default that is all active
        this.filter = newStorageFilterValues.filter
        this.isFilterStoredInLocalStorage = true
      } else if (oldStorageFilterValues) {
        this.selectedTab = oldStorageFilterValues.tab || 0
        let tabName = this.findTabName()
        let storedFilter = window.localStorage.getItem(this.currentStorageName) ? JSON.parse(window.localStorage.getItem(this.currentStorageName)) : ''
        if (storedFilter && typeof storedFilter === 'object' && storedFilter[tabName] && storedFilter[tabName].filter) {
          this.filter = storedFilter[tabName].filter
          this.isFilterStoredInLocalStorage = true
        } else this.filter = this.$formatter.cloneVariable(this.defaultTicketFilter)
      } else {
        this.selectedTab = 0
        this.filter = this.$formatter.cloneVariable(this.defaultTicketFilter)
      }
    },
    loadList () {
      let type = 'TICKETS_INDEX'
      if (this.fromSubmodule) {
        let moduleName = this.$route.params.name
        type = this.$store.state.common[`${moduleName}_TICKETSINDEX`]
        if (!this.$store.state.common[`${moduleName}_TICKETSINDEX`]) {
          this.$store.state.common[`${moduleName}_TICKETSINDEX`] = {}
        }
      }
      const model = { type, data: this.pagination }
      this.$store.commit('savePagination', model)
      this.getListHandler()
    },
    paginationOptionsChanged (pagination) {
      if (this.isMountedCall) {
        const storedPagination = window.localStorage.getItem(`${this.localStoragePrefix}_TicketPagination`)
        if (storedPagination) {
          try {
            pagination = JSON.parse(storedPagination)
          } catch (ex) {}
        }
      }
      if (!pagination.sortBy.length) pagination.sortBy = ['modified_at']
      if (!pagination.sortDesc.length) pagination.sortDesc = [true]
      this.pagination = this.$formatter.cloneVariable(pagination)
      if (!this.isMountedCall) this.loadList()
    },
    fetchTicketStatus () {
      // Dispatch the TICKETSTATUS action to fetch ticket statuses from the store
      return new Promise((resolve, reject) => {
        this.$store.dispatch(TICKETSTATUS)
          .then(() => {
            // After ticket statuses are fetched, check if there are any statuses
            if (!this.getListOfTicketStatus.length > 0) {
              this.$root.$emit('snackbar', {
                snackbar: true,
                color: 'warning',
                text: 'Create at least one ticket status!'
              })
            }
          })
          .finally(() => {
            resolve()
          })
          .catch(error => {
            console.error('Error fetching ticket statuses:', error)
            resolve() // because the code execution has to continue
          })
      })
    },
    syncTickets () {
      if (this.newTicketPopup) {
        this.newTicketPopup = false
        this.getListHandler()
      } else {
        this.ticketSyncing = true
        clearInterval(this.intervalId)
        const currentDate = new Date()
        const fourteenDaysAgo = new Date(currentDate)
        fourteenDaysAgo.setDate(currentDate.getDate() - 14)
        const fromDate = this.$formatter.formatDate(fourteenDaysAgo, `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DDTHH:mm:ss')
        let listOfMailboxes = []
        let arrayOfIds
        if (this.mailbox === 0) {
          let mails = this.getListOfMailboxes
          for (let item in mails) {
            if (mails[item].typeofauth === 'microsoft') {
              listOfMailboxes.push(mails[item]._id)
            }
          }
          arrayOfIds = listOfMailboxes
        } else {
          arrayOfIds = [`${this.mailbox}`]
        }
        this.$api.execute('post', `graphwebhooksclient/outlookmail_manual_sync`, {
          mailBoxIds: arrayOfIds,
          fromDate: fromDate
        }).then(response => {
          this.ticketSyncing = false
          this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'syncedSuccessfully' })
          this.getListHandler()
        }).finally(() => {
          this.loading = false
          this.syncTicketsInterval()
        })
      }
    },
    syncTicketsInterval () {
      this.intervalId = setInterval(() => {
        this.$api.execute('get', 'tickets/is_new_ticket_available')
          .then((res) => {
            if (res.data) {
              this.newTicketPopup = true
            }
          })
      }, 7000)
    },
    removeAllFilters () {
      this.filter = {
        assignedto: this.selectedTab === 1 ? this.userDetails._id : this.selectedTab === 2 ? -1 : 0,
        priority: 0,
        status: [],
        type: 0,
        mailbox: this.mailbox ? this.mailbox : 0,
        category: 0,
        search: '',
        account_id: this.fromSubmodule ? this.accountId : null,
        modulerelation: this.fromSubmodule && !this.accountId ? this.moduleRelations : undefined
      }
      this.showFilterIcon = false
    },
    getListHandler () { // statusList - I don't see we are passing status list from anywhwere commenting this out now
      this.$root.$emit('enableorDisableTab', true)
      this.loading = true
      this.selected = []
      let filterItem = this.$formatter.cloneVariable(this.filter)
      this.setFilterInLocalStorage() // store in localstorage
      // Apply filter based on selectedTab value - don't change other filter values
      filterItem = this.applyFilterBasedOnTicketTabFilter(filterItem) // selectedTab
      filterItem.rowsperpage = this.pagination.itemsPerPage
      filterItem.descending = this.pagination.sortDesc[0]
      filterItem.sortby = this.pagination.sortBy[0] === 'assignedtoname' ? 'assignedto' : this.pagination.sortBy[0]
      filterItem.page = this.pagination.page || 1
      filterItem.totalItems = 0
      if ([0, 3, 4].includes(this.selectedTab)) {
        if (filterItem.assignedto !== 0 && filterItem.assignedto !== -1) {
          let value = filterItem.assignedto.split('_')
          if (value[0] === 'user') {
            filterItem.assignedto = value[1]
            filterItem.assignedtogroup = 0
          } else {
            filterItem.assignedtogroup = value[1]
            filterItem.assignedto = 0
          }
        }
      }
      // To set ids with value to null for filter
      Object.keys(filterItem).forEach(function (key) {
        if (filterItem[key] === 0 && key !== 'status' && key !== 'totalItems') filterItem[key] = null
      })
      if (filterItem.type === null) {
        filterItem.type = 0
        if (filterItem.type > 0) {
          this.showFilterIcon = true
        }
      } else if (filterItem.type > 0) {
        this.showFilterIcon = true
      }
      if (filterItem.assignedto === -1) {
        filterItem.assignedtogroup = -1
        this.showFilterIcon = true
      } else if (filterItem.assignedto === null) {
        // this.showFilterIcon = false
      } else {
        if (filterItem.assignedto === this.userDetails._id && this.selectedTab !== 1) {
          this.showFilterIcon = true
        } else if (filterItem.assignedto !== this.userDetails._id && filterItem.assignedto !== -1) {
          this.showFilterIcon = true
        }
      }
      if (filterItem.category === -1) {
        filterItem.categorygroup = -1
        this.showFilterIcon = true
      } else if (filterItem.category === null) {
        // this.showFilterIcon = false
      } else {
        this.showFilterIcon = true
      }
      if (filterItem.priority === -1) {
        filterItem.prioritygroup = -1
        this.showFilterIcon = true
      } else if (filterItem.priority === null) {
        // this.showFilterIcon = false
      } else {
        this.showFilterIcon = true
      }
      this.listOfTickets = []
      if (this.selectedTab === 2) {
        filterItem.assignedto = -1
        filterItem.assignedtogroup = -1
      }
      if (this.$route.params.record_id !== null && this.$route.params.name !== null && this.moduleName !== this.ACCOUNT) {
        let moduleRelationObject = {
          id: this.$route.params.record_id,
          module: this.$route.params.name
        }
        filterItem.modulerelation = moduleRelationObject
      }
      // Account & module relation set
      if (this.fromSubmodule) {
        if (this.accountId) filterItem.account_id = this.accountId
        else if (this.moduleRelations) filterItem.modulerelation = this.moduleRelations
      }
      console.log(this.incident)
      filterItem.incidenttypeid = this.$route.params.incidentid
      this.$api.execute('post', 'incidentcustomerportal/paginate_filter', filterItem).then(({ data }) => {
        const { items, total } = data
        this.total = total
        items.forEach(x => {
          x.assignedto = x.assignedto ? `user_${x.assignedto}` : null
          x.assignedto_group = x.assignedto_group ? `group_${x.assignedto_group}` : null
          x.showEdit = x.showStatus = x.showAssignedTo = x.showCategory = x.showPriority = x.showAccount = false
          let mailfrom = x.mailfrom ? JSON.parse(x.mailfrom) : []
          x.mailfrom = mailfrom
        })
        this.backupTicketList = this.$formatter.cloneVariable(items)
        this.listOfTickets = items
      }).finally(() => {
        this.loading = false
        this.$root.$emit('enableorDisableTab', false)
        window.localStorage.removeItem('CRM_ticketStatusFilter')
        window.localStorage.setItem(`${this.localStoragePrefix}_TicketPagination`, JSON.stringify(this.pagination))
      })
      setTimeout(() => {
        if (this.isMountedCall) this.isMountedCall = false
        this.initKey++
      }, 500)
    },
    applyFilterBasedOnTicketTabFilter (filterItem) {
      let openStatus = this.getListOfTicketStatus.filter(x => x.incidenttypeid === this.incidenttypeid).filter(x => x.isopen).map(x => x._id)
      let closedStatus = this.getListOfTicketStatus.filter(x => x.incidenttypeid === this.incidenttypeid).filter(x => !x.isopen).map(x => x._id)
      let tabName = this.findTabName()
      switch (tabName) {
        case this.MY_ACTIVE:
          filterItem.status = openStatus
          break
        case this.OPEN_TICEKTS:
          filterItem.assignedto = this.userDetails._id
          filterItem.status = openStatus
          break
        case this.UNASSIGNED_TICEKTS:
          filterItem.assignedto = -1
          filterItem.assignedtogroup = -1
          filterItem.status = []
          break
        case this.CLOSED:
          filterItem.status = closedStatus
          break
        case this.ALL_TICKETS:
          if (this.$route.query.redirectfrom) { // if redirected from dashboard by widget click
            var status = window.localStorage.getItem('CRM_ticketStatusFilter') ? [window.localStorage.getItem('CRM_ticketStatusFilter')] : []
            filterItem.status = status.length > 0 ? status : []
          }
          break
      }
      this.setFilterValuesInMenuObject(filterItem)
      return filterItem
    },
    getAccountListValue () {
      let search = this.$formatter.cloneVariable(this.searchTerm)
      if (search) {
        this.skip = 0
        search = search.split('(')[0]
      } else {
        search = ''
      }
      this.$api.execute('get', `moduledata/Account/search?searchTerm=${search}`).then(({ data }) => {
        let records = data
        records.forEach((x) => {
          x.name = `${x.data.name}(${this.$t(x.data.type)})`
        })
        setTimeout(() => {
          this.getAccountListName = records
        }, 300)
      })
    },
    onIntersect (entries, observer, isIntersecting = true) {
      if (isIntersecting && this.isInitial) {
        this.getAccountListValue()
        this.isInitial++
      }
    },
    parseData (array) {
      let item = JSON.parse(array)
      let finalArray = []
      item.forEach(element => {
        finalArray.push(this.toLowerCaseKeys(element))
      })
      return finalArray
    },
    toLowerCaseKeys (obj) {
      return Object.keys(obj).reduce(function (accum, key) {
        accum[key.toLowerCase()] = obj[key]
        return accum
      }, {})
    },
    setFilterValuesInMenuObject (filterModel) {
      if (!this.fromSubmodule) {
        this.ticketSearchTerm = filterModel.search
        this.menu = this.$formatter.cloneVariable(filterModel)
        this.menu.menuassignedto = this.listOfUserMenu.findIndex(x => filterModel.assignedto && (String(filterModel.assignedto) === String(x.alternateid) || String(filterModel.assignedto).includes(x._id)))
        this.menu.menupriority = this.listOfPriorities.findIndex(x => filterModel.priority && x._id === filterModel.priority)
        this.menu.menucategory = this.listOfCategory.findIndex(x => filterModel.category && x._id === filterModel.category)
        let tabName = this.findTabName()
        if (tabName === this.ALL_TICKETS) {
          if (filterModel.status.length) {
            filterModel.status.forEach(element => {
              this.listOfStatus.forEach(status => { if (status.id === element) status.selected = true })
            })
          }
        }
      }
    },
    updateTickets (id, index, type) {
      let item = this.$formatter.cloneVariable(this.listOfTickets[index])
      let statusItem = this.getListOfTicketStatus.find(x => x._id === item.status)
      let model = {}
      let hideElement = ''
      if (type === 'status' && statusItem && statusItem.canclose && !item.assignedto && !item.assignedto_group) {
        this.statusItem = item
        this.cancloseDialog = true
      } else {
        switch (type) {
          case 'status': model = { status: item.status }
            hideElement = 'showStatus'
            break
          case 'assignedto':
            if (item.assignedto) {
              let assignedTo = item.assignedto.split('_')
              if (assignedTo[0] === 'user') {
                model = { assignedto: assignedTo[1], assignedto_group: null }
              } else model = { assignedto_group: assignedTo[1], assignedto: null }
              // if item.status === process.env.VUE_APP_TICKET_STAUS_NEW) model = { ...model, status: process.env.VUE_APP_TICKET_STAUS_INPROGRESS }
              hideElement = 'showAssignedTo'
            }
            break
          case 'priority': model = { priority: item.priority }
            hideElement = 'showPriority'
            break
          case 'category': model = { category_id: item.category_id }
            hideElement = 'showCategory'
            break
          case 'account': model = { account_id: item.account_id }
            hideElement = 'showAccount'
            break
        }
        this.listOfTickets[index][hideElement] = false
        this.listOfTickets[index].modifiedbyname = this.userDetails.name
        this.listOfTickets[index].modified_at = this.$moment().format(`${this.userDetails.dateformat} HH:mm`)
        this.updateTicketsAction(id, model, type, index)
      }
    },
    updateTicketsAction (id, model, type, index) {
      this.cancloseLoading = true
      this.$api.execute('post', `tickets/update_from_inline/${id}`, model).then(response => {
        this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'updatedSuccess' })
        this.sendNotification(index, type)
      }).finally(() => {
        this.cancloseDialog = false
        this.cancloseLoading = false
        this.getListHandler()
      })
    },
    updateCanCloseStatusHandler () {
      let index = this.listOfTickets.findIndex(x => x.id === this.statusItem.id)
      const model = {
        status: this.statusItem.status,
        assignedto: this.userDetails._id
      }
      this.updateTicketsAction(this.statusItem.id, model, 'status', index)
      this.listOfTickets.find(x => {
        if (x.id === this.statusItem.id) {
          x.showStatus = false
        }
      })
    },
    closeConfirmDialog () {
      this.cancloseDialog = false
      this.listOfTickets.find(x => {
        if (x.id === this.statusItem.ticketid) {
          x.showStatus = false
        }
      })
      this.statusItem = {}
    },
    showEditHandler (index) {
      this.listOfTickets[index].showEdit = true
      let item = this.$formatter.cloneVariable(this.listOfTickets[index])
      this.editTicketItems.push(item)
    },
    hideEditHandler (index) {
      this.listOfTickets[index].showEdit = false
    },
    sendNotification (index, type) {
      const item = this.$formatter.cloneVariable(this.listOfTickets[index])
      let matchingItem = this.backupTicketList.find(x => x.id === item.id)
      let msg = ''
      if (item.assignedto) {
        let assignedTo = this.$formatter.cloneVariable(item.assignedto.split('_'))
        switch (type) {
          case 'status':
            let oldStatus = this.getListOfTicketStatus.find(x => x._id === matchingItem.status)
            let newStatus = this.getListOfTicketStatus.find(x => x._id === item.status)
            item.statusname = newStatus.name
            item.statuscolor = newStatus.color
            this.$set(this.listOfTickets, index, item)
            if (!oldStatus) msg = `${this.$t('statusSet')} ${newStatus.name} ${this.$t('for')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
            else msg = `${this.$t('statusChanged')} ${oldStatus.name} ${this.$t('to')} ${newStatus.name} ${this.$t('for')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
            break
          case 'assignedto':
            if (assignedTo && assignedTo[0] === 'group') {
              let assignedToList = this.listOfUserAndGroups.find(x => x.alternateid === `${item.assignedto}`)
              if (assignedTo) {
                this.listOfTickets[index].assignedto_group_name = assignedToList.name
                this.listOfTickets[index].assignedtoname = ''
                // this.sendAssignedNotification(matchingItem.number, assignedToList.name, assignedto, item.id)
              }
            } else {
              let assignedToList = this.listOfUserAndGroups.find(x => x.alternateid === `${item.assignedto}`)
              if (assignedToList) {
                this.listOfTickets[index].assignedtoname = assignedToList.name
                this.listOfTickets[index].assignedto_group_name = ''
              }
              msg = `${this.$t('assignedtoMessage')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
              // this.getsignalRConnection.invoke('SendNotification', [assignedTo[1]], msg, item.id)
            }
            break
          case 'priority':
            if (item.priority !== matchingItem.priority) {
              let oldPriority = this.getListOfTicketPriorities.find(x => x._id === matchingItem.priority)
              let newPriority = this.getListOfTicketPriorities.find(x => x._id === item.priority)
              if (!oldPriority) msg = `${this.$t('prioritySet')} ${newPriority.name} ${this.$t('for')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
              else msg = `${this.$t('priorityChanged')} ${oldPriority.name} ${this.$t('to')} ${newPriority.name} ${this.$t('for')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
              item.priorityname = newPriority.name
              item.prioritycolor = newPriority.color
              this.$set(this.listOfTickets, index, item)
            }
            break
          case 'category':
            if (item.category_id !== matchingItem.category_id) {
              let oldCategory = this.getListOfTicketCategory.find(x => x._id === matchingItem.category_id)
              let newCategory = this.getListOfTicketCategory.find(x => x._id === item.category_id)
              item.categoryname = newCategory.name
              this.$set(this.listOfTickets, index, item)
              if (!oldCategory) msg = `${this.$t('categorySet')} ${newCategory.name} ${this.$t('for')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
              else msg = `${this.$t('categoryChanged')} ${oldCategory.name} ${this.$t('to')} ${newCategory.name} ${this.$t('for')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
            }
            break
          case 'account':
            if (item.account_id !== matchingItem.account_id) {
              let oldAccount = this.getAccountListName.find(x => x._id === matchingItem.account_id)
              let newAccount = this.getAccountListName.find(x => x._id === item.account_id)
              item.accountname = newAccount.data.name
              this.$set(this.listOfTickets, index, item)
              if (!oldAccount) msg = `${this.$t('accountSet')} ${newAccount.data.name} ${this.$t('for')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
              else msg = `${this.$t('accountChanged')} ${oldAccount.data.name} ${this.$t('to')} ${newAccount.data.name} ${this.$t('for')} ${matchingItem.number} ${this.$t('by')} ${this.userDetails.name}`
            }
            break
        }
      }
      if (item.assignedto || item.assignedto_group) {
        let value = item.assignedto ? item.assignedto : item.assignedto_group
        let assignedTo = this.$formatter.cloneVariable(value.split('_'))
        if (item.assignedto && assignedTo[0] !== 'group') {
          if (this.userDetails._id !== item.assignedto[1]) {
            if (this.getsignalRConnection && this.getsignalRConnection.invoke) {
              this.getsignalRConnection.invoke('SendTicketNotification', [assignedTo[1]], msg, item.id, item.mailboxid, item.outlookconversationid)
            }
          }
        } else {
          if (this.userDetails._id !== item.assignedto && type !== 'assignedto' && item.assignedto) {
            // let query  { filter: `groupid eq ${assignedTo[1]} and isactive eq 1` }
            // let usersarray = []
            // this.$api.execute('get', `usergroups/get_by_group/${assignedTo[1]}`).then(result => {
            //   usersarray = result.data.map(x => x.user_id)
            // }).finally(() => {
            //   this.getsignalRConnection.invoke('SendNotification', usersarray, msg, item.id)
            // })
          }
        }
      }
    },
    sendAssignedNotification (number, groupName, grouId, ticketid) {
      // let msg  `${groupName} is assigned for ${number} by ${this.userDetails.name}`
      // let usersarray = []
      // console.log(number, groupName, grouId, ticketid)
      // this.$api.execute('get', `usergroups/get_by_group/${grouId}`).then(result => {
      //   usersarray = result.data.map(x => x.user_id)
      // }).finally(() => {
      //   this.getsignalRConnection.invoke('SendNotification', usersarray, msg, ticketid)
      // })
    },
    menuActions (value) {
      if (value) {
        switch (value) {
          case 'merge':
            this.mergeDialogHandler()
            break
          case 'changeStatus':
            this.actionsHandler('statusDialog')
            break
          case 'changePriority':
            this.actionsHandler('priorityDialog')
            break
          case 'assignTo':
            this.actionsHandler('assignedDialog')
            break
          case 'delete':
            this.actionsHandler('deleteDialog')
        }
      }
    },
    clearFilter (type, id) {
      switch (type) {
        case 'assignedto':
          this.setUserFilter = false
          this.filter.assignedto = 0
          setTimeout(() => {
            this.closeUserFilter = false
          })
          break
        case 'priority':
          this.setPriority = false
          this.filter.priority = 0
          setTimeout(() => {
            this.closeUserFilter = false
          })
          break
        case 'status':
          this.setStatus = false
          this.filter.status = []
          this.listOfStatus.map(element => { element.selected = false })
          setTimeout(() => {
            this.closeStatusFilter = false
          })
          break
        case 'category':
          this.filter.category = 0
          setTimeout(() => { this.closeCategoryFilter = false })
          break
        case 'type':
          this.filter.type = 0
          setTimeout(() => { this.closeTypeFilter = false })
          break
      }
      if (this.filter.assignedto === 0 && this.filter.priority === 0 && this.filter.status.length === 0 && this.filter.category === 0 && this.filter.type === 0) {
        this.showFilterIcon = false
      }
    },
    setFilter (type, id, set) {
      switch (type) {
        case 'assignedto':
          this.setUserFilter = true
          this.closeUserFilter = false
          break
        case 'priority':
          this.setPriority = true
          this.closePriorityFilter = false
          break
        case 'status':
          this.setStatus = true
          this.closeStatusFilter = false
          break
        case 'category':
          this.setCategory = true
          this.closeCategoryFilter = false
          break
        case 'type':
          this.setType = true
          this.closeTypeFilter = false
      }
    },
    addToSelected (event, item) {
      if (event) {
        this.selected.push(item)
      } else {
        const result = this.selected.filter(x => x.id !== item.id)
        if (result) {
          this.selected = result
        }
      }
    },
    getSelectedName (type, filter, list) {
      let result = {}
      if (type === 'assignedto') {
        // list = [ ...this.listOfUsersForFilter, ...this.getListOfGroups]
        list = [ ...this.listOfUsersForFilter, ...this.getUserGroups ]
        result = list.find(x => x.alternateid === this.filter[type])
        if (result) return result.name
        else return ''
      } else if (type === 'status') {
        if (this.selectedTab === 4 && this.filter.status && this.filter.status.length) {
          this.showFilterIcon = true
        }
        let resultStatus = this.listOfStatusForFilter.find(x => x._id === this.filter.status[0])
        if (resultStatus) {
          if (this.filter.status.length > 1) return ` ${resultStatus.name} (+${this.filter.status.length - 1} others)`
          else return `${resultStatus.name}(${this.filter.status.length})`
        } else return ''
      } else {
        result = this[list].find(x => x._id === this.filter[type])
        if (result) return result.name
        else return ''
      }
    },
    navigateToTicket (id, mailboxid, convoid) {
      console.log(this.incident)
      this.$router.push({ path: `/incident/action/${this.incident.name}/${this.incident._id}/${id}` })
    },
    findTabName () {
      switch (this.selectedTab) {
        case 0: return this.MY_ACTIVE
        case 1: return this.OPEN_TICEKTS
        case 2: return this.UNASSIGNED_TICEKTS
        case 3: return this.CLOSED
        case 4: return this.ALL_TICKETS
      }
    },
    mergeDialogHandler () {
      if (this.selected.length >= 2) {
        const items = this.$formatter.cloneVariable(this.selected)
        this.mergeItems = items
        this.mergeTicketDialog = true
      } else {
        this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'selectTickets' })
      }
    },
    closeConfirmDialog () {
      if (this.archiveItem.id) {
        this.$root.$emit('closeEdit', { ticketid: this.archiveItem.id })
      }
      this.cancloseDialog = false
    },
    actionsHandler (type) {
      let list = this.$formatter.cloneVariable(this.getUsers)
      let groups = this.$formatter.cloneVariable(this.getListOfGroups)
      let users = [ ...list, ...groups ]
      this.usersAndGroupsList = users
      if (this.selected.length) this[type] = true
      else this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'selectTickets' })
    },
    mergeTicketHandler () {
      const model = {}
      model.parentticketid = this.parentticketid
      model.childticketids = this.mergeItems.filter(x => x.id !== model.parentticketid).map(x => x.id)
      this.$api.execute('post', 'mails/merge_mail', model).then(response => {
        this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'mergeSuccess' })
        this.closeMergeDialogHandler()
        this.$root.$emit('loadTickets')
      })
    },
    closeMergeDialogHandler () {
      this.mergeItems = []
      this.parentticketid = 0
      this.mergeTicketDialog = false
    },
    changedStatusHandler (setCurrentUser) {
      const model = {}
      this.statusLoading = true
      let idsArray = this.selected
      model.ids = idsArray.map(x => x.id)
      model.parameters = { status: this.changedStatusId, assignedto: setCurrentUser ? this.userDetails._id : undefined }
      let status = this.getListOfTicketStatus.find(x => x._id === this.changedStatusId)
      this.$api.execute('put', 'tickets/bulk_update', model).then(response => {
        this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'updatedSuccess' })
        if (setCurrentUser) this.cancloseDialog = false
        idsArray.forEach(element => {
          let msg = `Status set to ${status.name} for ${element.number} by ${this.userDetails.name}`
          if (this.userDetails._id !== element.assignedto) {
            if (this.getsignalRConnection && this.getsignalRConnection.invoke) {
              this.getsignalRConnection.invoke('SendNotification', [element.assignedto], msg, element.id)
            }
          }
        })
        this.statusLoading = false
        this.closeStatusDialogHandler()
        this.$root.$emit('loadTickets')
      })
    },
    closeStatusDialogHandler () {
      this.changedStatusId = 0
      this.statusDialog = false
    },
    changedPriorityHandler () {
      const model = {}
      let idsArray = this.selected
      model.ids = idsArray.map(x => x.id)
      model.parameters = { priority: this.changedPriorityId }
      let priority = this.getListOfTicketPriorities.find(x => x._id === this.changedPriorityId)
      this.$api.execute('put', 'tickets/bulk_update', model).then(response => {
        this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'updatedSuccess' })
        idsArray.forEach(element => {
          let msg = `Priority set to ${priority.name} for ${element.number} by ${this.userDetails.name}`
          if (this.userDetails.id !== element.assignedto) {
            if (this.getsignalRConnection && this.getsignalRConnection.invoke) {
              this.getsignalRConnection.invoke('SendNotification', [element.assignedto], msg, element.id)
            }
          }
        })
        this.closePriorityDialogHandler()
        this.$root.$emit('loadTickets')
      })
    },
    closePriorityDialogHandler () {
      this.changedPriorityId = 0
      this.priorityDialog = false
    },
    changeAssignedtoHandler () {
      if (this.$refs.assignedToRef && this.$refs.assignedToRef.validate()) {
        let assignedToModel = {}
        let model = {}
        let idsArray = this.selected
        let assignedTo = this.assignedtoId.split('_')
        if (assignedTo[0] === 'user') {
          assignedToModel.assignedto = assignedTo[1]
          assignedToModel.assignedto_group = null
        } else {
          assignedToModel.assignedto_group = assignedTo[1]
          assignedToModel.assignedto = null
        }
        model.ids = idsArray.map(x => x.id)
        model.parameters = assignedToModel
        this.$api.execute('put', 'tickets/bulk_update', model).then(response => {
          this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'updatedSuccess' })
          this.closeAssignedtoDialogHandler()
          idsArray.forEach(element => {
            let msg = `${this.$t('assignedtoMessage')} ${element.number} ${this.$t('by')} ${this.userDetails.name}`
            if (this.userDetails.id !== model.parameters.assignedto) {
              if (this.getsignalRConnection && this.getsignalRConnection.invoke) {
                this.getsignalRConnection.invoke('SendNotification', [model.parameters.assignedto], msg, element.id)
              }
            }
          })
          this.$root.$emit('loadTickets')
        })
      }
    },
    closeAssignedtoDialogHandler () {
      this.assignedtoId = 0
      this.assignedDialog = false
    },
    deleteHandler () {
      let array = this.selected
      const ids = array.map(x => x.id)
      let modelObj = { data: { ids: ids, delete_mails: this.deleteMails } }
      this.$api.execute('delete', `${this.MODULE_URL}/delete_multiple`, modelObj)
        .then(response => {
          if (response && response.data) {
            let text = this.$t('deleteMsg')
            this.$root.$emit('snackbar', { snackbar: true, color: 'success', text })
            this.closeDeleteDialogHandler()
            this.$root.$emit('loadTickets')
          }
        })
    },
    closeDeleteDialogHandler () {
      this.deleteMails = false
      this.deleteDialog = false
    },
    storePath (type) {
      window.localStorage.setItem('pathHistory', JSON.stringify({ path: this.$route.path, module: this.$route.params.name, name: this.usersData && this.usersData.data ? this.usersData.data.name : null }))
      // if (type) this.$router.push({ path: '/tickets/create', query: { type: 'task', fromModule: this.$route.params.name, recordId: this.recordId } })
      // else this.$router.push(this.fromSubmodule ? { path: '/tickets/create', query: { fromModule: this.$route.params.name, recordId: this.recordId } } : '/tickets/create')
      this.$router.push(`/tickets/create?incidenttypeid=${this.incident._id}&incidenttype=${this.incident.name.toLowerCase()}`)
    },
    clearSelected () {
      this.selected = []
    },
    openCommentsDialog (id) {
      this.commentsDialog = true
      this.reloadCommentDialog++
      this.ticketId = id
    },
    reloadCommentCount () {
      this.reloadCommentDialog++
      this.getListHandler()
    },
    showAccount (index) {
      if (!this.listOfTickets[index].showAccount) {
        this.listOfTickets[index].showAccount = true
        if (this.listOfTickets[index].account_id) {
          this.getAccountListName = []
          this.getAccountListName.push({ _id: this.listOfTickets[index].account_id, name: `${this.listOfTickets[index].account_name} ${this.listOfTickets[index].account_type ? `(${this.$t(this.listOfTickets[index].account_type)})` : ''}` })
        }
      }
    },
    getIncidentDetails () {
      // console.log(this.incidenttypeid);
      this.$api.execute('get', `incidentcustomerportal/get_incidents_by_type/${this.$route.params.incidentid}`)
      .then(({data}) => {
        this.incident = data
      })
    }
  },
  beforeDestroy () {
    clearInterval(this.intervalId)
    this.$root.$off('closeEdit')
    this.$root.$off('mailboxChanged')
    this.$root.$off('loadTickets')
    this.$root.$off('enableorDisableTab')
    this.$root.$off('showStatusDialog')
  }
}
</script>
<style>
.checkboxPaddingTicket .v-input--selection-controls {
  padding-top: 0px !important;
  margin-top: 0px !important;
}
.checkboxPaddingTicket .v-text-field--full-width input{
  margin-top: 0 !important;
}
.checkboxPaddingTicket .v-text-field--full-width > .v-input__control > .v-input__slot {
  min-height: auto !important;
}
.checkboxPaddingTicket .v-text-field.v-text-field--enclosed .v-input__append-inner {
  margin-top: 3px !important;
 }
.checkboxPaddingTicket .v-text-field.v-text-field--enclosed > .v-input__control > .v-input__slot {
  padding: 0 !important;
  font-size: 14px;
}
.checkboxPaddingTicket tbody tr:hover:not(.v-data-table__expanded__content) {
  background: none !important;
}
.checkboxPaddingTicket tbody > tr > td, .checkboxPaddingTicket tbody > tr > th,  .checkboxPaddingTicket  thead > tr > td, .checkboxPaddingTicket thead > tr > th,  .checkboxPaddingTicket  tfoot > tr > td,  .checkboxPaddingTicket tfoot > tr > th {
    padding: 0 7px !important;
    font-size: 0.83rem !important;
    transition: height 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}
.overflow-td {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.underline {
  text-decoration: underline;
}
.select-font {
  font-size: small;
}
.search-hint-padding div.v-text-field__details {
  padding: 0 3px !important;
  margin-bottom: 0px !important;
  background-color: #ebebeb;
}
.search-hint-padding .v-input__control .v-input__slot {
  margin-bottom: 0px !important;
}
.common .v-data-table__wrapper {
  max-height: 100vh; /* Set height to 100% of viewport height */
  overflow-y: auto; /* Allow vertical scrolling */
}
@media (min-width: 960px) and (max-width: 1980px) {
  .common .v-data-table__wrapper {
    max-height: calc(84vh - 64px); /* Adjust height for large screens, accounting for other elements like header/footer */
  }
}

/* Styles for extra-large screens (xl) */
@media (min-width: 1981px) {
  .common .v-data-table__wrapper {
    max-height: calc(88vh - 64px); /* Adjust height for extra-large screens, accounting for other elements like header/footer */
  }
}

.dark-theme .v-data-table-header tr th {
  background-color: black !important;
}
.custom_z-position {
  z-index: 3;
}
.checkboxPaddingTicket .v-data-table-header th {
  font-size: 15px !important;
  color: #3c3c3c !important;
  /* background-color: #c9c9c9 !important; */
}
.search-hint-padding {
  width: 500px;
}
.ticketToolbar {
  background-color: rgb(232, 232, 232) !important;
}
.iconStyle {
  margin-bottom: 1px;
}
</style>
