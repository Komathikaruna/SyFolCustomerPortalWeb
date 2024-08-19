<template>
  <div>
    <v-card flat>
      <v-row>
        <v-col cols="12">
          <v-expansion-panels v-model="expandedPanel" class="mt-4"  multiple focusable tile>
            <v-expansion-panel v-for="(item,i) in list" :key="i" >
              <v-expansion-panel-header style="border-botton: 3px solid green" class="font-weight-bold text-subtitle-1 title">
                {{ item }}
                <template v-if="i === 0">
                  <v-row>
                    <span class="ml-2 mt-1"><v-badge color="#01579B" inline :content="`${filtersArray.length}`"></v-badge></span>
                      <v-col cols="11" class=" pa-1">
                        <div><v-chip v-for=" (item, index) in  filtersArray" :key="`_${index}`" label small color="primary"  class="mx-1 pa-1 mb-1">{{ item }}</v-chip></div>
                      </v-col>
                    </v-row>
                </template>
                <template v-if="i === 1">
                  <div class="d-flex flex-row-reverse font-weight-bold">
                    <span>{{ $t('rows') }}<v-badge color="primary" :content="`${filteredArrayRow.length}`" inline></v-badge></span>
                    <span> {{ $t('columns')}}<v-badge color="primary" :content="`${filteredArrayColumn.length}`" inline></v-badge></span>
                  </div>
                </template>
                <template v-if="i === 2">
                  <div class="d-flex flex-row-reverse font-weight-bold mr-4 ml-2"> ({{ $t('rewards') }} {{ radioGroup }})</div>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-if="i === 0">
                  <v-row class="mt-1">
                    <v-col cols="3">
                      <reward-options :items="filterList" objKey='listofFields' :model="fields"></reward-options>
                    </v-col>
                  </v-row>
                  <div>
                    <reward-filters :listOfAllActiveFieldsWithValues="getSelectedItem" @removeItem="removeItemFilter"></reward-filters>
                  </div>
                </div>
                <div v-if="i === 1">
                  <v-row class="mt-1">
                    <div class="flex-container">
                      <div id="flowBoxes" class="group-by-container">
                        <div class="right font-weight-bold" v-if="filteredArrayColumn.length">{{ $t('columns')}}</div>
                        <draggable class="pa-0 remove-border" ghost-class="ghost" v-model="modelGroupByColumn">
                          <div class="left right active draggable-element" v-for=" (i, index) in filteredArrayColumn" :key="i">
                            <span class="text-truncate font-weight-medium" :title="i">{{i}} <v-icon size="15" @click="removeItem(index)" class="ml-2" color="#FFFFFF">mdi-close</v-icon></span>
                          </div>
                        </draggable>
                      </div>
                      <v-spacer></v-spacer>
                      <v-col cols="1" class="px-1" xl="3" lg="2">
                        <reward-options :items="groupByColumns" objKey='groupByColumn' :model="fields"></reward-options>
                      </v-col>
                    </div>
                  </v-row>
                  <v-row class="mb-5 mt-6">
                    <div class="flex-container mt-3">
                      <div id="flowBoxes" class="group-by-container">
                        <div class="right font-weight-bold" v-if="filteredArrayRow.length">{{ $t('rows') }}</div>
                        <draggable class="pa-0 remove-border" ghost-class="ghost" v-model="modelGroupByRow">
                          <div class="left right active draggable-element" v-for=" (i, index) in filteredArrayRow" :key="i" >
                            <span class="text-truncate font-weight-medium" :title="i">{{i}} <v-icon class="ml-2" @click="removeGroupByRowItem(index)" color="#FFFFFF" size="15">mdi-close</v-icon> </span>
                          </div>
                        </draggable>
                      </div>
                      <v-spacer></v-spacer>
                      <v-col cols="2"  class="px-1" xl="3" lg="2">
                        <reward-options :items="groupByRows" objKey='groupByRow' :model="fields"></reward-options>
                      </v-col>
                    </div>
                  </v-row>
                </div>
                <div v-if=" i === 2">
                  <v-radio-group dense v-model="radioGroup">
                    <v-radio
                      v-for="item in rewardsList"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value"
                    ></v-radio>
                 </v-radio-group>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
        <v-col cols="12">
          <v-btn color="primary" @click="runReportHandler()" tile small>{{ $t('apply') }}</v-btn>
          <v-btn color="error" class="ml-1" tile small @click="resetData()"> {{ $t('reset') }}</v-btn>
        </v-col>
        <!-- <v-col cols="12">
          <rewards-table :payload="reportsHeader"></rewards-table>
        </v-col> -->
      </v-row>
    </v-card>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
