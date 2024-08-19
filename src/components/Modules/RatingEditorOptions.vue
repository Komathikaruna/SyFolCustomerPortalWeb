<template>
  <div :key="rewards">
    <h4 class="text--subtitle-1">{{$t('options')}}</h4>
    <v-container>
      <v-form ref="optionsList">
        <v-card flat>
          <template v-for="(item, index) in list">
            <v-row :key="index" class="ma-0">
              <v-col cols="3" md="3"  class="pa-0 px-1">
                <v-text-field outlined v-model="item.label" dense label="Label" @focus="focusingLabelIndex = index" @blur="focusingLabelIndex = -1" :rules="$_optionsLabeleUniqueValidation"></v-text-field>
              </v-col>
              <v-col :cols="showColorPicker ? '2' : '4'" md="1" class="pa-0 px-1">
                <v-text-field @focus="focusingValueIndex = index" @blur="focusingValueIndex = -1" v-model="item.value"
                  :rules="$_optionsValueUniqueValidation" outlined dense label="Value" required disabled></v-text-field>
              </v-col>
              <v-col :cols="showColorPicker ? '8' : '4'" v-if="list.length >= 1">
                <v-row>
                  <v-col :cols="showColorPicker ? '2' : '3'" class="ma-0">
                    <v-row>
                      <v-btn fab dark x-small color="error" class="ma-0 mt-1 pa-0" @click="removeOption(index)" text>
                        <v-icon dark size="21">mdi-minus-circle</v-icon>
                      </v-btn>
                      <v-checkbox dense class="ma-0 mt-1" v-model="item.isactive" hide-details></v-checkbox>
                    </v-row>
                  </v-col>
                  <v-col cols="1" class="ma-0 pa-0" v-if="showColorPicker">
                    <v-menu offset-y :close-on-content-click="false">
                      <template v-slot:activator="{ on }">
                        <v-btn  class="ma-0 pa-0 align-center" x-small fab :color="item.color" dark v-on="on"></v-btn>
                      </template>
                      {{item.color}}
                      <v-color-picker flat  v-model="item.color" class="ma-0 pa-0"></v-color-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="2" class="px-0 mx-0">
                    <v-slider v-model="item.worthOf" class="align-center" thumb-label="always" max="15" min="2" hide-details></v-slider>
                  </v-col>
                  <v-col cols="7">
                    <v-rating readonly v-model="item.rating" dense :length="item.worthOf">
                      <template v-slot:item="props">
                        <v-icon
                          :color="item.color ? item.color : 'grey lighten-1'"
                          @click="props.click">
                        {{item.ratingIcon && item.ratingIcon.iconName ? item.ratingIcon.iconName : 'mdi-circle-outline'}}
                          <!-- {{ props.isFilled ? 'mdi-star-circle' : 'mdi-circle-outline' }} -->
                        </v-icon>
                      </template>
                    </v-rating>
                  </v-col>
                  <!-- <v-col cols="7" class="ma-0 pa-0">
                    <v-radio-group class="mt-0" row v-model="radioGroup">
                      <v-radio
                        v-for="n in listOfRatings"
                        :key="n.label"
                        :label="n.label"
                        :value="n"
                        :off-icon="n.iconName"
                      >
                      </v-radio>
                    </v-radio-group>
                  </v-col> -->
                </v-row>
              </v-col>
            </v-row>
            <!-- <v-row :key="`a_${index}`">
              <v-col cols="3">
                <v-slider v-model="item.worthOf" class="align-center" thumb-label="always" max="15" min="2" hide-details></v-slider>
              </v-col>
              <v-col cols="9">
                <v-rating readonly v-model="item.rating" dense :length="item.worthOf"></v-rating>
              </v-col>
            </v-row> -->
          </template>
          <v-btn class="mt-0" @click="addNewOption" fab dark x-small color="primary">
            <v-icon dark>mdi-plus</v-icon>
          </v-btn>
          <template>
            <v-row>
              <v-col cols="2" class="mt-3">
                <v-text-field readonly label="Total" dense type="number" outlined class="pt-2 ma-0" v-model="sumOfRatings"></v-text-field>
              </v-col>
            </v-row>
          </template>
        </v-card>
      </v-form>
    </v-container>
  </div>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    fieldType: {
      type: String,
      default: () => ''
    },
    type: {
      type: Number
    },
    totalRewards: {
      type: Number
    },
    showColorPicker: {
      type: Boolean
    },
    rewards: {
      type: Number
    }
  },
  data () {
    return {
      focusingValueIndex: -1,
      focusingLabelIndex: -1,
      radioGroup: 1,
      value: 1,
      listOfRatings: [
        { iconName: 'mdi-star', label: 'star' },
        { iconName: 'mdi-circle-outline', label: 'coins' },
        { iconName: 'mdi-star-circle', label: 'coins with star' }
      ]
    }
  },
  computed: {
    $_optionsValueUniqueValidation () {
      return [val => {
        var result
        if (!val) result = 'Required'
        else {
          let values = []
          if (this.focusingValueIndex > -1) values = this.list.filter((x, index) => index !== this.focusingValueIndex).map(x => x.value)
          result = values.includes(val) ? 'Value should not be same as previous ones' : true
        }
        return result
      }]
    },
    $_optionsLabeleUniqueValidation () {
      return [val => {
        var result
        if (!val) result = 'Required'
        else {
          let labels = []
          if (this.focusingLabelIndex > -1) labels = this.list.filter((x, index) => index !== this.focusingLabelIndex).map(x => x.label)
          result = labels.includes(val) ? 'Label should not be same as previous ones' : true
        }
        return result
      }]
    },
    sumOfRatings () {
      let count = this.list.reduce((acc, item) => item.worthOf > 0 ? acc + item.worthOf : acc, 0)
      // this.totalRewards = count
      return count
    }
  },
  methods: {
    addNewOption () {
      let findCustomIcon = this.list.find((x) => x.ratingIcon)
      if (findCustomIcon) {
        this.list.push({ isactive: true, worthOf: 2, rating: 0, ratingIcon: findCustomIcon.ratingIcon, color: '#1976D2FF', value: (this.list.length + 1) })
      } else {
        this.list.push({ isactive: true, worthOf: 2, rating: 0, color: '#1976D2FF', value: (this.list.length + 1) })
      }
    },
    removeOption (index) {
      this.list.splice(index, 1)
    }
  }
}
</script>
