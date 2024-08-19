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
    <div class="px-5 pt-5">
      <v-card class="pt-5">
        <v-row no-gutters>
          <v-col cols="10">
            <v-btn color="#0184e2" height="27" width="27" outlined icon  class="ml-4" @click="$router.go(-1)">
              <v-icon color="#0184e2" size="16" > mdi-arrow-left </v-icon>
            </v-btn>
            <span class="pl-4">{{ $route.params.incidentname }}</span>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="2" class="text-end pr-5">
            <v-btn>
              Mark as closed
            </v-btn>
          </v-col>
          <v-col cols="6"  class="ml-4">
            <v-breadcrumbs class="pa-1">
              <v-breadcrumbs-item href="#">{{ incidentRecordObj.subject }}</v-breadcrumbs-item>
              <v-breadcrumbs-item href="#">#{{ incidentRecordObj.number }}</v-breadcrumbs-item>
            </v-breadcrumbs>
          </v-col>
        </v-row>
        <v-row class="pt-0 mt-0">
          <v-col cols="9">
            <v-card flat>
              <v-card-title v-html="incidentRecordObj.mailbody">
              </v-card-title>
              <v-card-subtitle>
                Created on {{ $formatter.formatDate(incidentRecordObj.created_at, 'DD.MM.YYYYTHH:mm:ss', 'ddd, DD MMM YYYY hh:mm A') }}
              </v-card-subtitle>
              <v-card-text>
                <v-chip color="blue lighten-4" text-color="blue">
                  Being Processed for the past 14 days
                </v-chip>
                <v-row class="pt-5">
                  <v-col cols="12">
                    <template v-for="(content, index) in alteredSubContents">
                      <v-card :color="getLighterColor(content.subcontentTypeColor)" class="pt-2 mt-2 pb-1"  :key="index">
                      <v-row no-gutters>
                        <v-col cols="1" class="mt-3 pl-10">
                          <span class="rounded-circle pink lighten-3">{{ getInitials(getUserName(content.createdby)) }}</span>
                        </v-col>
                        <v-col cols="11" class="text-left">
                          <div class="mx-3">
                            <div class="d-flex mt-2">
                              <p class="text-h6 font-weight-black mb-1">
                                {{ content.title }} <v-chip small :color="content.subcontentTypeColor" :text-color="$formatter.foreGroundColor(content.subcontentTypeColor)" class="font-weight-medium">{{ content.subcontentTypeName }}</v-chip>
                              </p>
                              <v-spacer></v-spacer>
                              <div>
                                <p class="caption font-weight-bold mr-2 mb-0">{{ $t('Created by') }} : {{ getUserName(content.createdby) }}</p>
                                <p class="caption ma-0 pr-1 ml-3">{{ $formatter.formatDate(content.created_at, 'DD.MM.YYYYTHH:mm:ss', 'DD.MM.YYYY HH:mm') }}</p>
                              </div>
                            </div>
                            <div class="d-flex content-wrapper mt-5">
                              <p v-html="content.description"></p>
                            </div>
                          </div>
                          <v-row no-gutters>
                            <v-col>
                              <p class="ml-3 mb-0 mt-0">{{ $t('Approved by') }} : <span class="font-weight-bold">{{ content.approvedUsernames && content.approvedUsernames.length ? content.approvedUsernames.join(', ') : '--' }}</span></p>
                              <p class="ml-3 my-5">
                                {{ $t('Pending approval') }} : <span class="font-weight-bold">{{ content.approvalUsernames && content.approvalUsernames.length ? content.approvalUsernames.join(', ') : '--' }}</span>
                              </p>
                            </v-col>
                            <v-col class="d-flex align-end justify-end mb-2">
                              <p class="ml-3 mb-0 mr-3" v-if="content.needApproval">{{ $t('Approval needed')}} : <v-btn class="success" @click="updateApproved(content)"><v-icon small>mdi-checkbox-marked-circle</v-icon>{{ $t('Approve') }}</v-btn></p>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card>
                    </template>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3" class="pt-10">
            <v-card>
              <v-card-title class="pa-1 pl-5 pt-3">Properties</v-card-title>
              <hr role="separator" aria-orientation="horizontal" class="mt-1 mx-1 v-divider theme--light">
              <v-card-text>
                <div class="mb-1">
                  <template v-for="field in listOfFields">
                    <v-row :key="field._id" no-gutters class="pa-2">
                      <v-col cols="6">
                        <span class="font-weight-bold subtitle">{{ $t(field.label) }} </span>
                      </v-col>
                      <v-col cols="6">
                        <template v-if="field.type === 3">
                          <v-icon :color="modelObj[field.name] ? 'success' : 'error'">{{ modelObj[field.name] ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                        </template>
                        <template v-else>
                          {{ modelObj[field.name] }}
                        </template>
                      </v-col>
                    </v-row>
                  </template>
                  <!-- <p class="ml-2 ma-0 pt-1 caption"><span class="font-weight-bold">{{ $t('startDate') }} : </span>{{ ticket_startdate ? $formatter.formatDate(ticket_startdate, this.userDetails.dateformat).slice(0,10) : '--' }}</p>
                  <p class="ml-2 ma-0 caption"><span class="font-weight-bold">{{ $t('endDate') }} : </span>{{ ticket_enddate ? $formatter.formatDate(ticket_enddate, this.userDetails.dateformat).slice(0,10) : '--' }}</p>
                  <p class="ml-2 pb-1 caption"><span class="font-weight-bold">{{ $t('totalLoggedHours') }} : </span>{{ticket_totalHours ? ticket_totalHours.toFixed(2) : '0'}}h</p> -->
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <template v-if="listOfComments.length">
            <template v-for="(content, index) in listOfComments">
              <v-card :color="getLighterColor('#2196F3')" class="pt-2 mt-2 pb-1 px-5"  :key="index">
                  <v-row no-gutters>
                    <v-col cols="1" class="mt-3 pl-10">
                      <span class="rounded-circle pink lighten-3">{{ getInitials('Ruban Joshva') }}</span>
                    </v-col>
                    <v-col cols="11" class="text-left">
                      <div class="mx-3">
                        <div class="d-flex content-wrapper mt-5">
                          <p v-html="content.comments"></p>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
              </v-card>
            </template>
          </template>
        </v-row>
        <v-row class="px-5">
                  <v-col cols="9">
                    <v-card>
                      <v-card-text>
                        <html-editor v-model="comments" label="Enter your Comments"
                          ></html-editor>
                          {{ comments }}
                        <v-btn color="primary" @click="listOfComments.push({comments: comments})">Send</v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
      </v-card>
  </div>
  </v-main>
  </div>
</template>
<script>
/* eslint-disable camelcase */
import CommonFunctions from '@/views/CustomModules/mixin.js'
import { mapGetters } from 'vuex'
// import Editor from '@/ckeditor'
import moment from 'moment'
// import draggable from 'vuedraggable'
export default {
  mixins: [CommonFunctions],
  data () {
    return {
      modelObj: {
        _id: this.$route.params.ticket_id
      },
      ticketid: '',
      timelineObj: [],
      expandedStates: [],
      ticketTerm: null,
      bodySignature: null,
      enableEditMode: false,
      mailsMerged: 0,
      MODULE_URL: 'tickets',
      ticketMails: [],
      // editor: Editor,
      editorConfig: {
        height: '250px'
      },
      panel: [0],
      tab: null,
      sendMailLoading: false,
      toggle_exclusive: 2,
      emailRegex: /^([A-Za-z0-9_\-.+])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,})$/,
      fav: true,
      menu: false,
      message: false,
      hints: true,
      showNoteBox: false,
      selected: [],
      backupTicket: {},
      isLoading: false,
      listOfComments: [],
      accountLoading: false,
      showFieldsForTask: false,
      updateMailInfo: {},
      modulesRelated: [],
      isForwardMail: false,
      userSignature: '',
      fieldsLoading: false,
      attachmentsURL: process.env.VUE_APP_ATTACHMENTS,
      attachmentLoader: false,
      subject: '',
      assignedto: '',
      createdby: '',
      modifiedby: '',
      listOfEmailSuggestions: [],
      debouncedGetEmailSuggestions: null,
      filelist: [],
      sharepoint: {},
      hideDragFile: false,
      noFileSelect: false,
      attachmentsDialog: false,
      currentItem: null,
      typeOfFileInput: null,
      loaderStatus: true,
      attachmentFileNameMaxWidth: 150,
      convertButton: true,
      ticketsRelatedCustomModules: [],
      reRender: 0,
      showDropBackground: false,
      sharepointObj: {},
      loadHistory: 0,
      showArrows: false,
      reRenderBody: 0,
      timeDifference: '',
      deleteDialog: false,
      incident: {},
      addDesc: false,
      newDesc: '',
      subContentTypes: [],
      contentTitle: '',
      contentDescription: '',
      notifyUsers: [],
      approvalUsers: [],
      showContentForm: false,
      separateContentForm: false,
      selectedContentTypeId: '',
      selectedContentTypeName: '',
      contentFormColor: '',
      subContents: [],
      updatingSubContent: false,
      contentId: '',
      subContentType: {},
      alteredSubContents: [],
      listPayloadObj: {},
      taskModule_id: '',
      needApproval: false,
      editingIndex: null,
      fromIncident: true,
      incidentRecordObj: {},
      listOfFields: [],
      comments: ''
    }
  },
  components: {
    'html-editor': () => import('@/components/TextEditor.vue')
    // 'sub-task': () => import('./SubTasks.vue'),
    // 'comments-section': () => import('./Comments.vue'),
    // 'notes-section': () => import('./Notes.vue'),
    // 'history-section': () => import('./History.vue'),
    // 'ticket-reminder': () => import('./SubModules/Reminders.vue'),
    // 'ticket-activities': () => import('./Activities.vue'),
    // 'sharepoint-tree-view': () => import('./SharepointTreeView.vue'),
    // 'documents': () => import('@/views/CustomModules/Documents.vue'),
    // MetaAndSubModules: () => import('./SubModules/MetaAndSubModules.vue'),
  },
  computed: {
    ...mapGetters(['getUsers', 'getListOfTicketPriorities', 'getListOfTicketStatus', 'getListOfTicketCategory', 'getsignalRConnection', 'getListOfGroups', 'listOfModules', 'systemDetails', 'getUserGroups']),
    defaultExpandedState () {
      return this.ticketMails.map(() => true)
    },
    listOfTicketTabs () {
      return [{
        text: this.$route.query.incidettype !== 'Ticket' ? this.$t('details') : this.$t('conversation'),
        icon: 'mdi-email'
      }]
    },
    formattedDate () {
      if (this.ticketMails.length > 0 && this.ticketMails[this.ticketMails.length - 1].reciveddatetime) {
        const lastMail = this.ticketMails[this.ticketMails.length - 1]
        return `${this.formatedDate(lastMail.reciveddatetime)}, ${this.$formatter.formatDate(lastMail.reciveddatetime, 'DD.MM.YYYYTHH:mm:ss', `${this.userDetails.dateformat} HH:mm`)}`
      }
      return ''
    }
  },

  watch: {
    modelObj (val) {
      if (val) {
        if (val.assignedto) {
          const userIdFromAssignedTo = val.assignedto.replace(/^user_/, '')
          const assignedTo = this.getUsers.find(user => user._id === userIdFromAssignedTo)
          if (assignedTo) {
            this.assignedto = assignedTo.firstname + ' ' + assignedTo.lastname
          }
        }
        const created_by = this.getUsers.find(user => user._id === val.created_by)
        if (created_by) {
          this.createdby = created_by.firstname + ' ' + created_by.lastname
        }
        const modified_by = this.getUsers.find(user => user._id === val.modifiedby)
        if (modified_by) {
          this.modifiedby = modified_by.firstname + ' ' + modified_by.lastname
        }
      }
    },
    tab (val) {
      if (val < 1) {
        this.getSingleRecordHandler(false, true)
      }
      if (val === 1 && this.modelObj.ticket_startdate) {
        this.getResourcePlannerPlans()
      }
    }
  },
  mounted () {
    // this.getFieldsListForTableHeaderHandler(this.taskModule_id)
    // this.getTaskModuleId()
    this.getSingleRecordHandler()
    this.setTheAttachmentNameMaxWidth()
    window.addEventListener('resize', this.setTheAttachmentNameMaxWidth)
    this.debouncedGetEmailSuggestions = this.$formatter.debounce(this.getEmailSuggestions, 500)
    this.ticketsRelatedCustomModules = this.listOfModules.filter(x => x.incidents ? x.incidents.includes(this.$route.query.incidenttype) : '')
    // this.expandedStates = this.ticketMails.map(() => false);
    // this.expandedStates[0] = true
    let domain = this.userDetails.domain
    this.backupTicket = null
    this.attachmentsURL = domain ? `${this.attachmentsURL}${domain}/` : this.attachmentsURL

    // this.getListOfNotes()
    this.$store.dispatch('getUsers')
    // this.$store.dispatch('getListOfGroups')
    this.$store.dispatch('getTicketPriority')
    this.$store.dispatch('getTicketStatus')
    this.$store.dispatch('getTicketCategory')
    // const text = this.$t('deleteMsg')
    // this.$eventBus.$on('deleteItems', (data) => {
    //   if (data.module === this.NOTES_MODULE) {
    //     const payload = { ids: data.ids, url: `${this.NOTES_MODULE}/delete_multiple`, module: this.NOTES_MODULE }
    //     this.$store.commit('showDeleteDialog', payload)
    //   }
    // })
    // this.$root.$on('loadComments', (data) => {
    //   this.getAllComments(data)
    // })
    // this.$eventBus.$on('deleteSuccess', (data) => {
    //   if (data === this.NOTES_MODULE) {
    //     this.selected = []
    //     this.$root.$emit('snackbar', { snackbar: true, color: 'success', text })
    //     this.$store.commit('hideDialog')
    //     this.getListOfNotes()
    //   }
    // })
    this.ticketTerm = this.userDetails && this.userDetails.systemconfig ? this.userDetails.systemconfig.ticketterm : ''
    this.$root.$on('draggedSharepointId', (data) => {
      this.sharepointObj = data.sharepointObj
    })
    this.getIncident()
    this.getSubContents()
    this.getIncidentCustomFields()
    // this.getSubContentTypes()
    // this.subContents.forEach(content => {
    //   this.fetchSubContentType(content._id)
    // })
  },
  methods: {
    parseDate (dateString) {
      // Split the date and time components
      console.log(dateString)
      const [datePart, timePart] = dateString.split('T')

      // Split the date components (DD.MM.YYYY)
      const [day, month, year] = datePart.split('.')

      // Split the time components (HH.MM.SS)
      const [hours, minutes, seconds] = timePart.split('.')

      // Create and return a new Date object
      return new Date(year, month - 1, day, hours, minutes, seconds)
    },
    calculateTimeDifference () {
      // Get the current time
      const currentTime = new Date()

      // Parse the modelObj.created_at time
      console.log(currentTime)
      const createdAt = this.parseDate(this.modelObj.created_at)
      // Calculate the difference in milliseconds
      const differenceInMilliseconds = currentTime - createdAt

      // Convert milliseconds to different units
      const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000)
      const differenceInMinutes = Math.floor(differenceInSeconds / 60)
      const differenceInHours = Math.floor(differenceInMinutes / 60)
      const differenceInDays = Math.floor(differenceInHours / 24)

      // Determine which unit to display
      if (differenceInDays > 0) {
        this.timeDifference = `${differenceInDays} days`
      } else if (differenceInHours > 0) {
        this.timeDifference = `${differenceInHours % 24} hours`
      } else if (differenceInMinutes > 0) {
        this.timeDifference = `${differenceInMinutes % 60} minutes`
      } else {
        this.timeDifference = `${differenceInSeconds % 60} seconds`
      }
    },
    formatedDate (date) {
      // Assuming formatDate is a method in your component
      return moment(date, 'DD-MM-YYYY').format('dddd').slice(0, 3)
    },
    handleFileUpload () {
      // const file = event.target.files[0]
      // Do something with the file, such as uploading it to a server or processing it
      // console.log('Uploaded file:', file);
    },
    toggleExpansionPanel (index) {
      setTimeout(() => {
        if (this.panel.includes(index)) {
          if (this.ticketMails[index].hasattachments) {
            this.getAttachmentById(index)
          }
        }
      }, 300)
    },
    async getAttachmentById (index) {
      let payload = {}
      if (this.ticketMails.length !== 0) {
        payload = {
          mailboxid: this.$route.query.mailboxid,
          messageid: this.ticketMails[index].mailid
        }
        if (payload.mailboxid) {
          this.$api.execute('post', 'mails/get_attachments_by_id', payload).then(({ data }) => {
            if (data.body) data.body = data.body.split('\n').join('<br />')
            this.$set(this.ticketMails[index], 'body', this.convertHtml(data.body || ''))
            const attachments = data.attachments.map(attachment => {
              const getExtensionType = this.mimeTypeOfDocument(attachment.extension)
              return { ...attachment, icon: getExtensionType.icon, color: getExtensionType.color }
            })
            this.$set(this.ticketMails[index], 'otherAttachments', attachments)
            setTimeout(() => {
              this.setTheAttachmentNameMaxWidth()
            })
          })
        }
      }
    },
    changeStatus () {
      // if this.modelObj.status === parseInt(process.env.VUE_APP_TICKET_STAUS_NEW)) this.modelObj.status = parseInt(process.env.VUE_APP_TICKET_STAUS_INPROGRESS
    },
    getInitials (name) {
      if (name && name.indexOf(' ') !== -1) {
        const [firstName, lastName] = name.split(' ')
        return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
      } else {
        return name.substring(0, 2).toUpperCase()
      }
    },
    addToSelected (event, item) {
      if (event) {
        this.selected.push(item)
      } else {
        const result = this.selected.filter(x => x._id !== item._id)
        if (result) {
          this.selected = result
        }
      }
    },
    pickFile (index) {
      const name = `attachments_${index}`
      this.$refs[name][0].click()
    },
    async onFilePicked (files, index) {
      let item = this.$formatter.cloneVariable(this.ticketMails[index])
      if (this.ticketMails[index].attachmentsFiles) {
        item.attachmentsFiles = this.ticketMails[index].attachmentsFiles
      }
      for (let file of files) {
        if (file) {
          if (!item.attachmentsList) item.attachmentsList = []
          item.attachmentsList.push(file.name)
          if (!item.attachmentsFiles) item.attachmentsFiles = []
          item.attachmentsFiles.push(file)
          // console.log('attachmentsList', item.attachmentsFiles);
          // if (this.imagesTypes.includes(file.type)) {
          //   let base64 = await this.toBase64(file)
          //   if (!item.listOfFiles) item.listOfFiles = []
          //   item.listOfFiles.push(base64)
          //   this.$set(this.ticketMails, index, item)
          // } else {
          //   if (!item.listOfOtherFiles) item.listOfOtherFiles = []
          //   let iconObj = this.getMimeTypeIcons(file.type)
          //   item.listOfOtherFiles.push({ name: file.name, type: file.type, ...iconObj })
          //   this.$set(this.ticketMails, index, item)
          // }
          if (!item.listOfOtherFiles) item.listOfOtherFiles = []
          let iconObj = this.getMimeTypeIcons(file.type)
          item.listOfOtherFiles.push({ name: file.name, type: file.type, ...iconObj })
          this.$set(this.ticketMails, index, item)
        }
      }
      // console.log('final', this.ticketMails);
    },
    backToList () {
      this.modulesRelated = []
      // let hasHistory = localStorage.getItem('pathHistory') ? JSON.parse(localStorage.getItem('pathHistory')) : null
      // if (hasHistory) {
      //   window.localStorage.setItem('pathHistory', null)
      //   this.$router.push(hasHistory.path)
      // } else
      this.$router.push(`/${this.MODULE_URL}?incidenttypeid=${this.$route.query.incidenttypeid}&incidenttype=${this.$route.query.incidenttype}`)
    },
    toggleEditMode () {
      this.enableEditMode = !this.enableEditMode
    },
    supportingList (type, text) {
      text = this.$refs.ticketViewEditReference.$refs[text][0].lazySearch
      let model = { module: type, dialog: true, text }
      this.$store.commit('supportingList', model)
    },
    openAttachment (url) {
      window.open(url, '_blank')
    },
    syncAttachment (id, mailid) {
      this.attachmentLoader = true
      let mailboxid = this.$route.query.mailboxid
      if (this.modelObj.is_task) {
        const url = this.userDetails.issharepointstorage ? `sharepoint/upload_from_ticket/${this.modelObj._id}/${id}` : `azurestorage/upload_from_ticket/${this.modelObj._id}/${id}`
        this.$api.execute('post', url)
          .then(() => {
            this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'syncSuccessful' })
          // this.getTicketMails()
          }).finally(() => {
            this.attachmentLoader = false
          })
      } else {
        const url = `sharepoint/upload_attachments_in_sharepoint_from_ticket/${this.modelObj.ticketid}/${mailboxid}/${mailid}/${id}`
        this.$api.execute('post', url)
          .then(() => {
            this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'syncSuccessful' })
          // this.getTicketMails()
          }).finally(() => {
            this.attachmentLoader = false
          })
      }
    },
    getSingleRecordHandler (fromMailActions, stopRerenderSidebar, isFromSidebar = false) {
      this.fieldsLoading = true
      let query = [
        { $addFields: { convertedId: { $toString: '$_id' } } },
        { $match: { $and: [ { convertedId: `${this.$route.params.id}` } ] } },
        {
          $lookup: {
            let: { accountId: '$Account_Id' },
            from: 'Account',
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', { $convert: {
                input: '$$accountId',
                to: 'objectId',
                onError: { error: true },
                onNull: { isnull: true }
              } }] } } },
              { $project: { _id: 1, Data: 1 } }
            ],
            as: 'account_info'
          }
        },
        {
          $addFields: {
            ticketId: {
              $toString: '$_id'
            }
          }
        },
        {
          $lookup: {
            from: 'MailAttachment',
            localField: 'ticketId',
            foreignField: 'MailId',
            as: 'attachments'
          }
        },
        {
          $lookup: {
            let: { mailboxid: '$MailboxId' },
            from: 'MailConfiguration',
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', { $convert: {
                input: '$$mailboxid',
                to: 'objectId',
                onError: { error: true },
                onNull: { isnull: true }
              } }] } } }
            ],
            as: 'mailbox'
          }
        },
        {
          $lookup: {
            from: 'Task',
            localField: 'convertedId',
            foreignField: 'TicketId',
            as: 'task_info'
          }
        },
        {
          $unwind: {
            path: '$task_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$_id',
            start_date: { $min: '$task_info.Data.start_date' },
            end_date: { $max: '$task_info.Data.due_date' },
            task_ids: { $push: { $toString: '$task_info._id' } },
            originalFields: { $first: '$$ROOT' }
          }
        },
        {
          $lookup: {
            from: 'Hour',
            localField: 'task_ids',
            foreignField: 'TaskId',
            as: 'hour_info'
          }
        },
        {
          $addFields: {
            total_hours: { $sum: '$hour_info.Hours' }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [ '$originalFields', { Ticket_startdate: '$start_date', Ticket_enddate: '$end_date', task_ids: '$task_ids', total_hours: '$total_hours' } ]
            }
          }
        },
        {
          $project: {
            task_info: 0
          }
        }
      ]
      this.$api.execute('post', `incidentcustomerportal/getincident/query`, query).then(response => {
        this.convertButton = false
        this.incidentRecordObj = response.data[0]
        let regex = /\n*\s*<iframe.*?\\?>.*?<\/iframe\\?>\s*\n*/gi;
        console.log(this.incidentRecordObj.mailbody.replace(regex, ''))
        this.incidentRecordObj.mailbody = this.incidentRecordObj.mailbody.replace(regex, '')
        this.ticketid = response.data[0]._id
        let result = response.data[0]
        if (result && result.tags) {
          result.tags = JSON.parse(result.tags)
        }
        if (result.assignedto) {
          result.assignedto = `user_${result.assignedto}`
        } else if (result.assignedto_group) {
          result.assignedto = `group_${result.assignedto_group}`
        }
        this.backupTicket = this.$formatter.cloneVariable(result)
        if (result.createdby) {
          let user = this.getUsers.find(x => x._id === result.createdby)
          if (user) result.createdByName = [user.firstname, user.lastname].filter(x => x).join(' ')
        }
        if (result.status) {
          result.statusObj = this.getListOfTicketStatus.find(x => x._id === result.status)
          result.status =  result.statusObj.name
          console.log( result.statusObj)
        }
        if (result.priority) {
          result.priorityObj = this.getListOfTicketPriorities.find(x => x._id === result.priority)
          result.priority =  result.priorityObj.name
        }
        if (result.category_id) {
          result.categoryObj = this.getListOfTicketCategory.find(x => x._id === result.category_id)
          result.category_id =  result.categoryObj.name
        }
        result = {
          ...result,
          ...result.customfieldsdata
        }
        this.modelObj = result
        this.calculateTimeDifference()
        if (!isFromSidebar) {
          this.modelObj.imageAttachments = []
          this.modelObj.otherAttachments = []
          if (this.modelObj.attachments && this.modelObj.attachments.length > 0) {
            this.modelObj.attachments.forEach(attachment => {
              let getExtensionType = this.mimeTypeOfDocument(attachment.extension)
              // if (getExtensionType === 'mdi-file-image') {
              //   this.modelObj.imageAttachments.push({ ...attachment, icon: getExtensionType, color: '' })
              // } else this.modelObj.otherAttachments.push({ ...attachment, icon: getExtensionType.icon, color: getExtensionType.color })
              this.modelObj.otherAttachments.push({ ...attachment, icon: getExtensionType.icon, color: getExtensionType.color })
            })
          }
          if (!this.modelObj.is_task) {
            if (fromMailActions) {
              this.fieldsLoading = true
              setTimeout(() => {
                this.getTicketMails()
              }, 2000)
            } else this.getTicketMails()
          }
          // this.getAllComments(this.modelObj._id)
          let currentUser = this.getUsers.find(x => x._id === this.userDetails._id)
          this.bodySignature = `<p></p><p></p><p></p><p><strong>[${this.ticketTerm ? this.ticketTerm : ''}#${this.modelObj.number}]</strong>${currentUser && currentUser.signature ? '<iframe id="userSignFooter" frameborder="0" width="100%"></iframe>' : ''}</p>`
          if (!stopRerenderSidebar) this.reRender++
        }
      }).finally(() => {
        if (this.modelObj.is_task) this.fieldsLoading = false
        if (isFromSidebar) this.fieldsLoading = false
        this.loadHistory++
        // this.getHistory()
        // this.getTicketTerm()
      })
    },
    getTicketTerm () {
      this.$api.execute('get', 'systemconfigurations')
        .then(({ data }) => {
          if (data) this.ticketTerm = (data.systemconfiguration && data.systemconfiguration.ticketterm) ? data.systemconfiguration.ticketterm : ''
          // this.getSingleRecordHandler()
          this.enableEditMode = true
        })
    },

    // Old get_all method
    /*
    getTicketMails () {
      this.fieldsLoading = true
      const obj = {
        ticketid: this.modelObj._id,
        mailboxid: this.$route.query.mailboxid,
        conversationid: this.$route.query.conversationid
      }
      this.$api.execute('post', 'mails/get_all', obj).then(response => {
        if(response.status === 200) {
          this.loaderStatus = false
        }
        if (response) {
          // this.getHistory()
         // If the mail is deleted in the outlook
          if(response.data.length  == 0) {
            this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'Mail does not exist in outlook !!' })
            // setTimeout(()=> {
            //   this.$router.push(`/${this.MODULE_URL}`)
            // }, 100)
          }
          else {
          this.subject = response.data[0].subject
          let mergedMailsCount = 0
          let mails = this.$formatter.cloneVariable(response.data)
          let tempAllMails = []
          mails.forEach(mail => {
            if (mail.mergedmails && mail.mergedmails.length) {
              mergedMailsCount += mail.mergedmails.length
              tempAllMails.push(...mail.mergedmails)
              mail.mergedmails = null
            }
            tempAllMails.push(mail)
          })
          let uniqueItemFound = []
          tempAllMails.sort((a, b) => {
            if (a.mailid === b.mailid) uniqueItemFound.push(tempAllMails.indexOf(a))
          })
          uniqueItemFound.forEach(index => {
            tempAllMails.splice(index, 1)
          })
          var clonedArray = tempAllMails.map(function (mail) {
            mail.mailfrom = mail.mailfrom
            mail.mailto = mail.mailto
            mail.showMailCc = false
            mail.showMailBcc = false
            mail.mailcc = mail.ccrecipents
            mail.mailbcc = mail.bccrecipents
            mail.isShowMailForm = false
            return mail
          })
          clonedArray.sort((a, b) => {
            let date1 = a.datetime
            let date2 = b.datetime
            return this.$formatter.sortWithDates(date2, date1, 'DD.MM.YYYYTHH:mm:ss')
          })
          clonedArray.forEach(element => {
            element.imageAttachments = []
            element.otherAttachments = []
            if (element.attachments && element.attachments.length > 0) {
              element.attachments.forEach(attachment => {
                let getExtensionType = this.mimeTypeOfDocument(attachment.extension)
                if (getExtensionType === 'mdi-file-image') {
                  element.imageAttachments.push({ ...attachment, icon: getExtensionType, color: '' })
                } else element.otherAttachments.push({ ...attachment, icon: getExtensionType.icon, color: getExtensionType.color })
              })
            }
          })
          this.mailsMerged = mergedMailsCount
          this.ticketMails = this.$formatter.cloneVariable(clonedArray).reverse()
        }
        }
      }).finally(() => {
         var imgs = document.getElementsByTagName("img")
          for (let img  of imgs) {
            img.style.removeProperty('zoom')
          }
          this.fieldsLoading = false
          this.getAttachmentById(0)
      })
    }
    */

    // Changed method type to asynchronous to address the issue in case the API response is delayed.
    async getTicketMails () {
      try {
        this.fieldsLoading = true
        const obj = {
          ticketid: this.modelObj._id,
          mailboxid: this.$route.query.mailboxid,
          conversationid: this.$route.query.conversationid
        }
        if (obj.mailboxid && obj.conversationid) {
          const response = await this.$api.execute('post', 'mails/get_all', obj)
          this.showArrows = true
          if (response.status === 200) {
            this.loaderStatus = false
          }
          if (response) {
            if (response.data.length === 0) {
              this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'Mail does not exist in outlook !!' })
            } else {
              this.subject = response.data[0].subject
              let mergedMailsCount = 0
              let mails = this.$formatter.cloneVariable(response.data)
              let tempAllMails = []
              mails.forEach(mail => {
                if (mail.body) mail.body = mail.body.split('\n').join('<br />')
                if (mail.mergedmails && mail.mergedmails.length) {
                  mergedMailsCount += mail.mergedmails.length
                  tempAllMails.push(...mail.mergedmails)
                  mail.mergedmails = null
                }
                tempAllMails.push(mail)
              })
              let uniqueItemFound = []
              tempAllMails.sort((a, b) => {
                if (a.mailid === b.mailid) uniqueItemFound.push(tempAllMails.indexOf(a))
              })
              uniqueItemFound.forEach(index => {
                tempAllMails.splice(index, 1)
              })
              var clonedArray = tempAllMails.map(function (mail) {
                mail.showMailCc = false
                mail.showMailBcc = false
                mail.mailcc = mail.ccrecipents
                mail.mailbcc = mail.bccrecipents
                mail.isShowMailForm = false
                return mail
              })
              /* clonedArray.sort((a, b) => {
                let date1 = a.datetime
                let date2 = b.datetime
                return this.$formatter.sortWithDates(date2, date1, 'DD.MM.YYYYTHH:mm:ss')
              }) */
              clonedArray.forEach(element => {
                element.imageAttachments = []
                element.otherAttachments = []
                if (element.attachments && element.attachments.length > 0) {
                  element.attachments.forEach(attachment => {
                    let getExtensionType = this.mimeTypeOfDocument(attachment.extension)
                    // if (getExtensionType === 'mdi-file-image') {
                    //   element.imageAttachments.push({ ...attachment, icon: getExtensionType, color: '' });
                    // } else element.otherAttachments.push({ ...attachment, icon: getExtensionType.icon, color: getExtensionType.color });
                    element.otherAttachments.push({ ...attachment, icon: getExtensionType.icon, color: getExtensionType.color })
                  })
                }
              })
              this.mailsMerged = mergedMailsCount
              this.ticketMails = this.$formatter.cloneVariable(clonedArray) // .reverse()
              if (obj != null) {
                this.getAttachmentById(0)
              }
            }
          }
        } else {
          this.$root.$emit('snackbar', { snackbar: true, color: 'apiError', text: 'mailboxOrConversationReferenceMissing' }) // mailboxOrConversationReferenceMissing - it means, query param values are not set properly
          this.loaderStatus = false
        }
      } catch (error) {
        console.error('Error fetching ticket mails:', error)
      } finally {
        this.convertButton = false
        var imgs = document.getElementsByTagName('img')
        for (let img of imgs) {
          img.style.removeProperty('zoom')
        }
        this.reRenderBody++
        this.fieldsLoading = false
      }
    },
    convertHtml (body) {
      body = body || ''
      const regex = /[a-zA-Z]{6,9}, [a-zA-Z]{3,9} \d{1,2}, \d{4} \d{1,2}:\d{2} [a-zA-Z]{2}/
      const result = (body || '').match(regex) || []
      if (result && result[0]) {
        body = body.replace(result[0], this.$formatter.UtcToLocal(result[0], 'dddd, MMMM DD, YYYY HH:mm A'))
      }

      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = body

      const links = tempDiv.querySelectorAll('a')
      links.forEach(link => {
        link.setAttribute('target', '_blank')
      })

      return tempDiv.innerHTML
    },
    replyMail (item, index) {
      this.panel = [index]
      // this.expandedStates = []
      // this.expandedStates[index] = true
      let combinedArray = ((this.ticketMails[index].from && this.ticketMails[index].from.emailaddress) ? [this.ticketMails[index].from.emailaddress.address] : []).concat(this.ticketMails[index].torecipents.map(recipient => recipient.emailaddress.address))
      combinedArray = combinedArray.filter(email => email !== this.ticketMails[index].mailboxname)
      combinedArray = [...new Set(combinedArray)]
      let mailAddress = this.ticketMails[index].from ? combinedArray : []
      // let mailAddress = this.ticketMails[index].from ? [this.ticketMails[index].from.emailaddress.address] : []
      // let mailAddress = this.ticketMails[index].from && this.ticketMails[index].from.length > 0 ? item.mailfrom.map(function(elem){return elem.Address}) : []
      let itemObj = Object.assign({ ...item }, { isShowMailForm: true,
        mailTo: mailAddress,
        mailBody: !this.modelObj.is_task ? this.bodySignature : '',
        showMailCc: false,
        showMailBcc: false,
        mailCc: [],
        mailBcc: []
      })
      this.isForwardMail = false
      // this.isreplyall = false
      this.$set(this.ticketMails, index, itemObj)
      setTimeout(() => {
        this.focusMessageArea(index)
      })
    },
    replyAllMail (item, index) {
      // let mailAddress = this.ticketMails[index].torecipents
      // let from = this.ticketMails[index].from
      this.panel = [index]
      this.expandedStates = []
      this.expandedStates[index] = true
      this.isForwardMail = false
      // this.isreplyall = true
      this.$set(item, 'mailTo', item.torecipents.map(recipient => recipient.emailaddress.address))
      let combinedArray = ((this.ticketMails[index].from && this.ticketMails[index].from.emailaddress) ? [this.ticketMails[index].from.emailaddress.address] : []).concat(this.ticketMails[index].torecipents.map(recipient => recipient.emailaddress.address))
      let mailAddress = this.ticketMails[index].from ? combinedArray : []
      let from = this.ticketMails[index].from && this.ticketMails[index].from.length > 0 ? item.from.map(function (elem) { return elem.Address }) : []
      if (from) {
        mailAddress = [...mailAddress, ...from]
      }
      let mailCc = this.ticketMails[index].ccrecipents.length > 0 ? this.ticketMails[index].ccrecipents.map(function (elem) { return elem.emailaddress.address }) : []
      let mailBcc = this.ticketMails[index].bccrecipents.length > 0 ? this.ticketMails[index].bccrecipents.map(function (elem) { return elem.emailaddress.address }) : []
      if (this.modelObj.mailbox && this.modelObj.mailbox.length > 0) mailAddress = mailAddress.filter(x => x !== this.modelObj.mailbox[0].username)
      let itemObj = Object.assign({ ...item }, { isShowMailForm: true,
        mailTo: mailAddress,
        mailCc,
        mailBcc,
        mailBody: !this.modelObj.is_task ? this.bodySignature : '',
        showMailCc: mailCc.length > 0,
        showMailBcc: mailBcc.length > 0
      })
      this.isForwardMail = false
      this.$set(this.ticketMails, index, itemObj)
      setTimeout(() => {
        this.focusMessageArea(index)
      })
    },
    forwardMail (item, index) {
      this.panel = [index]
      this.expandedStates = []
      this.expandedStates[index] = true
      // let mailAddress this.ticketMails[index].mailfrom && this.ticketMails[index].mailfrom.length > 0 ? item.mailfrom.map(function(elem){return elem.Address}) : []
      let itemObj = Object.assign({ ...item }, { isShowMailForm: true, mailTo: [], mailBody: !this.modelObj.is_task ? this.bodySignature : '' })
      this.$set(this.ticketMails, index, itemObj)
      this.isForwardMail = true
      setTimeout(() => {
        this.focusMessageArea(index)
      })
    },
    focusMessageArea (index) {
      setTimeout(() => {
        var div = document.getElementsByClassName('ck-editor__editable_inline')
        setTimeout(function () {
          if (div[index]) div[index].focus()
        }, 50)
      }, 100)
      let item = ''
      let currentUser = this.getUsers.find(x => x._id === this.userDetails._id)
      if (currentUser && currentUser.signature) {
        item = `${currentUser.signature}`
        document.getElementById('userSignFooter').srcdoc = item
        setTimeout(() => {
          let element = document.getElementById('userSignFooter')
          element.style.height = (element.contentWindow.document.all[2].offsetHeight + 30) + 'px'
          element.style.pointerEvents = 'none'
          // const iWindow = iframe.contentWindow;
          // const iDocument = iWindow.document;
          element.style.color = this.$vuetify.theme.dark ? 'white' : ''
        }, 300)
      }
    },
    showHideInput (item, index, field) {
      if (field === 'cc') {
        item.showMailCc = !item.showMailCc
      } else item.showMailBcc = !item.showMailBcc
      this.$set(this.ticketMails, index, item)
    },
    // sendMailOrAttachment (item, index) {
    //   if (this.$refs[`mailForm_${index}`][0].validate()) {
    //             if ((item.listOfFiles && item.listOfFiles.length > 0) || (item.listOfOtherFiles && item.listOfOtherFiles.length > 0)) {
    //       var formData = new FormData()
    //       var filesList = item.attachmentsFiles
    //       if (filesList !== null && filesList.length > 0) {
    //         filesList.forEach(file => {
    //           formData.append(file.name,file)
    //         })
    //       }
    //       this.sendMailLoading = true
    //       this.$api.execute('post', 'mailattachments/upload', formData).then(response => {
    //         if (response.data && response.data.length > 0) {
    //           let attachmentIds = response.data.map(x => x._id)
    //           item.attachments = attachmentIds
    //           this.$set(this.ticketMails, index, item)
    //           setTimeout(() => {
    //             this.sendMail(item, index, true)
    //           }, 100)
    //         }
    //       })
    //               } else this.sendMail(item, index)
    //   }
    // },
    sendMail (item, index) {
      let mailItem = this.$formatter.cloneVariable(item)
      // if (this.$refs[`mailForm_${index}`][0].validate()) {
      let body = this.$formatter.isArrayHasData(mailItem.mailBody) ? mailItem.mailBody : ''
      let to = this.$formatter.isArrayHasData(mailItem.mailTo) ? mailItem.mailTo : []
      let formattedto = to.map(email => ({
        emailaddress: {
          address: email,
          name: ''
        }
      }))
      let cc = this.$formatter.isArrayHasData(mailItem.mailCc) ? mailItem.mailCc : []
      let formattedcc = cc.map(email => ({
        emailaddress: {
          address: email,
          name: ''
        }
      }))
      let bcc = this.$formatter.isArrayHasData(mailItem.mailBcc) ? mailItem.mailBcc : []
      let formattedbcc = bcc.map(email => ({
        emailaddress: {
          address: email,
          name: ''
        }
      }))
      let arrayOfEmails = [to, cc, bcc]
      if (arrayOfEmails.length > 0) {
        for (let i = 0; i < arrayOfEmails.length; i++) {
          for (let j = 0; j < arrayOfEmails[i].length; j++) {
            if (!this.emailRegex.test(arrayOfEmails[i][j])) {
              this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'invalidEmail' })
              return false
            }
          }
        }
      }
      this.sendMailLoading = true
      body = body ? body.replace('<iframe width="100%" frameborder="0" id="userSignFooter"> </iframe>', '') : ''
      let sendObj = {
        messageId: mailItem.mailid,
        mailboxId: this.$route.query.mailboxid,
        // from: this.ticketMails[index].from,
        comment: body,
        toRecipients: formattedto,
        ccRecipients: formattedcc,
        bccRecipients: formattedbcc
        // attachments: addedAttachments && item.attachments && item.attachments.length > 0 ? item.attachments : [],
        // ticket_id: [this.modelObj._id]
      }
      // console.log(item.attachmentsFiles.length);
      // return false
      var formData = new FormData()
      if (item.attachmentsFiles && item.attachmentsFiles.length) {
        var filesList = item.attachmentsFiles
        if (filesList !== null && filesList.length) {
          filesList.forEach(file => {
            if (!file.is_sharepoint) {
              formData.append(file.name, file)
            } else {
              formData.append(file.id, file)
            }
          })
        }
      }
      formData.append('model', JSON.stringify(sendObj))
      // let url = '/mails/reply'
      let url = '/mails/replymail_through_graphapi'
      // if (this.isreplyall) url = '/mails/replyall_outlook_mail'
      if (this.isForwardMail) url = '/mails/forwardmail_through_graphapi'
      this.$api.execute('post', url, formData)
        .then((response) => {
          item.listOfOtherFiles = []
          item.listOfFiles = []
          item.attachmentsFiles = []
          if (response.status === 200) {
            this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'sentSuccess' })
            item.isShowMailForm = false
            this.$set(this.ticketMails, index, item)
            this.getSingleRecordHandler(true)
          }
        })
        .finally(() => {
          this.sendMailLoading = false
        })
      // }
    },
    cancelMail (item, index) {
      item.isShowMailForm = false
      this.$set(this.ticketMails, index, item)
    },
    autoFocusOnField () {
      setTimeout(() => {
        var div = document.getElementsByClassName('ck-editor__editable_inline')
        if (div && div[div.length - 1]) div[div.length - 1].focus()
      }, 100)
    },
    addNotesHandler () {
      this.showNoteBox = true
      this.autoFocusOnField()
    },
    mimeTypeOfDocument (type) {
      let icon = ''
      switch (type) {
        case '.png':
        case '.jpeg':
        case '.jpg':
        case '.gif':
        case '.jfif':
          icon = { icon: 'mdi-file-image', color: '' }
          break
        case '.pdf':
          icon = { icon: 'mdi-file-pdf', color: 'red' }
          break
        case '.xlsx':
          icon = { icon: 'mdi-file-excel', color: 'green' }
          break
        case '.html':
          icon = { icon: 'mdi-language-html5', color: '' }
          break
        case '.mp4':
          icon = { icon: 'mdi-file-video', color: '' }
          break
        case '.mpeg':
          icon = 'mdi-audiobook'
          break
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
          icon = { icon: 'mdi-file-word', color: 'info' }
          break
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
          icon = { icon: 'mdi-file-excel', color: 'green' }
          break
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        case 'application/vnd.openxmlformats-officedocument.presentationml.template':
        case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
          icon = { icon: 'mdi-file-powerpoint', color: 'error' }
          break
        case 'application/x-rar-compressed':
        case 'application/octet-stream':
        case 'application/zip':
        case 'application/x-zip-compressed':
        case 'multipart/x-zip':
          icon = { icon: 'mdi-zip-box', color: null }
          break
        default:
          icon = { icon: 'mdi-file-cloud', color: null }
          break
      }
      return icon
    },
    downloadFile (attachmentid, mailid) {
      let mailboxid = this.$route.query.mailboxid
      this.$api.execute('post', `mails/download_attachments/${mailboxid}/${mailid}/${attachmentid}`).then(response => {
        let filename = response.data.filename
        window.open(process.env.VUE_APP_URL + 'files/download/?fileName=' + filename, '_blank')
      })
    },
    downloadTaskFile (attachmentid) {
      this.$api.execute('get', `mailattachments/download/${attachmentid}`).then(response => {
        let filename = response.data
        window.open(process.env.VUE_APP_URL + 'files/download/?fileName=' + filename, '_blank')
      })
    },
    showMailInfoEdit (item) {
      this.updateMailInfo = this.$formatter.cloneVariable(item)
      this.showFieldsForTask = true
    },
    updateMailValues (modelObj) {
      let model = this.$formatter.cloneVariable(this.updateMailInfo)
      // model.attachments = []
      this.$api.execute('post', `tickets/update_task/${this.modelObj._id}`, { body: model, subject: modelObj.subject }).then(() => {
        this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'updatedSuccess' })
        this.showFieldsForTask = false
        this.getSingleRecordHandler()
      })
    },

    removeAttachment (fileIndex, listname, mainIndex) {
      let item = this.$formatter.cloneVariable(this.ticketMails[mainIndex])
      item.attachmentsFiles = this.ticketMails[mainIndex].attachmentsFiles
      item.attachmentsFiles.splice(fileIndex, 1)
      item[listname].splice(fileIndex, 1)
      this.$set(this.ticketMails, mainIndex, item)
    },
    getEmailSuggestions (item, index, model) {
      const searchTerm = item[`${model}FieldSearchText`] || ''
      item[`${model}EmailSuggestionloading`] = true
      this.$set(this.ticketMails, index, item)
      this.$api.execute('get', `emailaccounts/get_email_suggesstion?searchTerm=${searchTerm || ''}`).then(({ data: emailSuggestions }) => {
        const suggestedEmails = emailSuggestions.map(x => {
          x.nameAndEmail = [x.name, (x.name ? `(${x.emailaddress})` : x.emailaddress)].filter(x => x).join(' ')
          return x
        })
        this.listOfEmailSuggestions = []
        this.listOfEmailSuggestions = suggestedEmails
      }).finally(() => {
        item[`${model}EmailSuggestionloading`] = false
        this.$set(this.ticketMails, index, item)
      })
    },
    onChange () {
      // const spFiles = this.sharepoint && this.sharepoint.files ? this.sharepoint.files.filter(x => x.isSelected) : []
      // const spFileProps = spFiles.map(x => {
      //   const prop = { id: x.id, name: x.name, is_sharepoint: true }
      //   return prop
      // })
      // const result = [...this.$refs.file.files, ...spFileProps]
      // this.$emit('change', result)
      this.filelist = [...this.$refs.file.files]
    },
    remove (i) {
      this.filelist.splice(i, 1)
    },
    dragover (event) {
      event.preventDefault()
      // Add some visual fluff to show the user can drop its files
      if (!event.currentTarget.classList.contains('bg-green-300')) {
        event.currentTarget.classList.remove('bg-gray-100')
        event.currentTarget.classList.add('bg-green-300')
      }
    },
    dragleave (event) {
      // Clean up
      event.currentTarget.classList.add('bg-gray-100')
      event.currentTarget.classList.remove('bg-green-300')
    },
    drop (event) {
      event.preventDefault()
      this.$refs.file.files = event.dataTransfer.files
      this.onChange() // Trigger the onChange event manually
      // Clean up
      event.currentTarget.classList.add('bg-gray-100')
      event.currentTarget.classList.remove('bg-green-300')
    },
    dropSharepoint (event, index) {
      event.preventDefault()
      this.currentItem = index
      if (this.sharepointObj && this.sharepointObj.id) {
        const files = [{ id: this.sharepointObj.id, isdocument: this.sharepointObj.is_document, name: this.sharepointObj.name, type: this.sharepointObj.mimetype, is_sharepoint: true }]
        this.onFilePicked(files, this.currentItem)
      }
      this.currentItem = null
      this.showDropBackground = false
      this.sharepointObj = {}
    },
    openDocument (url) {
      window.open(url, '_blank')
    },
    openAttachmentsDialog (index, type) {
      this.currentItem = index
      this.typeOfFileInput = type
      this.attachmentsDialog = true
    },
    includeFiles () {
      if (this.typeOfFileInput === 1) {
        this.onFilePicked(this.filelist, this.currentItem)
        this.attachmentsDialog = false
        this.closeAttachmentsDialog()
      } else this.$eventBus.$emit('copySelectedDocuments')
    },
    getAttachmentFiles (files) {
      this.onFilePicked(files, this.currentItem)
      this.closeAttachmentsDialog()
      this.currentItem = null
    },
    closeAttachmentsDialog () {
      this.filelist = []
      this.attachmentsDialog = false
    },
    setTheAttachmentNameMaxWidth () {
      var cards = document.getElementsByClassName('attachment_card')
      if (cards && cards.length) {
        var attachmentCard = cards[0]
        this.attachmentFileNameMaxWidth = attachmentCard.clientWidth - 100
      }
    },
    checkMove (evt) {
      const mailid = evt.clone.getAttribute('data-mail-id')
      this.$root.$emit('draggedAttachmentId', { ticketId: this.modelObj.ticketid, mailboxid: this.$route.query.mailboxid, attachmentId: evt.clone.id, mailid: mailid, attachmentObj: (evt && evt.item ? evt && evt.item._underlying_vm_ : null) })
    },
    dragoverreply (event) {
      this.showDropBackground = true
      event.preventDefault()
    },
    resizeIframe (event) {
      const iframe = event.target
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document
      iframe.style.height = iframeDocument.documentElement.scrollHeight + 'px'
    },
    showOutline () {
      // const comboboxElement = this.$refs.myCombobox.$el.querySelector('.v-input__control')
      // comboboxElement.style.outline = '2px solid #1976D2' // Customize the outline style here
    },
    hideOutline () {
      // console.log(this.$refs.myCombobox)
      // const comboboxElement = this.$refs.myCombobox.$el.querySelector('.v-input__control')
      // comboboxElement.style.outline = 'none'
    },
    deleteMail () {
      // console.log()
      this.$api.execute('delete', `tickets/${this.modelObj._id}`).then(() => {
        let text = this.$t('deleteMsg')
        this.$root.$emit('snackbar', { snackbar: true, color: 'success', text })
        this.$router.push('/tickets')
      })
    },
    getIncident () {
      // this.$api.execute('get', `incidenttypes/${this.$route.params.incidentid}`)
      //   .then(({ data }) => {
      //     this.incident = data
      //   })
    },
    getSubContentTypes () {
      let model = [{ $match: { IncidentTypeId: `${this.$route.params.incidentid}` } }]
      this.$api.execute('post', 'incidentcustomerportal/incidentsubcontenttypes/query', model)
        .then(({ data }) => {
          this.subContentTypes = data
          this.getContents()
        })
    },
    getSubContents () {
      let model = [{ $match: { IncidentId: `${this.$route.params.id}` } }]
      this.$api.execute('post', 'incidentcustomerportal/incidentsubcontents/query', model)
        .then(({ data }) => {
          this.subContents = data
          this.getSubContentTypes()
        })
    },
    saveSubContent () {
      let approvalUsersObj = []
      for (let id of this.approvalUsers) {
        let obj = {}
        if (typeof id === 'string') {
          obj = {
            id: id,
            IsApproved: false
          }
        } else {
          obj = {
            id: id._id,
            IsApproved: false
          }
        }
        approvalUsersObj.push(obj)
      }
      let payload = {
        title: this.contentTitle,
        description: this.contentDescription,
        notify: this.notifyUsers,
        approval: approvalUsersObj,
        subcontenttypeId: this.selectedContentTypeId,
        incidenttypeId: this.$route.query.incidenttypeid,
        incidentid: this.$route.params.ticket_id,
        created_at: new Date().toISOString(),
        _id: this.contentId
      }
      this.$api.execute(this.updatingSubContent ? 'put' : 'post', this.updatingSubContent ? `incidentsubcontents/${this.contentId}` : 'incidentsubcontents', payload)
        .then(() => {
          this.updatingSubContent = false
          this.closeSubContentForm()
          this.getSubContents()
        })
    },
    openContentForm (item) {
      // console.log(item)
      this.selectedContentTypeId = item._id
      this.selectedContentTypeName = item.name
      // this.showContentForm = true
      this.editingIndex = -1
      this.emptySubContentForm()
      this.separateContentForm = true
      this.contentFormColor = this.getLighterColor(item.color)
    },
    getLighterColor (color) {
      // Convert hex color to RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    // Calculate brightness
    // const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // If the color is already light, return the original color
    // if (brightness > 200) return color;

    // Make the color lighter by increasing each RGB component by 90%
    r = Math.min(255, r + 0.9 * (255 - r));
    g = Math.min(255, g + 0.9 * (255 - g));
    b = Math.min(255, b + 0.9 * (255 - b));

    // Convert RGB back to hex
    return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
    },
    emptySubContentForm () {
      this.contentTitle = ''
      this.contentDescription = ''
      this.notifyUsers = []
      this.approvalUsers = []
    },
    closeSubContentForm () {
      this.editingIndex = null
      this.emptySubContentForm()
      this.showContentForm = false
      this.separateContentForm = false
      this.updatingSubContent = false
    },
    editSubContent (content, index) {
      this.editingIndex = index
      this.contentTitle = content.title
      this.contentDescription = content.description
      this.notifyUsers = content.notify
      this.approvalUsers = content.approval
      this.selectedContentTypeId = content.subcontenttypeid
      this.selectedContentTypeName = content.subcontenttypename
      this.contentFormColor = content.subcontentcolor
      this.contentId = content._id
      this.separateContentForm = false
      this.showContentForm = true
      this.updatingSubContent = true
    },
    // fetchSubContentType (id) {
    //   this.$api.execute('get', `incidentsubcontenttypes/${id}`)
    //     .then(({ data }) => {
    //       this.$set(this.subContentTypes, id, data.name)
    //     })
    // },
    getUserName (val) {
      const created_by = this.getUsers.find(user => user._id === val)
      return created_by ? created_by.name : ''
    },
    getContents () {
      const enrichedSubcontents = this.subContents.map(subcontent => {
        const matchedType = this.subContentTypes.find(type => type._id === subcontent.subcontenttypeid)
        const needApproval = subcontent.approval && subcontent.approval.length
          ? subcontent.approval.some(user => user._id === this.userDetails._id && !user.isapproved)
          : false
        const approvalUsernames = subcontent.approval
          ? subcontent.approval.map(approval => {
            const user = this.getUsers.find(user => user._id === approval._id && !approval.isapproved)
            return user ? user.name : null
          }).filter(username => username !== null)
          : []
        const approvedUsernames = subcontent.approval
          ? subcontent.approval.map(approval => {
            const user = this.getUsers.find(user => user._id === approval._id && approval.isapproved)
            return user ? user.name : null
          }).filter(username => username !== null)
          : []
        return {
          ...subcontent,
          subcontentTypeName: matchedType ? matchedType.name : null,
          subcontentTypeColor: matchedType ? matchedType.color : null,
          needApproval: needApproval,
          approvalUsernames: approvalUsernames,
          approvedUsernames: approvedUsernames
        }
      })
      console.log(enrichedSubcontents)
      this.alteredSubContents = enrichedSubcontents
    },

    updateApproved (content) {
      const payload = {
        approval: []
      }

      payload.approval = content.approval.map(user => {
        if (user._id === this.userDetails._id) {
          return {
            id: user._id,
            isapproved: true
          }
        }
        return {
          id: user._id,
          isapproved: user.isapproved
        }
      })

      this.$api.execute('put', `incidentsubcontents/update_approval_property/${content._id}`, payload)
        .then(() => {
          this.getSubContents()
        })
    },
    getNameOfUser () {
      return this.getUsers.find()
    },
    getTaskModuleId () {
      this.$api.execute('get', 'modules/get_by_name?name=Task')
        .then(({ data }) => {
          this.taskModule_id = data._id
        })
    },
    getResourcePlannerPlans () {
      const from = this.$formatter.formatDate(this.modelObj.ticket_startdate, 'DD.MM.YYYYTHH.mm.ss', 'YYYY-MM-DD')
      const to = this.$formatter.formatDate(this.modelObj.ticket_enddate, 'DD.MM.YYYYTHH.mm.ss', 'YYYY-MM-DD')
      const payload = {
        userIds: [],
        projectIds: [],
        hourweek: { // temporary handling for hour calculation is send in payload due to date handling is missing in timezone task #riyaz
          from,
          to
        }
      }
      const extendedStartDate = this.$moment(from, 'YYYY-MM-DD').subtract(2, 'd').format('YYYY-MM-DD')
      const extendedEndDate = this.$moment(to, 'YYYY-MM-DD').add(2, 'd').format('YYYY-MM-DD')
      this.$api.execute('post', `resourceplanning/get_plans?from=${extendedStartDate}&to=${extendedEndDate}`, payload)
        .then(async () => {
          // console.log(data)
        })
    },
    getIncidentCustomFields () {
      this.$api.execute('get', `incidentcustomerportal/ticketcustomfields/get_by_incident/${this.$route.params.incidentid}`)
        .then(({ data }) => {
          let listOfFields = []
          data.forEach(element => {
            if (element.exposetocustomerportal && element.name !== 'subject' && element.name !== 'attachments' && element.name !== 'body') {
              listOfFields.push(element)
            }
          })
          console.log(listOfFields)
          this.listOfFields = listOfFields
        })
    }
  },
  beforeDestroy () {
    // this.$root.$off('loadComments')
    this.$eventBus.$off('deleteItems')
    this.$eventBus.$off('deleteSuccess')
    this.$root.$off('draggedSharepointId')
  }
}
</script>
<style>
/* .custom-ckeditor-height .ck-content {
  min-height: 120px;
} */
.v-expansion-panel--active > .v-expansion-panel-header {
  min-height: 48px !important;
}
.notes-overflow {
  text-overflow: ellipsis;
  overflow: hidden;
  width: 160px;
  height: 1.2em;
  white-space: nowrap;
}
.notes-wrapper {
    min-width: 100px !important;
    background-color: rgba(0, 0, 0, 0.3) !important;
    border-color: rgba(0, 0, 0, 0.3) !important;
    position: fixed !important;
    top: 64px !important;
    right: -35px !important;
    border-radius: 8px !important;
}
/* .theme--dark.v-sheet { because of this style, app words become dark color when its in dark mode
  color: #000000;
} */
/* .ticketcontent img {
  height: 100px;
} */

