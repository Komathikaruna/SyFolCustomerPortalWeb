<template>
     <v-card>
        <v-card-title>
          {{ $t('validation') }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-5">
          <v-form>
            <v-select :items="eventsList" item-text="text" item-value="value" :label="$t('validateOn')" outlined dense hide-details></v-select>
            <div>
            </div>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" id="cloneConfirm">{{ $t('yes') }}</v-btn>
          <v-btn color="error" id="deleteClose">{{ $t('no') }}</v-btn>
        </v-card-actions>
      </v-card>
</template>
<script>
export default {
  data () {
    return { }
  },
  computed: {
    eventsList () {
      return [{
        text: 'Change',
        value: 'change'
      }, {
        text: 'Blur',
        value: 'blur'
      }]
    }
  }
}
</script>
