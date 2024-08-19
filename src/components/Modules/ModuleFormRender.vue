<template>
  <v-card flat :disabled="disabled" :style="fromProperties ? { backgroundColor: $vuetify.theme.dark ? '' : '#ebebeb' } : {}">
    <v-form ref="validateForm" v-if="showForm">
      <v-row class="formRender" v-if="listOfFields.length">
        <!-- :cols="item.columns ? item.columns : '12'" :md="item.columns ? item.columns : (item.type === 10 || item.type === 11 || item.type === 12 || item.type === 14) ? '12' : '6'" -->
        <template v-for="(item, index) in listOfFields">
          <template v-if="isRecordCreation ? (item.name !== 'routingstatus' ? true : false) : (item.name !== 'isanonymous' && item.name !== 'routingstatus')">
            <v-col v-if="moduleName === 'tickets' ? true && item.isactive : (item.accesscontrol && item.accesscontrol.edit) && (!['created_by', 'created_at', 'modified_by', 'modified_at'].includes(item._id)) && item.isactive && !item.isPanelField && (isRecordCreation && item.type === 18 ? false : true) && (item.conditionscript ? item.isShowElement ? item.isShowElement(fields, self) : () => {} : item.isShow)"
              :xl="!fromBookingInfoDialog ? item.columns : 4"
              :lg="!fromBookingInfoDialog ? item.columns : 4"
              :md="!fromBookingInfoDialog ? (item.type === 10 || item.type === 11 ? '6' : '4') : 4"
              :sm="!fromBookingInfoDialog ? ((item.type === 9 || item.type === 11 || item.type === 12) ? '12' : '4') : 6"
              xs="12"
              :key="item._id"
            >
              <!-- :md="!fromBookingInfoDialog ? (item.type === 10 || item.type === 11 || item.type === 12 || item.type === 14 ? '12' : '4') : 4" -->
              <template v-if="item.type === 1">
                <v-text-field outlined :label="$t(item.label)" v-model="fields[item.name]" :placeholder="item.placeholder" dense :autofocus="index === 0" maxlength="255"
                  :id="`_${item.name}`" :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" @keypress.enter.prevent
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')" autocomplete="off"
                  :class="fromProperties ? 'ticketProperty' : ''"
                  @change="moduleName !== 'tickets' && item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : checkForValidationOrFunction(item, fields[item.name], index)">
                </v-text-field> <!-- :disabled="item.name === 'routingstatus'" -->
              </template>
              <template v-if="item.type === 2">
                <v-textarea outlined  :label="$t(item.label)" v-model="fields[item.name]" :placeholder="item.placeholder" dense
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                  :class="fromProperties ? 'ticketProperty' : ''"
                  :id="`_${item.name}`" :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                  hide-details
                  @change="checkForValidationOrFunction(item, fields[item.name], index)">
                </v-textarea>
              </template>
              <template v-if="item.type === 3">
                <v-row v-if="item.default_value && item.default_value.is_multiselect">
                  <v-col class="pa-0 pl-2" cols="12">
                    <label>{{ $t(item.label) }}:</label>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="pa-0 pl-2" cols="12" lg="12" v-if="item.default_value && !item.default_value.is_multiselect">
                    <v-checkbox
                      :label="$t(item.label)" class="pt-0 d-inline-flex" v-model="fields[item.name]" :id="`_${item.name}`"
                      :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                      @change="item.name === 'sync_to_tripletex' ? syncToTripletex() : checkForValidationOrFunction(item, fields[item.name], index)"
                      hide-details
                      :class="fromProperties ? 'ticketProperty' : ''"
                    >
                    </v-checkbox>
                    <div class="mb-12 d-inline" v-if="item.name === 'sync_to_tripletex'">
                      {{ item.name === 'sync_to_tripletex' ? `( Number of added items: ${syncToTripletex_addedItems.length} )` : '' }}
                      <v-icon v-if="syncToTripletex_addedItems.length" @click="syncToTripletex()">mdi-open-in-new</v-icon>
                    </div>
                  </v-col>
                  <v-col class="pa-0 pl-2" cols="12" lg="12" v-else>
                    <template>
                      <v-checkbox v-model="fields[item.name]" :label="options.label" :value="options.value" :key="optionkey" v-for="(options, optionkey) in item.default_value.options" :id="`_${item.name}`"
                        :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                        @change="checkForValidationOrFunction(item, fields[item.name], index)"
                        :class="fromProperties ? 'ticketProperty' : ''">
                      </v-checkbox>
                    </template>
                  </v-col>
                </v-row>
              </template>
              <template v-if="item.type === 4">
                <div>
                  <label class="font-weight-medium grey--text text--darken-2"> {{ $t(item.label) }}: </label>
                  <v-radio-group row v-model="fields[item.name]" :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" :id="`_${item.name}`"
                    @change="checkForValidationOrFunction(item, fields[item.name], index)" class="ma-0" hide-details>
                    <v-radio v-for="(options, index) in item.default_value.options" :key="index" :value="options.value"
                      :label="item.enableoptiontranslations ? $t(`${moduleName}_${item.name}_option_${options.value}`) : options.label"
                      :class="fromProperties ? 'ticketProperty' : ''"></v-radio>
                  </v-radio-group>
                </div>
              </template>
              <template v-if="item.type === 5">
                <template v-if="item.default_value.selectType === 'api'">
                  <v-autocomplete outlined :items="item.default_value.options" :label="$t(item.label)"  v-model="fields[item.name]" :key="autoCompleteRender"
                  dense :multiple="item.default_value.is_multiselect" :item-text="item.default_value.name" :item-value="item.default_value.name"
                  :placeholder="item.placeholder" clearable
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                  :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" autocomplete="off" :ref="`searchInput${index}`"
                  :id="`_${item.name}`" @keyup="getValuesFromAPI(`searchInput${index}`, item.default_value, index)"
                  @change="checkForValidationOrFunction(item, fields[item.name], index);item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : ''"
                  :class="fromProperties ? 'ticketProperty' : ''">
                </v-autocomplete>
                </template>
                <template v-else-if="item.default_value.selectType === 'module'">
                  <!-- {{ moduleName === 'tickets' && !!item.moduleid && !!fields.customfieldsdata }} -->
                  <v-autocomplete outlined v-if="moduleName === 'tickets' && !!item.moduleid && !!fields.customfieldsdata" :items="item.name === 'supplier' ? item.default_value.options && item.default_value.options.filter((accountItem) => accountItem.type === 'supplier') : item.default_value.options"
                    :label="$t(item.label)" :autofocus="addingFromSubmodule ? true : false"  :ref="`autocompleteRef${index}`" :key="autoCompleteRender" dense
                    :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                    :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" v-model="fields.customfieldsdata[item.name]" :multiple="item.default_value.is_multiselect"
                    autocomplete="off" :placeholder="item.placeholder" clearable :id="`_${item.name}`"
                    @change="checkForValidationOrFunction(item, fields[item.name], index);item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : ''"
                    @keydown="preventSpecialCharacters($event)"
                    @click="getFromModuleName(item.default_value.selectedModule, index)"
                    @keyup="isBooking ? '' : getValuesForModule({ event: $event, value: item.default_value, index, ref: `autocompleteRef${index}` })"
                    :class="fromProperties ? 'ticketProperty' : ''"
                    item-text="name" item-value="_id">
                    <template v-slot:append-item>
                      <div v-intersect="onIntersect" class="pa-0 teal--text" />
                    </template>
                    <template #selection="selectionObj" v-if="item.default_value.is_multiselect">
                      <v-chip v-if="selectionObj.index <= 0" label small class="hover--class rounded-sm" :color="$vuetify.theme.dark? 'white' : systemDetails.themecolor" outlined>
                        <span style="font-size: 13px;"> {{ selectionObj.item.name }} </span>
                      </v-chip>
                      <span v-if="selectionObj.index === 1" class="grey--text text-caption pl-1">
                        (+{{ fields[item.name].length - 1 }} others)
                      </span>
                    </template>
                    <template v-slot:prepend-item>
                        <!-- <v-list-item-content>
                          <v-list-item-title>{{ $t('startTyping') }}</v-list-item-title>
                        </v-list-item-content> -->
                        <v-progress-linear v-if="loadingValues" :color="systemDetails.themecolor" indeterminate></v-progress-linear>
                      </template>
                      <template #no-data>
                        <v-list-item v-if="showNoData">
                          <v-list-item-content class="pa-0">
                            <v-list-item-title>
                              <span class="font-weight-bold text-subtitle-1 text-uppercase"> {{ $t('NoAvailableInList') }}</span>
                            </v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-icon>
                            <v-icon color="#1A237E" size="30" @click=" item.hasNoOptionsValues  ? addRecord(item.default_value, index) : ''">mdi-plus-circle-outline</v-icon>
                          </v-list-item-icon>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                    <v-autocomplete outlined v-else :items="item.name === 'supplier' ? item.default_value.options && item.default_value.options.filter((accountItem) => accountItem.type === 'supplier') : item.default_value.options"
                      :label="$t(item.label)" :autofocus="addingFromSubmodule ? true : false"  :ref="`autocompleteRef${index}`" :key="autoCompleteRender" dense
                      :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                      :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" v-model="fields[item.name]" :multiple="item.default_value.is_multiselect"
                      autocomplete="off" :placeholder="item.placeholder" clearable :id="`_${item.name}`"
                      @change="checkForValidationOrFunction(item, fields[item.name], index);item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : ''"
                      @keydown="preventSpecialCharacters($event)"
                      @click="getFromModuleName(item.default_value.selectedModule, index)"
                      @keyup="isBooking ? '' : getValuesForModule({ event: $event, value: item.default_value, index, ref: `autocompleteRef${index}` })"
                      :class="fromProperties ? 'ticketProperty' : ''"
                      item-text="name" item-value="_id">
                      <template v-slot:append-item>
                        <div v-intersect="onIntersect" class="pa-0 teal--text" />
                      </template>
                      <template #selection="selectionObj" v-if="item.default_value.is_multiselect">
                        <v-chip v-if="selectionObj.index <= 0" label small class="hover--class rounded-sm" :color="$vuetify.theme.dark? 'white' : systemDetails.themecolor" outlined>
                          <span style="font-size: 13px;"> {{ selectionObj.item.name }} </span>
                        </v-chip>
                        <span v-if="selectionObj.index === 1" class="grey--text text-caption pl-1">
                          (+{{ fields[item.name].length - 1 }} others)
                        </span>
                      </template>
                      <template v-slot:prepend-item>
                        <!-- <v-list-item-content>
                          <v-list-item-title>{{ $t('startTyping') }}</v-list-item-title>
                        </v-list-item-content> -->
                        <v-progress-linear v-if="loadingValues" :color="systemDetails.themecolor" indeterminate></v-progress-linear>
                      </template>
                      <template #no-data>
                        <v-list-item v-if="showNoData">
                          <v-list-item-content class="pa-0">
                            <v-list-item-title>
                              <span class="font-weight-bold text-subtitle-1 text-uppercase"> {{ $t('NoAvailableInList') }}</span>
                            </v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-icon>
                            <v-icon color="#1A237E" size="30" @click=" item.hasNoOptionsValues  ? addRecord(item.default_value, index) : ''">mdi-plus-circle-outline</v-icon>
                          </v-list-item-icon>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                </template>
                <template v-else-if="item.default_value.selectType === 'default'">
                  <v-autocomplete outlined :items="item.default_value.options" v-if="moduleName === 'tickets' && !isSupportForm" :label="$t(item.label)" dense
                   :item-text="item.name === 'mailboxid' || item.name === 'status' || item.name === 'priority' || item.name === 'priority' || item.name === 'category_id' || item.name === 'assignedto' ? val => val.name : val => val.label"
                    :item-value="item.name === 'mailboxid' || item.name === 'status' || item.name === 'priority' || item.name === 'category_id' ? val => val._id :  item.name === 'assignedto' ? val => val.alternateid :  val => val.name"
                    :multiple="item.default_value.is_multiselect" v-model="fields[item.name]" :placeholder="item.placeholder" clearable
                    :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                    :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" :id="`_${item.name}`"
                    @change="checkForValidationOrFunction(item, fields[item.name], index);item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : ''"
                    :class="fromProperties ? 'ticketProperty' : ''"
                    >
                      <template #selection="selectionObj" v-if="item.default_value.is_multiselect">
                        <v-chip v-if="selectionObj.index <= 0" label small class="hover--class rounded-sm" :color="$vuetify.theme.dark? 'white' : systemDetails.themecolor" outlined>
                          <span style="font-size: 13px;">
                            {{ item.enableoptiontranslations ? $t(`${moduleName}_${item.name}_option_${selectionObj.item.value}`) : selectionObj.item.label }}
                          </span>
                        </v-chip>
                        <span v-if="selectionObj.index === 1" class="grey--text text-caption pl-1">
                          (+{{ fields[item.name].length - 1 }} others)
                        </span>
                      </template>
                  </v-autocomplete>
                  <v-autocomplete v-else outlined :items="item.default_value.options" :label="$t(item.label)" dens
                    :item-text="item.enableoptiontranslations ? val => $t(`${moduleName}_${item.name}_option_${val.value}`) : val => val.label" item-value="value"
                    :multiple="item.default_value.is_multiselect" v-model="fields[item.name]" :placeholder="item.placeholder" clearable
                    :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                    :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" :id="`_${item.name}`"
                    @change="checkForValidationOrFunction(item, fields[item.name], index);item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : ''"
                    :class="fromProperties ? 'ticketProperty' : ''"
                    >
                      <template #selection="selectionObj" v-if="item.default_value.is_multiselect">
                        <v-chip v-if="selectionObj.index <= 0" label small class="hover--class rounded-sm" :color="$vuetify.theme.dark? 'white' : systemDetails.themecolor" outlined>
                          <span style="font-size: 13px;">
                            {{ item.enableoptiontranslations ? $t(`${moduleName}_${item.name}_option_${selectionObj.item.value}`) : selectionObj.item.label }}
                          </span>
                        </v-chip>
                        <span v-if="selectionObj.index === 1" class="grey--text text-caption pl-1">
                          (+{{ fields[item.name].length - 1 }} others)
                        </span>
                      </template>
                  </v-autocomplete>
                </template>
                <template v-else-if="item.default_value.selectType === 'custom'">
                  <template v-if="moduleName === 'Account'">
                    <v-combobox outlined :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" :items="item.customOptions"
                      :item-text="item.optionName" :item-value="item.optionValue"
                      :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                      :multiple="item.default_value.is_multiselect" v-model="fields[item.name]" :placeholder="item.placeholder" clearable
                      :label="$t(item.label)" dense :ref="`customSearch_${index}`" :loading="item.loading" :id="`_${item.name}`"
                      @change="checkForValidationOrFunction(item, fields[item.name], index);item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : ''"
                      :class="fromProperties ? 'ticketProperty' : ''">
                    </v-combobox>
                  </template>
                  <v-autocomplete outlined :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" v-else
                    :item-text="item.optionName" :item-value="item.optionValue" :items="item.customOptions"
                    :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                    :multiple="item.default_value.is_multiselect" v-model="fields[item.name]" :placeholder="item.placeholder" clearable
                    :label="$t(item.label)" dense :ref="`customSearch_${index}`" :loading="item.loading" :id="`_${item.name}`"
                    @change="checkForValidationOrFunction(item, fields[item.name], index);item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : ''"
                    :class="fromProperties ? 'ticketProperty' : ''">
                  </v-autocomplete>
                </template>
              </template>
              <template v-if="item.type === 6">
                <v-menu v-model="item.date_menu" :close-on-content-click="false" max-width="290">
                  <template #activator="{ on, attrs }">
                    <v-text-field outlined v-model="fields[item.name]" :placeholder="item.placeholder" dense clearable
                      :label="$t(item.label.trim())" readonly @click:clear="fields[item.name] = null; checkForValidationOrFunction(item, fields[item.name], index)"
                      :id="`_${item.name}`" :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                      :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                      :class="fromProperties ? 'ticketProperty' : ''"
                    >
                      <template #prepend>
                        <v-btn icon x-small v-on="on" v-bind="attrs" class="mt-1" @click="item.date_value = $formatter.formatDate(fields[item.name], userDetails.dateformat , 'YYYY-MM-DD')">
                          <v-icon size="22"> mdi-calendar </v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>
                  </template>
                  <v-date-picker v-model="item.date_value" no-title :first-day-of-week="1"
                    @input="fields[item.name] = parseDate(item.date_value); item.date_menu = false; emitForWatch(fields[item.name], item.name); checkForValidationOrFunction(item, fields[item.name], index)"
                  ></v-date-picker>
                </v-menu>
              </template>
              <template v-if="item.type === 7">
                <v-menu :ref="`time_menu_${index}`" v-model="item.time_menu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="fields[item.name]"
                  transition="scale-transition" offset-y max-width="290px" min-width="290px">
                  <template #activator="{ on }">
                    <v-text-field outlined  v-model="fields[item.name]" :placeholder="item.placeholder" clearable dense prepend-icon="mdi-timer" :id="`_${item.name}`"
                      :label="$t(item.label)" readonly @click:prepend="on.click"
                      :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                      @click:clear="fields[item.name] = null; checkForValidationOrFunction(item, fields[item.name], index)"
                      :class="fromProperties ? 'ticketProperty' : ''">
                    </v-text-field>
                  </template>
                  <v-time-picker v-if="item.time_menu" v-model="fields[item.name]" format="24hr" full-width
                    @click:minute="$refs[`time_menu_${index}`][0].save(fields[item.name]); checkForValidationOrFunction(item, fields[item.name], index)">
                  </v-time-picker>
                </v-menu>
              </template>
              <template v-if="item.type === 8">
                <v-file-input outlined :label="$t(item.label)" v-model="fields[item.name]"  :placeholder="item.placeholder" dense :id="`_${item.name}`"
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                  :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                  @change="checkForValidationOrFunction(item, fields[item.name], index)"
                  :class="fromProperties ? 'ticketProperty' : ''">
                </v-file-input>
              </template>
              <template v-if="item.type === 9">
                <v-subheader v-if="item.label" class="pa-0 font-weight-bold"> {{ $t(item.label) }}: </v-subheader>
                <v-divider></v-divider>
              </template>
              <template v-if="item.type === 10">
                <v-subheader v-if="item.label" class="pa-0 font-weight-bold"> {{ $t(item.label) }}: </v-subheader>
                <VueSignaturePad width="100%" :height="`${item.columns ? $formatter.setSignaturePadHeight(item.columns): 250}px`" :class="['signature--pad', $vuetify.theme.dark ? 'signature--pad--dark' : '']" :ref="`signaturePad_${item._id}`" />
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn color="info" fab x-small dark v-on="on" class="mt-1" @click="clearThisSignature(item._id)">
                      <v-icon> mdi-cached </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('reset') }}</span>
                </v-tooltip>
              </template>
              <template v-if="item.type === 11">
                <v-card class="pa-1">
                <v-card-title class="pa-1 caption font-weight-bold">
                  {{ $t(item.label) }}
                  <v-spacer></v-spacer>
                </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <module-render :listOfFields="item.panel_fields" :moduleName="moduleName" ref="panelFormReference" :fields="fields"  :isRecordCreation="isRecordCreation"></module-render>
                  </v-card-text>
                </v-card>
              </template>
              <template v-if="item.type === 12">
                <v-text-field outlined  :label="$t(item.label)" :placeholder="item.placeholder" v-model="fields[item.name]"
                  :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : $_emailValidation"
                  dense @change="checkForValidationOrFunction(item, fields[item.name], index)" :id="`_${item.name}`"
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                  :class="fromProperties ? 'ticketProperty' : ''">
                </v-text-field>
              </template>
              <template v-if="item.type === 13">
                <v-text-field outlined  :label="$t(item.label)" :placeholder="item.placeholder" :id="`_${item.name}`"
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                  :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                  @change="checkForValidationOrFunction(item, fields[item.name], index)"
                  v-model="fields[item.name]" dense
                  :class="fromProperties ? 'ticketProperty' : ''">
                </v-text-field>
              </template>
              <template v-if="item.type === 14">
                <v-text-field outlined  :label="$t(item.label)" :placeholder="item.placeholder" v-model="fields[item.name]" dense
                  :id="`_${item.name}`" :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                  @change="checkForValidationOrFunction(item, fields[item.name], index)"
                  :class="fromProperties ? 'ticketProperty' : ''"></v-text-field>
              </template>
              <template v-if="item.type === 15">
                <v-autocomplete outlined :items="getUsers" :label="$t(item.label)" :multiple="item.default_value.is_multiselect" dense v-model="fields[item.name]"
                  clearable item-text="name" item-value="_id" :placeholder="item.placeholder"
                  :disabled="((item.label === 'Event_create_for') ? ((userDetails.isadmin) ? !!eventId : true) : false) || item.disabled"
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                  :id="`_${item.name}`" :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                  @change="checkForValidationOrFunction(item, fields[item.name], index);item.name === 'name' ? checkForDuplicateNames(fields[item.name], moduleName, item, index, fields._id) : ''"
                  :class="fromProperties ? 'ticketProperty' : ''">
                    <template #selection="selectionObj" v-if="item.default_value.is_multiselect">
                      <v-chip v-if="selectionObj.index <= 0" label small class="hover--class rounded-sm" :color="$vuetify.theme.dark? 'white' : systemDetails.themecolor" outlined>
                        <span style="font-size: 13px;"> {{ selectionObj.item.name }} </span>
                      </v-chip>
                      <span v-if="selectionObj.index === 1" class="grey--text text-caption pl-1">
                        (+{{ fields[item.name].length - 1 }} others)
                      </span>
                    </template>
                  </v-autocomplete>
              </template>
              <template v-if="item.type === 16">
                <v-menu v-model="item.dateTimeMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                  <template #activator="{ on }">
                    <v-text-field slot="activator" v-model="fields[item.name]" :id="`_text${item.name}`" clearable :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                      :label="$t(item.label)" prepend-icon="mdi-timetable" @click:prepend="on.click" outlined dense hide-details
                      :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                      @click:clear="fields[item.name] = null; item.dateTimePicker = null; item.timePicker = null; checkForValidationOrFunction(item, fields[item.name], index)"
                      :class="fromProperties ? 'ticketProperty' : ''"
                    ></v-text-field>
                  </template>
                  <v-tabs v-model="item.active" color="primary lighten-1" dark centered slider-color="white">
                    <v-tab ripple>
                      <v-icon color="white" class="pr-2">mdi-calendar</v-icon>
                    </v-tab>
                    <v-tab ripple>
                      <v-icon color="white" class="pr-2">mdi-clock-outline</v-icon>
                    </v-tab>
                    <v-tab-item>
                      <v-date-picker :min="(item.label === 'endDate' && item.showMinMax) ? $formatter.formatDate(fields.start_date, 'DD.MM.YYYY HH:mm', 'YYYY-MM-DD') : ''" :max="(item.label === 'startDate' && item.showMinMax) ? $formatter.formatDate(fields.end_date, 'DD.MM.YYYY HH:mm', 'YYYY-MM-DD') : ''"
                        v-model="item.dateTimePicker" color="primary lighten-1" no-title @change="item.active = 1" :id="`_${item.name}`" :first-day-of-week="1"></v-date-picker>
                    </v-tab-item>
                    <v-tab-item>
                      <v-card flat>
                        <v-time-picker format="24hr" :close-on-content-click="false" v-model="item.timePicker" color="primary lighten-1"
                          @change="item.dateTimeMenu = false, fields[item.name] = $formatter.formatDateTimeForPicker(item.dateTimePicker, item.timePicker); checkForValidationOrFunction(item, fields[item.name], index)"
                          :min="(item.label === 'endDate' && item.showMinMax && $formatter.formatDate(fields.start_date, 'DD.MM.YYYY HH:mm', 'YYYY-MM-DD') === item.dateTimePicker) ? $formatter.formatDate(fields.start_date, 'DD.MM.YYYY HH:mm', 'HH:mm') : ''"
                          :max="(item.label === 'startDate' && item.showMinMax && $formatter.formatDate(fields.end_date, 'DD.MM.YYYY HH:mm', 'YYYY-MM-DD') === item.dateTimePicker) ? $formatter.formatDate(fields.end_date, 'DD.MM.YYYY HH:mm', 'HH:mm') : ''">
                        </v-time-picker>
                      </v-card>
                    </v-tab-item>
                  </v-tabs>
                </v-menu>
              </template>
              <template v-if="item.type === 17">
                <v-file-input outlined :label="$t(item.label)" v-model="fields[item.name]" :placeholder="item.placeholder" dense
                  :id="`_${item.name}`" :ref="`attachment`" multiple
                  :class="fromProperties ? 'ticketProperty' : ''">
                </v-file-input>
                <v-sheet class="py-4">
                  <v-chip-group multiple active-class="primary--text">
                    <v-card small v-for="(file, index) in fields[`${item.name} oldAttachments`]" :key="index" width="200" outlined>
                      <v-row class="mt-0 py-0">
                        <v-col lg="2">
                          <v-icon class="mx-1" size="18">mdi-file</v-icon>
                        </v-col>
                        <v-col lg="6" class="text-truncate py-0 d-flex align-center justify-center">
                          <span class="pl-3 caption">{{ file.originalfilename || file.OriginalFileName }}</span><br><br>
                        </v-col>
                        <v-col lg="3" class="px-0">
                          <v-layout>
                            <v-flex>
                              <v-icon size="18" color="success" @click="downloadAttachmet(item.name, file)">mdi-download</v-icon>
                            </v-flex>
                            <v-flex>
                              <v-icon size="18" color="error" @click="deleteAttachmet(item.name, file)">mdi-close-circle-outline</v-icon>
                            </v-flex>
                          </v-layout>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-chip-group>
                </v-sheet>
              </template>
              <template v-if="item.type === 18">
                <v-text-field outlined :label="$t(item.label)" :placeholder="item.placeholder" :id="`_${item.name}`"
                  v-model="fields[item.name]" dense disabled
                  :class="fromProperties ? 'ticketProperty' : ''">
                </v-text-field>
            </template>
              <!-- <template v-if="item.type === 18">
                <v-text-field outlined :label="$t(item.label)" :placeholder="item.placeholder" :id="`_${item.name}`"
                  v-model="fields[item.name]" dense disabled> -->
                  <!-- :validate-on-blur="(item.validateon && item.validateon === 'blur')"
                  :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []"
                  @change="checkForValidationOrFunction(item, fields[item.name], index)" -->
                <!-- </v-text-field>
              </template> -->
              <template v-if="item.type === 19">
                {{ moduleName === 'tickets' ? $t('body') : '' }}
                <!-- <ckeditor v-if="isCreateTicket" v-model="fields[item.name]" :editor="editor" ref="editor" :key="render"></ckeditor> -->
                <!-- <html-editor v-else v-model="fields[item.name]" :label="$t(item.label)" :id="`_${item.name}`"
                :class="fromProperties ? 'ticketProperty' : ''"></html-editor> -->
              </template>
              <template v-if="item.type === 20">
                <span @click.stop="enableRewardOption(item, fields)">
                  <v-badge overlap bordered color="green" class="pt-1 mx-0 mt-3" :content=" fields[item.name] ? `${fields[item.name].reduce((acc, item) => item.rating > 0 ? acc + item.rating : acc, 0)}` : '0'">
                    <v-icon size="23" color="#0598ed">mdi-account-star</v-icon>
                  </v-badge>
                </span>
                <span class="ml-2"> {{item.name}}</span>
              </template>
              <template v-if="item.type === 21">
                <v-text-field outlined :label="$t(item.label)" v-model="fields[item.name]" :placeholder="item.placeholder" dense :autofocus="index === 0" maxlength="255"
                  :id="`_${item.name}`" :rules="$formatter.isArray(rulesHandler(item, fields[item.name])) ? rulesHandler(item, fields[item.name]) : []" @keypress.enter.prevent
                  :validate-on-blur="(item.validateon && item.validateon === 'blur')" autocomplete="off"
                  :class="fromProperties ? 'ticketProperty' : ''">
                </v-text-field>
              </template>
              <!-- Attachments added for ticketing suppport form -->
              <template v-if="item.type === 22">
                <label class="font-weight-bold">{{ $t(item.label) }} :</label>
                <div v-if="isSupportForm">
                  <div class="width-100">
                    <div class="p-12 bg-gray-100 border border-gray-300" @dragover="dragover" @dragleave="dragleave" @drop="drop">
                      <input type="file" multiple name="fields[assetsFieldHandle][]" id="assetsFieldHandle"
                        class="w-px h-px opacity-0 overflow-hidden absolute" @change="onChange" ref="file"/>
                      <label for="assetsFieldHandle" class="block cursor-pointer">
                        <div>
                          <span class="underline">{{ 'Click here or Drag & drop file(s)' }}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <v-sheet class="mt-2 pa-1 custom_rounded-xxl" color="#F5F7FA" v-if="listOfAttachmentFiles && listOfAttachmentFiles.length">
                    <v-layout row wrap class="ma-0">
                      <v-flex lg3 md4 sm6 v-for="(files, index) in listOfAttachmentFiles" :key="`file_${index}`" class="py-1 pl-3 pr-0">
                        <v-card outlined>
                        <v-layout row wrap class="ma-0 pa-1" align-center>
                            <v-flex lg2 class="text-center  pa-1">
                              <v-sheet color="#DFE3ED" width="40" height="40" :rounded="true" style="display: flex;">
                                <v-icon class="ma-auto" :color="files.color" size="22"> {{ files.icon }} </v-icon>
                              </v-sheet>
                            </v-flex>
                            <v-flex lg8 class="text-truncate">
                              <p class="subtitle-2 mb-0 text-truncate" :title="files.name">{{ files.name }}</p>
                            </v-flex>
                            <v-flex lg2 class="text-center">
                              <v-icon color="error" @click="removeAttachment(index, 'listOfAttachmentFiles')" size="22"> mdi-close-circle-outline </v-icon>
                            </v-flex>
                          </v-layout>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </v-sheet>
                </div>
                <div v-else>
                  <v-row>
                    <v-col cols="12" class="px-0 pl-0 mt-2">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn color="info" @click="openAttachmentsDialog(1)" v-on="on" small class="ml-3">
                            <v-icon>mdi-attachment</v-icon>
                          </v-btn>
                        </template>
                        {{ $t('attachFiles') }}
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn color="info" @click="openAttachmentsDialog(2)" class="ml-5" v-on="on" small v-if="$route.query && (!$route.query.converttask && $route.query.type !== 'task')">
                            <v-icon>mdi-cloud</v-icon>
                          </v-btn>
                        </template>
                        {{ $t('attachFilesFromSharepoint') }}
                      </v-tooltip>
                      <template>
                        <v-sheet class="mt-2 pa-1 custom_rounded-xxl" color="#F5F7FA" v-if="(listOfFiles && listOfFiles.length) || (listOfOtherFiles && listOfOtherFiles.length)">
                          <v-layout row wrap class="ma-0">
                            <!-- <v-flex lg3 xl3 class="pr-2">
                              <v-text-field :label="$t('attachments')" @click='pickFile' prepend-icon='mdi-paperclip' dense outlined hide-details></v-text-field>
                              <input type="file" style="display: none" id="attachments" ref="attachments" @change="onFilePicked" multiple>
                            </v-flex> -->
                            <!-- attachments -->
                            <v-flex lg2 md2 sm3 v-for="(image, index) in listOfFiles" :key="`image_${index}`" class="py-1 pl-3 pr-0">
                              <v-hover v-slot="{ hover }">
                                <v-img :lazy-src="image" :src="image" height="60">
                                <v-expand-transition>
                                    <div v-if="hover" class="d-flex align-center justify-center transition-fast-in-fast-out primary darken-2 v-card--reveal display-3 white--text" style="height: 100%;">
                                      <v-icon @click="removeAttachment(index, 'listOfFiles')" dark size="22"> mdi-close-circle-outline </v-icon>
                                    </div>
                                  </v-expand-transition>
                                </v-img>
                              </v-hover>
                            </v-flex>
                            <v-flex lg3 md4 sm6 v-for="(files, index) in listOfOtherFiles" :key="`file_${index}`" class="py-1 pl-3 pr-0">
                              <v-card outlined>
                                <v-layout row wrap class="ma-0 pa-1" align-center>
                                  <v-flex lg2 class="text-center  pa-1">
                                    <v-sheet color="#DFE3ED" width="40" height="40" :rounded="true" style="display: flex;">
                                      <v-icon class="ma-auto" :color="files.color" size="22"> {{ files.icon }} </v-icon>
                                    </v-sheet>
                                  </v-flex>
                                  <v-flex lg8 class="text-truncate" :class="$vuetify.breakpoint.smAndDown ? '' : 'show_divider_border_right'">
                                    <p class="subtitle-2 mb-0 text-truncate" :title="files.name">{{ files.name }}</p>
                                  </v-flex>
                                  <v-flex lg2 class="text-center">
                                    <v-icon color="error" @click="removeAttachment(index, 'listOfOtherFiles')" size="22"> mdi-close-circle-outline </v-icon>
                                  </v-flex>
                                </v-layout>
                                <!-- <v-row class="mt-0">
                                  <v-col lg="1" xl="1">
                                    <v-icon class="mr-4 ml-2" :color="files.color">{{ files.icon }}</v-icon>
                                  </v-col>
                                  <v-col lg="7" xl="8" class="text-truncate">
                                    <span class="mt-1 pt-4 pl-3 caption">{{ files.name }}</span><br><br>
                                  </v-col>
                                  <v-col lg="3" xl="2">
                                    <v-icon color="error" @click="removeAttachment(index, 'listOfOtherFiles')">mdi-close-circle-outline</v-icon>
                                  </v-col>
                                </v-row> -->
                              </v-card>
                            </v-flex>
                          </v-layout>
                        </v-sheet>
                      </template>
                    </v-col>
                  </v-row>
                </div>
              </template>
              <template v-if="item.type === 23">
                <v-combobox :items="listOfEmailSuggestions" outlined v-model="fields[item.name]"
                    :label="$t(item.label)" :ref="`autocompleteRef${index}`" :key="autoCompleteRender" dense chips multiple hide-selected
                    item-text="emailaddress" item-value="emailaddress" @keyup="emailSuggestions"
                    :class="fromProperties ? 'ticketProperty' : ''"
                ></v-combobox>
              </template>
            </v-col>
          </template>
        </template>
      </v-row>
    </v-form>
    <v-dialog max-width="750px" class="rewards" v-model="rewardDialog" persistent>
      <rating-editor v-if="constructRewardEditor !== null"
      :rewardEditorObject="constructRewardEditor" :items="constructRewardEditor.rewardItems" :item="constructRewardEditor.item"
      :isFromQuickAdd="quickAdd" :field="constructRewardEditor.field"/>
    </v-dialog>
    <from-module :item="fromModuleFields" :fieldValue="fieldValue" :key="reRender" v-if="fromModuleAddRecord" @setProperty="listOrder"></from-module>
    <v-dialog v-model="attachmentsDialog" persistent width="800" class="mt-0">
      <v-card>
        <v-card-title :style="`background-color:${systemDetails.themecolor};color:${systemDetails.textcolor}`" class="pa-3 pb-2 title">
         {{ $t('attachments') }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-5">
          <div class="width-100" v-if="typeOfFileInput === 1">
            <div v-if="!hideDragFile" class="p-12 bg-gray-100 border border-gray-300" @dragover="dragover" @dragleave="dragleave" @drop="drop">
              <input type="file" multiple name="customFieldsDataModel[assetsFieldHandle][]" id="assetsFieldHandle"
                class="w-px h-px opacity-0 overflow-hidden absolute" @change="onChanging" ref="file"/>
              <label for="assetsFieldHandle" class="block cursor-pointer">
                <div>
                  <span class="underline">{{ $t('clickOrDragAndDropFiles') }}</span>
                </div>
              </label>
            </div>
            <div class="row">
              <div class="col-12">
                <h3 v-if="!hideDragFile && filelist.length" class="text-left">{{ $t('filesAdded') }}!</h3>
                <v-list dense>
                  <v-list-item v-for="(file, index) in filelist" :key="index">
                    <v-list-item-icon>
                      <v-icon class="pb-3">{{ $formatter.mimeTypeOfDocument(file.type).icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-row no-gutters>
                        <v-col class="pa-0 text-left" :cols="`${sharepoint ? '8' : '4'}`">{{ file.name }}</v-col>
                        <v-icon color="error" class="pb-3" @click="remove(index)">mdi-close-circle</v-icon>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </div>
          <template v-else>
            <!-- <sharepoint-tree-view @copyDocuments="getAttachmentFiles" v-if="attachmentsDialog"></sharepoint-tree-view> -->
          </template>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="includeFiles()">{{ $t('ok') }}</v-btn>
          <v-btn color="error" @click="attachmentsDialog = false">{{ $t('close') }}</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import { mapGetters } from 'vuex'
import customScript from '../../mixins/customScriptHandling'
import mixins from '../../views/CustomModules/mixin'
// import Editor from '../../ckeditor'
export default {
  mixins: [customScript, mixins],
  props: {
    listOfFields: {
      type: Array,
      default: () => []
    },
    fields: {
      type: Object,
      default: () => {}
    },
    isBooking: {
      type: Boolean,
      default: false
    },
    fromBookingInfoDialog: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: () => false
    },
    eventId: String,
    moduleName: String,
    propValue: String,
    isRecordCreation: Boolean,
    prefill: Object,
    fromRp: Boolean,
    isSupportForm: Boolean,
    isCreateTicket: Boolean,
    fromProperties: Boolean
  },
  data () {
    return {
      selectedEmails: [],
      reRender: 0,
      autoCompleteRender: 0,
      deleteDocumentId: 0,
      deleteDocumentName: '',
      updateDocument: {},
      updateFilePicker: [],
      updateDocumentProp: '',
      showForm: false,
      self: this,
      syncToTripletex_addedItems: [],
      // listOfFields: []
      constructRewardEditor: {},
      rewardDialog: false,
      quickAdd: true,
      fromModuleAddRecord: false,
      fromModuleFields: {},
      fieldValue: {},
      listIndex: null,
      skip: 0,
      limit: 30,
      getFromModuleValues: {},
      currentModuleName: '',
      addingFromSubmodule: false,
      fromModuleFlag: false,
      searchValue: '',
      filesList: [],
      listOfAttachmentFiles: [],
      attachmentsFiles: [],
      // editor: Editor,
      listOfFiles: [],
      listOfOtherFiles: [],
      render: 0,
      listOfEmailSuggestions: [],
      attachmentsDialog: false,
      typeOfFileInput: 0,
      filelist: [],
      sharepoint: {},
      hideDragFile: false,
      noFileSelect: false
    }
  },
  components: {
    // 'sharepoint-tree-view': () => import('/src/views/Tickets/SharepointTreeView.vue'),
    'module-render': () => import('./ModuleFormRender'),
    // 'html-editor': () => import('@/components/TextEditor.vue'),
    'rating-editor': () => import('@/components/RatingEditor.vue'),
    'from-module': () => import('@/components/Modules/CreateModuleFields.vue')
  },
  mounted () {
    if (this.prefill) {
      if (this.prefill.field_value !== null) this.$set(this.fields, this.prefill.field_name, this.prefill.field_value)
    }
    this.$eventBus.$on('resetAttachments', () => {
      this.$refs.validateForm.resetValidation()
      this.filesList = []
      this.listOfAttachmentFiles = []
      this.attachmentsFiles = []
    })
    this.$root.$on('setFromModuleName', (data, fromModuleName) => {
      this.addingFromSubmodule = true
      let getIndex = this.listOfFields.findIndex(data => (data.default_value && data.default_value.selectedModule) ? data.default_value.selectedModule === fromModuleName : null)
      if (getIndex !== -1) {
        let moduleName = this.listOfFields[getIndex].name
        this.getFromModuleName(fromModuleName, getIndex)
        this.searchValue = data.data.name
        this.getValuesFromModule({
          searchText: this.searchValue ? this.searchValue : '',
          moduleName: fromModuleName,
          index: getIndex,
          skip: 0,
          limit: 30
        })
        this.fromModuleFlag = true
        // this.searchValue = data.data.name
        this.fillAutoComplete(data, moduleName)
      }
    })
    this.$root.$on('syncToTripletex_addedItems', (data) => {
      this.syncToTripletex_addedItems = data
    })
    this.$root.$on('callRerender', () => {
      this.reRender++
    })
    // this.listOfFields = this.$formatter.cloneVariable(this.listOfFields)
    this.listOfFields.forEach((element, index) => {
      let validationScript = ''
      element.isShow = true
      element.loading = false
      element.validationCallback = [true]
      // Simple Conditional
      if (element.fielddisplayconditionwhen) {
        let foundElementIndex = this.listOfFields.findIndex((field) => field.name === element.fielddisplayconditionwhen)
        if (foundElementIndex !== -1) {
          this.listOfFields[foundElementIndex].hideField = element.name
          this.listOfFields[foundElementIndex].hideConditions = {
            condition: element.fielddisplaycondition,
            value: element.fielddisplayconditionvalue
          }
          this.checkForValidationOrFunction(this.listOfFields[foundElementIndex], this.fields[this.listOfFields[foundElementIndex].name], foundElementIndex)
        }
      }
      // Conditional Script manipulation
      try {
        if (element.conditionscript) {
          let conditionScript = this.decodeStringTobase64(element.conditionscript)
          conditionScript = `var show=true; \n${conditionScript} \n return show`
          // eslint-disable-next-line
          element.isShowElement = new Function('data', 'instance', conditionScript)
        }
      } catch {}
      // Validation Script manipulation
      if (element.validationscript) {
        if (element.validateon === 'blur') {
          validationScript = this.decodeStringTobase64(element.validationscript)
          this.addValidationMethod(`${element.name}_validation`, validationScript)
          element.validationCallback = `${element.name}_validation`
        } else {
          element.validationCallback = [true]
        }
      }
      // Logical manipulation
      if (element.logicscripts && element.logicscripts.length > 0) {
        element.logicscripts.forEach(logic => {
          let logicScript = this.decodeStringTobase64(logic.logicscript)
          if (element.type === 5 && logic.logicevent === 'change') {
            element[logic.logicname] = logicScript
          } else if (element.type === 3 && logic.logicevent === 'change') {
            element[logic.logicname] = logicScript
          } else {
            element[logic.logicname] = logicScript
            // eslint-disable-next-line
            setTimeout(() => {
              let elementItem = this.$el.querySelector(`#_${element.name}`)
              if (elementItem) {
                elementItem.addEventListener(logic.logicevent, (event) => {
                  this.eventHandler(event, index, logic)
                })
              }
            }, 1000)
          }
        })
      }
    })
    this.$root.$on('setModuleList', (data) => {
      // { ...this.listOfFields[data.index], 'default_value.options': data.fieldItem.default_value.options }
      this.$set(this.listOfFields, data.index, data.fieldItem)
    })
    this.showForm = true
    this.self = this
    this.$root.$on('rewardFromQuickAdd', (getReward) => {
      this.fields[getReward.fieldName] = getReward.rewardModel
      this.rewardDialog = false
      this.constructRewardEditor = null
    })
    this.$root.$on('rewardFromQuickAddCancel', () => {
      this.rewardDialog = false
      this.constructRewardEditor = null
    })
    this.$root.$on('fromModuleListData', (data) => {
      let item = this.listOfFields[this.listIndex]
      if (item && this.listIndex !== null) {
        const indexToRemove = item.default_value.options.findIndex(item => item._id === 1)
        if (indexToRemove !== -1) {
          item.default_value.options.splice(indexToRemove, 1)
        }
        item.default_value.options.push({ name: data.data.name, _id: data._id })
        this.fields[item.name] = data._id
      }
    })
  },
  computed: {
    ...mapGetters(['getUsers', 'systemDetails'])
  },
  watch: {
    fields: {
      handler (value) {
        this.$emit('update:fields', value)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    emitForWatch (dateValue, fieldname) {
      if (this.fromRp) this.$emit('dateChanged', { dateValue, fieldname })
    },
    fillAutoComplete (data, moduleName) {
      this.$set(this.fields, moduleName, data._id)
    },
    onIntersect (entries, observer, isIntersecting = true) {
      if (isIntersecting) {
        if (this.currentModuleName !== this.getFromModuleValues.moduleName) {
          this.currentModuleName = this.getFromModuleValues.moduleName
          this.skip = 0
        } else {
          this.skip += 30
        }
        this.getValuesFromModule({
          searchText: '',
          moduleName: this.getFromModuleValues.moduleName,
          index: this.getFromModuleValues.index,
          skip: this.skip,
          limit: this.limit
        })
      }
    },
    getFromModuleName (moduleName, index) {
      if (this.listOfFields[index].default_value.options) {
        this.showNoData = false
      }
      this.getFromModuleValues = { moduleName: moduleName, index: index, skip: this.skip }
    },
    getValidation (validate, type = null) {
      if (validate === 'required') {
        if (type) return this.$_multiSelectValidation
        else return this.$_requiredValidation
      } else return null
    },
    // Extension get method
    getProperty (key) { // for account fields[key] is object for other modules it is string, so slightly changed this condition
      if (this.moduleName === 'Account') return this.fields[key] && (typeof this.fields[key] === 'object') ? this.fields[key].navn : this.fields[key]
      else return this.fields[key]
    },
    // Extension set method
    setProperty (key, value) {
      this.fields[key] = value
    },
    addHoursToDate (value, hours, format) {
      return this.$formatter.addHoursToDate(value, hours, format)
    },
    showAlert (type, message) {
      this.$root.$emit('snackbar', { snackbar: true, color: type, text: message })
    },
    getCurrentUserInfo () {
      return {
        name: this.userDetails.name,
        email: this.userDetails.email,
        isadmin: this.userDetails.isadmin
      }
    },
    getList (field) {
      let result = this.listOfFields.find(x => x.name === field)
      if (result && result.type === 5) {
        let list = []
        if (result.default_value && result.default_value.options && result.default_value.options.length > 0) list = result.default_value.options
        else list = result.customOptions ? result.customOptions : []
        return list
      } else return []
    },
    // Extension set select options method
    setOptionList (key, value, itemValue) {
      let foundElementIndex = this.listOfFields.findIndex(x => x.name === key)
      if (foundElementIndex !== -1) {
        let item = this.$formatter.cloneVariable(this.listOfFields[foundElementIndex])
        item.customOptions = value
        item.optionName = itemValue
        item.optionValue = itemValue
        this.$set(this.listOfFields, foundElementIndex, item)
      }
    },
    parseDate (date) {
      return this.$formatter.formatDate(date, 'YYYY-MM-DD', this.userDetails.dateformat)
    },
    getValuesFromAPI (searchText, value, index) {
      this.$root.$emit('getAPIValues', { searchText, value, index })
    },
    // getValuesForModule (searchText, value, index) {
    getValuesForModule ({ event, value, index, ref }) {
      this.skip = 0
      if (this.$refs[ref] && this.$refs[ref][0] && this.$refs[ref][0].lazySearch) {
        this.getValuesFromModule({
          searchText: this.$refs[ref][0].lazySearch,
          moduleName: value.selectedModule,
          index,
          skip: this.skip,
          limit: this.limit
        })
      }
    },
    addNewFilesHandler (propId, propName, files) {
      this.$root.$emit('addNewDocuments', { property_id: propId, prop_name: propName, files })
      this.fields[propName]['attachments'] = null
    },
    clearThisSignature (index) {
      let self = this
      let reference = `signaturePad_${index}`
      self.$refs[reference][0].clearSignature()
    },
    // Common validation method on blur
    addValidationMethod (name, script) {
      this[name] = () => [
        // eslint-disable-next-line
        new Function('input', 'instance', 'data', script)
      ]
    },
    // Manipulation for Validation on change
    checkForValidationOrFunction (element, value, index) {
      element.conditionscript = () => {}
      // Minumum length validation
      if (element.minlength && value && value.length < element.minlength) {
        element.validationCallback = [`Minimum length should be ${element.minlength}`]
        this.$set(this.listOfFields, index, element)
        return false
      }
      // Maximum length validation
      if (element.maxlength && value && value.length > element.maxlength) {
        element.validationCallback = [`Maximum length should be ${element.maxlength}`]
        this.$set(this.listOfFields, index, element)
        return false
      }
      // Validate based on regex
      if (element.regexpattern) {
        var regex = new RegExp(element.regexpattern)
        if (regex.test(value)) element.validationCallback = [true]
        else element.validationCallback = [`Not in expected pattern`]
        this.$set(this.listOfFields, index, element)
        return false
      }
      // Validate based on script
      if (element.validationscript && element.validateon !== 'blur') {
        let validationScript = this.decodeStringTobase64(element.validationscript)
        validationScript = `var valid=true;\n${validationScript}\nreturn valid`
        // eslint-disable-next-line
        let validationFunction = new Function('input', 'data', 'instance', validationScript)
        let result = validationFunction(value, this.fields, this.self)
        element.validationCallback = [result]
        this.$set(this.listOfFields, index, element)
        return false
      }
      // Conditional hide
      if (element.hideField) {
        let foundElementIndex = this.listOfFields.findIndex(x => x.name === element.hideField)
        // eslint-disable-next-line
        const checkCondition = (value) ? element.type === 3 ? element.hideConditions.value == value.toString() : (element.hideConditions.value === value) : false // Condition for checkbox
        if (checkCondition) {
          // this.$set(this.listOfFields, foundElementIndex, { ...this.listOfFields[foundElementIndex], isShow: element.hideConditions.condition })
          this.listOfFields[foundElementIndex].isShow = element.hideConditions.condition
        } else this.listOfFields[foundElementIndex].isShow = !element.hideConditions.condition
        this.$forceUpdate()
      }
      // Onchange select logic script
      // if ((element.type === 5 && element.logicscripts && element.logicscripts.length) || (element.type === 3 && element.logicscripts && element.logicscripts.length)) {
      if (element.logicscripts && element.logicscripts.length) {
        if (element.logicscripts.length > 0) {
          const haschangeEvent = element.logicscripts.find((eventType) => (eventType.logicevent && ['change', 'onchange'].includes(eventType.logicevent)))
          if (haschangeEvent) {
            // eslint-disable-next-line
            const logicalFunction = new Function('instance', 'input', 'data', element[haschangeEvent.logicname])
            logicalFunction(this, value, this.fields)
          }
        }
      }
      if (this.moduleName === 'Account' &&
        (element.default_value && element.default_value.selectType === 'custom') &&
        this.fields[element.name] &&
        typeof this.fields[element.name] === 'object') this.fields[element.name] = this.fields[element.name][element.optionValue]
      this.$set(this.listOfFields, index, element)
    },
    eventHandler (evt, index, logic) {
      let element = this.$formatter.cloneVariable(this.listOfFields[index])
      // eslint-disable-next-line
      let logicalFunction = new Function('instance', 'input', 'data', element[logic.logicname])
      logicalFunction(this, evt.target.value, this.fields)
    },
    deleteAttachmet (fieldname, fileObj) {
      this.$root.$emit('deleteBookingAttachment', `?fieldname=${fieldname}&&fileguid=${fileObj.physicalpath || fileObj.PhysicalPath}`)
      // condition to be added for live reomving
    },
    downloadAttachmet (fieldname, fileObj) {
      this.$root.$emit('downloadBookingAttachment', `?fieldname=${fieldname}&&fileguid=${fileObj.physicalpath || fileObj.PhysicalPath}`)
    },
    syncToTripletex () {
      this.$root.$emit('syncToTripletex_onBooking', this.fields['sync_to_tripletex'])
    },
    enableRewardOption (obj, fieldObj) {
      this.rewardDialog = true
      this.constructRewardEditor = {
        // rewardItems: fieldObj._id ? (fieldObj[obj.name] && fieldObj[obj.name].length ? fieldObj[obj.name] : []) : [],
        rewardItems: fieldObj[obj.name] && fieldObj[obj.name].length ? fieldObj[obj.name] : [],
        item: obj.default_value,
        field: obj
      }
    },
    addRecord (item, index) {
      let typedText = ''
      const autocompleteRef = this.$refs[`autocompleteRef${index}`][0]
      if (autocompleteRef) typedText = autocompleteRef.$refs.input.value
      this.fieldValue = { name: typedText }
      if (typedText) {
        let currentItem = this.listOfFields[index]
        currentItem.default_value.options = currentItem.default_value.options || []
        currentItem.default_value.options.push({ name: typedText, _id: '1' })
        setTimeout(() => {
          this.fields[currentItem.name] = this.fields[currentItem.name] || 1
        }, 250)
        // this.fields[currentItem.name] = '1'
      }
      // this.fields[item.name] = 1
      this.listIndex = index
      this.reRender++
      this.fromModuleFields = item
      this.fromModuleAddRecord = true
    },
    listOrder (data) {
      this.fromModuleAddRecord = data
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
      this.onFilePicked(event.dataTransfer.files)
      // Clean up
      event.currentTarget.classList.add('bg-gray-100')
      event.currentTarget.classList.remove('bg-green-300')
    },
    onChange () {
      if (this.$refs.file && this.$refs.file.length) this.onFilePicked(this.$refs.file[0].files)
    },
    async onFilePicked (files) {
      // const files = e.target.files
      for (let file of files) {
        if (file) {
          this.attachmentsFiles.push(file)
          let iconObj = this.getMimeTypeIcons(file.type)
          this.listOfAttachmentFiles.push({ name: file.name, type: file.type, ...iconObj })
          this.listOfOtherFiles.push({ name: file.name, type: file.type, ...iconObj })
          this.$emit('files-uploaded', this.attachmentsFiles)
        }
      }
    },
    removeAttachment (index, listname) {
      this[listname].splice(index, 1)
      this.attachmentsFiles.splice(index, 1)
      this.$emit('files-uploaded', this.attachmentsFiles)
    },
    emailSuggestions (event) {
      const inputValue = event.target.value
      // Your logic to handle the input value
      this.getEmailSuggestions(inputValue)
    },
    getEmailSuggestions (searchTerm = '') {
      this.$api.execute('get', `emailaccounts/get_email_suggesstion?searchTerm=${searchTerm || ''}`).then(({ data: emailSuggestions }) => {
        const suggestedEmails = emailSuggestions.map(x => {
          x.nameAndEmail = [x.name, (x.name ? `(${x.emailaddress})` : x.emailaddress)].filter(x => x).join(' ')
          return x
        })
        this.listOfEmailSuggestions = []
        this.listOfEmailSuggestions = suggestedEmails
      }).finally(() => {
      })
    },
    openAttachmentsDialog (type) {
      this.typeOfFileInput = type
      this.attachmentsDialog = true
    },
    includeFiles () {
      this.onFilePicked(this.filelist)
      if (this.typeOfFileInput === 1) {
        this.attachmentsDialog = false
        this.closeAttachmentsDialog()
      } else this.$eventBus.$emit('copySelectedDocuments')
      // this.$emit('files-uploaded', this.attachmentsFiles)
    },
    getAttachmentFiles (files) {
      const listOfFiles = [...files]
      this.onFilePicked(listOfFiles)
      // this.$emit('files-uploaded', this.attachmentsFiles)
      this.attachmentsDialog = false
    },
    closeAttachmentsDialog () {
      this.filelist = []
      this.attachmentsDialog = false
    },
    onChanging () {
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
    openDocument (url) {
      window.open(url, '_blank')
    }
  },
  beforeDestroy () {
    this.$root.$off('callRerender')
    this.$root.$off('syncToTripletex_addedItems')
    this.$root.$off('setModuleList')
    this.$root.$off('rewardFromQuickAdd')
    this.$root.$off('rewardFromQuickAddCancel')
    this.$root.$off('fromModuleListData')
    this.$root.$off('setFromModuleName')
    this.$eventBus.$off('resetAttachments')
  }
}
</script>
<style>
.attachment-icon-delete {
  float: right !important;
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
.ticketProperty .v-label{
  font-weight: 500;
}
.ticketProperty .v-input__control{
  font-weight: 650;
}
.propertiesBackground {
  background: #ebebeb;
}
</style>
