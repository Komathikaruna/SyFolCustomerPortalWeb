<template>
  <div>
    <v-autocomplete @blur="$root.$emit('closeExpension')" outlined dense hide-details multiple :label="$t('fields')" :items="items" v-model="model[objKey]"
      item-text="text" item-value="_id">
      <template v-slot:selection="{ item, index }">
        <v-chip v-if="index === 0" class="mt-1" style="height: 28px">
          <span>{{ item.text }}</span>
        </v-chip>
        <!-- <span v-if="index === 1" class="grey--text caption">(+{{ model[objKey].length - 1 }} {{$t('others')}})</span> -->
         <span v-if="index === 1" class="grey--text caption">(+{{ model[objKey].filter((item) => item).length - 1 }} {{$t('others')}})</span>
      </template>
      <template v-slot:prepend-item>
        <v-list-item ripple @click="groupBytoggle" @focusout="$root.$emit('closeExpension')">
          <v-list-item-action>
            <v-icon color="primary">{{ icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
              <v-list-item-title>Select All</v-list-item-title>
          </v-list-item-content>
          </v-list-item>
        </template>
  </v-autocomplete>
  </div>
</template>
<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    model: {
      type: Object,
      default: () => {}
    },
    objKey: {
      type: String,
      default: () => ''
    }
  },
  data () {
    return {
      selectedItems: []
    }
  },
  computed: {
    comparegroupByElements () {
      return this.model[this.objKey].length === this.items.length
    },
    icon () {
      if (this.comparegroupByElements) return 'mdi-close-box'
      return 'mdi-checkbox-blank-outline'
    }
  },
  methods: {
    groupBytoggle () {
      if (this.comparegroupByElements) {
        if (this.model[this.objKey]) this.model[this.objKey] = []
      } else {
        // this.model[this.objKey] = this.items.map(item => item.value)
        this.model[this.objKey] = this.items.map(item => {
          if (!item.disabled) return item._id
        })
      }
    }
  }
}
</script>