.recipient {
  display: flex; /* Use flexbox to align items horizontally */
}
  .v-expansion-panel-content {
    max-height: none; /* Override the max-height property */
}
.custom-timeline-item .v-timeline-item__icon {
  margin-right: 10px; /* Adjust the margin to reduce space between dot and content */
}
.timelineItemCompressed{
  margin-left: -50px;
}
.timelineItemCompressed .v-timeline-item__divider{
  min-width: 35px;
  margin-left: -51px;
}
.timeline:before {
  margin-left: -19px;
}
.tabDivider {
  min-height: 50% !important;
  max-height: 50% !important;
  margin-top: 13px;
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
.loader-container {
    display: flex;
    align-items: center;
    justify-content: center;
}
.loading-text {
    color: rgb(124, 130, 130);
}
.loader{
  text-align: center;
  margin:5px 0 -1px 0;
}
.custom_rounded-xxl {
  border-radius: 8px;
}
.show_divider_border_left {
  border-left: 1px solid rgba(0, 0, 0, 0.085);
}
.center_aligned_file_name {
  display: flex;
  align-items: center;
}
.inline_block{
  display: inline-block;
}
.attachment_name_max_width {
  max-width: var(--attachment_name_max_width);
  /* overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; */
}
.show_divider_border_right {
  border-right: 1px solid rgba(0, 0, 0, 0.085);
}
.container_height {
  max-height: 95vh;
  overflow: auto;
}
.text-editor-reply .theme--light.v-sheet--outlined {
  border: 2px solid #2f80eb !important;
  border-radius: 8px !important;
  background-color: #f4f4f4;
}
.ck-editor-reply .ck.ck-toolbar .ck.ck-toolbar__separator {
  background: none !important;
}
.ck-editor-reply .ck.ck-toolbar {
  border: none;
  background: #fff;
}
.ck-editor-reply .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused) {
  background: #fff;
  border: none;
  border-color: none !important;
}
.ck-editor-reply .ck.ck-editor__main>.ck-editor__editable {
  background: #fff !important;
  border: none !important;
  border-color: none !important;
  box-shadow: none !important;
  height: 248px !important;
}
.attachments .theme--light.v-sheet--outlined {
  border: 1px solid black !important;
  border-radius: 8px !important;
  background-color: #eceff1 !important;
}
.subjectPart {
  height: 50px;
}
.ticketToolbar {
  background-color: rgb(244, 244, 244);
}
.content-wrapper {
  position: relative;
}
.edit-button {
  opacity: 0;
  transition: opacity 0.3s ease;
}
.content-wrapper:hover .edit-button {
  opacity: 1;
}
.rounded-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}
</style>
