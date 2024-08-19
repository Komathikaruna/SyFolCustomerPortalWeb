<template>
  <div>
    <v-card class="overflow-hidden">
      <v-card-title class="pa-3 pb-2" :style="`background-color:${systemDetails.themecolor};color:${systemDetails.textcolor}`">
        <span class="body-1 font-weight-medium"> {{ payload.typeFieldName }} </span>
        <v-spacer></v-spacer>
          <v-icon :color="systemDetails && systemDetails.textcolor ? systemDetails.textcolor : '#ffffff'"  @click="handleRedirect()">mdi-close-circle</v-icon>
        </v-card-title>
      <v-divider></v-divider>
      <v-tabs v-model="propsTab" centered hide-slider>
        <v-tab v-for="(item, index) in propTabItems" :key="index" :style="propsTab === index ? $formatter.activeTabStyle(systemDetails.themecolor, systemDetails.textcolor, $vuetify.theme.dark) : $formatter.tabStyle(systemDetails.themecolor)"
        class="tab-bar mt-2 text-capitalize">
          {{ item.name }}
        </v-tab>
        <v-tab-item><!-- Properties -->
          <v-card color="basil" flat>
            <v-card-text>
              <v-form ref="fieldsForm">
                <v-container fluid class="pa-2">
                  <v-row>
                    <v-col cols="12" md="6">
                      <span v-if="properties.is_internal && properties._id">
                        {{ $t('name') }} : {{ properties.name }}
                      </span>
                      <v-text-field hide-details outlined :label="$t('name')" v-model="properties.name" :rules="properties.name ? fieldAndUniqueValidation : $_requiredValidation" dense
                      :disabled="!!properties._id" v-else>
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" md="6" v-if="properties.type !== 9 && properties.type !== 10 && properties.type !== 11 && properties.type !== 18">
                      <v-autocomplete outlined :items="validationList" v-model="properties.validation" clearable dense @click:clear="properties.validation = null" hide-details
                        item-text="text" item-value="value" :label="$t('validation')" :disabled="properties.name === 'name' || (payload.moduleName === 'Event' ? (properties.name === 'create_for') : false)">
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="6" v-if="properties.type !== 9 && properties.type !== 10 && properties.type !== 11 &&properties.type !== 15">
                      <v-text-field outlined hide-details :label="$t('placeholder')" v-model="properties.placeholder" required dense v-if="!properties.is_internal"></v-text-field>
                      <span v-else>{{ $t('placeholder') }} : {{ properties.placeholder }}</span>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field type="number" outlined dense hide-details :label="$t('columns')" v-model="properties.columns" required :rules="$_columnValidation"></v-text-field>
                    </v-col>
                    <template v-if="properties.type === 18">
                      <v-col cols="12" lg="6" md="6" sm="6">
                        <v-text-field outlined dense hide-details :label="$t('prefix')" v-model="autoIncrementPrefix" :placeholder="$t('prefixTextForNumber')"></v-text-field>
                      </v-col>
                      <v-col cols="12" lg="6" md="6" sm="6">
                        <v-text-field type="number" min="0" outlined dense hide-details :label="$t('startFrom')" @change="setStartFromLength" v-model="autoIncrementStartFrom" :placeholder="$t('startFrom')"></v-text-field>
                      </v-col>
                      <v-col cols="12" lg="6" md="6" sm="6">
                        <v-text-field type="number" @change="validateDigitLength" outlined dense hide-details :min="autoIncrementStartFromLength" :max="autoIncrementStartFromLength <= 7 ? 7 : ''" :label="$t('numberLength')" v-model="autoIncrementDigitLength" :placeholder="$t('maximumNumberDigits')"></v-text-field>
                      </v-col>
                    </template>
                    <v-col cols="12" md="6" v-if="properties.type === 5 || properties.type === 15">
                      <v-checkbox  :label="$t('isMultiSelect')" v-model="isMultiSelect" hide-details :disabled="properties.name !== 'assigned_to' && properties.is_internal"></v-checkbox>
                    </v-col>
                    <v-col cols="12" md="6" v-if="properties.type === 8">
                      <v-checkbox label="Is multiple files" v-model="isMultipleFiles" hide-details dense></v-checkbox>
                    </v-col>
                    <template v-if="properties.type === 1 || properties.type === 5 && selectType != 'module' || properties.type === 4">
                      <v-col cols="12" md="6">
                        <v-text-field outlined :label="$t('defaultValue')" v-model="properties.default_value" :hide-details="properties.type !== 5 && properties.type !== 4" persistent-hint dense
                          :transition="false" :hint="properties.type === 5 || properties.type === 4 ? !properties.default_value ? 'Enter one of the values from option' : '': ''"></v-text-field>
                      </v-col>
                    </template>
                    <template v-else-if="properties.type === 2">
                      <v-col cols="12" md="6">
                        <v-textarea outlined hide-details :label="$t('defaultValue')" v-model="properties.default_value"></v-textarea>
                      </v-col>
                    </template>
                    <template v-else-if="properties.type === 6">
                      <v-col cols="12" md="3">
                        <v-menu v-model="dateMenu" :close-on-content-click="false" max-width="290">
                          <template v-slot:activator="{ on }">
                            <v-text-field outlined hide-details v-model="properties.default_value" clearable prepend-icon="mdi-calendar" :label="$t('defaultValue')" readonly v-on="on" dense
                              @click:clear="properties.default_value = null, datePicker = null"></v-text-field>
                          </template>
                          <v-date-picker v-model="datePicker" @change="dateMenu = false" no-title :first-day-of-week="1"></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-checkbox :label="$t('setCurrentDate')" v-model="setcurrentDate" hide-details></v-checkbox>
                      </v-col>
                    </template>
                    <template v-else-if="properties.type === 7">
                      <v-col cols="12" md="6">
                        <v-menu ref="timeMenu" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" :return-value.sync="time" offset-y max-width="290px" min-width="290px">
                          <template v-slot:activator="{ on }">
                            <v-text-field outlined hide-details v-model="properties.default_value" label="Picker in menu" prepend-icon="mdi-timer" readonly v-on="on" dense></v-text-field>
                          </template>
                          <v-time-picker v-if="timeMenu" v-model="properties.default_value" format="24hr" full-width @click:minute="$refs.timeMenu.save(properties.default_value)"></v-time-picker>
                        </v-menu>
                      </v-col>
                    </template>
                    <v-col cols="12" md="6" v-if="properties.type === 5">
                      <!-- <v-radio-group v-model="selectType" row :disabled="properties.is_internal" @change="selectType === 'custom' ? listOfOptions = [] : listOfOptions = [{ color: '#1976D2FF'}]"> -->
                      <v-radio-group v-model="selectType" row :disabled="properties.is_internal">
                        <v-radio :label="$t('default')" value="default"></v-radio>
                        <v-radio :label="$t('fromModule')" value="module"></v-radio>
                        <v-radio :label="$t('custom')" value="custom"></v-radio>
                      </v-radio-group>
                    </v-col>
                    <!-- <v-col cols="12" md="6" v-if="properties.type !== 11 && !isBookingForm">
                      <v-checkbox :label="$t('isPrimary')" v-model="properties.is_primary" hide-details></v-checkbox>
                    </v-col> -->
                    <v-col cols="12" md="6" v-if="(properties.type !== 11 && properties.type !== 10 && !isBookingForm)">
                    <!-- <v-col cols="12" md="6" v-if="(properties.type !== 11 && properties.type !== 10 && !isBookingForm && (payload.moduleName === 'Event' ? (properties.name !== 'create_for') : true))"> -->
                      <v-layout wrap>
                        <v-checkbox :disabled="fieldSelectedForKView.includes(properties._id)" :label="$t('showInList')" v-model="properties.show_in_list" hide-details></v-checkbox>
                        <span v-if="fieldSelectedForKView.includes(properties._id)" class="ml-3 checkbox-warning red--text">{{ $t('usedInKanbanView') }}</span>
                      </v-layout>
                    </v-col>
                    <v-col cols="12" md="6" v-if="currentModule && currentModule.isbookable">
                      <v-checkbox :label="$t('showInBooking')" v-model="properties.show_in_booking" hide-details></v-checkbox>
                    </v-col>
                    <v-col cols="12" md="6"  v-if="isBookingForm">
                      <v-checkbox :label="$t('showOnlyToAdmin')" v-model="properties.adminonlyfield" hide-details></v-checkbox>
                    </v-col>
                    <v-col cols="12" md="6" v-if="properties.name !== 'name'">
                      <v-layout wrap>
                        <v-checkbox :label="$t('isActive')" v-model="properties.isactive" hide-details
                        :disabled="properties.name === 'name' || fieldSelectedForKView.includes(properties._id) || (payload.moduleName === 'Event' ? (properties.name === 'create_for') : false)"></v-checkbox>
                        <span v-if="fieldSelectedForKView.includes(properties._id)" class="ml-3 checkbox-warning red--text">{{ $t('usedInKanbanView') }}</span>
                      </v-layout>
                    </v-col>
                    <v-col cols="12" v-if="properties.type === 4">
                      <options-list v-model="listOfRadios" ref="optionslistComponent"></options-list>
                    </v-col>
                    <v-col cols="12" md="6" v-if="properties.type === 5 &&! isMultiSelect && selectType === 'default'">
                      <v-checkbox :label="$t('enableColorPicker')" v-model="properties.iscolorpickerenabled" hide-details @change="properties.iscolorpickerenabled ? setOptionsColor() : null"></v-checkbox>
                    </v-col>
                    <v-col cols="12" v-if="properties.type === 5 && selectType === 'default'">
                      <options-list v-model="listOfOptions" ref="optionslistComponent" :showColorPicker="!isMultiSelect && properties.iscolorpickerenabled"></options-list><!--  :showColorPicker="!isMultiSelect" -->
                    </v-col>
                    <v-col cols="12" v-if="properties.type === 5 && selectType === 'api'">
                      <v-container fluid class="pa-0">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field outlined hide-details :label="$t('apiUrl')" required v-model="apiOptions.apiUrl" dense></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field outlined hide-details :label="$t('objectName')" required v-model="apiOptions.objectName" dense></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field outlined hide-details :label="$t('name')" required v-model="apiOptions.name" dense></v-text-field>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-col>
                    <v-col cols="6" v-if="properties.type === 5 && selectType === 'module'">
                      <v-container fluid class="pa-0">
                        <v-row>
                          <v-col cols="12" md="12">
                            <v-autocomplete outlined :items="listOfModules" :loading="moduleLoading" v-model="selectedModule" clearable hide-details dense
                              item-text="name" item-value="name" :label="$t('selectModule')"></v-autocomplete>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-col>
                    <v-col cols="6" v-if="properties.type === 5 && selectType === 'module'">
                      <v-checkbox :label="$t('loadAllRecords')" v-model="properties.load_all_records" hide-details class="pa-0"></v-checkbox>
                      <template v-if="properties.load_all_records">
                        <v-icon size="20" color="red darken-4">mdi-alert-box</v-icon>
                        <code class="red darken-4 white--text">{{ $t('performanceAlert') }}</code>
                      </template>
                    </v-col>
                    <v-col cols="12" v-if="properties.type === 15">
                      <v-container fluid class="pa-0">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-checkbox :label="$t('setCurrentUserAsDefault')" v-model="setCurrentUserAsDefault" hide-details
                            :disabled="properties.name === 'name' || fieldSelectedForKView.includes(properties._id) || (payload.moduleName === 'Event' ? (properties.name === 'create_for') : false)"></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item> <!-- Validation -->
          <v-card color="basil" flat>
            <v-card-text>
              <v-container fluid class="pa-2">
                <v-row>
                  <v-col cols="12" md="6"  v-if="properties.type === 1 || properties.type === 2 || properties.type === 13 || properties.type === 14">
                    <v-text-field hide-details outlined :label="$t('minimumLength')" v-model="properties.minlength" dense>
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" md="6" v-if="properties.type === 1 || properties.type === 2 || properties.type === 13 || properties.type === 14">
                    <v-text-field hide-details outlined :label="$t('maximumLength')" v-model="properties.maxlength" dense>
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" md="6" v-if="properties.type === 1 || properties.type === 13 || properties.type === 14 || properties.type === 12">
                    <v-text-field hide-details outlined :label="$t('regularExpressionPattern')" v-model="properties.regexpattern" dense>
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select :items="eventsList" item-text="text" item-value="value" v-model="properties.validateon" :label="$t('validateOn')" outlined dense hide-details></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-expansion-panels accordion>
                      <v-expansion-panel>
                        <v-expansion-panel-header class="white--text" style="height: 40px;" color="primary">Guidelines</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-simple-table dense width="100%" class="dense_table bordered--table mt-2">
                            <tbody>
                              <tr>
                                <td style="width:50%">
                                  input
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Current field value</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  valid
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Set validation state to the varaible 'valid' either true or error message</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For example: </span> valid = value > 250 ? true : 'Length should be greater than 250'</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  data
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Current form object</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  instance
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Gives access to methods: <span class="font-weight-bold">getProperty(), setProperty() & setOptionList()</span></p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  getProperty()
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes one parameter, name of the field we need to get</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example:</span> instance.getProperty('name'), this will return the value of name field in the form</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  setProperty()
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes two parameter , name of the field and value you we need to set</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example: </span> instance.setProperty('name', val), this will set the value of name field in the form</p>
                                </td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-col>
                  <v-col cols="12" class="custom-code-editor">
                    <editor v-model="properties.validationscript" @init="editorInit" lang="javascript" theme="chrome" width="1000" height="300"></editor>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item v-if="(payload.moduleName === 'Event' ? (properties.name !== 'create_for') : true)"> <!-- Conditional -->
          <v-card color="basil" flat>
            <v-card-text>
              <v-container fluid class="pa-2">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select :items="displayItems" item-text="text" item-value="value" v-model="properties.fielddisplaycondition" :label="$t('fieldDisplay')" outlined dense hide-details></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select :items="listOfAvailableFields" clearable :item-text="(val) => $t(val.label)" item-value="name" v-model="properties.fielddisplayconditionwhen" :label="$t('when')" outlined dense hide-details @change="checkForBooleanField(properties.fielddisplayconditionwhen)"></v-select>
                  </v-col>
                  <v-col cols="12" md="6" v-if="!properties.showBooleanSelect">
                    <v-text-field hide-details outlined :label="$t('hasTheValue')" v-model="properties.fielddisplayconditionvalue" dense></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6" v-else>
                    <v-select hide-details outlined :label="$t('hasTheValue')" v-model="properties.fielddisplayconditionvalue" :items="displayItems" item-text="text" item-value="value" dense></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-expansion-panels accordion>
                      <v-expansion-panel>
                        <v-expansion-panel-header class="white--text" style="height: 40px;" color="primary">Guidelines</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-simple-table dense width="100%" class="dense_table bordered--table mt-2">
                            <tbody>
                              <tr>
                                <td style="width:50%">
                                  show
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Set visibiltiy state to the varaible 'show' either true or false</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For example: </span> show = data.name === 'hit' ? true : false</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  data
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Current form object</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  instance
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Gives access to methods: <span class="font-weight-bold">getProperty(), setProperty() & setOptionList()</span></p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  getProperty()
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes one parameter, name of the field we need to get</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example:</span> instance.getProperty('name'), this will return the value of name field in the form</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  setProperty()
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes two parameter , name of the field and value you we need to set</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example: </span> instance.setProperty('name', val), this will set the value of name field in the form</p>
                                </td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-col>
                  <v-col cols="12" class="custom-code-editor">
                    <editor v-model="properties.conditionscript" @init="editorInit" lang="javascript" theme="chrome" width="1000" height="300"></editor>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item> <!-- Logical -->
          <v-card color="basil" flat>
            <v-card-text>
              <v-container fluid class="pa-2">
                <v-row class="mb-0">
                  <v-col cols="12" class="pt-0">
                    <v-expansion-panels accordion>
                      <v-expansion-panel>
                        <v-expansion-panel-header class="white--text" style="height: 40px;" color="primary">Guidelines</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-simple-table dense width="100%" class="dense_table bordered--table mt-2">
                            <tbody>
                              <tr>
                                <td style="width:50%">
                                  input
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Current field value</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  data
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Current form object</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  instance
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">Gives access to methods: <span class="font-weight-bold">getProperty(), setProperty() & setOptionList()</span></p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  getProperty()
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes one parameter, name of the field we need to get</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example:</span> instance.getProperty('name'), this will return the value of name field in the form</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  setProperty()
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes two parameter , name of the field and value you we need to set</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example: </span> instance.setProperty('name', val), this will set the value of name field in the form</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  setOptionList() <span class="font-weight-bold">(Works only for select)</span>
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes three parameter , name of the field and list of values you we need to set and optiontext</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example: </span> instance.setOptionList('name', arrayOfitems, 'name'), this will set the value of name field in the form</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  getList() <span class="font-weight-bold">(Works only for select)</span>
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes one parameter , name of the field</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example: </span> instance.getList('name'), this return array values in list</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="width:50%">
                                  showAlert()
                                </td>
                                <td style="width:50%">
                                  <p class="caption ma-1">This methods takes two parameters, type => 'success' or  'error', and message => the text need to be shown</p>
                                  <p class="caption ma-1"><span class="font-weight-bold">For Example: </span> instance.showAlert('error', 'NotFound')</p>
                                </td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-col>
                  <v-col cols="12" class="pa-0 pl-4">
                    <v-row>
                      <template v-for="(props, index) in properties.logicscripts">
                        <v-col cols="12" md="3" :key="`eventname_${index}`">
                          <v-text-field hide-details outlined :label="$t('name')" v-model="props.logicname" dense></v-text-field>
                        </v-col>
                        <v-col cols="12" md="3" :key="`event_${index}`">
                          <v-text-field hide-details outlined :label="$t('event')" v-model="props.logicevent" dense></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6" :key="`remve_${index}`" class="text-right">
                          <v-icon @click="removeEvent(index)" color="error">mdi-minus-circle</v-icon>
                        </v-col>
                        <v-col cols="12" :key="`script_${index}`" class="custom-code-editor">
                          <editor v-model="props.logicscript" @init="editorInit" lang="javascript" theme="chrome" width="1000" height="200"></editor>
                        </v-col>
                      </template>
                    </v-row>
                  </v-col>
                </v-row>
                <v-btn color="primary" fab x-small @click="properties.logicscripts.push({})" class="mt-1">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-container>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn small color="success" :loading="loading" @click="properties._id  ? saveUpdateHandler('SAVE', 'fieldsForm') : openTranslationDialog()" dark>
          {{ properties._id ? $t('update') : $t('save')}}
        </v-btn>
        <v-btn small color="error" @click="handleRedirect()" dark>{{ $t('close') }}</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
    <!--Translation dialog-->
    <v-dialog v-model="showTransalationDialog" persistent width="700" height="800px">
      <v-form ref="translationForm">
        <v-card>
          <v-toolbar dense :style="`background-color:${systemDetails.themecolor};color:${systemDetails.textcolor};font-weight:700`">
            {{ $t('addTranslation') }}
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-actions>
            <template>
              <v-simple-table dense style="width:100%" class="dense_table bordered--table mt-2">
                <thead>
                  <tr>
                    <th id="">{{ $t('name') }}</th>
                    <th id="">{{ $t('translation') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in translationObj" :key="item.code">
                    <td>{{ item.name }}</td>
                    <td>
                      <v-text-field dense hide-details :rules="item.isdefault ? $_requiredValidation : []" v-model="item.value"></v-text-field>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </template>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-actions>
            <v-flex class="text-center">
              <v-btn color="primary" class="mr-3" @click="saveUpdateHandler('SAVE', 'translationForm')" :loading="loading">{{ $t('save') }}</v-btn>
              <v-btn color="error" @click="showTransalationDialog=false">{{ $t('cancel') }}</v-btn>
            </v-flex>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>
<script>
import listOfFormTypes from '../../../assets/js/fields'
import { mapGetters } from 'vuex'
export default {
  props: ['payload', 'listOfFields', 'propertyNames', 'isBookingForm'],
  data () {
    return {
      formValid: false,
      properties: {
        _id: ''
      },
      date: null,
      dateMenu: false,
      timeMenu: false,
      time: null,
      datePicker: null,
      validationList: [{ text: 'Required', value: 'required' }],
      listOfOptions: [{ color: '#1976D2FF' }],
      tempListOfOptions: [],
      listOfRadios: [{}],
      listOfCheckbox: [{}],
      isMultiSelect: false,
      isMultipleFiles: false,
      panelId: 0,
      selectType: 'default',
      selectedModule: '',
      moduleLoading: false,
      loading: false,
      apiOptions: {},
      listOfFormTypes: listOfFormTypes,
      availableLanguages: [],
      translationObj: [],
      showTransalationDialog: false,
      propsTab: 0,
      listOfAvailableFields: [],
      content: '',
      setcurrentDate: false,
      currentModule: null,
      fieldSelectedForKView: [],
      autoIncrementPrefix: '',
      autoIncrementStartFrom: 0,
      autoIncrementDigitLength: 0,
      autoIncrementStartFromLength: 0,
      optionsValueNotUnique: false,
      // permission handling
      listOfPermissionAssinged: [{
        access_level: ''
      }],
      // manageLevelPermissions: ['add', 'edit', 'delete'],
      manageLevelPermissions: ['add', 'edit', 'delete'],
      permissionArray: [],
      setCurrentUserAsDefault: false
    }
  },
  watch: {
    'datePicker' (val) {
      if (val) {
        // this.properties.default_value = this.$formatter.formatDate(val, 'YYYY-MM-DD', 'DD.MM.YYYY')
        this.properties.default_value = this.$formatter.formatDate(val, 'YYYY-MM-DD', this.userDetails.dateformat)
      }
    },
    'selectType' (val) {
      if (val) {
        this.moduleLoading = true
        this.$store.dispatch('getModuleList')
          .finally(() => {
            this.moduleLoading = false
          })
      }
    }
  },
  components: {
    'options-list': () => import('./OptionsList'),
    editor: require('vue2-ace-editor')
  },
  computed: {
    ...mapGetters(['listOfModules', 'userDetails', 'systemDetails']),
    fieldAndUniqueValidation () {
      return [
        v => v ? /^[a-zA-Z0-9_]*$/.test(v) || 'Invalid name' : true,
        v => v && this.propertyNames ? !this.propertyNames.includes(v.toString().toLowerCase()) || 'Name property exists' : true
      ]
    },
    eventsList () {
      return [{
        text: this.$t('change'),
        value: 'change'
      }, {
        text: this.$t('blur'),
        value: 'blur'
      }]
    },
    displayItems () {
      return [{
        text: this.$t('true'),
        value: true
      }, {
        text: this.$t('false'),
        value: false
      }]
    },
    propTabItems () {
      return [{
        id: 1,
        name: this.$t('properties')
      }, {
        id: 2,
        name: this.$t('validation')
      }, ...((this.payload.moduleName === 'Event' ? (this.properties.name !== 'create_for') : true) ? [{
        id: 3,
        name: this.$t('conditional')
      }] : []), {
        id: 4,
        name: this.$t('logical')
      }]
    }
  },
  mounted () {
    var currentModule = this.listOfModules.find(x => x._id === this.$route.params.form_id)
    if (currentModule) this.currentModule = currentModule
    if (this.payload._id) {
      if (this.payload.type) this.properties.type = this.payload.type
      this.getSingleRecordHandler(this.payload._id)
      this.disableKViewGroupByField()
    } else {
      let listOfAvailableFields = this.$formatter.cloneVariable(this.listOfFields)
      this.listOfAvailableFields = listOfAvailableFields.filter(x => x.type !== 11)
      this.properties = { type: this.payload.type, module_id: this.payload.moduleId, isactive: true, logicscripts: [{}], columns: this.payload.type === 9 ? 12 : 3 }
    }
  },
  methods: {
    validateManagePerission ({ accessItem, permissionIndex }) {
      // console.log(this.manageLevelPermissions, this.listOfPermissionAssinged[permissionIndex])
      if (this.manageLevelPermissions.includes(accessItem) && this.listOfPermissionAssinged[permissionIndex].access_level && !!this.listOfPermissionAssinged[permissionIndex].access_level[accessItem]) {
        return this.$set(this.listOfPermissionAssinged[permissionIndex].access_level, 'view', true)
      }
    },
    addPermissionItem () {
      this.listOfPermissionAssinged.push({ access_level: {} })
    },
    removePermission (index) {
      this.listOfPermissionAssinged.splice(index, 1)
    },
    disableKViewGroupByField () {
      let fieldSelectedForKView = localStorage.getItem(`${process.env.VUE_APP_NAME}_kanbanview_preselect_group`)
      if (fieldSelectedForKView) {
        let parsedViewType = fieldSelectedForKView ? JSON.parse(fieldSelectedForKView) : []
        let currentModuleKView = parsedViewType.filter(x => x.module === this.payload.moduleName)
        if (currentModuleKView) this.fieldSelectedForKView = currentModuleKView.map(x => x.fieldId)
      }
    },
    editorInit: function () {
      require('brace/ext/language_tools') // language extension prerequsite...
      require('brace/mode/javascript') // language
      require('brace/mode/less')
      require('brace/theme/chrome')
      require('brace/snippets/javascript') // snippet
    },
    handleRedirect () {
      this.$root.$emit('closeProperty')
    },
    getSingleRecordHandler (id) {
      this.$api.getSingleRecordHandler(this.isBookingForm ? `bookingformfields/${id}` : `modulefields/${id}`)
        .then((result) => {
          if (result && result.data) {
            let model = this.$formatter.cloneVariable(result.data)
            model.validation = model.validation ? model.validation : null
            let values = model.default_value ? JSON.parse(model.default_value) : null
            model.validationscript = model.validationscript ? this.decodeStringTobase64(model.validationscript) : ''
            model.conditionscript = model.conditionscript ? this.decodeStringTobase64(model.conditionscript) : ''
            if (model.logicscripts && model.logicscripts.length) {
              model.logicscripts.forEach(element => {
                element.logicscript = element.logicscript ? this.decodeStringTobase64(element.logicscript) : ''
              })
            } else model.logicscripts = [{}]
            if (values) {
              switch (model.type) {
                case 3:
                  this.isMultiSelect = values.is_multiselect
                  this.listOfCheckbox = values.options
                  this.panelId = values.panelId
                  break
                case 4:
                  model.default_value = values.default_value
                  this.listOfRadios = values.options
                  this.panelId = values.panelId
                  break
                case 5:
                  this.isMultiSelect = values.is_multiselect
                  this.selectType = values.selectType
                  if (values.selectType === 'api') {
                    this.apiOptions = { apiUrl: values.apiUrl, name: values.name, objectName: values.objectName }
                  } else if (values.selectType === 'module') {
                    this.selectedModule = values.selectedModule
                  } else {
                    if (values.selectType === 'default') {
                      values.options.forEach(x => {
                        if ([null, undefined].includes(x.color)) x.color = '#1976D2FF'
                      })
                    }
                    this.listOfOptions = values.options
                    this.tempListOfOptions = this.$formatter.cloneVariable(values.options)
                  }
                  model.default_value = values.default_value
                  this.panelId = values.panelId
                  break
                case 6:
                  this.setcurrentDate = values.setcurrentdate
                  model.default_value = values.default_value
                  this.panelId = values.panelId
                  break
                case 8:
                  this.isMultipleFiles = values.is_multiple_files
                  model.default_value = values.default_value
                  this.panelId = values.panelId
                  break
                case 15:
                  this.isMultiSelect = values.is_multiselect
                  this.setCurrentUserAsDefault = values.setcurrentuserasdefault
                  model.default_value = values.default_value
                  break
                case 18:
                  this.autoIncrementPrefix = values.prefix_text || ''
                  this.autoIncrementStartFrom = values.start_from || 0
                  this.autoIncrementDigitLength = values.digit_length || 0
                  model.default_value = values.default_value
                  break
                default:
                  model.default_value = values.default_value
                  this.panelId = values.panelId
                  break
              }
            }
            this.properties = model
            if (this.propertyNames) this.propertyNames.splice(this.propertyNames.indexOf(this.properties.name), 1)
            // Adding list field in the form for conditional tab select
            let listOfAvailableFields = this.$formatter.cloneVariable(this.listOfFields)
            listOfAvailableFields = listOfAvailableFields.filter(x => x._id !== id)
            this.listOfAvailableFields = listOfAvailableFields.filter(x => x.type !== 11)
          }
        })
    },
    async constructDefaultValue (model, form) {
      let panelObj = { panelId: (this.payload.panelid) ? this.payload.panelid : this.panelId }
      let fieldObj = {}
      switch (model.type) {
        case 3:
          fieldObj = Object.assign(panelObj, { options: this.listOfCheckbox, default_value: model.default_value, is_multiselect: this.isMultiSelect })
          model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
          return model
        case 4:
          fieldObj = Object.assign(panelObj, { default_value: model.default_value, options: this.listOfRadios })
          model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
          return model
        case 5:
          if (this.selectType === 'api') {
            fieldObj = Object.assign(panelObj, { default_value: model.default_value, is_multiselect: this.isMultiSelect, selectType: this.selectType, ...this.apiOptions })
            model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
            return model
          } else if (this.selectType === 'module') {
            fieldObj = Object.assign(panelObj, { default_value: model.default_value, is_multiselect: this.isMultiSelect, options: [], selectType: this.selectType, selectedModule: this.selectedModule })
            model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
            return model
          } else {
            if (this.listOfOptions && this.listOfOptions.length) this.getListOfLanguages(false)
            fieldObj = Object.assign(panelObj, { default_value: model.default_value, is_multiselect: this.isMultiSelect, options: this.listOfOptions, selectType: this.selectType })
            model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
            return model
          }
        case 6:
          fieldObj = Object.assign(panelObj, { default_value: model.default_value, setcurrentdate: this.setcurrentDate })
          model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
          return model
        case 8:
          fieldObj = Object.assign(panelObj, { default_value: model.default_value, is_multiple_files: this.isMultipleFiles })
          model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
          return model
        case 11:
          fieldObj = Object.assign(panelObj, { default_value: {} })
          model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
          return model
        case 15:
          fieldObj = Object.assign(panelObj, { default_value: model.default_value, is_multiselect: this.isMultiSelect, setcurrentuserasdefault: this.setCurrentUserAsDefault })
          model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
          return model
        case 18:
          fieldObj = Object.assign(panelObj, {
            default_value: model.default_value,
            prefix_text: this.autoIncrementPrefix,
            start_from: this.autoIncrementStartFrom,
            digit_length: this.autoIncrementDigitLength
          })
          model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
          return model
        default:
          fieldObj = Object.assign(panelObj, { default_value: model.default_value })
          model.default_value = form ? fieldObj : JSON.stringify(fieldObj)
          return model
      }
    },
    saveUpdateHandler (type, formName) {
      if ((this.$refs[formName].validate() && formName === 'fieldsForm') ? this.isOptionsValid() : true) {
        let fieldsList = this.$formatter.cloneVariable(this.translationObj)
        let hasAnyOneTranslation = fieldsList.filter(x => !!x.value)
        if (formName === 'translationForm' && hasAnyOneTranslation.length === 0) {
          this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'validationIssue' })
        } else this.saveAction(type)
      } else this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: this.optionsValueNotUnique ? 'optionsListValuesAreNotUnique' : 'validationIssue' })
    },
    isOptionsValid () {
      let isOptionsListValid = true
      if (this.properties.type === 4 || (this.properties.type === 5 && this.selectType === 'default')) {
        let options = this.properties.type === 4 ? this.listOfRadios : this.listOfOptions
        let values = options.map(x => x.value)
        const hasDuplicate = values.some((x, i) => values.indexOf(x) !== i)
        const isValid = this.$refs.optionslistComponent.$refs.optionsList.validate()
        isOptionsListValid = isValid && !hasDuplicate
        this.optionsValueNotUnique = isValid && hasDuplicate
      }
      return isOptionsListValid
    },
    async saveAction (type) {
      this.loading = true
      let fieldsList = this.$formatter.cloneVariable(this.listOfFields)
      fieldsList.forEach(element => {
        if (element.type === 5 && element.default_value && element.default_value.isAPI) {
          element.default_value.options = []
        }
        element.default_value = element.default_value ? JSON.stringify(element.default_value) : null
        element.validation = element.validation ? element.validation : null
      })
      let model = this.$formatter.cloneVariable(this.properties)
      if (!model._id) { // To set orders for newly added field
        model.tab_order = fieldsList.length + 1
        model.column_order = fieldsList.length + 1
      }
      model.validation = model.validation ? model.validation : null
      model = await this.constructDefaultValue(model, false)
      model.validationscript = model.validationscript ? this.encodeStringTobase64(model.validationscript) : ''
      model.conditionscript = model.conditionscript ? this.encodeStringTobase64(model.conditionscript) : ''
      if (model.logicscripts && model.logicscripts.length > 0) {
        model.logicscripts.forEach(element => {
          element.logicscript = element.logicscript ? this.encodeStringTobase64(element.logicscript) : ''
        })
      } else model.logicscripts = []
      if (this.isBookingForm) {
        model.bookingformid = this.$route.params.formid
        model.module_id = this.$route.params.id
      }
      if (model._id) {
        let index = fieldsList.findIndex(x => x._id === model._id)
        fieldsList[index] = model
      } else {
        let name = model.name
        model.name = name.toLowerCase()
        model.label = `${this.payload.moduleName}_${model.name}`
        fieldsList = [...fieldsList, model]
      }
      let itemsJSON = { 'items': this.$formatter.cloneVariable(fieldsList) }
      let url = ''
      if (this.isBookingForm) url = `bookingformfields/bulk_save/${this.$route.params.id}`
      else url = `modulefields/bulk_save/${model.module_id}`
      this.$api.execute('post', url, itemsJSON)
        .then((response) => {
          // if (this.translationObj.length > 0 && this.showTransalationDialog && !this.isBookingForm) {
          if (this.translationObj.length > 0 && this.showTransalationDialog) {
            let formattedArray = this.$formatter.cloneVariable(this.translationObj)
            let translationArray = []
            formattedArray.forEach(element => {
              translationArray.push({ key: model.label, locale: element.code, value: element.value || '' })
            })
            this.showTransalationDialog = false
            this.$api.execute('post', `translations/add_translations`, translationArray).then(() => {
              this.$root.$emit('fieldsAdded', { result: response, type: model._id ? 'update' : 'add' })
            })
          } else this.$root.$emit('fieldsAdded', { result: response, type: model._id ? 'update' : 'add' })
          this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'savedSuccess' })
        })
        .finally(() => {
          this.loading = false
        })
    },
    openTranslationDialog () {
      // if (!this.isBookingForm) {
      if (this.$refs.fieldsForm.validate() && this.isOptionsValid()) {
        this.getListOfLanguages(true)
      } else this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: this.optionsValueNotUnique ? 'optionsListValuesAreNotUnique' : 'validationIssue' })
      // } else this.saveUpdateHandler('SAVE', 'fieldsForm')
    },
    getListOfLanguages (from) {
      if (this.availableLanguages.length === 0) {
        this.$api.execute('get', `languages/get_by_domain?domain=${this.userDetails.domain}`).then(response => {
          let filteredResponse = response.data.filter(x => x.isactive)
          this.constructTranslation(from, filteredResponse)
        })
      } else {
        this.constructTranslation(from, this.availableLanguages)
      }
    },
    constructTranslation (from, filteredResponse) {
      if (filteredResponse && filteredResponse.length > 0) {
        if (from) {
          this.availableLanguages = filteredResponse
          this.translationObj = this.$formatter.cloneVariable(filteredResponse)
          let name = this.$formatter.cloneVariable(this.properties.name) || ''
          if (/_/g.test(name)) name = name.replace(/_/g, ' ')
          name = name.charAt(0).toUpperCase() + name.slice(1)
          this.translationObj.forEach(x => { x.value = name || '' })
          this.showTransalationDialog = true
        } else {
          let translationArray = []
          let languages = filteredResponse
          this.listOfOptions.forEach(options => {
            languages.forEach(element => {
              let result = this.tempListOfOptions.find(x => x.label === options.label)
              if (!result) {
                translationArray.push({ key: options.label, locale: element.code, value: options.label })
              }
            })
          })
          this.$api.execute('post', `translations/add_translations`, translationArray)
        }
      }
    },
    checkForBooleanField (value) {
      let hasName = this.listOfAvailableFields.find(x => x.name === value)
      if (hasName && hasName.type === 3) {
        this.properties.showBooleanSelect = true
      } else this.properties.showBooleanSelect = false
    },
    removeEvent (index) {
      this.properties.logicscripts.splice(index, 1)
    },
    setStartFromLength () {
      if (this.autoIncrementStartFrom < 0) this.autoIncrementStartFrom = 0
      this.autoIncrementDigitLength = this.autoIncrementStartFromLength = this.autoIncrementStartFrom.toString().length
    },
    validateDigitLength () {
      this.autoIncrementDigitLength = parseInt(this.autoIncrementDigitLength)
      this.autoIncrementDigitLength = this.autoIncrementDigitLength >= this.autoIncrementStartFromLength ? this.autoIncrementDigitLength : this.autoIncrementStartFromLength
    },
    setOptionsColor () {
      this.listOfOptions.forEach(x => {
        if (!x.color) x.color = '#1976D2FF'
      })
    }
  }
}
</script>
<style>
  .custom-code-editor * {
    font-family : monospace !important;
    font-size: 12px !important;
    direction:ltr !important;
    text-align:left !important;
  }
  .checkbox-warning {
    margin: auto;
    margin-bottom: 0 !important;
  }
</style>
