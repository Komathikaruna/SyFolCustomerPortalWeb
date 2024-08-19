<!-- eslint-disable no-prototype-builtins -->
<template>
  <div class="pa-1">
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
      <v-progress-linear indeterminate color="primary" v-if="fieldsLoading"></v-progress-linear>
      <form-template :references.sync="formReferences" :model="ticketObj" ref="ticketReference">
        <template slot="ticketCustomFields">
          <v-container class="grid-list-xl pa-1 my-4">
            <module-render :listOfFields="listOfFields" :key="reInit" :fields.sync="customFieldsDataModel" :isRecordCreation="true" :moduleName="moduleName" :isCreateTicket="true" @files-uploaded="handleFiles" ref="ticketReference12"></module-render>
          </v-container>
        </template>
        <template slot="extraDetails">
          <v-container class="grid-list-xl pa-0">
            <v-checkbox v-model="customFieldsDataModel.deleteparentticket" :label="$t('ticketDeleteConfirm')" class="pb-1" hide-details v-if="$route.query && $route.query.converttask"></v-checkbox>
            <v-checkbox v-model="customFieldsDataModel.deleteparenttask" :label="$t('taskDeleteConfirm')" class="pb-1" hide-details v-if="$route.query && $route.query.convertticket"></v-checkbox>
          </v-container>
        </template>
      </form-template>
    </v-main>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import FormTemplate from '../../components/FormTemplate'
