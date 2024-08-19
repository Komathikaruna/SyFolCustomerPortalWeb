<template>
  <v-card :flat="ticketview">
    <v-card-title :style="`background-color: ${ systemDetails.themecolor }; color: ${ systemDetails.textcolor };`" class="pa-4 pb-3" v-if="!ticketview">
      <span class="body-1 font-weight-medium px-1"> {{ $t('chooseTemplate') }} </span>
      <v-spacer></v-spacer>
      <v-btn icon dark @click="closeComponent" x-small>
        <v-icon> mdi-close-circle </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text :class="ticketview ? 'pa-0': 'pa-2'">
      <v-row v-if="listOfTemplates.length" no-gutters class="text-center">
        <v-col cols="12">
          <v-radio-group v-model="selectedTemplate" hide-details class="ma-2 ">
            <v-radio class="text-center"
              v-for="item in listOfTemplates"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row v-else class="mt-1">
        <v-col>
          <template>
            <v-alert color="info" dark icon="mdi-file-alert" border="left" prominent outlined>
              <span> {{ $t('noTemplate') }} </span>
            </v-alert>
          </template>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider v-if="!ticketview"></v-divider>
    <v-card-actions v-if="!ticketview">
      <v-spacer></v-spacer>
      <v-btn color="success" @click="saveTemplate" :disabled="!selectedTemplate"> {{ $t('save') }} </v-btn>
      <v-btn color="error" @click="closeComponent()"> {{ $t('close') }} </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: ['listOfTemplates', 'ticketview'],
  data () {
    return {
      selectedTemplate: null
    }
  },
  computed: {
    ...mapGetters(['systemDetails'])
  },
  methods: {
    saveTemplate () {
      this.$root.$emit('saveTemplate', this.selectedTemplate)
    },
    closeComponent () {
      this.$root.$emit('hideComponent')
    }
  }
}
</script>
