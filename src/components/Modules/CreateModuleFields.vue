<template>
  <div v-if="currentModule && currentModule.accesscontrol && currentModule.accesscontrol.add">
    <v-dialog class="rewards" v-model="fromModuleAddRecord" persistent max-width="1300px">
      <v-card style="overflow-y:hidden !important;overflow-x:hidden !important" width="1000">
        <v-card-title class="pt-0 px-0">
          <v-toolbar dense flat dark :color="systemDetails.themecolor? systemDetails.themecolor : 'primary'">
            <v-toolbar-title>{{ $t('addRecordFor') }} - {{ setModuleName }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="fromModuleAddRecord = false;$emit('setProperty', false)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
          <module-render ref="formReferences" :listOfFields="listOfFields" :moduleName="setModuleName" :fields="fields" :isRecordCreation="!moduleObj._id"></module-render>
        </v-card-text>
        <v-row justify="center" class="pa-4">
          <v-card-actions>
            <v-btn color="primary" @click="saveUpdateHandler(FROM_MODULE_SAVE)" small>{{ $t('save') }}</v-btn>
            <v-btn color="purple" small dark @click="openTemplateDialog"  :loading="templateLoader">{{ $t('chooseTemplate') }}</v-btn>
            <v-btn color="error" small @click="fromModuleAddRecord = false">{{ $t('close') }}</v-btn>
          </v-card-actions>
        </v-row>
      </v-card>
    </v-dialog>
    <v-dialog v-model="templateDialog" persistent width="500">
      <template-render :listOfTemplates="listOfTemplates" v-if="templateDialog"></template-render>
    </v-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import mixins from '../../views/CustomModules/mixin'
export default {
  mixins: [mixins],
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    fieldValue: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      fields: {},
      listOfFields: [],
      setModuleName: '',
      moduleObj: {},
      fromModuleAddRecord: false,
      templateLoader: false,
      moduleId: null,
      listOfTemplates: [],
      templateDialog: false,
      MODULE_URL: 'moduledata',
      currentModule: {},
      skip: 0
    }
  },
  mounted () {
    this.addRecord()
    this.$root.$on('saveTemplate', (selectedTemplate) => {
      this.saveTemplate(selectedTemplate)
    })
    this.$root.$on('hideComponent', () => {
      this.templateDialog = false
      this.templateName = ''
    })
    this.$root.$on('FromModuleData', (data) => {
      this.constructFromModuleData(data)
    })
  },
  computed: {
    ...mapGetters(['getUsers', 'systemDetails', 'listOfModules'])
  },
  methods: {
    addRecord () {
      this.isFromModule = true
      let getModule = this.listOfModules.find((x) => x.name === this.item.selectedModule)
      if (getModule) {
        this.currentModule = getModule
        this.setModuleName = this.item.selectedModule
        this.moduleId = getModule._id
        let query = [{ $match: { Module_Id: getModule._id } }, { $sort: { Tab_Order: 1 } }]
        this.$api.execute('post', 'modulefields/query', query).then(async (result) => {
          if (result.data) {
            await this.constructModuleFields(result.data, getModule._id, this.skip)
            this.fields = { ...this.fields, ...this.fieldValue }
          }
          this.fromModuleAddRecord = true
        })
      }
    },
    openTemplateDialog () {
      this.templateLoader = true
      this.$api.execute('get', `foldertemplates/get_templates`)
        .then(({ data }) => {
          this.listOfTemplates = data
          this.templateDialog = true
          this.templateLoader = false
        })
    },
    saveUpdateHandler (type) {
      this.saveUpdateRecordHandler({
        moduleName: this.setModuleName,
        moduleId: this.moduleId,
        type,
        from: '',
        template_id: this.selectedTemplate
      })
    },
    saveTemplate (selectedTemplate) {
      this.selectedTemplate = selectedTemplate
      let obj = this.listOfTemplates.find(x => x.id === selectedTemplate)
      this.templateName = obj ? obj.name : ''
      this.templateDialog = false
    },
    constructFromModuleData (item) {
      let fromModuleObj = { _id: item._id, data: { name: item.data.name } }
      this.$root.$emit('fromModuleListData', fromModuleObj)
    }
  },
  components: {
    'module-render': () => import('@/components/Modules/ModuleFormRender'),
    'template-render': () => import('@/components/Modules/DocumentTemplate')
  },
  beforeDestroy () {
    this.$root.$off('saveTemplate')
    this.$root.$off('hideComponent')
    this.$root.$off('FromModuleData')
  }
}
</script>
