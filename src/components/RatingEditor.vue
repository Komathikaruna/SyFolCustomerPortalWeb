<template>
  <v-card  v-if="item" flat class="pa-0 prevent-scroll" width="700px" outlined min-height="60px">
      <template>
          <v-row>
            <v-col cols="12" class="mt-0">
               <v-toolbar :color="!$vuetify.theme.dark ? systemDetails.themecolor : 'white'" dense class="pa-0">
                  <v-toolbar-title class="pa-0">
                    <v-card-title :class="(field && field.text !== '') ? 'white--text px-0' : 'pa-0'">
                      {{ `${(field && field.name) ? field.name : (field && field.text !== "") ? field.text : label}`}}
                    </v-card-title>
                  </v-toolbar-title>
                  <div class="spacer"></div>
                  <v-icon @click="cancelRewards()" dense light class="white--text">mdi-close-circle-outline</v-icon>
                </v-toolbar>
              <v-card-subtitle class="font-weight-bold subtitle-2" v-if="recordIndex >= 0 && record['name'].text !== ''"> {{record['name'].text}} </v-card-subtitle>
              <template v-if="rewardEditorModel">
                <v-form ref="ratingRefOptions">
                  <template v-for="(option, index) in rewardEditorModel.filter( x => x.isactive)">
                    <v-row class="ma-0 pa-2"  :key="index">
                        <v-list v-model="option.isactive" class="pa-0 ma-0">
                          <v-list-item :key="index" :value="option.value" class="pa-0 ma-0">
                            <v-badge overlap bordered color="green" :content="option.worthOf">
                              <v-list-item-icon class="ma-0 ml-2 pa-0">
                                <v-icon size="28">mdi-trophy-award</v-icon>
                              </v-list-item-icon>
                            </v-badge>
                            <v-list-item-content v-if="option.label !== ''" class="ma-0 mx-3 pa-0">
                              <v-list-item-title> {{option.label}} </v-list-item-title>
                            </v-list-item-content>
                              <v-rating :color="option.color ? option.color : 'blue'" clearable :length="option.worthOf" v-model="option.rating" dense>
                                <template v-slot:item="props">
                                  <v-icon
                                    :color="props.isFilled ? (option.color ? option.color : 'blue') : 'grey lighten-1'"
                                    @click="props.click"
                                  >
                                  {{option.ratingIcon ? ( props.isFilled ? option.ratingIcon.filledIcon : option.ratingIcon.iconName ) : 'mdi-star'}}
                                  <!-- {{options.ratingIcon ? options.ratingIcon.iconName : 'mdi-star'}} -->
                                    <!-- {{ props.isFilled ? 'mdi-star-circle' : 'mdi-circle-outline' }} -->
                                  </v-icon>
                                </template>
                              </v-rating>
                          </v-list-item>
                        </v-list>
                    </v-row>
                  </template>
                </v-form>
              </template>
            </v-col>
          </v-row>
      </template>
      <v-divider></v-divider>
      <template>
        <v-row>
          <v-col cols="3" class="mt-2">
            <template>
              <span class="ml-2">Total: {{ sumOfRatings }} {{ `/${ outOfPoints }` }}</span>
            </template>
          </v-col>
          <v-col cols="9">
            <v-layout v-if="field || sumOfRatings" row wrap align-end justify-end class="ma-0">
            <v-btn color="green" @click="emitSavedRewards()" dense small class="my-2 mx-2">
              <v-icon size="12" dense light class="white--text">mdi-check</v-icon>
              <span class="white--text">{{ sumOfRatings === 0 ? 'Save' : 'Update' }}</span>
            </v-btn>
            <v-btn color="error" @click="cancelRewards()" dense small class="my-2 mx-2">
              <v-icon size="12" dense light class="white--text">mdi-close</v-icon>
              <span class="white--text">Cancel</span>
            </v-btn>
          </v-layout>
          </v-col>
        </v-row>
      </template>
  </v-card>
</template>

