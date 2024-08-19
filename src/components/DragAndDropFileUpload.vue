<template>
  <v-card outlined
    @drop.prevent="onDrop($event)"
    @dragover.prevent="dragover = true"
    @dragenter.prevent="dragover = true"
    @dragleave.prevent="dragover = false"
    :class="{ 'grey lighten-2': dragover }"
  >
    <v-card-text class="pa-1">
      <input id="fileUpload" type="file" ref="inputFile" @input="fileSelected()" hidden  :multiple="multiple" />
      <v-row class="d-flex flex-column" dense align="center" justify="center">
        <v-icon :class="[dragover ? 'mt-2, mb-6' : 'mt-5']" size="60" @click="triggerFileUpload" color="success"> mdi-cloud-upload </v-icon>
        <p> {{$t('files')}} </p>
      </v-row>
      <v-virtual-scroll v-if="uploadedFiles.length > 0" :items="uploadedFiles" min-height="61px" max-height="140px" item-height="50">
        <template v-slot:default="{ item }">
          <v-list-item :key="item.name">
            <v-list-item-content>
              <v-list-item-title>
                {{ item.name }}
                <span class="ml-3 text--secondary"> {{ item.size }} bytes</span>
                <!-- <span class="ml-3 text--secondary"> {{ $format.humanFileSize(item.size) }}</span> -->
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn @click.stop="removeFile(item.name)" icon>
                <v-icon> mdi-close-circle </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider></v-divider>
        </template>
      </v-virtual-scroll>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'Upload',
  props: {
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dragover: false,
      uploadedFiles: []
    }
  },
  mounted () {
    this.$root.$on('emptyFields', () => {
      this.uploadedFiles = []
    })
  },
  methods: {
    triggerFileUpload () {
      this.$refs.inputFile.click()
    },
    fileSelected () {
      this.uploadedFiles = [...this.uploadedFiles, ...this.$refs.inputFile.files]
      this.$emit('filesUploaded', this.uploadedFiles)
    },
    removeFile (fileName) {
      const index = this.uploadedFiles.findIndex(file => file.name === fileName)
      if (index > -1) {
        this.uploadedFiles.splice(index, 1)
        this.$emit('filesUploaded', this.uploadedFiles)
      }
    },
    onDrop (e) {
      this.dragover = false
      const files = e.dataTransfer.files
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        this.uploadedFiles.push(file)
      }
      this.$emit('filesUploaded', this.uploadedFiles)
    }
  },
  beforeDestroy () {
    this.$root.$off('emptyFields')
  }
}
// eslint-disable-next-line
</script>