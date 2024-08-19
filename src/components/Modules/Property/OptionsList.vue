<template>
  <div class="options_list_class">
    <h5>{{ $t('options') }}</h5>
    <v-container fluid class="pa-0 mt-4">
      <v-form ref="optionsList">
        <draggable v-model="optionList" ghost-class="ghost" @change="$emit('input', optionList)">
          <v-row class="sortable" :id="item" v-for="(item, index) in optionList" :key="index">
            <v-col cols="12" md="5">
              <v-row>
                <v-col cols="1" class="pa-0">
                  <v-icon class="mt-1" size="30">mdi-drag</v-icon>
                </v-col>
                <v-col cols="11" class="pa-0 pr-1">
                  <v-text-field v-model="item.label" outlined hide-details :label="$t('label')" required dense :autofocus="index === indexValue"></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" class="pa-0" md="5">
              <v-text-field class="custom-append-style" @keypress.enter="addRow(item.label, item.value, index)"  v-model="item.value" @focus="focusingValueIndex = index;" @blur="focusingValueIndex = -1" :rules="!item.is_internal ? $_optionsValueUniqueValidation : []" outlined :label="$t('value')" required dense :readonly="item.is_internal && item.is_internal === 'true'">
                <template v-slot:append-outer v-if="showColorPicker">
                  <v-menu offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on }">
                      <v-btn x-small fab :color="item.color" dark v-on="on"></v-btn>
                    </template>
                    <v-color-picker v-model="item.color" class="mx-auto"></v-color-picker>
                  </v-menu>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="2" class="pa-0 mt-1">
              <v-btn text color="error" x-small v-if="optionList.length > 1" @click="optionList.splice(index, 1)" :disabled="item.is_internal && item.is_internal === 'true'">
                <v-icon>mdi-minus-circle</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </draggable>
      </v-form>
      <v-btn class="mt-1 ml-3" @click="optionList.push(showColorPicker ? { color: '#1976D2FF' } : {})" fab dark x-small color="primary">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-container>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    showColorPicker: {
      type: Boolean
    }
  },
  data () {
    return {
      focusingValueIndex: -1,
      optionList: [],
      indexValue: null
    }
  },
  components: {
    draggable
  },
  watch: {
    value: {
      handler (value) {
        this.optionList = value
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    $_optionsValueUniqueValidation () {
      return [val => {
        var result
        if (!val) result = 'Required'
        else {
          let values = []
          if (this.focusingValueIndex > -1) values = this.optionList.filter((x, index) => index !== this.focusingValueIndex).map(x => x.value)
          result = values.includes(val) ? 'Please enter unique value' : true
        }
        return result
      }]
    }
  },
  methods: {
    addRow (label, value, index) {
      if ((label && label.length) && (value && value.length)) {
        this.optionList.push(this.showColorPicker ? { color: '#1976D2FF' } : {})
        this.indexValue = index + 1
      }
    }
  }
}
</script>
<style>
.options_list_class .sortable {
  width: 100%;
  cursor: move;
}
.options_list_class .sortable {
  float: right;
}
.options_list_class .ghost {
  border-left: 5px solid rgb(134, 206, 156);
  box-shadow: 10px 10px 5px -1px rgba(0, 0, 0, 0.14);
  opacity: 1;
}
.custom-append-style > div.v-input__append-outer {
  /* margin: auto 0.2rem !important; */
  margin-top: 4px !important;
}
</style>
