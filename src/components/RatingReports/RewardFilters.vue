<template>
  <div>
    <v-card flat>
      <v-card-text class="pa-0 ma-0">
        <v-list class="text-left" dense>
          <template v-for="(field, i) in listOfAllActiveFieldsWithValues">
            <v-col cols="2" xl="12" lg="12" class="pa-0" style="display:inline-block;" :key="i">
              <v-row>
                <v-col cols="3" class="py-0">
                  <v-list-item-title  class="body-2 font-weight-bold">{{ field.text }}</v-list-item-title>
                </v-col>
                <v-col cols="3" class="py-2">
                  <v-autocomplete class="mb-2 custom-height" outlined :items="field.type === 7 ? filterItemsTime : field.type === 13 ?
                    filterItemsNumber : ([5, 15, 3, 4].includes(field.type) ? filterItemsSelect : (field.type === 6 || field.type === 16 ? filterItemsDate : filterItemsDefault))"
                    :item-text=" (val) => field.type === 5 ||  field.type === 15 ? $t(val.text) : val.text"
                    item-value="value" v-model="field.selected" dense hide-details @change="reinit += 1">
                  </v-autocomplete>
                </v-col>
                <v-col cols="4" class="py-2">
                  <template>
                    <v-text-field dense hide-details v-if="![3, 4, 5, 6, 7, 15, 16].includes(field.type) && !field.isSubModule" :placeholder="$t('typeHere')"
                      v-model="field.inputValue" outlined @keypress.enter="$root.$emit('applyFilters')" class="custom-height">
                    </v-text-field>
                    <v-autocomplete class="custom-height" outlined :items="getUsers" item-text="name" item-value="_id" v-model="field.inputValue" dense hide-details v-else-if="field.type === 15"
                      multiple>
                      <template v-slot:selection="{ item, index }">
                        <span v-if="index === 0">{{ item.name }}</span>
                        <span
                          v-if="index === 1"
                          class="grey--text caption pt-1 ml-2"
                        > (+{{ field.inputValue.length - 1 }} others)</span>
                      </template>
                    </v-autocomplete>
                    <template v-else-if="field.type === 3">
                      <v-autocomplete class="custom-height" outlined :items="[{text: $t('selected'), value: true }, {text: $t('notSelected'), value: false }]" item-text="text" item-value="value"
                        v-model="field.inputValue" dense hide-details>
                      </v-autocomplete>
                    </template>
                    <template v-else-if="field.type === 4 && field.default_value">
                      <v-autocomplete class="selection custom-height custom-autocomplete" outlined :items="field.default_value.options" item-value="value" v-model="field.inputValue" dense hide-details multiple
                        :item-text="field.allValues.enableoptiontranslations ? val => field.allValues.is_internal ? $t(`${$route.params.name}_${field.allValues.label}_option_${val.value}`) : $t(`${field.allValues.label}_option_${val.value}`) : val => $t(val.label)">
                        <template #selection="{ item, index }">
                          <span v-if="index === 0" class="mb-3"> {{ item.label }} </span>
                          <small v-if="index === 1" class="grey--text pt-1 ml-2" style="font-size:10px"> (+{{ field.inputValue.length - 1 }} others)</small>
                        </template>
                      </v-autocomplete>
                    </template>
                    <template v-else-if="field.type === 5 && field.default_value">
                      <v-autocomplete class="selection custom-height custom-autocomplete"  outlined :items="field.default_value.options" item-value="value" v-model="field.inputValue" dense hide-details
                        :item-text="field.allValues.enableoptiontranslations ? val => field.allValues.is_internal ? $t(`${$route.params.name}_${field.allValues.label}_option_${val.value}`) : $t(`${field.allValues.label}_option_${val.value}`) : val => $t(val.label)"
                        v-if="field.default_value.selectType === DEFAULT" multiple>
                        <template #selection="{ item, index }">
                          <span v-if="index === 0" class="mb-3">{{  field.allValues.enableoptiontranslations ? field.allValues.is_internal ? $t(`${$route.params.name}_${field.allValues.label}_option_${item.value}`) : $t(`${field.allValues.label}_option_${item.value}`) : $t(item.label) }}</span>
                          <span
                            v-if="index === 1"
                            class="grey--text caption pt-1 ml-2"
                          > (+{{ field.inputValue.length - 1 }} others)
                          </span>
                        </template>
                      </v-autocomplete>
                      <v-autocomplete class="selection custom-height custom-autocomplete" outlined :items="field.default_value.options" item-text="data.name" item-value="_id" v-model="field.inputValue" dense hide-details multiple
                        v-if="field.default_value.selectType === MODULE" ref="filterSearchText" @keydown="preventSpecialCharacters($event)"
                        @keyup="$event.keyCode !== 13 ? loadValues(i) : ''">
                        <template #selection="{ item, index }">
                          <span v-if="index === 0" class="mb-3"> {{ item.data.name }} </span>
                          <span
                            v-if="index === 1"
                            class="grey--text caption pt-1 ml-2"
                          > (+{{ field.inputValue.length - 1 }} others)
                          </span>
                        </template>
                      </v-autocomplete>
                    </template>
                    <template v-else-if="field.type === 6">
                      <v-row :key="reinit">
                        <v-col v-if="['created_at', 'modified_at', 'before', 'after'].includes(field.selected)" cols="12">
                          <v-menu v-model="field.datePicker" :close-on-content-click="true" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                               <v-text-field dense outlined hide-details v-model="field.date" :placeholder="$t('date')" class="mb-3"
                                @focusout="field.datePicked = $formatter.formatDate(field.date, userDetails.dateformat, 'YYYY-MM-DD')"
                                @focus="field.datePicked = $formatter.formatDate(field.date, userDetails.dateformat, 'YYYY-MM-DD')" prepend-icon="mdi-calendar"
                                readonly v-bind="attrs" v-on="on">
                              </v-text-field>
                            </template>
                            <v-date-picker no-title v-model="field.datePicked" @input="datePickedHandler(field, i, 1)" :first-day-of-week="1"></v-date-picker>
                          </v-menu>
                        </v-col>
                        <v-col v-else-if="field.selected === 'between'" cols="12">
                          <v-menu v-model="field.startdatePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto" :key="i">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field outlined hide-details v-model="field.startdate" :placeholder="$t('startDate')" dense
                                @focusout="field.startDatePicked = $formatter.formatDate(field.startdate, userDetails.dateformat, 'YYYY-MM-DD')"
                                @focus="field.datePicked = $formatter.formatDate(field.startdate, userDetails.dateformat, 'YYYY-MM-DD')" prepend-icon="mdi-calendar" readonly
                                v-bind="attrs" v-on="on">
                              </v-text-field>
                            </template>
                            <v-date-picker no-title v-model="field.startDatePicked"
                              @input="datePickedHandler(field, i, 2)" :first-day-of-week="1">
                            </v-date-picker>
                          </v-menu>
                          <v-menu v-model="field.enddatePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field outlined hide-details v-model="field.enddate" :placeholder="$t('endDate')" class="mt-2 mb-3" dense
                              @focusout="field.endDatePicked = $formatter.formatDate(field.enddate, userDetails.dateformat, 'YYYY-MM-DD')"
                              @focus="field.endDatePicked = $formatter.formatDate(field.enddate, userDetails.dateformat, 'YYYY-MM-DD')" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" >
                            </v-text-field>
                            </template>
                            <v-date-picker no-title v-model="field.endDatePicked" :min="field.startDatePicked" :first-day-of-week="1"
                              @input="datePickedHandler(field, i, 3)"
                            >
                            </v-date-picker>
                          </v-menu>
                        </v-col>
                        <v-col v-if="['withinnext', 'withinpast'].includes(field.selected)" class="py-0" cols="12">
                          <v-text-field hide-details outlined dense :placeholder="$t('days')" v-model="field.within" @keydown="preventSpecialCharacters($event)" suffix="days" class="pt-2 mb-1 pb-1" :rules="$_requiredValidation"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </template>
                    <template  v-else-if="field.type === 7">
                      <v-row :key="reinit">
                        <template v-if="field.selected === 'between'">
                        <v-col  class="py-0 pt-2" cols="6" :key="reinit">
                          <v-text-field outlined dense slot="activator" v-model="field.start">
                            <template v-slot:append>
                              <v-menu :close-on-content-click="false" :ref="`startTimePicker_${i}`" v-model="field.startTimeMenu" transition="scale-transition" offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                  <v-icon size="23" class="pt-1" v-on="on">mdi-clock-outline</v-icon>
                                </template>
                                <v-time-picker color="primary" :allowed-minutes="allowedStep" v-model="field.startTimeValue" format="24hr"
                                  @click:minute="$refs[`startTimePicker_${i}`][0].save(field.timeValue); timePickedHandler(i, 2)">
                                </v-time-picker>
                              </v-menu>
                            </template>
                          </v-text-field>
                        </v-col>
                        <v-col   cols="6" :key="`end_${reinit}`">
                        <v-text-field outlined dense hide-details slot="activator" v-model="field.end">
                            <template v-slot:append>
                              <v-menu :close-on-content-click="false" :ref="`endtimepicker_${i}`" v-model="field.endTimeMenu" transition="scale-transition" offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                  <v-icon size="23" class="pt-1" v-on="on">mdi-clock-outline</v-icon>
                                </template>
                                <v-time-picker color="primary" :allowed-minutes="allowedStep" :min="field.startTimeValue" v-model="field.endTimeValue" format="24hr"
                                  @click:minute="$refs[`endtimepicker_${i}`][0].save(field.timeValue); timePickedHandler(i, 3)">
                                </v-time-picker>
                              </v-menu>
                            </template>
                          </v-text-field>
                        </v-col>
                        </template>
                        <v-col v-else class="py-0 pt-2" cols="12">
                          <v-text-field hide-details outlined dense slot="activator" class="mt-1" v-model="field.inputValue" :key="reinit">
                            <template v-slot:append>
                              <v-menu :close-on-content-click="false" :ref="`timepicker_${i}`" v-model="field.timeMenu" transition="scale-transition" offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                  <v-icon size="23" class="pt-1" v-on="on">mdi-clock-outline</v-icon>
                                </template>
                                <v-time-picker color="primary" :allowed-minutes="allowedStep" v-model="field.timeValue" format="24hr"
                                  @click:minute="$refs[`timepicker_${i}`][0].save(field.timeValue); timePickedHandler(i, 1)">
                                </v-time-picker>
                              </v-menu>
                            </template>
                          </v-text-field>
                        </v-col>
                      </v-row>
                    </template>
                    <template v-else-if="field.type === 16">
                      <v-row :key="reinit">
                        <v-col v-if="['created_at', 'modified_at', 'before', 'after'].includes(field.selected)" cols="12">
                          <v-menu v-model="field.dateTimeMenu" :close-on-content-click="false" :nudge-right="40" :nudge-top="50" transition="scale-transition" min-width="290px">
                            <template  v-slot:activator="{ on }">
                              <v-text-field outlined slot="activator" v-model="field.inputDate" :id="`_text${field.name}`"
                                prepend-icon="mdi-timetable" @click:prepend="on.click" dense hide-details readonly></v-text-field>
                            </template>
                            <v-tabs v-model="field.active" color="primary lighten-1" dark centered slider-color="white" height="37" :key="`menu${reInitDateTimePicker}`">
                              <v-tab ripple>
                                <v-icon color="white" class="pr-2">mdi-calendar</v-icon>
                              </v-tab>
                              <v-tab ripple>
                                <v-icon color="white" class="pr-2">mdi-clock-outline</v-icon>
                              </v-tab>
                              <v-tab-item>
                                <v-date-picker v-model="field.dateTimePicker" color="primary lighten-1" no-title @change="datetimeHandler(field, i)" :id="`_${field.name}`" :first-day-of-week="1"></v-date-picker>
                              </v-tab-item>
                              <v-tab-item>
                                <v-card flat>
                                  <v-time-picker format="24hr" :close-on-content-click="false" v-model="field.timePicker" color="primary lighten-1"
                                    @change="dateTimePickerHandler(field, i , 1)">
                                  </v-time-picker>
                                </v-card>
                              </v-tab-item>
                            </v-tabs>
                          </v-menu>
                        </v-col>
                        <v-col v-else-if="field.selected === 'between'" cols="12">
                          <v-menu v-model="field.dateTimeStartMenu" :close-on-content-click="false" :nudge-right="40" :nudge-top="50" transition="scale-transition" min-width="290px">
                            <template  v-slot:activator="{ on }">
                              <v-text-field outlined slot="activator" v-model="field.inputStartDate" :id="`_text${field.name}`"
                                prepend-icon="mdi-timetable" @click:prepend="on.click" dense hide-details></v-text-field>
                            </template>
                            <v-tabs v-model="field.active" color="primary lighten-1" dark centered slider-color="white" height="37" :key="`menu${reInitDateTimePicker}`">
                              <v-tab ripple>
                                <v-icon color="white" class="pr-2">mdi-calendar</v-icon>
                              </v-tab>
                              <v-tab ripple>
                                <v-icon color="white" class="pr-2">mdi-clock-outline</v-icon>
                              </v-tab>
                              <v-tab-item>
                                <v-date-picker v-model="field.dateTimeStartPicker" color="primary lighten-1" no-title @change="datetimeHandler(field, i)" :id="`_${field.name}`" :first-day-of-week="1"></v-date-picker>
                              </v-tab-item>
                              <v-tab-item>
                                <v-card flat>
                                  <v-time-picker format="24hr" :close-on-content-click="false" v-model="field.startTimePicker" color="primary lighten-1"
                                    @change="dateTimePickerHandler(field, i , 2)">
                                  </v-time-picker>
                                </v-card>
                              </v-tab-item>
                            </v-tabs>
                          </v-menu>
                          <v-menu v-model="field.dateTimeEndMenu" :close-on-content-click="false" :nudge-right="40" :nudge-top="50" transition="scale-transition" min-width="290px">
                            <template  v-slot:activator="{ on }">
                              <v-text-field class="mt-2" outlined slot="activator" v-model="field.inputEndDate" :id="`_text${field.name}`"
                                prepend-icon="mdi-timetable" @click:prepend="on.click" dense hide-details></v-text-field>
                            </template>
                            <v-tabs v-model="field.active" color="primary lighten-1" dark centered slider-color="white" height="37" :key="`endmenu${reInitDateTimePicker}`">
                              <v-tab ripple>
                                <v-icon color="white" class="pr-2">mdi-calendar</v-icon>
                              </v-tab>
                              <v-tab ripple>
                                <v-icon color="white" class="pr-2">mdi-clock-outline</v-icon>
                              </v-tab>
                              <v-tab-item>
                                <v-date-picker v-model="field.endDateTimePicker" color="primary lighten-1" no-title @change="datetimeHandler(field, i)" :id="`_${field.name}`" :min="field.dateTimeStartPicker" :first-day-of-week="1"></v-date-picker>
                              </v-tab-item>
                              <v-tab-item>
                                <v-card flat>
                                  <v-time-picker format="24hr" :close-on-content-click="false" v-model="field.endTimePicker" color="primary lighten-1"
                                    @change="dateTimePickerHandler(field, i , 3)">
                                  </v-time-picker>
                                </v-card>
                              </v-tab-item>
                            </v-tabs>
                          </v-menu>
                        </v-col>
                        <v-col v-if="['withinnext', 'withinpast'].includes(field.selected)" class="py-0" cols="12">
                          <v-text-field class="mt-2" outlined dense :placeholder="$t('days')" v-model="field.within" @keydown="preventSpecialCharacters($event)" suffix="days" :rules="$_requiredValidation"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </template>
                  </template>
                </v-col>
                <v-col cols="1" class="py-0">
                  <v-icon size="18" class="mt-4" @click="$emit('removeItem', i)" color="black">mdi-close</v-icon>
                </v-col>
              </v-row>
            </v-col>
          </template>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: ['listOfAllActiveFieldsWithValues'],
  data () {
    return {
      group: null,
      reRender: 0,
      customColor: '',
      reinit: 0,
      reInitDateTimePicker: 0
    }
  },
  computed: {
    ...mapGetters(['userDetails', 'listOfModules', 'getUsers', 'systemDetails'])
  },
  mounted () {
    this.$root.$on('runReports', () => {
      this.constructValues()
    })
    this.$root.$on('clearRewardsFilters', (data) => {
      if (data) this.removeRewardsFilters()
    })
  },
  methods: {
    preventSpecialCharacters (e) {
      if (/^\W$/.test(e.key)) {
        e.preventDefault()
      }
    },
    testing (i) {
      console.log(i)
    },
    allowedStep: m => m % 5 === 0,
    constructValues () {
      // let getActiveItems = this.$formatter.cloneVariable(this.listOfAllActiveFieldsWithValues)
      let getActiveItems = this.listOfAllActiveFieldsWithValues
      if (getActiveItems.length) {
        getActiveItems.forEach((element) => {
          if (element.type === 6 && ['before', 'after'].includes(element.selected)) {
            element.date = this.$formatter.formatDate(element.date, this.userDetails.dateformat, 'YYYY-MM-DDTHH:mm:ss')
          }
          if (element.type === 6 && element.selected === 'between') {
            if (element.startdate) element.startdate = element.startdate ? this.$formatter.formatDate(element.startdate, this.userDetails.dateformat, 'YYYY-MM-DDTHH:mm:ss') : null
            if (element.enddate) element.enddate = element.startdate ? this.$formatter.formatDate(element.enddate, this.userDetails.dateformat, 'YYYY-MM-DDTHH:mm:ss') : null
          }
          if (!element.selected) element.selected = (element.type === 6) ? 'today' : 'is'
          element.condition = element.selected
          var value = {}
          for (let i in element) {
            if (!['field', 'selected', 'type', '_id', 'dbRef', 'selectBox', 'show', 'text', 'value'].includes(i)) {
              value[i] = element[i]
            }
          }
          let index = this.listOfAllActiveFieldsWithValues.findIndex(x => x._id ? (x._id === element._id) : x.module === element.module)
          if (index !== -1) {
            element.condition = element.selected
            element.field = element._id
            element.fieldtype = element.type
            element.value = JSON.stringify(value)
          }
        })
        this.runReportsHandler(getActiveItems)
      } else {
        this.$root.$emit('rewardsFilters', [])
      }
    },
    runReportsHandler (conditions) {
      this.$root.$emit('rewardsFilters', conditions)
    },
    async loadValues (i, subModuleName = '') {
      let searchTerm = this.$refs.filterSearchText[0].lazySearch
      if (searchTerm || (this.listOfAllActiveFieldsWithValues[i].inputValue && this.listOfAllActiveFieldsWithValues[i].inputValue.length)) {
        if (searchTerm) {
          await this.$api.execute('get', `moduledata/${subModuleName || this.listOfAllActiveFieldsWithValues[i].default_value.selectedModule}/search?searchterm=${searchTerm}`).then(response => {
            this.listOfAllActiveFieldsWithValues[i].default_value.options = response.data
          })
        }
      } else this.listOfAllActiveFieldsWithValues[i].default_value.options = []
    },
    datePickedHandler (field, index, type) {
      switch (type) {
        case 1:
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'datePicker', false)
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'date', this.$formatter.formatDate(field.datePicked, 'YYYY-MM-DD', this.userDetails.dateformat))
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'inputValue', this.$formatter.formatDate(field.date, this.userDetails.dateformat, 'YYYY-MM-DDTHH:mm:ss'))
          break
        case 2:
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'startdatePicker', false)
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'startdate', this.$formatter.formatDate(field.startDatePicked, 'YYYY-MM-DD', this.userDetails.dateformat))
          break
        case 3:
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'enddatePicker', false)
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'enddate', this.$formatter.formatDate(field.endDatePicked, 'YYYY-MM-DD', this.userDetails.dateformat))
          break
      }
    },
    timePickedHandler (i, type) {
      switch (type) {
        case 1:
          this.$set(this.listOfAllActiveFieldsWithValues[i], 'timeMenu', false)
          this.$set(this.listOfAllActiveFieldsWithValues[i], 'inputValue', this.listOfAllActiveFieldsWithValues[i].timeValue)
          break
        case 2:
          this.$set(this.listOfAllActiveFieldsWithValues[i], 'startTimeMenu', false)
          this.$set(this.listOfAllActiveFieldsWithValues[i], 'start', this.listOfAllActiveFieldsWithValues[i].startTimeValue)
          break
        case 3:
          this.$set(this.listOfAllActiveFieldsWithValues[i], 'endTimeMenu', false)
          this.$set(this.listOfAllActiveFieldsWithValues[i], 'end', this.listOfAllActiveFieldsWithValues[i].endTimeValue)
          break
      }
      this.reinit++
    },
    dateTimePickerHandler (field, index, type) {
      switch (type) {
        case 1:
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'dateTimeMenu', false)
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'inputDate', this.$formatter.formatDateTimeForPicker(field.dateTimePicker, field.timePicker))
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'date', this.$formatter.formatDate(field.inputDate, `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DDTHH:mm:ss'))
          break
        case 2:
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'dateTimeStartMenu', false)
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'inputStartDate', this.$formatter.formatDateTimeForPicker(field.dateTimeStartPicker, field.startTimePicker))
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'startdate', this.$formatter.formatDate(field.inputStartDate, `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DDTHH:mm:ss'))
          break
        case 3:
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'dateTimeEndMenu', false)
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'inputEndDate', this.$formatter.formatDateTimeForPicker(field.endDateTimePicker, field.endTimePicker))
          this.$set(this.listOfAllActiveFieldsWithValues[index], 'enddate', this.$formatter.formatDate(field.inputEndDate, `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DDTHH:mm:ss'))
          break
      }
    },
    datetimeHandler (field, index) {
      this.reInitDateTimePicker++
      this.$set(this.listOfAllActiveFieldsWithValues[index], 'active', 1)
    },
    removeRewardsFilters () {
      this.listOfAllActiveFieldsWithValues.forEach((element, index) => {
        element.show = false
        element.selectBox = false
        element.inputValue = ''
        switch (element.type) {
          case 6: element.selected = 'today'
            element.date = null
            element.startdatePicker = null
            element.startDatePicked = null
            element.endDatePicked = null
            element.startdate = null
            element.enddatePicker = null
            element.enddate = null
            element.within = null
            break
          case 7: element.selected = 'is'
            element.endTimeValue = null
            element.startTimeValue = null
            element.timeValue = null
            element.start = null
            element.end = null
            break
          case 16: element.selected = 'today'
            element.date = null
            element.dateTimePicker = null
            element.timePicker = null
            element.inputStartDate = null
            element.inputEndDate = null
            element.inputDate = null
            element.dateTimeStartPicker = null
            element.dateTimeEndPicker = null
            element.startdatePicker = null
            element.startDatePicked = null
            element.endDatePicked = null
            element.startdate = null
            element.enddatePicker = null
            element.endTimePicker = null
            element.startTimePicker = null
            element.enddate = null
            element.within = null
            break
          default: element.selected = 'is'
        }
      })
    }
  },
  destroyed () {
    this.$root.$off('runReports')
  }
}
</script>
<style>
.custom-height.v-text-field.v-text-field--enclosed:not(.v-text-field--rounded) > .v-input__control > .v-input__slot, .v-text-field.v-text-field--enclosed .v-text-field__details {
  min-height: 20px !important;
  max-width: 100% !important;
}
.selection.theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state) > .v-input__control > .v-input__slot fieldset {
  color: rgba(0, 0, 0, 0.38);
    border: 2px solid currentColor;
    height: calc(100% - 3px) !important;
  /* max-width: 190px !important; */
}
/* .custom-autocomplete.v-select.v-text-field--outlined:not(.v-text-field--single-line).v-input--dense .v-select__selections {
    height:40px !important;
} */
</style>
