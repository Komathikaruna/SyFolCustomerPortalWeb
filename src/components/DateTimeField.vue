<template>
  <div>
    <v-menu v-model="modelObj.menu" :close-on-content-click="false" max-width="100%">
      <template #activator="{ on, attrs }">
        <v-text-field :label="label" hide-details outlined dense readonly
        v-model="modelObj.dateTime" :rules="validation">
        <template #prepend>
          <v-btn icon v-bind="attrs" v-on="on" class="ma-n1 mr-n2">
            <v-icon> {{ 'mdi-timetable' }} </v-icon>
          </v-btn>
        </template>
        </v-text-field>
      </template>
      <v-card>
        <v-card-title class="pa-0">
          <v-tabs v-model="modelObj.activeTab" centered grow background-color="primary" color="white">
            <v-tabs-slider></v-tabs-slider>
            <v-tab class="font-weight-bold"> {{ $t('date') }} </v-tab>
            <v-tab class="font-weight-bold" :disabled="!modelObj.date"> {{ $t('time') }} </v-tab>
          </v-tabs>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-tabs-items v-model="modelObj.activeTab">
            <v-tab-item>
              <v-card tile>
                <v-card-text class="pa-0">
                  <v-date-picker v-model="modelObj.date" show-adjacent-months no-title @input="$set(modelObj, 'activeTab', 1)"
                  @change="updateDateTime" :first-day-of-week="1"></v-date-picker>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card tile>
                <v-card-text class="pa-0">
                  <v-time-picker v-model="modelObj.time" format="24hr" @click:hour="updateDateTime" @click:minute="updateDateTime(); modelObj.menu = false"
                  ></v-time-picker>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>
<script>
export default {
  props: ['label', 'value', 'validation'],
  data () {
    return {
      modelObj: {
        menu: false,
        activeTab: 0
      }
    }
  },
  watch: {
    value: {
      handler () {
        if (this.value) {
          this.modelObj.date = this.value.split('T')[0]
          this.modelObj.time = this.value.split('T')[1]
          this.modelObj.dateTime = this.$formatter.formatDateTimeForPicker(this.modelObj.date, this.modelObj.time)
          this.$forceUpdate()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    updateDateTime () {
      this.modelObj.time = this.modelObj.time || '00:00'
      // this.modelObj.dateTime = this.modelObj.date + ' ' + this.modelObj.time
      this.modelObj.dateTime = this.$formatter.formatDateTimeForPicker(this.modelObj.date, this.modelObj.time)
      this.$emit('input', this.modelObj.date + 'T' + this.modelObj.time)
      this.$forceUpdate()
    }
  }
}
</script>