// import Editor from '../../ckeditor'
import CommonFunctions from './mixin'
export default {
  mixins: [CommonFunctions],
  data () {
    return {
      MODULE_URL: 'tickets',
      type: this.$route.query.type === 'task',
      ticketObj: {
        // body: `<br><div class="content"><iframe id="userSignFooter" frameborder="0" width="100%"></iframe></div>`
        body: ''
      },
      loading: false,
      // editor: Editor,
      loader: false,
      emailRegex: /^([A-Za-z0-9_\-.+])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,})$/,
      listOfAccounts: [],
      isLoading: false,
      accountLoading: false,

      enableSearch: true,
      render: 0,
      modulesRelated: [],
      attachmentsList: [],
      attachmentsFiles: [],
      listOfFiles: [],
      listOfOtherFiles: [],
      listOfProjects: [],
      projectLoader: false,
      hasSearchResults: true,
      listOfEmailSuggestions: [],
      toEmailSuggestionLoading: false,
      ccEmailSuggestionLoading: false,
      bccEmailSuggestionLoading: false,
      debouncedGetEmailSuggestions: null,
      debouncedModuleRelationListSearch: null,
      filelist: [],
      sharepoint: {},
      hideDragFile: false,
      noFileSelect: false,
      attachmentsDialog: false,
      currentItem: null,
      typeOfFileInput: null,
      debouncedAccountListLoading: null,
      listOfFields: [],
      customFieldsDataModel: {},
      moduleName: 'tickets',
      externalFieldNames: [],
      fieldsLoading: false,
      reInit: 0
    }
  },
  components: {
    FormTemplate,
    'module-render': () => import('@/components/Modules/ModuleFormRender')
  },
  computed: {
    ...mapGetters(['formType', 'getUsers', 'getListOfMailboxes', 'getListOfTicketPriorities', 'getListOfTicketStatus', 'getListOfTicketCategory',
      'getsignalRConnection', 'getListOfGroups', 'listOfModules', 'userDetails', 'getUserGroups']),
    formReferences () {
      return {
        backButtonFromTickets: true,
        hideCloseButton: true,
        title: this.$route.query.type === 'task' || this.type === 'task' ? this.$t('createTask') : this.$t('createTicket'),
        hideColor: true,
        flat: true,
        buttons: [{
          name: 'action_handler',
          color: 'success',
          label: this.ticketObj.id ? this.$t('update') : this.$t('save'),
          click: this.saveUpdateHandler,
          loading: this.loader,
          is_show: true
        }]
      }
    },
    getUsersAndGroups () {
      let userList = this.$formatter.cloneVariable(this.getUsers)
      let groupList = this.$formatter.cloneVariable(this.getUserGroups)
      return [ ...userList, ...groupList ]
    },
    getAccountSubModules () {
      const accountModule = this.listOfModules.find(x => x.name === this.ACCOUNT)
      const accountSubmodules = accountModule ? (accountModule.submodule || []) : []
      return accountSubmodules
    }
  },
  async mounted () {
    this.$store.dispatch('getUsers')
    let ticketInfo = JSON.parse(window.localStorage.getItem('taskOrTicketInfo'))
    if (this.$route.query && this.$route.query.type && this.$route.query.type === 'task') {
      this.ticketObj.is_task = this.customFieldsDataModel.is_task = true
    } else {
      this.ticketObj.is_task = this.customFieldsDataModel.is_task = false
    }
    if (ticketInfo && this.$route.query && (!!this.$route.query.converttask || !!this.$route.query.convertticket)) {
      let query = this.$route.query
      // Load to modules related to tickets
      let modulesRelated = this.listOfModules.filter(x => x.include_ticket && x.isactive && (x.name !== this.ACCOUNT)) // since account is hard coded hide from here
      this.modulesRelated = this.$formatter.cloneVariable(modulesRelated)
      let ticketObj = {
        ...ticketInfo,
        is_task: !query.convertticket,
        parenttaskid: query.convertticket ? ticketInfo._id : undefined,
        deleteparenttask: query.convertticket ? false : undefined,
        deleteparentticket: query.converttask ? false : undefined,
        parentticketid: query.converttask ? ticketInfo._id : undefined,
        to: null,
        cc: '',
        bcc: '',
        from: '',
        _id: null,
        mailboxid: this.$route.query.mailboxid ? this.$route.query.mailboxid : null
      }
      // this.loadValues()
      this.type = query.convertticket ? 'ticket' : 'task'
      if (ticketInfo.modulerelations && ticketInfo.modulerelations.length > 0) {
        this.modulesRelated.forEach(element => { // Set Related module values
          let result = ticketInfo.modulerelations.find(x => x.module === element.name)
          if (result) element.selectedValue = result._id
        })
      }
      this.ticketObj = Object.assign({}, this.ticketObj, ticketObj)
      this.customFieldsDataModel = Object.assign({}, this.customFieldsDataModel, ticketObj)
      // setTimeout(() => {
      //   this.loadModuleRelationsSelectedItems()
      // }, 200)
    }
    if (this.modulesRelated.length && this.$route.query && this.$route.query.fromModule && this.$route.query) {
      // Set the record in the field by default
      await this.setModuleRecordInTheField(this.$route.query)
    }
    //  Set the defualt value in the mailbox automcomplete box
    // this.$store.dispatch('getMailbox').then(() => {
    //   if (this.getListOfMailboxes.length === 1) {
    //     this.ticketObj.mailboxid = this.getListOfMailboxes[0]._id
    //   } else {
    //     this.setDefaultValues({ prop: 'mailboxid', list: this.getListOfMailboxes })
    //   }
    // })
    this.$store.dispatch('getTicketStatus').then(() => {
      if (!this.$route.query.converttask && !this.$route.query.convertticket) this.setDefaultValues({ prop: 'status', list: this.getListOfTicketStatus.filter(x => x.incidenttypeid === this.$route.query.incidenttypeid) })
    })
    this.$store.dispatch('getTicketPriority').then(() => {
      if (this.$route.query && (!this.$route.query.converttask && !this.$route.query.convertticket)) this.setDefaultValues({ prop: 'priority', list: this.getListOfTicketPriorities.filter(x => x.incidenttypeid === this.$route.query.incidenttypeid) })
    })
    this.$store.dispatch('getTicketCategory').then(() => {
      if (this.$route.query && (!this.$route.query.converttask && !this.$route.query.convertticket)) this.setDefaultValues({ prop: 'category_id', list: this.getListOfTicketCategory.filter(x => x.incidenttypeid === this.$route.query.incidenttypeid) })
      setTimeout(() => {
        this.getCustomTicketFields(ticketInfo)
      }, 100)
    })
  },
  methods: {
    handleFiles (files) {
      this.attachmentsFiles = files
    },
    setDefaultValues (data) {
      let { list, prop } = data
      let item = list.find(x => x.isdefault)
      if (item) {
        this.ticketObj[prop] = item._id
      }
    },
    supportingList (type, text) {
      text = this.$refs.ticketReference.$refs[text][0].lazySearch
      let model = { module: type, dialog: true, text }
      this.$store.commit('supportingList', model)
    },
    loadAccountList ($event) {
      if ($event && this.$formatter.hasliveSearchRestrictedKeycodes($event)) return
      const searchTerm = ($event && $event.target) ? $event.target.value : ''
      if (!searchTerm.includes('-')) {
        this.accountLoading = true
        this.listOfAccounts = []
        const model = {
          searchterm: searchTerm || ''
        }
        this.$api.execute('get', `moduledata/${this.ACCOUNT}/live_search_for_dropdown?searchterm=${model.searchterm || ''}&relation_module=${''}&relation_id=${''}`).then((response) => {
          this.listOfAccounts = response.data
        }).finally(() => {
          this.accountLoading = false
        })
      }
    },
    async saveUpdateHandler () {
      if (this.$refs.ticketReference.$refs.validateForm.validate()) {
        let ticketObj = this.$formatter.cloneVariable(this.ticketObj)
        ticketObj.body = ticketObj.body.replace('<div class="content"><iframe width="100%" frameborder="0" id="userSignFooter"> </iframe></div>', '')
        let to = this.ticketObj.to ? ticketObj.to : []
        let cc = ticketObj.cc ? ticketObj.cc : []
        let bcc = this.ticketObj.bcc ? ticketObj.bcc : []
        if (!this.type) {
          let arrayOfEmails = [...to, ...cc, ...bcc]
          if (arrayOfEmails.length > 0) {
            for (let email of arrayOfEmails) {
              if (!this.emailRegex.test(email)) {
                this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'invalidEmail' })
                return false
              }
            }
          }
        }
        if (!this.$route.query.converttask) {
          let formattedto = to.map(email => ({
            emailaddress: {
              address: email,
              name: ''
            }
          }))
          ticketObj.toRecipients = formattedto
          ticketObj.body = ticketObj.mailbody
          if (this.$route.query.convertticket) {
            ticketObj.body = ticketObj.mailbody
          }
          if (this.$route.query.type) {
            ticketObj.body = ticketObj.mailbody
          }
        } else {
          ticketObj.body = ticketObj.mailbody
          ticketObj.to = []
          ticketObj.mailboxid = this.$route.query.mailboxid
          ticketObj.outlookconversationid = this.$route.query.conversationid
        }
        let formattedcc = cc.map(email => ({
          emailaddress: {
            address: email,
            name: ''
          }
        }))
        ticketObj.ccRecipients = formattedcc
        let formattedbcc = bcc.map(email => ({
          emailaddress: {
            address: email,
            name: ''
          }
        }))
        ticketObj.bccRecipients = formattedbcc
        this.loader = true
        let url = `${this.MODULE_URL}/create_ticket_through_graphapi`
        let model = ticketObj
        model.tags = JSON.stringify(model.tags)
        let assignedTo = []
        // this.customFieldsDataModel.assignedto = ''
        if (this.customFieldsDataModel.assignedto) {
          assignedTo = this.customFieldsDataModel.assignedto.split('_')
          if (assignedTo[0] === 'user') {
            this.customFieldsDataModel.assignedto = assignedTo[1]
            this.customFieldsDataModel.assignedto_group = null
          } else {
            this.customFieldsDataModel.assignedto = null
            this.customFieldsDataModel.assignedto_group = assignedTo[1]
          }
        }
        let modelRelatedModule = this.$formatter.cloneVariable(this.modulesRelated)
        model.modulerelations = []
        // If any module as ticket relation
        if (modelRelatedModule.length > 0) {
          model.modulerelations = modelRelatedModule.map(x => { return { id: x.selectedValue, module: x.name } }).filter(x => x.id)
        }
        var formData = new FormData()
        if (this.attachmentsFiles && this.attachmentsFiles.length) {
          var filesList = this.attachmentsFiles
          if (filesList !== null && filesList.length) {
            filesList.forEach(file => {
              if (!file.is_sharepoint) {
                formData.append(file.name, file)
              } else {
                formData.append(file.id, file)
              }
              // formData.append(file.name, file)
            })
          }
        }
        if (this.$route.query.incidentid !== 'ticket') {
          this.ticketObj.is_task = true
        }
        if (this.ticketObj.is_task) {
          this.$api.execute('post', 'mailattachments/upload', formData).then(response => {
            if (response.data && response.data.length > 0) {
              let attachmentIds = response.data.map(x => x._id)
              // resolve(attachmentIds)
              this.$set(model, 'attachments', attachmentIds)
            }
          })
        } else {
          model.attachments = []
        }
        // eslint-disable-next-line no-prototype-builtins
        if (this.customFieldsDataModel.hasOwnProperty('to') && Array.isArray(this.customFieldsDataModel.to)) {
          // Map the 'to' array of objects to an array of email addresses
          this.customFieldsDataModel.toRecipients = this.customFieldsDataModel.to.map(email => ({
            emailaddress: {
              address: email.emailaddress,
              name: ''
            }
          }))
          this.customFieldsDataModel.to = this.customFieldsDataModel.to.map(item => item.emailaddress)
        }
        // eslint-disable-next-line no-prototype-builtins
        if (this.customFieldsDataModel.hasOwnProperty('cc') && Array.isArray(this.customFieldsDataModel.cc)) {
          // Map the 'to' array of objects to an array of email addresses
          this.customFieldsDataModel.ccRecipients = this.customFieldsDataModel.cc.map(email => ({
            emailaddress: {
              address: email.emailaddress,
              name: ''
            }
          }))
          this.customFieldsDataModel.cc = this.customFieldsDataModel.cc.map(item => item.emailaddress)
        } else {
          this.customFieldsDataModel.ccRecipients = []
          this.customFieldsDataModel.cc = []
        }
        // eslint-disable-next-line no-prototype-builtins
        if (this.customFieldsDataModel.hasOwnProperty('bcc') && Array.isArray(this.customFieldsDataModel.bcc)) {
          // Map the 'to' array of objects to an array of email addresses
          this.customFieldsDataModel.bccRecipients = this.customFieldsDataModel.bcc.map(email => ({
            emailaddress: {
              address: email.emailaddress,
              name: ''
            }
          }))
          this.customFieldsDataModel.bcc = this.customFieldsDataModel.bcc.map(item => item.emailaddress)
        } else {
          this.customFieldsDataModel.bccRecipients = []
          this.customFieldsDataModel.bcc = []
        }
        this.customFieldsDataModel.customfields = this.customFieldsDataModel.customfieldsdata
        this.customFieldsDataModel.modulerelations = []
        setTimeout(() => {
          let moduleFields = this.listOfFields.filter(x => x.moduleid)
          for (const field of moduleFields) {
            const fieldName = field.name
            // eslint-disable-next-line no-prototype-builtins
            if (this.customFieldsDataModel.customfields.hasOwnProperty(fieldName)) {
              if (this.customFieldsDataModel.customfields[fieldName]) {
                if (fieldName === 'account_id') this.customFieldsDataModel.account_id = this.customFieldsDataModel.customfields[fieldName]
                this.customFieldsDataModel.modulerelations.push({
                  id: this.customFieldsDataModel.customfields[fieldName],
                  module: fieldName === 'account_id' ? 'Account' : fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
                })
              }
            }
          }
          let otherFields = this.listOfFields.filter(x => !x.is_internal && !x.moduleid)
          for (const field of otherFields) {
            this.customFieldsDataModel.customfieldsdata[field.name] = this.customFieldsDataModel[field.name]
          }
          this.customFieldsDataModel.customfields = this.customFieldsDataModel.customfieldsdata
          this.customFieldsDataModel.attachments = model.attachments
          if (this.$route.query.incidenttype !== 'ticket') {
            this.customFieldsDataModel.is_task = true
          }
          this.customFieldsDataModel.incidenttypeid = this.$route.query.incidenttypeid
          formData.append('model', JSON.stringify(this.customFieldsDataModel))
          this.$api.saveUpdateHandler(url, formData).then(response => {
            this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'addedSucess' })
            this.$router.push({ path: `/${this.MODULE_URL}/actions/${response._id}`, query: { mailboxid: response.mailboxid, conversationid: response.outlookconversationid, incidenttypeid: this.$route.query.incidenttypeid } })
            window.localStorage.removeItem('taskOrTicketInfo')
            if (model.assignedTo && this.userDetails._id !== model.assignedto) {
              let msg = ''
              if (assignedTo[0] === 'user') {
                msg = `${this.$t('assignedtoMessage')} ${response.number} ${this.$t('by')} ${this.userDetails.name}`
                if (this.getsignalRConnection && this.getsignalRConnection.invoke) {
                  this.getsignalRConnection.invoke('SendNotification', [assignedTo[1]], msg, response._id)
                }
              } else {
                // let item  this.getListOfGroups.find(x => x.id == assignedTo[1])
                // let usersarray = []
                // let query = { filter: `groupid eq ${assignedTo[1]} and isactive eq 1` }
                // msg = `${item.name} ${this.$t('assignedFor')} ${response.number} ${this.$t('by')} ${this.userDetails.name}`
                // this.$api.execute('get', `usergroups/get_by_group/${assignedTo[1]}`).then(result => {
                //   usersarray = result.data.map(x => x.user_id)
                // }).finally(() => {
                //   this.getsignalRConnection.invoke('SendNotification', usersarray, msg, response._id)
                // })
              }
            }
          }).finally(() => {
            this.loader = false
          })
        }, 1200)
      }
    },
    saveAirwayBill (id, model) {
      let airwayBills = {
        ids: model
      }
      this.$api.saveUpdateHandler(`airwaybills/update_bills/${id}`, airwayBills)
    },
    backToList () {
      let hasHistory = localStorage.getItem('pathHistory') ? JSON.parse(localStorage.getItem('pathHistory')) : null
      if (hasHistory) {
        window.localStorage.setItem('pathHistory', null)
        this.$router.push(hasHistory.path)
      } else this.$router.push(`/${this.MODULE_URL}`)
    },
    openDocument (url) {
      window.open(url, '_blank')
    },
    async setModuleRecordInTheField ({ fromModule, recordId }) {
      const response = await this.$api.execute('get', `moduledata/${fromModule}/get_by_id/${recordId}`)
      if (response && response.data) {
        if (fromModule === this.ACCOUNT) {
          const accountObj = response.data
          accountObj.data.name = `${accountObj.data.number || ''} ${accountObj.data.name || ''}`
          this.listOfAccounts = [accountObj]
          this.ticketObj.account_id = accountObj._id
          this.enableSearch = false
          setTimeout(() => {
            this.enableSearch = true
          }, 1000)
        } else {
          const relatedModuleObjIndex = this.modulesRelated.findIndex(x => x.name === fromModule)
          if (relatedModuleObjIndex > -1) {
            const moduleRecords = [response.data]
            moduleRecords.forEach(item => {
              item.data.name = fromModule === this.CONTACT ? `${item.data.name || ''} ${item.data.last_name || ''}` : `${item.data.number || ''} ${item.data.name || ''}`
            })
            this.modulesRelated[relatedModuleObjIndex].selectedValue = recordId
            if (fromModule === this.PROJECT) this.listOfProjects = moduleRecords
            else {
              this.modulesRelated[relatedModuleObjIndex].listOfValues = moduleRecords
              this.$set(this.modulesRelated, relatedModuleObjIndex, this.modulesRelated[relatedModuleObjIndex])
            }
          }
        }
      }
    },
    getCustomTicketFields (ticketinfo) {
      this.fieldsLoading = true
      this.$api.execute('get', `incidentcustomerportal/ticketcustomfields/get_by_incident/${this.$route.params.incidentid}`).then(({ data }) => {
        if (this.customFieldsDataModel.is_task) {
          data = data.filter(x => x.name !== 'bcc' && x.name !== 'cc' && x.name !== 'to')
        }
        this.customFieldsDataModel.customfieldsdata = {}
        this.listOfFields = data
        this.listOfFields.forEach(field => {
          if (field.moduleid) {
            this.customFieldsDataModel.customfieldsdata[field.name.toLowerCase()] = null
          }
        })
        this.constructModuleFields(this.listOfFields, ticketinfo)
        this.externalFieldNames = this.listOfFields
          .filter(field => !field.is_internal)
          .map(field => field.name)
      }).finally(() => {
        this.fieldsLoading = false
        this.reInit++
      })
    },
    async constructModuleFields (list) {
      return new Promise((resolve) => {
        if (this.$route.params.record_id && (!this.userDetails.isadmin || this.$route.params.name === 'Event')) list = list.filter((item) => item.label !== 'Event_create_for')
        // Sorting fields by tab order
        if (list && list.length) {
          list = list.sort(function (a, b) {
            return a.tab_order - b.tab_order
          })
          // Constructing fields with default value
          for (let i = 0; i < list.length; i++) {
            // this.customFieldsDataModel[list[i].name] = ''
            // list[i].default_value = list[i].default_value ? JSON.parse(list[i].default_value) : null
            if (list[i].default_value && typeof list[i].default_value === 'string') list[i].default_value = list[i].default_value ? JSON.parse(list[i].default_value) : null
            if (list[i].default_value) {
              if (list[i].type === 3 || list[i].type === 4 || list[i].type === 5) {
                if (list[i].type === 5 && list[i].default_value.selectType === 'default') {
                  if (list[i].name === 'assignedto') {
                    list[i].default_value.options = this.getUsersAndGroups
                    if (this.$route.query.converttask || this.$route.query.convertticket) list[i].default_value.default_value = this.ticketObj.assignedto
                  }
                  if (list[i].name === 'mailboxid') {
                    list[i].default_value.options = this.getListOfMailboxes
                    list[i].default_value.default_value = this.ticketObj.mailboxid
                  }
                  if (list[i].name === 'status') {
                    list[i].default_value.options = this.getListOfTicketStatus.filter(x => x.incidenttypeid === this.$route.query.incidenttypeid)
                    list[i].default_value.default_value = this.ticketObj.status
                  }
                  if (list[i].name === 'priority') {
                    list[i].default_value.options = this.getListOfTicketPriorities.filter(x => x.incidenttypeid === this.$route.query.incidenttypeid)
                    list[i].default_value.default_value = this.ticketObj.priority
                  }
                  if (list[i].name === 'category_id') {
                    list[i].default_value.options = this.getListOfTicketCategory.filter(x => x.incidenttypeid === this.$route.query.incidenttypeid)
                    list[i].default_value.default_value = this.ticketObj.category_id
                  }
                }
                if (!this.$route.query.converttask && !this.$route.query.convertticket) {
                  if (list[i].default_value.is_multiselect) {
                    this.customFieldsDataModel[list[i].name] = null
                  } else if (list[i].type === 3 && !list[i].default_value.is_multiselect) this.customFieldsDataModel[list[i].name] = false
                  else if (list[i].type !== 3) this.customFieldsDataModel[list[i].name] = list[i].default_value.default_value
                }
              } else {
                if (!this.$route.query.converttask && !this.$route.query.convertticket) {
                  if (list[i].type === 6 && list[i].default_value && list[i].default_value.setcurrentdate) {
                    this.customFieldsDataModel[list[i].name] = this.$formatter.getCurrentDate(this.userDetails.dateformat)
                  } else if (list[i].type === 6 && list[i].default_value && list[i].default_value) {
                    this.customFieldsDataModel[list[i].name] = this.$formatter.formatDate(list[i].default_value.default_value, 'YYYY-MM-DDTHH:mm:ss', this.userDetails.dateformat)
                  } else if (list[i].type === 16 && list[i].default_value && list[i].default_value.setcurrentdate) {
                    this.customFieldsDataModel[list[i].name] = this.$formatter.getCurrentDateAndTime(`${this.userDetails.dateformat} HH:mm`)
                    list[i].dateTimePicker = this.$formatter.formatDate(this.customFieldsDataModel[list[i].name], `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DD')
                    list[i].timePicker = this.$formatter.formatDate(this.customFieldsDataModel[list[i].name], `${this.userDetails.dateformat} HH:mm`, 'HH:mm')
                  } else if (list[i].type === 14) {
                    if (this.customFieldsDataModel[list[i].name]) this.customFieldsDataModel[list[i].name].replace(/\s/g, '').trim()
                  } else if (list[i].type === 15 && list[i].default_value && list[i].default_value.setcurrentuserasdefault) {
                    this.customFieldsDataModel[list[i].name] = list[i].default_value.is_multiselect ? [this.userDetails._id] : this.userDetails._id
                  } else if (list[i].type === 19 && list[i].name === 'body') {
                    // this.setTicketBody(ticketInfo)
                    this.customFieldsDataModel[list[i].name] = ''
                    if (this.$route.query.converttask || this.$route.query.convertticket) this.customFieldsDataModel[list[i].name] = this.customFieldsDataModel.mailbody
                    if (!this.customFieldsDataModel.is_task && (!this.$route.query.converttask)) {
                      let currentUser = this.getUsers.find(x => x._id === this.userDetails._id)
                      this.customFieldsDataModel[list[i].name] += this.userDetails.systemconfig && this.userDetails.systemconfig.ticketterm ? `<div class="content"><br><span><b>${this.userDetails.systemconfig.ticketterm}</b></span>${currentUser && currentUser.signature ? '<iframe id="userSignFooter" frameborder="0" width="100%"></iframe>' : ''}</div>` : `<div class="content"><br>${currentUser && currentUser.signature ? '<iframe id="userSignFooter" frameborder="0" width="100%"></iframe>' : ''}</div>`
                      this.setSignature(currentUser)
                    }
                  } else {
                    if (!this.$route.query.converttask && !this.$route.query.convertticket) this.customFieldsDataModel[list[i].name] = (list[i].default_value && list[i].default_value['default_value']) ? list[i].default_value['default_value'] === '0' ? null : list[i].default_value['default_value'] : null
                  }
                }
                if (list[i].type === 19 && list[i].name === 'body') {
                  // this.setTicketBody(ticketInfo)
                  this.customFieldsDataModel[list[i].name] = ''
                  if (this.$route.query.converttask || this.$route.query.convertticket) this.customFieldsDataModel[list[i].name] = this.customFieldsDataModel.mailbody
                  if (!this.customFieldsDataModel.is_task && (!this.$route.query.converttask)) {
                    let currentUser = this.getUsers.find(x => x._id === this.userDetails._id)
                    this.customFieldsDataModel[list[i].name] += this.userDetails.systemconfig && this.userDetails.systemconfig.ticketterm ? `<div class="content"><br><span><b>${this.userDetails.systemconfig.ticketterm}</b></span>${currentUser && currentUser.signature ? '<iframe id="userSignFooter" frameborder="0" width="100%"></iframe>' : ''}</div>` : `<div class="content"><br>${currentUser && currentUser.signature ? '<iframe id="userSignFooter" frameborder="0" width="100%"></iframe>' : ''}</div>`
                    this.setSignature(currentUser)
                  }
                }
              }
            }
          }
          this.listOfFields = list
          this.loadModuleRelationsSelectedItems()
        }
        resolve()
      })
    },
    loadModuleRelationsSelectedItems () {
      const payloadList = []
      if (this.customFieldsDataModel.modulerelations && this.customFieldsDataModel.modulerelations.length) {
        const listGroupedByModule = this.$formatter.groupBy(this.customFieldsDataModel.modulerelations, 'module')
        Object.keys(listGroupedByModule).forEach(moduleName => {
          let obj = {
            modulename: moduleName,
            ids: listGroupedByModule[moduleName].map(x => (x._id || x.id)).filter(x => x)
          }
          payloadList.push(obj)
        })
      }
      if (this.loadForAccountInfo) {
        let obj = {
          modulename: this.ACCOUNT,
          ids: [this.customFieldsDataModel.account_id]
        }
        payloadList.push(obj)
        this.accountLoading = true
      }
      if (payloadList && payloadList.length) {
        this.loadingSubmoduleValues = true
        this.$api.execute('post', `moduledata/Default/get_certain_records_by_module`, payloadList).then(({ data: moduleResultList }) => {
          /* Set values in custom module fields */
          moduleResultList.forEach(record => {
            let recordData = record
            let fieldName = recordData.modulename.toLowerCase() === 'account' ? 'account_id' : recordData.modulename.toLowerCase()
            let fieldIndex = this.listOfFields.findIndex(x => x.moduleid && x.name === fieldName)
            // console.log(fieldIndex, this.listOfFields)
            this.listOfFields[fieldIndex].default_value.options = []
            // if (fieldName === 'account_id') {
            //   this.customFieldsDataModel.account_info.forEach(data => {
            //     this.listOfFields[fieldIndex].default_value.options.push({ _id: data._id, name: data.data.name })
            //     this.customFieldsDataModel.account_id = this.ticketObj.account_id
            //     console.log(this.listOfFields[fieldIndex])
            //   })
            // }
            this.customFieldsDataModel.customfieldsdata[this.listOfFields[fieldIndex].name] = record.records[0]._id
            recordData.records.forEach(data => {
              this.listOfFields[fieldIndex].default_value.options.push({ _id: data._id, name: data.data.name })
            })
          })
        }).finally(() => {
          this.loadingSubmoduleValues = false
          this.accountLoading = false
          this.reInit++
        })
      } else {
        this.loadingSubmoduleValues = false
        this.accountLoading = false
      }
    },
    setCustomModuleListSelectedValueAndOptions (moduleResultList = []) {
      this.modulesRelated.forEach((element, index) => {
        let resultrelation = this.modelObj.modulerelations.find(x => x.module === element.name)
        if (resultrelation) {
          element.selectedValue = resultrelation._id || resultrelation.id
        }
        let obj = moduleResultList.find(x => x.modulename === element.name && (x.records && x.records.length))
        if (obj && obj.records.length) {
          const result = obj.records || []
          result.forEach(item => {
            item.data.name = `${item.data.name || ''} ${item.data.last_name || ''}`
          })
          this.$set(this.modulesRelated, index, { ...this.modulesRelated[index], listOfValues: result })
        }
      })
      // For Account
      if (this.loadForAccountInfo) {
        let obj = moduleResultList.find(x => x.modulename === this.ACCOUNT && (x.records && x.records.length))
        if (obj && obj.records.length) {
          const indexOfItem = this.listOfAccounts.findIndex(x => x._id === this.modelObj.account_id)
          if (indexOfItem === -1) this.listOfAccounts.unshift(obj.records[0])
        }
      }
    },
    setSignature (currentUser) {
      let item = ''
      if (currentUser && currentUser.signature) {
        item = `${currentUser.signature}`
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = item
        const userSignDiv = tempDiv.querySelector('.user-sign')
        const imgElement = tempDiv.querySelector('.user-sign img')
        const dynamicHeight = '150px' // Replace with your desired height
        const dynamicWidth = '150px' // Replace with your desired width
        if (userSignDiv) {
          userSignDiv.style.height = dynamicHeight
          userSignDiv.style.width = dynamicWidth
        }
        if (imgElement) {
          imgElement.style.height = '100%'
          imgElement.style.width = '100%'
        }
        let modifiedItem = tempDiv.innerHTML
        item = modifiedItem
        setTimeout(() => {
          document.getElementById('userSignFooter').srcdoc = item
        }, 300)
      }
    }
  },
  beforeDestroy () {
    // before leaving create ticket page reset the modulesRelated listOfValues array
    this.modulesRelated.forEach(x => { x.listOfValues = [] })
  }
}
</script>
<style>
.signature-div {
  width: 100%;
  border: 3px solid #cccccc;
  padding: 7px;
  min-height: 200px;
  overflow: hidden; /* Hide content that exceeds the defined size */
}

.signature-div img {
  max-width: 20%; /* Constrain images to a maximum width within the div */
  height: 10%; /* Maintain the aspect ratio of the images */
}
.create-ticket .ck-editor__editable_inline {
  min-height: 200px;
}
[v-cloak] {
display: none;
}
.p-12 {
  padding: 1.5rem;
}
.border {
  border-width: 1px;
}
.border-gray-300 {
  border-color: #e2e8f0;
}
.bg-gray-100 {
  background-color: #e1e1e1;
  border: 2px dashed #036693b5;
}
.w-px {
  width: 1px;
}
.absolute {
  position: absolute;
}
.overflow-hidden {
  overflow: hidden;
}
.opacity-0 {
  opacity: 0;
}
.h-px {
  height: 1px;
}
.block {
  display: block;
}
.underline {
  text-decoration: underline;
}
.text-sm {
  font-size: .875rem;
}
.p-1 {
  padding: 0.25rem;
}
.width-100 {
  width: 100%;
  text-align: center;
}
.custom_rounded-xxl {
  border-radius: 8px;
}
.show_divider_border_right {
  border-right: 1px solid rgba(0, 0, 0, 0.085);
}
</style>
