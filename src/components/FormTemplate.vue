<template>
  <v-card :flat="!references.title || references.flat ? true : false">
    <v-form ref="validateForm" autocomplete="off" :class="references.fromComponent === 'ticketProperties' ? $vuetify.theme.dark ? '' : 'formColor' : ''">
      <v-card-title class="pa-2" v-if="references.title || references.hideTitle" :style="!references.hideColor? `background-color:${systemDetails.themecolor};color:${systemDetails.textcolor}` : ''">
        <v-btn class="mr-2" icon fab color="primary" x-small v-if="references.showBackBtn || references.backButtonFromTickets" @click="handleBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h5 :color="$vuetify.theme.dark ? '' : systemDetails.textcolor" class="px-2"> {{ references.title }} </h5>
        <v-spacer></v-spacer>
        <v-btn icon v-show="!references.hideCloseButton" title="Close" :color="$vuetify.theme.dark ? '' : 'white'" @click="$emit('closeDialog')">
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider v-if="references.title"></v-divider>
      <v-container grid-list-xl>
        <v-layout wrap :class="references.layoutStyles ? references.layoutStyles : 'pa3'" align-center>
          <slot name="salesproduct"></slot>
          <template v-for="(prop, index) in references.properties">
            <template v-if="prop.is_visible !== undefined ? prop.is_visible : true">
              <v-flex
                :key="`${prop.type || ''}_${prop.model || ''}_${index}`" :style="prop.style"
                :class="['drag-item', prop.class]" align-self-center
                :data-field-index="index" :data-parent-index="prop.parentFieldIndex"
              >
                <template v-if="prop.slot">
                  <slot :name="prop.slot" :prop="prop" :index="index"></slot>
                </template>
                <template v-else-if="prop.type === formType.TEXT">
                  <v-text-field
                    outlined hide-details :label="prop.label" v-if="prop.is_show !== undefined ? prop.is_show : true " :suffix="prop.suffix" :id="prop.model" @input="prop.input" :disabled="prop.disabled"
                    :readonly="prop.readonly" :rules="prop.rules" v-model="model[prop.model]" :validate-on-blur="prop.validateOnBlur"
                    dense @change="prop.change ? prop.change() : ''" :prepend-icon="prop.icon ? prop.icon : ''"
                    @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event,index) : prop.handlerEnterPress ? prop.handlerEnterPress() : ''" :ref="prop.ref ? prop.ref:''"
                    :autofocus="!prop.disabled && prop.autofocus"
                  >
                    <template #prepend-inner>
                      <v-icon size="1.25rem" style="margin: 0.2rem 0.2rem 0 0;"> {{ prop.prependInnerIcon || prop.fieldIcon }} </v-icon>
                    </template>
                  </v-text-field>
                </template>
                <template v-else-if="prop.type === formType.NUMBER">
                  <v-text-field
                    outlined hide-details :type="formType.NUMBER" v-if="prop.is_show !== undefined ? prop.is_show : true" :id="prop.model" :label="prop.label" :rules="prop.rules" v-model.number="model[prop.model]"
                    :disabled="prop.disabled" dense @input="prop.input ? prop.input() : ''"  @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index) : ''"
                    :ref="prop.ref ? prop.ref:''" :min="prop.min" :max="prop.max"
                  >
                  </v-text-field>
                </template>
                <template v-else-if="prop.type === formType.TEXTAREA">
                  <v-textarea
                    outlined hide-details :label="prop.label" v-if="prop.is_show !== undefined ? prop.is_show : true " :id="prop.model"
                    :rules="prop.rules" v-model="model[prop.model]" :disabled="prop.disabled" :rows="prop.rows || 2" dense  @change="prop.change ? prop.change() : ''"
                    @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index) : ''" @keydown.tab="references.enterAsTab ? performNextLine($event, prop.model) : ''" :ref="prop.ref ? prop.ref:''"
                  >
                    <template #prepend-inner>
                      <v-icon size="1.25rem" style="margin: 0.2rem 0.2rem 0 0;"> {{ prop.prependInnerIcon || prop.fieldIcon }} </v-icon>
                    </template>
                  </v-textarea>
                </template>
                <template v-else-if="prop.type === formType.TICKBOX">
                  <v-checkbox
                    :label="prop.label" v-if="prop.is_show !== undefined ? prop.is_show : true" :id="prop.model" color="primary" :rules="prop.rules" v-model="model[prop.model]"
                    @change="prop.change ? prop.change({ value: model[prop.model] }): ''" hide-details :value="prop.value ? prop.value: ''"
                    :class="['ma-0 pd-tickbox d-inline-flex', prop.class]" :disabled="prop.disabled"
                  ></v-checkbox>
                  <span v-if="prop.showKanbanViewMsg" class="ml-3 checkbox-warning red--text">{{ $t('kanbanViewField') }}</span>
                </template>
                <template v-else-if="prop.type === formType.CHECKBOX">
                  <!-- <v-checkbox :label="prop.label" :id="prop.model" color="primary" :rules="prop.rules" v-model="model[prop.model]" @change="prop.click ? prop.click(prop.model): ''"  hide-details :value="prop.value ? prop.value: ''"> </v-checkbox> -->
                  <v-switch
                    dense :key="index" v-model="model[prop.model]" :label="prop.label" @click="prop.click ? prop.click(prop.model): disableSwitch(prop)" hide-details
                    class="ma-0"
                    :inset="prop.inset"  @keypress.enter="references.enterAsTab ? handlerEnterPress($event, index) : ''" :ref="prop.ref ? prop.ref:''"
                    :disabled="((model && model.disabledfield) === prop.model) ? true : false"
                    :readonly="(model.code === $i18n.locale && prop.model === 'isactive') ? true : false"
                  >
                  </v-switch>
                </template>
                <template v-else-if="prop.type === formType.AUTO_COMPLETE">
                  <v-autocomplete outlined hide-details :items="prop.items" :id="prop.model" :disabled="prop.disabled" dense
                    :rules="prop.rules" :item-text="prop.select_text" :multiple="prop.multiple" autocomplete="off" @focus-out="prop.foucsout ? prop.foucsout : '' "
                    @click:append="prop.click(prop.term)"
                    :item-value="prop.select_value" :label="prop.label"
                    :ref="prop.term || prop.ref || ''"
                    :append-icon="prop.is_list ? 'add_circle' : ''"
                    clearable
                    @keyup="prop.hasLiveSearch ? handleSearchInput(prop) : ''"
                    @change="prop.change ? prop.change() : ''"
                    @keydown="prop.keydown ? prop.keydown($event) : ''"
                    v-model="model[prop.model]" @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index, prop.ref) : ''"
                    >
                    <template v-slot:append-item>
                      <div v-intersect="onIntersect" class="pa-0 teal--text"></div>
                    </template>
                    <template v-slot:selection="{ item, index }" v-if="prop.multiple">
                      <span v-if="index === 0">{{ item[prop.select_text] }}</span>
                      <span
                        v-if="index === 1"
                        class="grey--text caption"
                      >(+{{ model[prop.model].length - 1 }} {{ $t('others') }})</span>
                    </template>
                    <template v-slot:append>
                    <v-slide-x-reverse-transition mode="out-in">
                      <v-icon v-if="prop.model === 'groups' || prop.model === 'accessible_to_groups'" class="mt-1" title="Quick Add" color="secondary" outlined dense @click="(model.addClickHandler && model.addClickHandler()) || (prop.appendClick && prop.appendClick())">mdi-account-multiple-plus</v-icon>
                    </v-slide-x-reverse-transition>
                  </template>
                  </v-autocomplete>
                </template>
                <template v-else-if="prop.type === formType.AUTO_COMPLETE_LIVE">
                  <v-autocomplete outlined hide-details :items="prop.items" :id="prop.model" :disabled="prop.disabled" dense
                    :rules="prop.rules" :item-text="prop.select_text" :multiple="prop.multiple" autocomplete="off"
                    :item-value="prop.select_value" :label="prop.label"
                    clearable
                    @change="prop.change ? prop.change() : ''"
                    @keydown="prop.keydown ? prop.keydown($event) : ''"
                    v-model="model[prop.model]"
                    :search-input.sync="model[prop.live_search_model]"
                    :loading="prop.loading ? prop.loading : false"
                    :ref="prop.ref ? prop.ref:''"
                    @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index, prop.ref) : ''"
                  >
                    <template v-slot:no-data v-if="!model[prop.live_search_model]">
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>{{ $t('startTyping') }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                    <template v-slot:selection="{ item, index }" v-if="prop.multiple">
                      <span v-if="index === 0">{{ item[prop.select_text] }}</span>
                      <span
                        v-if="index === 1"
                        class="grey--text caption"
                      >(+{{ model[prop.model].length - 1 }} {{ $t('others') }})</span>
                    </template>
                  </v-autocomplete>
                </template>
                <template v-else-if="prop.type === formType.AWB_AUTO_COMPLETE">
                  <slot name="awb"></slot>
                </template>
                <template v-else-if="prop.type === formType.SELECT">
                  <v-select
                    outlined hide-details v-if="prop.is_show !== undefined ? prop.is_show : true" :items="prop.items" :id="prop.model" :rules="prop.rules" :item-text="prop.select_text" dense
                    :multiple="prop.multiple" :item-value="prop.select_value" :label="prop.label" :disabled="prop.disabled" v-model="model[prop.model]"
                    @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index, prop.ref) : ''" :ref="prop.ref ? prop.ref:''"
                    @change="prop.change ? prop.change() : ''"
                    clearable
                  >
                    <template #prepend-inner>
                      <v-icon size="1.25rem" style="margin: 0.2rem 0.2rem 0 0;"> {{ prop.prependInnerIcon || prop.fieldIcon }} </v-icon>
                    </template>
                  </v-select>
                </template>
                <template v-else-if="prop.type === formType.PASSWORD">
                  <v-text-field outlined hide-details :label="prop.label" :id="prop.model" :rules="prop.rules" :type="formType.PASSWORD"
                    v-model="model[prop.model]"  @change="prop.change ? prop.change() : ''" dense
                    @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index, prop.ref) : ''">
                  </v-text-field>
                </template>
                <template v-else-if="prop.type === formType.COMBOBOX" class="pt-2">
                  <div class="combo">
                    <v-combobox
                      v-model="model[prop.model]" :items="prop.items" :item-text="prop.select_text" :item-value="prop.select_value" hide-selected
                      :rules="prop.rules" :label="prop.label" :multiple="prop.multiple" persistent-hint
                      :small-chips="(typeof prop.chips === 'boolean') ? prop.chips : true" :id="prop.model" :disabled="prop.disabled"
                      outlined dense hide-details @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index, prop.ref) : ''"
                      :ref="prop.ref ? prop.ref:''" @change="prop.change && prop.change()" :loading="prop.loading"
                      :search-input.sync="model[prop.live_search_model || '_default']" :return-object="prop.select_value ? false : true"
                      @keyup="prop.keyup && ![13, 16, 17, 18, 20, 27, 30, 32, 37, 38, 39, 40].includes($event.keyCode) ? prop.keyup(prop) : () => {}"
                    ></v-combobox>
                  </div>
                </template>
                <template v-else-if="prop.type === formType.DATEPICKER">
                  <v-menu :close-on-content-click="false" v-model="model[prop.menu]" transition="scale-transition" offset-y min-width="290px"
                    v-if="prop.is_show !== undefined ? prop.is_show : true">
                    <template #activator="{ on:datePicker, attrs }">
                      <!-- <v-text-field
                        maxlength="10" @keypress="doAlbhaNumericConversion" @blur="validateDateFormate(model[prop.model], prop.model, prop.picker)"
                        outlined hide-details v-model="model[prop.model]" :rules="prop.rules" clearable :label="prop.label" dense
                        @focus="model[prop.picker] = $formatter.formatDate(model[prop.model], userDetails.dateformat, 'YYYY-MM-DD')"
                        :disabled="prop.disabled" @click:clear="$nextTick(() => model[prop.picker] = null)" :readonly="prop.readonly"
                        @keypress.enter="references.enterAsTab ? handlerEnterPress($event, index, prop.ref) : ''" :ref="prop.ref ? prop.ref:''"
                      > -->
                      <v-text-field
                        maxlength="10" @keypress="doAlbhaNumericConversion"
                        outlined hide-details v-model="model[prop.model]" :rules="prop.rules" clearable :label="prop.label" dense
                        @focus="model[prop.picker] = $formatter.formatDate(model[prop.model], userDetails.dateformat, 'YYYY-MM-DD')"
                        :disabled="prop.disabled" @click:clear="$nextTick(() => model[prop.picker] = null)" :readonly="prop.readonly"
                        @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index, prop.ref) : ''" :ref="prop.ref ? prop.ref:''"
                      >
                        <template #prepend-inner v-if="prop.prependInnerIcon || prop.fieldIcon">
                          <v-icon size="1.25rem" style="margin: 0.2rem 0.2rem 0 0;"> {{ prop.prependInnerIcon || prop.fieldIcon }} </v-icon>
                        </template>
                        <template #prepend v-else>
                          <v-btn icon v-bind="attrs" v-on="datePicker" class="ma-n1 mr-n2" @click="model[prop.picker] = $formatter.formatDate(model[prop.model], userDetails.dateformat, 'YYYY-MM-DD')">
                            <v-icon> {{ 'mdi-calendar' }} </v-icon>
                          </v-btn>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      :color="prop.color" @input="model[prop.menu] = false; model[prop.model] = $formatter.formatDate(model[prop.picker], 'YYYY-MM-DD', userDetails.dateformat)"
                      :min="model[prop.min]" :max="model[prop.max]" v-model="model[prop.picker]" first-day-of-week='1' :disabled="prop.disabled"
                      @change="prop.change ? prop.change(): ''" no-title :readonly="prop.readonly"
                    >
                    </v-date-picker>
                  </v-menu>
                </template>
                <template v-else-if="prop.type === formType.QUICKADD">
                  <v-btn fab small outline color="primary" :id="prop.type" @click="$router.push(prop.to)" :disabled="prop.disabled">
                    <v-icon color="primary">perm_identity</v-icon>
                  </v-btn>
                </template>
                <template v-else-if="prop.type === formType.TIMEPICKER">
                  <v-text-field
                    maxlength="5" outlined hide-details slot="activator" :label="prop.label" :rules="prop.rules" dense v-model="model[prop.model]"
                    clearable :disabled="prop.disabled" @blur="validateTime(model[prop.model], prop.model)" :readonly="prop.readonly"
                    @keypress.enter.prevent="references.enterAsTab ? handlerEnterPress($event, index, prop.ref) : ''" :ref="prop.ref ? prop.ref:''"
                  >
                    <template #prepend-inner v-if="prop.prependInnerIcon || prop.fieldIcon">
                      <v-icon size="1.25rem" style="margin: 0.2rem 0.2rem 0 0;"> {{ prop.prependInnerIcon || prop.fieldIcon }} </v-icon>
                    </template>
                    <template #prepend v-else>
                      <v-menu :close-on-content-click="false" :ref="prop.menu" v-model="model[prop.menu]" transition="scale-transition" offset-y min-width="290px">
                        <template #activator="{ on }">
                          <v-icon v-on="on"> mdi-clock-outline </v-icon>
                        </template>
                        <v-time-picker
                          color="primary" v-model="model[prop.model]" :min="prop.min ? model[prop.min] : null" :max="prop.max ? model[prop.max] : null"
                          @click:minute="$refs[prop.menu][0].save(model[prop.model]); prop.change && prop.change()" :allowed-minutes="allowedStep" format="24hr"
                          :disabled="prop.disabled" :readonly="prop.readonly"
                        >
                        </v-time-picker>
                      </v-menu>
                    </template>
                  </v-text-field>
                </template>
                 <template v-else-if="prop.type === formType.FILES">
                  <v-file-input type="file" :accept="prop.accept" :disabled="prop.disabled" outlined show-size v-model="model[prop.model]" hide-details :rules="prop.rules" :label="prop.label" :multiple="prop.multiple" dense></v-file-input>
                  <slot :name="prop.slot"></slot>
                 </template>
                <template v-else-if="prop.type === formType.DRAGANDDROPFILE">
                  <drag-and-drop-upload @filesUploaded="processUpload($event, prop.model); prop.change ? prop.change() : ''" :rules="prop.rules" :multiple="prop.multiple"></drag-and-drop-upload>
                </template>
                <template v-else-if="prop.type === formType.COLORPICKER">
                  <v-menu bottom :close-on-content-click="false" offset-y v-model="model[prop.menu]" max-width="300">
                    <template v-slot:activator="{ on }">
                      <v-text-field :label="prop.label" v-model="model[prop.model]" outlined hide-details class="ma-0 pa-0" readonly slot="activator" v-on="on" @click="colorPicker = model[prop.model] ? model[prop.model] : ''" :disabled="prop.disabled" dense></v-text-field>
                    </template>
                    <v-color-picker v-if="[prop.menu]" v-model="colorPicker" bottom flat :disabled="prop.disabled" />
                    <v-card class="d-flex justify-end" tile elevation="0">
                      <v-btn text color="primary" @click="model[prop.model] = colorPicker; model[prop.menu] = false"> {{$t('save')}} </v-btn>
                      <v-btn text color="primary" @click="model[prop.menu] = false"> {{$t('cancel')}} </v-btn>
                    </v-card>
                  </v-menu>
                </template>
                <template v-else-if="prop.type === formType.RADIO">
                  <span class="caption font-weight-medium grey--text text--darken-3 d-flex mb-n1 text-capitalize" v-if="prop.label"> {{ prop.label }} </span>
                  <v-radio-group
                    v-model="model[prop.model]" row @change="prop.click ? prop.click(prop.model): ''" :mandatory="prop.mandatory" hide-details
                    class="ma-0 d-inline" :disabled="prop.disabled"
                  >
                    <template v-for="(item, index) in prop.items">
                      <v-radio
                        :label="prop.enableoptiontranslations ? $t(`${prop.optionLabel}_option_${item.value}`) : item[prop.select_text]" :value="item[prop.select_value]" :key="index"
                        class="ma-1 mr-2 pd-radio"
                      ></v-radio>
                    </template>
                  </v-radio-group>
                </template>
                <template v-else-if="prop.type === formType.DIVIDER">
                  <span
                    v-if="prop.label"
                    class="d-flex caption font-weight-bold grey--text text--darken-2 mb-1"
                  >
                    {{ prop.label }}:
                  </span>
                  <v-divider></v-divider>
                </template>
                <template v-else-if="prop.type === formType.HEADING">
                  <h3> {{ prop.text }} </h3>
                </template>
                <template v-else-if="prop.type === formType.FOOTERINFORMATION && prop.is_show">
                  <div class="font-weight-bold">{{prop.text}}</div>
                </template>
                <template v-else-if="prop.type === formType.DATE_TIME_PICKER">
                  <datetime-field v-model="model[prop.model]" :label="prop.label" :validation="prop.rules"></datetime-field>
                </template>
                <template v-else-if="prop.type === formType.HTMLFIELD">
                  <html-editor v-model="model[prop.model]" :label="prop.label"></html-editor>
                </template>
                <template v-else-if="prop.type === formType.REWARDS">
                  <rating-editor :item="prop.items" :label="prop.label ? prop.label : ''"></rating-editor>
                </template>
                <template v-else-if="prop.type === formType.ATTACHMENT">
                  <label class="font-weight-bold">{{ prop.label }} :</label>
                  <div class="bg-gray-100 border border-gray-300 text-center">
                    <input type="file" multiple name="fields[assetsFieldHandle][]" id="assetsFieldHandle"
                      class="w-px h-px opacity-0 overflow-hidden absolute" ref="file"/>
                    <label for="assetsFieldHandle" class="block cursor-pointer">
                      <div class="my-2">
                        {{ $t('clickOrDragAndDropFiles') }}
                        <span class="underline">{{ $t('clickHere') }}</span>
                      </div>
                    </label>
                  </div>
                </template>
              </v-flex>
            </template>
          </template>
        </v-layout>
      </v-container>
      <v-card-text class="pa-0 mb-2" style="overflow: hidden;">
        <slot name="extraDetails"></slot>
        <slot name="ticketCustomFieldsSlot"></slot>
      </v-card-text>
      <slot name="ticketCustomFields"></slot>
      <v-divider v-if="references.buttons && references.buttons.length"></v-divider>
      <v-card-actions v-if="references.buttons && !references.hideCard" class="pt-0">
        <v-spacer v-if="!references.buttons[0].isTicket"></v-spacer>
        <v-layout justify-center align-center>
          <v-flex>
            <template v-for="(button, index) in references.buttons">
              <v-btn :key="index" :loading="button.loading" :id="button.name" v-if="button.is_show" @click="button.click" :ref="button.ref ? button.ref:''" :color="button.color" :disabled="button.disabled"
              @keypress="reverseFocus()" :class="['mr-2 mt-2', button.class, button.isTicket ? 'width100' : '']" :small="button.small"> {{ button.label }} </v-btn>
            </template>
          </v-flex>
        </v-layout>
      </v-card-actions>
      <slot name="button" v-else></slot>
    </v-form>
  </v-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    references: {
      type: Object
    },
    model: {
      type: Object
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  // mounted () {
  //   console.log(this.references)
  // },
  components: {
    'datetime-field': () => import('@/components/DateTimeField.vue'),
    'html-editor': () => import('@/components/TextEditor.vue'),
    'rating-editor': () => import('@/components/RatingEditor.vue'),
    'drag-and-drop-upload': () => import('@/components/DragAndDropFileUpload.vue')
  },
  data () {
    return {
      colorPicker: '',
      constructRewardEditor: {},
      skip: 0,
      searchValue: '',
      searchTerm: ''
    }
  },
  computed: {
    ...mapGetters(['formType', 'systemDetails'])
  },
  methods: {
    handleBack () {
      if (this.references.backButtonFromTickets) {
        window.history.back()
      } else {
        this.$router.push('/settings')
      }
    },
    processUpload (files, key) {
      this.model[key] = files
      if (files) {
        if (files.length > 0) {
          this.$set(this.model, key, Array.from(new Set(files)))
          let nameField = this.references.properties.find(x => x.label === 'Name')
          if (nameField && files && files[0].name) {
            this.$set(this.model, nameField.model, files[0].name)
          }
        }
      }
    },
    handleSearchInput (prop) {
      const searchTermRefKey = prop.term || prop.ref
      if (searchTermRefKey && this.$refs[searchTermRefKey] && this.$refs[searchTermRefKey].length) {
        const searchTerm = this.$refs[searchTermRefKey][0].lazySearch
        this.searchValue = searchTerm
        this.skip = 0
        this.$root.$emit('taskProjectId', this.skip, this.searchValue)
      }
    },
    onIntersect () {
      this.skip += 30
      this.$root.$emit('taskProjectId', this.skip, this.searchValue)
    },
    disableSwitch (prop) {
      if (this.model.code === this.$i18n.locale && prop.model === 'isactive') {
        this.$root.$emit('preventDefaultRemoval')
      } else if (!this.model.isFromUser) {
        this.model.disabledfield = (this.model.isdefault || this.model.code === this.$i18n.locale ? 'isactive' : '') || (!this.model.isactive ? 'isdefault' : '')
      }
      // } else this.model.disabledfield = (this.model.isdefault || this.model.code === this.$i18n.locale ? 'isactive' : '') || (!this.model.isactive ? 'isdefault' : '')
      // this.model.disabledfield = (this.model.isdefault || this.model.code === this.$i18n.locale ? 'isactive' : '') || (!this.model.isactive ? 'isdefault' : '')
    },
    doAlbhaNumericConversion (evt) {
      var regex = new RegExp('^[0-9-!./,?]')
      if (!regex.test(evt.key)) evt.preventDefault()
    },
    validateDateFormate (sDate, modelName, pickerName) {
      var sForwardSlaceContains = '/'
      var sIfenContains = '-'
      var sComacontains = ','
      var sDottedcontains = '.'
      var [day, month, year] = []
      var sFinalDate = ''
      var sCurrentDate = new Date()
      if (sDate) {
        if (sDate.includes(sForwardSlaceContains) || sDate.includes(sIfenContains) || sDate.includes(sComacontains) || sDate.includes(sDottedcontains)) {
          setTimeout(() => {
            if (sDate.includes(sForwardSlaceContains)) {
              [day, month, year] = sDate.split('/')
            } else if (sDate.includes(sIfenContains)) {
              [day, month, year] = sDate.split('-')
            } else if (sDate.includes(sComacontains)) {
              [day, month, year] = sDate.split(',')
            } else if (sDate.includes(sDottedcontains)) {
              [day, month, year] = sDate.split('.')
            }
            if (day && day.length < 2) {
              day = '0' + day
            } else if (!day) {
              day = sCurrentDate.getDate()
            }
            if (month && month.length < 2) {
              month = '0' + month
            } else if (!month) {
              month = sCurrentDate.getMonth() + 1
            }
            if (year && year.length < 4) {
              year = sCurrentDate.getFullYear()
            } else if (!year) {
              year = sCurrentDate.getFullYear()
            }
            if (day <= 31 && month <= 12) {
              this.model[modelName] = `${day}.${month}.${year}`
              this.model[pickerName] = `${year}-${month}-${day}`
            } else {
              this.model[modelName] = this.$formatter.formatDate(sCurrentDate, 'YYYY-MM-DDTHH:mm:ss', this.userDetails.dateformat)
              this.model[pickerName] = this.$formatter.formatDate(sCurrentDate, 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD')
            }
            this.$forceUpdate()
          }, 500)
          this.$forceUpdate()
        } else {
          sFinalDate = ''
          var sNumber = sDate
          var digits = sNumber.split('')
          if (sNumber.length === 1 || sNumber.length === 2) {
            if (sNumber.length === 1) {
              day = '0' + sNumber
            } else {
              day = sNumber
            }
            setTimeout(() => {
              if (day <= 31) {
                this.model[modelName] = day + '.' + (sCurrentDate.getMonth() + 1) + '.' + sCurrentDate.getFullYear()
                this.model[pickerName] = sCurrentDate.getFullYear() + '-' + (sCurrentDate.getMonth() + 1) + '-' + day
              } else {
                this.model[modelName] = this.$formatter.formatDate(sCurrentDate, 'YYYY-MM-DDTHH:mm:ss', this.userDetails.dateformat)
                this.model[pickerName] = this.$formatter.formatDate(sCurrentDate, 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD')
              }
              this.$forceUpdate()
            })
          } else if (digits.length === 3 || digits.length <= 4) {
            if (digits.length === 3) {
              for (var j = 0; j < digits.length; j++) {
                if (j <= 1) {
                  sFinalDate += digits[j]
                } else if (j === 2) {
                  sFinalDate += '.0' + digits[j]
                }
              }
            } else {
              for (var k = 0; k < digits.length; k++) {
                if (k <= 1) {
                  sFinalDate += digits[k]
                } else if (k === 2) {
                  sFinalDate += '.' + digits[k]
                } else if (k === 3) {
                  sFinalDate += digits[k]
                }
              }
            }
            setTimeout(() => {
              [day, month] = sFinalDate.split('.')
              if (day <= 31 && month <= 12) {
                this.model[modelName] = sFinalDate + '.' + sCurrentDate.getFullYear()
                this.model[pickerName] = sCurrentDate.getFullYear() + '-' + sFinalDate
              } else {
                this.model[modelName] = this.$formatter.formatDate(sCurrentDate, 'YYYY-MM-DDTHH:mm:ss', this.userDetails.dateformat)
                this.model[pickerName] = this.$formatter.formatDate(sCurrentDate, 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD')
              }
              this.$forceUpdate()
            }, 500)
          } else if ((digits.length > 4 && digits.length < 8) || (digits.length === 8 || digits.length > 8)) {
            for (var i = 0; i < digits.length; i++) {
              if (i <= 1) {
                sFinalDate += digits[i]
              } else if (i === 2) {
                sFinalDate += '.' + digits[i]
              } else if (i === 3) {
                sFinalDate += digits[i]
              } else if (i === 4) {
                sFinalDate += '.' + digits[i]
              } else if (i > 4 && i < 8) {
                sFinalDate += digits[i]
              }
            }
            setTimeout(() => {
              if (sFinalDate.includes(sDottedcontains)) {
                [day, month, year] = sFinalDate.split('.')
                if (!year) {
                  year = sCurrentDate.getFullYear()
                } else if (year && year.length < 4) {
                  year = sCurrentDate.getFullYear()
                }
                if (day <= 31 && month <= 12) {
                  this.model[modelName] = `${day}.${month}.${year}`
                  this.model[pickerName] = `${year}-${month}-${day}`
                } else {
                  this.model[modelName] = this.$formatter.formatDate(sCurrentDate, 'YYYY-MM-DDTHH:mm:ss', this.userDetails.dateformat)
                  this.model[pickerName] = this.$formatter.formatDate(sCurrentDate, 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD')
                }
                this.$forceUpdate()
              }
            }, 500)
          }
          this.$forceUpdate()
        }
      }
    },
    allowedStep: m => m % 5 === 0,
    validateTime (time, modelName, pickerName) {
      if (time) {
        if (((time.includes(':') || time.includes(',')) && time.length > 5) || (!time.includes(':') && !time.includes(',') && time.length > 4)) {
          this.model[modelName] = null
          this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'invalidTime' })
          return false
        } else {
          if (time.includes(',')) {
            let replacedTime = time.replace(',', ':')
            this.model[modelName] = this.model[pickerName] = replacedTime
          } else if (!time.includes(':')) {
            let result = time.slice(0, 2) + ':' + time.slice(2)
            this.model[modelName] = this.model[pickerName] = result
          }
          if (!(/^(([[0|1]\d)|(2[0-3]))[:]?([0-5]\d)$/.test(this.model[modelName]))) {
            this.model[modelName] = this.model[pickerName] = null
            this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'invalidTime' })
            return false
          } else this.model[pickerName] = this.model[modelName]
        }
      }
    },
    // handlerEnterPress (event, index) {
    //   event.preventDefault()
    //   event.stopImmediatePropagation()
    //   // this.$el.querySelectorAll('.task-tab:last-child')[0].dispatchEvent(new Event('click'))
    //   let currentItem = this.references.properties[index]
    //   let item = this.references.properties[index + 1]
    //   if (item && item.disabled) item = this.references.properties[index + 2]
    //   if (item) {
    //     this.$refs[currentItem.ref][0].blur()
    //     setTimeout(() => {
    //       this.$refs[item.ref][0].focus()
    //     }, 100)
    //   } else {
    //     if (index + 1 === this.references.properties.length) {
    //       this.$refs[currentItem.ref][0].blur()
    //       this.$refs.saveupdate[0].$el.focus()
    //     }
    //   }
    // },
    handlerEnterPress (event, index) {
      event.preventDefault()
      event.stopImmediatePropagation()
      let currentItem = this.references.properties[index]
      // eslint-disable-next-line
      var e = e || window.event // for IE to cover IEs window event-object
      if (e.shiftKey && e.which === 13) {
        let item
        if (index === 0) item = this.references.properties[this.references.properties.length - 1]
        else item = this.references.properties[index - 1]
        if (item && item.disabled) item = this.references.properties[index - 2]
        if (item) {
          this.currentlyFocusedItem = item.disabled ? index - 2 : index - 1
          this.$refs[currentItem.ref][0].blur()
          setTimeout(() => {
            this.$refs[item.ref][0].focus()
          }, 100)
        }
        // if (index === 0) this.$refs.this.references.properties[0].ref[0].blur()
      } else {
        let item = this.references.properties[index + 1]
        if (item && item.disabled) item = this.references.properties[index + 2]
        if (item) {
          this.currentlyFocusedItem = item.disabled ? index + 2 : index + 1
          this.$refs[currentItem.ref][0].blur()
          setTimeout(() => {
            this.$refs[item.ref][0].focus()
          }, 100)
        } else {
          if (index + 1 === this.references.properties.length) {
            this.currentlyFocusedItem = null
            this.$refs[currentItem.ref][0].blur()
            this.$refs.saveupdate[0].$el.focus()
          }
        }
      }
    },
    performNextLine (event, modelName) {
      event.stopImmediatePropagation()
      event.preventDefault()
      if (this.model[modelName]) {
        let model = this.model[modelName] + '\n'
        this.model[modelName] = model
      }
    },
    reverseFocus () {
      // eslint-disable-next-line
      var e = e || window.event // for IE to cover IEs window event-object
      if (e.shiftKey && e.which === 13) {
        let item = this.references.properties[this.references.properties.length - 1]
        this.$refs[item.ref][0].focus()
      }
    }
  }
}
</script>
<style scoped>
  .container.grid-list-xl .layout .flex {
    padding: 7px !important;
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
</style>
<style>
  .pd-tickbox .v-icon {
    font-size: 22px !important;
  }
  .pd-radio .v-icon {
    font-size: 22px !important;
    margin-top: 3px !important;
  }
  .width100 {
    width: 100%;
  }
  .formColor {
    background: #ebebeb;
  }
</style>
