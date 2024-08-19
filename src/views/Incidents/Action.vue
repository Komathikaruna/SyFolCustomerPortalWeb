<template>
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
        <v-col cols="6"  class="ml-13">
          <v-breadcrumbs class="pa-1">
            <v-breadcrumbs-item href="#">{{ incidentRecordObj.subject }}</v-breadcrumbs-item>
            <v-breadcrumbs-item href="#">#{{ incidentRecordObj.number }}</v-breadcrumbs-item>
          </v-breadcrumbs>
        </v-col>
        <v-col cols="12">
          <v-divider horizontal></v-divider>
        </v-col>
      </v-row>
      <v-row class="pt-0 mt-0">
        <v-col cols="10" class="ma-0">
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
                    <v-card :color="getLighterColor(content.subcontentTypeColor)" class="mt-2"  :key="index">
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
        <v-col cols="2" class="pt-10">
          <v-card>
            <v-card-title class="pa-1 pl-5 pt-3">Properties</v-card-title>
            <v-divider horizontal></v-divider>
            <!-- <hr role="separator" aria-orientation="horizontal" class="mt-1 mx-1 v-divider theme--light"> -->
            <v-card-text style="color:#000000eb">
              <div class="mb-1">
                <template v-for="field in listOfFields">
                  <v-row :key="field._id" no-gutters class="pa-2">
                    <v-col cols="12">
                      <span class="font-weight-bold subtitle-1">{{ $t(field.label) }} </span>
                    </v-col>
                    <v-col cols="12">
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
        <v-col cols="10">
          <v-card style="background:#f7f9fa">
            <v-card-title>Enter your comments</v-card-title>
            <v-card-text>
              <html-editor v-model="comments"></html-editor>
            </v-card-text>
            <v-card-actions>
              <v-flex class="text-right mt-1">
                <v-btn color="primary" @click="addComments()">Send</v-btn>
              </v-flex>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable camelcase */
import CommonFunctions from '@/views/CustomModules/mixin.js'
import { mapGetters } from 'vuex'
// import Editor from '@/ckeditor'
export default {
  mixins: [CommonFunctions],
  data () {
    return {
      modelObj: {
        _id: this.$route.params.ticket_id
      },
      ticketid: '',
      ticketTerm: null,
      enableEditMode: false,
      mailsMerged: 0,
      MODULE_URL: 'tickets',
      ticketMails: [],
      // editor: Editor,
      editorConfig: {
        height: '250px'
      },
      emailRegex: /^([A-Za-z0-9_\-.+])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,})$/,
      isLoading: false,
      listOfComments: [],
      listOfModules: [],
      fieldsLoading: false,
      subject: '',
      assignedto: '',
      createdby: '',
      modifiedby: '',
      incident: {},
      subContentTypes: [],
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
  },
  computed: {
    ...mapGetters(['getUsers', 'getListOfTicketPriorities', 'getListOfTicketStatus', 'getListOfTicketCategory'])
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
    }
  },
  mounted () {
    this.getSingleRecordHandler()
    this.ticketsRelatedCustomModules = this.listOfModules.filter(x => x.incidents ? x.incidents.includes(this.$route.query.incidenttype) : '')
    this.$store.dispatch('getUsers')
    this.$store.dispatch('getTicketPriority')
    this.$store.dispatch('getTicketStatus')
    this.$store.dispatch('getTicketCategory')
    this.getIncident()
    this.getSubContents()
    this.getIncidentCustomFields()
    setTimeout(() =>{
       const editorElem = document.querySelector('.editor-content')
        editorElem.innerHTML = ''
    }, 1000)
  },
  methods: {
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
    getInitials (name) {
      if (name && name.indexOf(' ') !== -1) {
        const [firstName, lastName] = name.split(' ')
        return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
      } else {
        return name.substring(0, 2).toUpperCase()
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
        // this.calculateTimeDifference()
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
    },
    addComments () {
      console.log(this.comments)
    }
  }
}
</script>
<style>
.rounded-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}
</style>