<script>
export default ({
  props: {
    rewardEditorObject: {
      type: Object
    },
    rewardItems: {
      type: Array,
      default: () => []
    },
    item: {
      type: Object
    },
    label: {
      type: String
    },
    record: {
      type: Object
    },
    recordIndex: {
      type: Number
    },
    field: {
      type: Object
    },
    fromKanbanView: {
      type: Object
    },
    isKanbanView: {
      default: () => false,
      type: Boolean
    },
    editPreviewFromKanban: {
      default: () => false,
      type: Boolean
    },
    indexObj: {
      default: () => {},
      type: Object
    },
    isEditPreview: {
      default: () => false,
      type: Boolean
    },
    isEditView: {
      default: () => false,
      type: Boolean
    },
    isListView: {
      default: () => false,
      type: Boolean
    },
    isTileView: {
      default: () => false,
      type: Boolean
    },
    isFromQuickAdd: {
      default: () => false,
      type: Boolean
    }
  },
  data () {
    return {
      model: {},
      outOfPoints: 0,
      rewardEditorModel: null
    }
  },
  computed: {
    sumOfRatings () {
      if (this.item && this.item.options && this.item.options.length > 0) {
        let count = this.item.options.reduce((acc, item) => item.rating > 0 ? acc + item.rating : acc, 0)
        return count
      } else {
        return 0
      }
    }
  },
  mounted () {
    if (this.rewardEditorObject) {
      this.calculateOverAllPoints()
      this.$root.$on('ratingCount', () => {
        this.calculateOverAllPoints()
      })
    }
    this.constructRewardEditorModel()
    this.$root.$on('ratingCount', () => {
      this.constructRewardEditorModel()
    })
  },
  methods: {
    emitSavedRewards () {
      this.item.totalRewards = this.sumOfRatings
      if (this.record && this.label && this.record[this.label]) {
        this.record[this.label].text = this.label
        this.record[this.label].value = this.item
      }
      let rewardModel = []
      if (this.item.options != null && this.item.options.length) {
        this.item.options.forEach(element => {
          rewardModel.push({ value: element.value, rating: element.rating })
        })
      }
      // if (this.isKanbanView) {
      //   this.model = {
      //     fields: this.field.allValues,
      //     fromKanbanView: this.fromKanbanView,
      //     fromListView: false,
      //     inLineEditValue: true,
      //     model: { [this.field.value]: rewardModel }
      //   }
      // } else {
      //   this.model = {
      //     fields: this.field,
      //     index: this.recordIndex,
      //     fromListView: true,
      //     fromKanbanView: false,
      //     model: { [this.field.name || [this.field.value]]: rewardModel }
      //   }
      // }
      if (this.isKanbanView) {
        this.model = {
          fields: this.field.allValues,
          fromKanbanView: this.fromKanbanView,
          fromListView: false,
          inLineEditValue: true,
          model: { [this.field.value]: rewardModel }
        }
        this.$root.$emit('rewardListView', this.model)
      } else if (this.editPreviewFromKanban) {
        this.model = {
          fields: this.field,
          index: this.field.name,
          indexObj: this.indexObj,
          moduleInlineEdit: false,
          model: { [this.field.name]: rewardModel }
        }
        this.$root.$emit('rewardListView', this.model)
      } else if (this.isFromQuickAdd) {
        this.model = { fieldName: this.field.name, rewardModel }
        this.$root.$emit('rewardFromQuickAdd', this.model)
      } else {
        this.model = {
          fields: this.field,
          index: this.recordIndex,
          fromListView: true,
          fromKanbanView: false,
          model: { [this.field.name || [this.field.value]]: rewardModel }
        }
      }
      if (this.isEditPreview) {
        this.$root.$emit('rewardEditPreview', this.model)
      } if (this.isEditView) {
        this.$root.$emit('rewardEditView', this.model)
      } if (this.isListView || this.isTileView) {
        this.$root.$emit('rewardListView', this.model)
      }
      this.resetValue()
    },
    cancelRewards () {
      if (this.isEditPreview) {
        this.$root.$emit('rewardEditPreviewCancel', this.model)
      } if (this.isEditView) {
        this.$root.$emit('rewardEditViewCancel', this.model)
      } if (this.isListView || this.isTileView || this.isKanbanView) {
        this.$root.$emit('rewardListViewCancel', this.model)
      } if (this.isFromQuickAdd) {
        this.$root.$emit('rewardFromQuickAddCancel', this.model)
      }
      this.resetValue()
      // this.$refs.ratingRefOptions.reset()
    },
    calculateOverAllPoints () {
      if (this.rewardEditorObject !== null && this.rewardEditorObject.rewardItems !== null && this.rewardEditorObject.rewardItems.length > 0) {
        if (this.rewardEditorObject.rewardItems.length > 0) {
          this.rewardEditorObject.field.default_value.options = this.rewardEditorObject.field.default_value.options.map(x => {
            const matchingReward = this.rewardEditorObject.rewardItems.find(y => String(y.value) === String(x.value))
            if (matchingReward) {
              return { ...x, rating: matchingReward.rating }
            }
            return x
          })
        }
        this.outOfPoints = this.rewardEditorObject.field.default_value.options.reduce((acc, item) => item.worthOf > 0 ? acc + item.worthOf : acc, 0)
      } else if (this.rewardEditorObject.field.default_value && this.rewardEditorObject.field.default_value.options && this.rewardEditorObject.field.default_value.options.length > 0) {
        this.outOfPoints = this.rewardEditorObject.field.default_value.options.reduce((acc, item) => item.worthOf > 0 ? acc + item.worthOf : acc, 0)
      }
    },
    constructRewardEditorModel () {
      if (this.item && this.item.options.length > 0) {
        this.rewardEditorModel = this.item.options
        this.outOfPoints = this.rewardEditorModel.reduce((acc, item) => item.worthOf > 0 ? acc + item.worthOf : acc, 0)
      } else if (this.rewardEditorObject && this.rewardEditorObject.field.default_value.options && this.rewardEditorObject.field.default_value.options.length > 0) {
        this.rewardEditorModel = this.rewardEditorObject.field.default_value.options
      }
    },
    resetValue () {
      this.item.options.forEach(value => {
        value.rating = 0
      })
    }
  }
})
</script>

<style scoped>
.prevent-scroll {
overflow:hidden !important;
}
</style>