export default {
  props: {
    payload: {
      type: Object,
      default: () => {}
    },
    listofFields: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      groupByselectedItems: [],
      isShow: false,
      getSelectedItem: [],
      selectAll: [{ text: this.$t('all'), value: 'all' }],
      list: [ this.$t('filters'), this.$t('groupBy'), this.$t('reportBy') ],
      expandedPanel: [0, 1, 2],
      radioGroup: 'count',
      rewardsList: [
        { name: this.$t('rewardsCount'), value: 'count' },
        { name: this.$t('rewardsSum'), value: 'sum' }
      ],
      chip: true,
      groupByRow: [],
      fields: {
        groupByRow: [],
        groupByColumn: [],
        listofFields: []
      },
      groupByRows: [],
      groupByColumns: [],
      filterList: [],
      moduleId: this.$route.params.id,
      reportsHeader: {},
      testing: []
    }
  },
  watch: {
    'fields.listofFields': {
      handler (value) {
        if (value.length) {
          let selectedItem = []
          value.forEach((item) => {
            let getItem = this.headers.find(record => record._id === item)
            selectedItem.push(getItem)
          })
          this.getSelectedItem = selectedItem
        } else {
          this.getSelectedItem = []
        }
        this.isShow = false
      },
      deep: true
    },
    'fields.groupByColumn': {
      handler (value) {
        if (value) {
          this.groupByColumnHanler(value)
        }
      },
      deep: true
    },
    'fields.groupByRow': {
      handler (value) {
        if (value) {
          this.groupByRowHandler(value)
        }
      },
      deep: true
    }
  },
  computed: {
    headers () {
      let headers = this.$formatter.cloneVariable(this.listofFields)
      headers = headers.filter((item) => !['created_at', 'created_by', 'modified_at', 'modified_by', 'isanonymous'].includes(item.value) && (![9, 10, 11, 17, 20, 19].includes(item.type)))
      headers = headers.filter((item) => !item.allValues.isSubModule && (item.default_value || {}).selectType !== 'custom')
      headers = [...headers]
      return headers
    },
    filteredArrayColumn () {
      // Filter out null values from the array
      return this.getRecords(this.modelGroupByColumn)
    },
    filteredArrayRow () {
      // Filter out null values from the array
      return this.getRecords(this.modelGroupByRow)
    },
    filtersArray () {
      let result = this.fields.listofFields.filter((item) => item)
      return this.getRecords(result)
    },
    modelGroupByColumn: {
      get () {
        return this.fields.groupByColumn.filter((item) => item)
      },
      set (val) {
        this.fields.groupByColumn = val
      }
    },
    modelGroupByRow: {
      get () {
        return this.fields.groupByRow.filter((item) => item)
      },
      set (val) {
        this.fields.groupByRow = val
      }
    }
  },
  methods: {
    getFields () {
      if (this.$refs.ratingReports.validate()) {
        this.isShow = true
      }
    },
    runReportHandler () {
      this.$root.$emit('runReports')
    },
    removeItem (index) {
      this.fields.groupByColumn.splice(index, 1)
    },
    removeGroupByRowItem (index) {
      this.fields.groupByRow.splice(index, 1)
    },
    groupByColumnHanler (value) {
      this.groupByRows = this.$formatter.cloneVariable(this.headers)
      this.groupByRows = this.groupByRows.map((item) => ({ ...item, disabled: value.includes(item._id) }))
    },
    groupByRowHandler (value) {
      this.groupByColumns = this.$formatter.cloneVariable(this.headers)
      this.groupByColumns = this.groupByColumns.map((item) => ({ ...item, disabled: value.includes(item._id) }))
    },
    getRecords (result) {
      let fieldNames = []
      if (result.length) {
        result.forEach((field) => {
          let value = this.headers.find(item => item._id === field)
          fieldNames.push(value.text)
        })
      }
      return fieldNames
    },
    generateReports (filterConditions) {
      let reportsObj = {
        moduleId: this.moduleId,
        filters: filterConditions.length ? filterConditions : [],
        GroupBy: {
          col: this.modelGroupByColumn,
          row: this.modelGroupByRow
        },
        reportBy: this.radioGroup
      }
      let model = this.$formatter.cloneVariable(reportsObj)
      this.$api.execute('post', `rewardsreport/get_report`, model).then(({ data }) => {
      })
        .finally(() => {
        })
    },
    removeItemFilter (index) {
      this.getSelectedItem.splice(index, 1)
      this.fields.listofFields.splice(index, 1)
    },
    resetData () {
      this.getSelectedItem = []
      this.fields.listofFields = []
      this.fields.groupByColumn = []
      this.fields.groupByRow = []
      this.$root.$emit('clearRewardsFilters', true)
    }
  },
  components: {
    'reward-filters': () => import('@/components/RatingReports/RewardFilters.vue'),
    'reward-options': () => import('@/components/RatingReports/Options.vue'),
    draggable
    // 'rewards-table': () => import('@/components/RatingReports/RewardsTable.vue')
  },
  mounted () {
    this.groupByRows = this.$formatter.cloneVariable(this.headers)
    this.groupByColumns = this.$formatter.cloneVariable(this.headers)
    let getRecords = this.$formatter.cloneVariable(this.headers)
    this.filterList = getRecords.map((item) => ({ ...item, disabled: false }))
    this.$root.$on('closeExpension', () => {
      this.expandedPanel = this.expandedPanel.filter((panelIndex) => panelIndex !== 0)
    })
    this.$root.$on('rewardsFilters', (filterConditions) => {
      this.generateReports(filterConditions)
    })
  }
}
</script>
<style scoped>

