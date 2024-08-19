<template>
  <div :class="['texteditor', uniqueClassIdentifier]">
    <v-card flat color="transparent" class="py-1">
      <v-card-title class="pa-0">
        <span class="caption font-weight-medium grey--text text--darken-3"> {{ label }} </span>
      </v-card-title>
      <v-card-title class="pa-0">
        <v-layout row wrap align-center class="ma-0 pb-1">
          <template v-for="(btn, index) in ctrlButtons">
            <v-menu v-model="editorAddLinkMenu" absolute bottom :key="index" :close-on-click="true" :open-on-click="false"
            :close-on-content-click="false" v-if="btn.isLinkHandler">
              <template #activator="{ on, attrs }">
                <v-btn outlined x-small :color="index === indexValue  ? 'primary' : ''" :class="['px-1 mt-2', btn.class]" height="25" :key="index" @click="indexValue = index; btn.click && btn.click(btn)"
                :title="btn.title" v-on="on" v-bind="attrs" :ref="btn.ref">
                  <v-icon size="20"> {{ btn.icon }} </v-icon>
                </v-btn>
              </template>
              <v-card width="350" class="pa-0" tile>
                <v-card-title class="pa-0" :style="`background-color: ${systemDetails.themecolor};`">
                  <v-layout row wrap class="ma-0 py-2">
                    <v-flex lg11 class="text-truncate white--text d-flex align-center px-3">
                      <label style="font-size: 0.80rem;">
                        {{ $t('selectedSelection') }}:
                        <span class="font-weight-bold"> {{ selectionString }} </span>
                      </label>
                    </v-flex>
                    <v-spacer></v-spacer>
                    <v-flex lg1 class="text-right d-flex align-center">
                      <v-btn icon x-small dark class="mr-n2" @click="editorAddLinkMenu = false">
                        <v-icon small> mdi-close-circle </v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-card-title>
                <v-card-text class="pa-2">
                  <v-form ref="editorLinkContentForm">
                    <v-text-field
                      outlined dense hide-details placeholder="link" class="d-flex align-center" v-model="editorLinkContent"
                      autofocus :rules="editorLinkContent ? domainValidation : $_requiredValidation" validate-on-blur
                      @keydown.enter="executeJSCommand({ command: 'createLink', value: editorLinkContent })"
                    >
                      <template #append-outer>
                        <div class="d-flex mt-n1">
                          <v-btn fab x-small color="primary" height="24" width="24" @click="executeJSCommand({ command: 'createLink', value: editorLinkContent })">
                            <v-icon x-small> mdi-check </v-icon>
                          </v-btn>
                          <v-btn fab x-small color="error" class="ml-1" height="24" width="24" @click="executeJSCommand({ command: 'unlink' })">
                            <v-icon x-small> mdi-link-variant-off </v-icon>
                          </v-btn>
                        </div>
                      </template>
                    </v-text-field>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-menu>
            <template v-else-if="btn.isButtonHandler">
              <v-menu offset-y :key="`button_${index}`" close-on-content-click max-width="200">
                <template #activator="{ on, attrs }">
                  <v-btn outlined x-small :class="['px-1 mt-2 ', btn.class]" height="25" :key="index"
                  :title="btn.title" @click="indexValue=index;" :color="index === indexValue ? 'primary' : ''" v-on="on" v-bind="attrs" :ref="btn.ref">
                    <v-icon size="20"> {{ btn.icon }} </v-icon>
                    <v-icon size="20" v-if="btn.isdropDownIcon">mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-card>
                    <v-list>
                      <v-list-item max-height="10" min-height="10"
                        v-for="(fontStyleDesign, index) in fontStyleDesigns"
                        :key="index"
                        :value="index"
                        @click="executeJsFontCommand(fontStyleDesign.command)"
                      >
                        <v-list-item-title class="timeline-page-v-list-item-title"><v-icon size="20">{{ fontStyleDesign.icon }}</v-icon>{{ fontStyleDesign.command }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                </v-card>
              </v-menu>
            </template>
            <template v-else-if="btn.isInsertList">
              <v-menu offset-y :key="`insertlist_${index}`" close-on-content-click max-width="200">
                <template #activator="{ on, attrs }">
                  <v-btn  active-class="active-button" outlined x-small :class="['px-1 mt-2', btn.class]" height="25" :key="index"
                  :title="btn.title" @click="indexValue=index;" :color="index === indexValue ? 'primary' : ''" v-on="on" v-bind="attrs" :ref="btn.ref">
                    <v-icon size="20"> {{ btn.icon }} </v-icon>
                    <v-icon size="20" v-if="btn.isdropDownIcon">mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-card>
                    <v-list>
                      <v-list-item
                        v-for="(insertOrderAndUnorderList, index) in insertOrderAndUnorderLists"
                        :key="index"
                        :value="index"
                        @click="executeJsFontCommand(insertOrderAndUnorderList.command)"
                      >
                        <v-list-item-title class="timeline-page-v-list-item-title"><v-icon size="20">{{ insertOrderAndUnorderList.icon }}</v-icon> {{ insertOrderAndUnorderList.command }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                </v-card>
              </v-menu>
            </template>
            <template v-else-if="btn.isTableHandler">
              <v-menu offset-y :key="`tablemenu_${index}`" close-on-content-click>
                <template #activator="{ on, attrs }">
                  <v-btn outlined x-small :class="['px-1 mt-2', btn.class]" height="25" :key="index"
                  :title="btn.title" @click="indexValue=index;" :color="index === indexValue ? 'primary' : ''" v-on="on" v-bind="attrs" :ref="btn.ref">
                    <v-icon size="20"> {{ btn.icon }} </v-icon>
                    <v-icon size="20" v-if="btn.isdropDownIcon">mdi-arrow-down-drop-circle-outline</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-text class="white timeline-pd-20">
                      <div>
                        <v-row v-for="row in 10" :key="row">
                          <v-col class="timeline-selection" v-for="col in 10" :key="col">
                            <v-sheet
                              width="12"
                              height="12"
                              class="timeline-selection-box"
                              :class="{ active: overedRow >= row && overedCol >= col }"
                              @click="btn.click(row, col)"
                              @mouseleave="handleTableSelecetion(row = 1, col = 1)"
                              @mouseover="handleTableSelecetion(row, col)"
                            ></v-sheet>
                          </v-col>
                        </v-row>
                      </div>
                  </v-card-text>
                  <div class="text-center d-block timeline-font-size">{{ overedRow }} x {{ overedCol }}</div>
                </v-card>
              </v-menu>
            </template>
            <template v-else-if="btn.istextAlignmentHandler">
              <v-menu offset-y :key="`textalign_${index}`" close-on-content-click max-width="135">
                <template #activator="{ on, attrs }">
                  <v-btn outlined x-small :class="['px-1 mt-2', btn.class]" height="25" :key="index"
                  :title="btn.title"  @click="indexValue=index;" :color="index === indexValue ? 'primary' : ''" v-on="on" v-bind="attrs" :ref="btn.ref">
                    <v-icon size="20"> {{ btn.icon }} </v-icon>
                    <v-icon size="20" v-if="btn.isdropDownIcon">mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-card>
                    <v-list>
                      <v-list-item max-height="10" min-height="10"
                        v-for="(textAlignment, index) in textAlignments"
                        :key="index"
                        :value="index"
                        @click="executeJsFontCommand(textAlignment.title)"
                      >
                        <v-list-item-title class="timeline-page-v-list-item-title"><v-icon size="20">{{ textAlignment.icon }}</v-icon> {{ textAlignment.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                </v-card>
              </v-menu>
            </template>
            <template v-else-if="btn.isFontSizeHandler">
              <v-menu offset-y :key="`fontsize_${index}`" close-on-content-click>
                <template #activator="{ on, attrs }">
                  <v-btn outlined x-small :class="['px-1 mt-2', btn.class]" height="25" :key="index"
                  :title="btn.title"  @click="indexValue=index;" :color="index === indexValue ? 'primary' : ''" v-on="on" v-bind="attrs" :ref="btn.ref">
                    <v-icon size="20"> {{ btn.icon }} </v-icon>
                    <v-icon size="20"  v-if="btn.isdropDownIcon">mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-card>
                    <v-list>
                      <v-list-item
                        v-for="(fontSize, index) in fontSizes"
                        :key="index"
                        :value="index"
                        @click="executeJsFontCommand('fontSize',fontSize.size)"
                      >
                        <v-list-item-title class="timeline-page-v-list-item-title">{{ fontSize.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                </v-card>
              </v-menu>
            </template>
            <template v-else-if="btn.isFontColorHandler">
              <v-menu offset-y :key="`fontcolor_${index}`" max-height="320">
                <template #activator="{ on, attrs }">
                  <v-btn outlined x-small :class="['px-1 mt-2', btn.class]" height="25" :key="index"
                  :title="btn.title"  @click="indexValue=index;" :color="index === indexValue ? 'primary' : ''" v-on="on" v-bind="attrs" :ref="btn.ref">
                    <v-icon size="20"> {{ btn.icon }} </v-icon>
                    <v-icon size="20" v-if="btn.isdropDownIcon">mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                  <v-color-picker
                  class="ma-2"
                  v-model="color"
                  @input="executeJsFontCommand('foreColor',color)"
                ></v-color-picker>
              </v-menu>
            </template>
            <template v-else-if="btn.headingHandler">
              <v-menu offset-y :key="`textalign_${index}`" close-on-content-click>
                <template #activator="{ on, attrs }">
                  <v-btn outlined x-small :class="['px-1 mt-2', btn.class]" height="25" :key="index"
                  :title="btn.title"  @click="indexValue=index;" :color="index === indexValue ? 'primary' : ''" v-on="on" v-bind="attrs" :ref="btn.ref">
                    <h3 size="20"> {{ "Heading"}} </h3>
                    <v-icon size="20" v-if="btn.isdropDownIcon">mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <!-- <v-card-text class="white timeline-pd-20"> -->
                  <v-list>
                    <v-list-item
                      v-for="(heading, index) in headings"
                      :key="index"
                      :value="index"
                      @click="executeJsHeadingCommand('formatBlock',heading.title)"
                    >
                      <v-list-item-title class="timeline-page-v-list-item-title">{{ heading.text }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </template>
            <template v-else-if="btn.isImageUpload">
              <v-menu offset-y :key="`imageUpload_${index}`" close-on-content-click>
                <template #activator="{ on, attrs }">
                  <v-btn outlined x-small :class="['px-1 mt-2', btn.class]" height="25" max-width="10" :key="index"
                  :title="btn.title" @click="indexValue=index;" :color="index === indexValue ? 'primary' : ''" v-on="on" v-bind="attrs" :ref="btn.ref">
                    <v-file-input style="margin-bottom: 18px; margin-left: 8px"
                    accept="image/*"
                    hide-input
                    @change="onImageUploadEvent"
                    prepend-icon="mdi-image"
                  ></v-file-input>
                  </v-btn>
                </template>
              </v-menu>
            </template>
            <v-btn outlined x-small :color="index === indexValue  ? 'primary' : ''" :class="['px-1 mt-2', btn.class]" height="25" :key="`btn_${index}`" @click="indexValue=index;btn.click && btn.click()"
            :title="btn.title" v-else>
              <v-icon size="20"> {{ btn.icon }} </v-icon>
            </v-btn>
          </template>
        </v-layout>
      </v-card-title>
      <v-card-text class="pa-0" data-editor-root-container>
        <div
          id="commentEditor"
          :contenteditable="!editorLoading"
          aria-placeholder="true"
          :class="['editor-content pa-1 mt-2', $vuetify.theme.dark ? 'themedark' : '']"
          @keypress="onKeyPressComment"
          @keydown="onKeyDownComment"
          @paste="onEditorPasteEvent"
          @click="onEditorClickEvent"
        ></div>
        <v-menu offset-y class="d-flex justify-space-around" v-model="editorTableMenu" max-width="50%">
          <v-btn
            id="menu-activator"
            max-width="33%"
            min-width="10%"
            class="mr-1 mt-2 mb-2 ml-1 texteditor box-shadow"
            small
            style="padding: 5px"
          >
          <v-icon>mdi-table-column</v-icon>
          <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
          <v-menu activator="#menu-activator">
            <v-list>
              <v-list-item
                v-for="(insertColumnItem, index) in insertColumnItems"
                :key="index"
                :value="index"
                @click="addAditionalColumn(insertColumnItem.value)"
              >
                <v-list-item-title class="timeline-page-v-list-item-title">{{ insertColumnItem.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn
            id="menu-activator-row"
            max-width="33%"
            min-width="10%"
            class="mr-1 mt-2 mb-2 texteditor box-shadow"
            small
            style="padding: 5px"
          >
          <v-icon>mdi-table-row</v-icon>
          <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
          <v-menu activator="#menu-activator-row">
            <v-list>
              <v-list-item
                v-for="(insertRowItem, index) in insertRowItems"
                :key="index"
                :value="index"
                @click="addAditionalRow(insertRowItem.value)"
              >
                <v-list-item-title class="timeline-page-v-list-item-title">{{ insertRowItem.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn
            id="menu-activator-merge"
            max-width="34%"
            min-width="10%"
            class="mr-1 mt-2 mb-2 texteditor box-shadow"
            small
            style="padding: 5px"
          >
          <v-icon>mdi-table-merge-cells</v-icon>
          <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
          <v-menu activator="#menu-activator-merge">
            <v-list>
              <v-list-item
                v-for="(mergeCellItem, index) in mergeCellItems"
                :key="index"
                :value="index"
                @click="mergeCellROwAndColumn(mergeCellItem.value)"
              >
                <v-list-item-title class="timeline-page-v-list-item-title">{{ mergeCellItem.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-menu>
        <v-menu
          v-model="editorMentionsMenu" :position-x="editorMentionsMenuPos.left" :position-y="editorMentionsMenuPos.top"
          nudge-right="22" :close-on-content-click="false"
        >
          <v-card>
            <v-card-title class="pa-0">
              <v-text-field solo flat dense hide-details v-model="mentionUserSearch" ref="menuListSearch"
              persistent-placeholder :placeholder="$t('search')" autofocus></v-text-field>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list dense max-height="200" class="body-2 py-1 user-mentions-list overflow-auto"
              v-model="selectedUser" @change="executeJSCommand({ command: 'insertUser', value: user })">
                <v-list-item v-for="(user, index) in mentionUserList" :key="index"
                :tabindex="(index + 1)" @click.stop="executeJSCommand({ command: 'insertUser', value: user })">
                  {{ user.name }}
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import texteditor from '@/mixins/texteditor'
import { mapGetters } from 'vuex'
export default {
  props: ['value', 'label', 'loading'],
  mixins: [texteditor],
  data () {
    return {
      inputvalue: null,
      indexValue: null,
      uniqueClassIdentifier: null
    }
  },
  beforeMount () {
    this.setUniqueClassIdentifier()
  },
  mounted () {
    this.$nextTick(() => {
      const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
      if (!editorElem) return
      editorElem.innerHTML = this.value || ''
    })
  },
  computed: {
    ...mapGetters(['getUsers'])
  },
  watch: {
    value () {
      this.inputvalue = this.value || ''
    },
    inputvalue: {
      handler (value) {
        if (value && value.reset) return this.$emit('input', '')
        const firstRow = document.querySelector('.editor-content > div[data-row-container="1"]')
        if (!firstRow) return

        this.$emit('input', value)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    setUniqueClassIdentifier () {
      if (this.label && this.label.length) this.uniqueClassIdentifier = this.label.replaceAll(' ', '').toLowerCase()
      else this.uniqueClassIdentifier = `_${this.getRandomNumberWithNDigits(6).toString().split('.')[1]}`
    },
    getRandomNumberWithNDigits (length) {
      let randomNumber = Math.random()
      randomNumber *= Math.pow(10, length)
      randomNumber = Math.round(randomNumber)
      randomNumber /= Math.pow(10, length)
      return randomNumber
    }
  }
}
</script>
<style>
  /* comments texteditor */
  .texteditor .editor-content {
    min-height: 70px;
    height: 100%;
    width: 100%;
    border: 1px solid black;
    padding: 2px;
    outline: none;
    color: black;
  }
  .texteditor .editor-content span.user-mention {
    color: orangered;
    /* color: #a61f49; */
  }
  .texteditor .editor-content.themedark {
    border: 1px solid white;
    color: white;
    caret-color: white;
  }
  .texteditor .editor-content img {
    height: 14vh;
    width: 8vw;
    margin-top: 5px;
  }
  .texteditor .editor-message-container {
    font-size: 0.93rem !important;
    /* display: flex !important; */
    max-width: 66vw !important;
  }
  .texteditor .editor-message-container + span.caption {
    border: 1px solid grey;
    padding: 2px 4px 2px 0;
    text-transform: lowercase;
    font-weight: 500;
  }
  .texteditor .editor-message-container img {
    width: 16vw;
    height: 18vh;
    margin: 4px 0 -2px 0;
  }
  .texteditor .editor-message-container span.user-mention {
    color: orangered;
  }
  .texteditor.box-shadow {
    box-shadow: none !important
  }
  .v-list-item {
    min-height: 36px;
  }
 .timeline-page-width {
  width: 70%;
  }
  .timeline-editor-table {
    font-size: 15px; /* use rem for font size */
    width: calc(100% - 20px);
    border-collapse: collapse;
    margin: 10px;
  }
  .setColumn {
    border: 1px solid black;
    padding: 10px;
  }
  .timeline-selection {
    margin: 3px;
    padding: 0px;
  }
  * {
    margin: 0px
  }
  .timeline-selection-box {
    border: 1px solid gray !important;
  }
  .timeline-selection-box.active {
    border: 1px solid blue !important;
  }
  .timeline-font-size {
    font-size: 12px;
  }
  .timeline-pd-20 {
    padding: 22px;
  }
  #timeline-table:hover {
    outline: 3px solid#ffc83d;
  }
  .timeline-editor-table td.active:hover {
    background: lightblue;
  }
  #highlight {
    background-color: lightblue;
  }
  .timeline-page-v-list-item-title {
    font-size: 0.875rem !important;
  }
  /* .unselectable {
    -khtml-user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
  } */
</style>
