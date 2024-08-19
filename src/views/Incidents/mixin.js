export default {
  methods: {
    async searchProjects (searchTerm) {
      if (searchTerm) {
        this.projectLoader = true
        await this.$api.execute('get', `moduledata/${this.PROJECT}/live_search_for_dropdown?searchterm=${searchTerm}`).then(response => {
          response.data.forEach(item => {
            item.data.name = `${item.data.number || ''} ${item.data.name || ''}`
          })
          this.listOfProjects = response.data
          if (!response.data.length) this.hasSearchResults = false
        }).finally(() => { this.projectLoader = false })
      }
    },
    getProjectById (modelObj) {
      if (modelObj.modulerelations && modelObj.modulerelations.length > 0) {
        let projectFound = modelObj.modulerelations.find(x => x.module === this.PROJECT)
        if (projectFound && (projectFound._id || projectFound.id)) {
          this.projectLoader = true
          this.$api.execute('get', `moduledata/${this.PROJECT}/get_by_id/${projectFound._id || projectFound.id}`).then(response => {
            response.data.data.name = `${response.data.data.number || ''} ${response.data.data.name || ''}`
            this.listOfProjects.push(response.data)
          }).finally(() => {
            this.projectLoader = false
          })
        }
      }
    }
  }
}