.flex-container {
  width:100%;
  display:flex;
  height:100%;
  align-items: center;
}
.chip-container {
  display:flex;
  flex-wrap:wrap;
  width:90%
}
#flowBoxes {
    margin:auto;
    padding:20px;
    min-width:700px;

}
#flowBoxes div {
    display:inline-block;
    position:relative;
    height:25px;
    line-height:25px;
    padding:0 20px;
    border:1px solid #ccc;
    margin-right:2px;
    background-color:white;
}

#flowBoxes div.right:after{
    content:'';
    border-top:1px solid #ccc;
    border-right:1px solid #ccc;
    width:18px;
    height:18px;
    position:absolute;
    right:0;
    top:-1px;
    background-color:white;
    z-index:150;
    -webkit-transform: translate(10px,4px) rotate(45deg);
       -moz-transform: translate(10px,4px) rotate(45deg);
        -ms-transform: translate(10px,4px) rotate(45deg);
         -o-transform: translate(10px,4px) rotate(20deg);
            transform: translate(10px,4px) rotate(45deg);
}

#flowBoxes div.left:before{
    content:'';
    border-top:1px solid #ccc;
    border-right:1px solid #ccc;
    width:18px;
    height:18px;
    position:absolute;
    left:0;
    top:-1px;
    background-color:white;
    z-index:50;
    -webkit-transform: translate(-10px,4px) rotate(45deg);
       -moz-transform: translate(-10px,4px) rotate(45deg);
        -ms-transform: translate(-10px,4px) rotate(45deg);
         -o-transform: translate(-10px,4px) rotate(20deg);
            transform: translate(-10px,4px) rotate(45deg);
}
#flowBoxes .active{
  background-color: #757575;
  color:white;
}
#flowBoxes div.active:after{
  background-color: #757575;
}
.draggable-element {
  cursor: all-scroll;
}
.group-by-container {
  display: flex !important;
}
.remove-border {
  border:none !important;
}
</style>
