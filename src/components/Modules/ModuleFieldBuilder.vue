<template>
  <div>
    <v-hover v-slot:default="{ hover }">
      <div>
        <template v-if="item.type === 1">
          <v-text-field outlined hide-details :label="$t(item.label)" :placeholder="item.placeholder" dense></v-text-field>
        </template>
        <template v-if="item.type === 2">
          <v-textarea outlined hide-details :label="$t(item.label)" :placeholder="item.placeholder" dense></v-textarea>
        </template>
        <template v-if="item.type === 3">
          <v-row v-if="item.default_value && item.default_value.is_multiselect" class="ma-0">
            <v-col class="pa-0 pl-2" cols="12">
              <label>{{ $t(item.label) }}:</label>
            </v-col>
          </v-row>
          <v-row class="ma-0">
            <v-col class="pa-0 pl-2" cols="12" lg="12" v-if="item.default_value && !item.default_value.is_multiselect">
              <v-checkbox dense hide-details :label="$t(item.label)"  class="pt-0"></v-checkbox>
            </v-col>
            <v-col class="pa-0 pl-2" cols="12" lg="12" v-else>
              <template v-for="(options, index) in item.default_value.options">
                <v-checkbox dense hide-details :label="options.label" :value="options.value" multiple :key="index"></v-checkbox>
              </template>
            </v-col>
          </v-row>
        </template>
        <template v-if="item.type === 4">
          <label>{{ $t(item.label) }}:</label>
          <v-radio-group dense row hide-details>
            <v-radio v-for="(options, index) in item.default_value.options" :key="index" :label="options.label" :value="options.value"></v-radio>
          </v-radio-group>
        </template>
        <template v-if="item.type === 5">
          <template v-if="item.default_value.isAPI">
            <v-autocomplete outlined :items="item.default_value.options" :label="$t(item.label)" dense
            autocomplete="off" :ref="`searchInput${item._id}`"
            :placeholder="item.placeholder" clearable hide-details :item-text="item.default_value.name" :item-value="item.default_value.name"></v-autocomplete>
          </template>
          <template v-else>
            <v-autocomplete outlined :items="item.default_value.options" :label="$t(item.label)" :multiple="item.default_value.is_multiselect" dense
              :placeholder="item.placeholder" clearable hide-details item-text="label" item-value="value"></v-autocomplete>
          </template>
        </template>
        <template v-if="item.type === 6">
          <v-menu v-model="item.date_menu" :close-on-content-click="false" max-width="290">
            <template v-slot:activator="{ on }">
              <v-text-field outlined hide-details :placeholder="item.placeholder" clearable prepend-icon="mdi-calendar" :label="$t(item.label)" readonly v-on="on" dense @click:clear="fields[item.name] = null"></v-text-field>
            </template>
            <v-date-picker no-title v-model="item.date_value" @input="fields[item.name] = parseDate(item.date_value), item.date_menu = false" :first-day-of-week="1"></v-date-picker>
          </v-menu>
        </template>
        <template v-if="item.type === 7">
          <v-menu :ref="`time_menu_${item._id}`" :close-on-content-click="false" :nudge-right="40" :return-value.sync="fields[item.name]" transition="scale-transition" offset-y max-width="290px" min-width="290px">
            <template v-slot:activator="{ on }">
              <v-text-field outlined hide-details :placeholder="item.placeholder" clearable prepend-icon="mdi-timer" :label="$t(item.label)" readonly v-on="on" dense @click:clear="fields[item.name] = null"></v-text-field>
            </template>
            <v-time-picker v-if="item.time_menu" format="24hr" full-width @click:minute="$refs[`time_menu_${item._id}`][0].save(fields[item.name])"></v-time-picker>
          </v-menu>
        </template>
        <template v-if="item.type === 8">
          <v-file-input outlined :label="$t(item.label)" hide-details :placeholder="item.placeholder" dense></v-file-input>
        </template>
        <template v-if="item.type === 9">
          <v-subheader v-if="item.label" class='pa-0'><strong>{{ $t(item.label) }}:</strong></v-subheader>
          <v-divider></v-divider>
        </template>
        <template v-if="item.type === 10">
          <v-subheader v-if="item.label" class='pa-0'><strong>{{ $t(item.label) }}:</strong></v-subheader>
          <VueSignaturePad width="100%" :height="`${item.columns ? $formatter.setSignaturePadHeight(item.columns): 250}px`" class="signature--pad" :class="$vuetify.theme.dark ? 'signature--pad--dark' : ''" :ref="`signaturePad_${item._id}`"/>
        </template>
        <template v-if="item.type === 11">
          <drop @dragenter="panelHighlighter(item._id)" @dragleave="hidePanelHighlighter(item._id)" @drop="droppedItem(item)">
            <v-card class="pa-1" :class="fieldDragging ? 'custom_pointer_event' : ''">
              <v-card-title class="pa-1 caption font-weight-bold">
                {{ $t(item.label) }}
                <v-spacer></v-spacer>
                <v-btn icon small color="info" fab @click="clonePanelHandler(item)">
                  <v-icon> mdi-content-copy </v-icon>
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-1" :class="panelDragging ? 'panel-drop-highlight' : ''">
                <div :id="`${item._id}_panelFieldDroppingArea`" class="row ma-0 px-3 pb-10">
                  <v-col cols="12" :md="subField.columns ? subField.columns : (subField.type === 10 || subField.type === 11 || subField.type === 12 || subField.type === 14) ? '12' : '3'"
                    v-for="subField in item.panel_fields" :key="subField._id">
                    <module-builder
                      :fields="fields"
                      :item="subField"
                      :parseDate="parseDate"
                      :edit="edit"
                      :remove="remove"
                      :isBooking="isBooking"
                    ></module-builder>
                  </v-col>
                  <v-col cols="12" id="no-fields" v-if="!item.panel_fields || item.panel_fields.length < 1">
                    <v-alert color="primary" class="text-center" outlined dark border="left" prominent :style="{ 'min-height': `100px` }">
                      <span class="text-center">
                      {{ $t('dropFields') }}
                      </span>
                    </v-alert>
                  </v-col>
                </div>
              </v-card-text>
            </v-card>
          </drop>
        </template>
        <template v-if="item.type === 12">
          <v-text-field outlined hide-details :label="$t(item.label)" :placeholder="item.placeholder" dense></v-text-field>
        </template>
        <template v-if="item.type === 13">
          <v-text-field outlined hide-details :label="$t(item.label)" :placeholder="item.placeholder" dense></v-text-field>
        </template>
        <template v-if="item.type === 14">
          <v-text-field outlined hide-details :label="$t(item.label)" :placeholder="item.placeholder" dense></v-text-field>
        </template>
        <template v-if="item.type === 15">
          <v-autocomplete outlined :items="item.default_value.options" :label="$t(item.label)" :multiple="item.default_value.is_multiselect" dense
          :placeholder="item.placeholder" clearable hide-details item-text="label" item-value="value"></v-autocomplete>
        </template>
        <template v-if="item.type === 16">
          <v-menu v-model="item.dateTimeMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
            <template  v-slot:activator="{ on }">
              <v-text-field slot="activator" clearable :label="$t(item.label)" prepend-icon="mdi-timetable" v-on="on" outlined dense hide-details></v-text-field>
            </template>
            <v-tabs v-model="item.active" color="primary lighten-1" dark centered slider-color="white">
              <v-tab ripple>
                <v-icon color="white" class="pr-2">mdi-calendar</v-icon>
              </v-tab>
              <v-tab ripple>
                <v-icon color="white" class="pr-2">mdi-clock-outline</v-icon>
              </v-tab>
              <v-tab-item>
                <v-date-picker v-model="item.dateTimePicker" color="primary lighten-1"  no-title @change="item.active = 1" :first-day-of-week="1"></v-date-picker>
              </v-tab-item>
              <v-tab-item>
                <v-card flat>
                  <v-time-picker format="24hr" :close-on-content-click="false" v-model="item.timePicker" @change="item.dateTimeMenu = false"  color="primary lighten-1"></v-time-picker>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-menu>
        </template>
        <template v-if="item.type === 17">
          <v-file-input v-if="item.label" outlined hide-details :label="$t(item.label)" :placeholder="item.placeholder" dense multiple></v-file-input>
        </template>
        <template v-if="item.type === 18">
          <v-text-field disabled outlined hide-details :label="$t(item.label)" :placeholder="item.placeholder" dense></v-text-field>
        </template>
        <v-expand-transition>
          <v-layout justify-end v-if="hover">
            <v-fade-transition>
              <v-btn text x-small icon color="info" @click="edit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
            </v-fade-transition>
            <v-fade-transition>
              <v-btn text x-small icon color="error" @click="remove(item)" v-if="!item.is_internal">
                <v-icon> mdi-window-close </v-icon>
              </v-btn>
            </v-fade-transition>
          </v-layout>
        </v-expand-transition>
      </div>
    </v-hover>
    <v-dialog v-model="showCloneDialog" persistent width="400" class="mt-0">
      <v-card>
        <v-card-title :style="`background-color: ${systemDetails.themecolor}; color: ${systemDetails.textcolor}`" class="pa-3 pb-2 body-1">
          {{ $t('confirmation') }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-5 black--text">
          {{ $t('sureToCloneFields') }}
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-flex class="text-center">
            <v-btn color="success" class="mr-3" id="cloneConfirm" :loading="loading" @click="confirmToClone">{{ $t('yes') }}</v-btn>
            <v-btn color="error" id="cloneClose" @click="showCloneDialog=false">{{ $t('no') }}</v-btn>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!---Validation-->
    <v-dialog v-model="validationDialog" persistent width="1000px" class="mt-0">
      <field-validation></field-validation>
    </v-dialog>
  </div>
</template>
<script>
import { Drop } from 'vue-drag-drop'
import { mapGetters } from 'vuex'
export default {
  props: {
    item: {
      type: Object
    },
    fields: {
      type: Object
    },
    addToPanel: {
      type: Function
    },
    parseDate: {
      type: Function
    },
    edit: {
      type: Function
    },
    remove: {
      type: Function
    },
    fieldDragging: {
      type: Boolean,
      default: false
    },
    isBooking: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showCloneDialog: false,
      clonedPanel: {},
      loading: false,
      panelDragging: false,
      validationDialog: false
    }
  },
  components: {
    Drop,
    ModuleBuilder: () => import('./ModuleFieldBuilder'),
    fieldValidation: () => import('./FieldValidation')
  },
  computed: {
    ...mapGetters(['systemDetails'])
  },
  mounted () {
    this.$root.$on('hideLoadingForCloneFields', () => {
      this.loading = false
      this.showCloneDialog = false
    })
  },
  methods: {
    clonePanelHandler (panel) {
      this.clonedPanel = panel
      this.showCloneDialog = true
    },
    confirmToClone () {
      this.loading = true
      this.$root.$emit('clonePanelEvent', {
        model: this.clonedPanel,
        callback: () => {
          this.loading = false
          this.showCloneDialog = false
        }
      })
    },
    droppedItem (item) {
      this.hidePanelHighlighter(item._id)
      this.addToPanel(item)
    },
    panelHighlighter (id) {
      if (!this.fieldDragging) return
      this.panelDragging = true
      this.$eventBus.$emit('isPanelHighlighted', true)
      var fieldDropPanel = document.getElementById(`${id}_panelFieldDroppingArea`)
      if (fieldDropPanel) {
        var children = Array.from(fieldDropPanel.children)
        var listOfAllActiveFieldsWithValues = []
        children.forEach(child => {
          const obj = { element: child }
          const isDropColExists = children.length === 1 && children[0].id === 'no-fields'
          obj.columns = parseInt(child.classList[isDropColExists ? 1 : 0].split('-')[isDropColExists ? 1 : 2])
          listOfAllActiveFieldsWithValues.push(obj)
        })
        let rowReferenceObj = { previousRows: 0, currentRowOccupiedColumns: 0 }
        listOfAllActiveFieldsWithValues.forEach((field, index) => {
          rowReferenceObj.currentRowOccupiedColumns += field.columns
          let tempColumns = rowReferenceObj.currentRowOccupiedColumns
          if ((index + 1) !== listOfAllActiveFieldsWithValues.length) tempColumns += listOfAllActiveFieldsWithValues[index + 1].columns
          if (tempColumns > 12) {
            rowReferenceObj.previousRows += 1
            rowReferenceObj.currentRowOccupiedColumns = 0
          }
        })
        let newElementColumn = 12 - rowReferenceObj.currentRowOccupiedColumns
        newElementColumn = newElementColumn === 0 ? 12 : newElementColumn
        var div = document.createElement('div')
        div.setAttribute('class', `col col-${newElementColumn}`)
        div.setAttribute('style', 'border: 3px dashed #1fb2aa;')
        fieldDropPanel.appendChild(div)
      }
    },
    hidePanelHighlighter (id) {
      if (!this.fieldDragging) return
      this.panelDragging = false
      this.$eventBus.$emit('isPanelHighlighted', false)
      var fieldDropPanel = document.getElementById(`${id}_panelFieldDroppingArea`)
      if (fieldDropPanel) {
        var children = Array.from(fieldDropPanel.children)
        fieldDropPanel.removeChild(children[children.length - 1])
      }
    },
    openValidationDialog () {
      this.validationDialog = true
    }
  },
  beforeDestroy () {
    this.$root.$off('hideLoadingForCloneFields')
  }
}
</script>
<style>
.panel-drop-highlight {
  transition: background-color 0.5s ease !important;
  background-color: #D3D3D3 !important;
  border: 1px dashed #8198af !important;
}
.custom_pointer_event {
  pointer-events: none !important;
}
.v-picker__title {
  padding: 2px !important;
}
</style>
