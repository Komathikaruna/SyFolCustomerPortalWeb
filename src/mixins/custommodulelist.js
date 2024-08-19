import mixins from '../views/CustomModules/mixin'
export default {
  mixins: [mixins],
  methods: {
    /* Datalist checkbox selection handling */
    handleSelectedItems () { // While selctall checkobx clicked in datalist
      let totalSelectable = this.payload.list.filter(item => item.accesscontrol && item.accesscontrol.delete && item.accesscontrol.edit).length
      if (this.selected.length !== totalSelectable) {
        if (this.selected.length && this.selected.length === this.recordsHasManagePermissionCount) this.clearSelected() // Handling selected items when the user has only view permission for the records
        else {
          // this.selected = []
          this.selected = this.payload.list.filter(({ accesscontrol }) => (accesscontrol.edit && accesscontrol.delete)).map((listItem) => listItem._id)
          // this.payload.list.forEach((element) => {
          //   element.isSelected = element.accesscontrol.edit && element.accesscontrol.delete
          //   let isAlreadySelected = this.selected.find(x => x._id === element._id)
          //   if (!isAlreadySelected && element.isSelected) this.selected.push(element)
          // })
        }
      } else this.clearSelected()
      this.addRecordToSelectedItems()
    },
    addRecordToSelectedItems () { // Add record to selected list while clicking in checkbox (Single checkbox)
      if (this.selected.length === 1) { // show applied permissions if only one records is selected
        let hasElement = this.payload.list.find((listItem) => listItem._id === this.selected[0])
        if (hasElement) {
          this.handleMultiSPpermissions = true
          this.hideforadminsFlag = hasElement.hideforadmins
          this.recordSPIdForPermission = hasElement.sharepoint_id
        }
        if (hasElement && hasElement.permissions && hasElement.permissions.length) {
          this.listOfPermissionAssinged = hasElement.permissions
          this.recordSPIdForPermission = hasElement.sharepoint_id
          this.handleMultiSPpermissions = true
        }
      } else {
        this.listOfPermissionAssinged = []
        this.handleMultiSPpermissions = false
      }
      // toggle datalist-header-checkbox style based on selected count
      // const checkbox = document.querySelector('.custom-list-table thead.v-data-table-header div.v-simple-checkbox i.v-icon')
      // if (checkbox) checkbox.className = `v-icon notranslate theme--light mdi ${(this.selected.length) ? (this.payload.list.length === this.selected.length) ? 'mdi-checkbox-marked' : 'mdi-minus-box' : 'mdi-checkbox-blank-outline'}`
      // if (checkbox) checkbox.className = `v-icon notranslate theme--light mdi ${(this.selected.length) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'}`
    },
    /* Manage columns handlers */
    openManageColumnsDialog () {
      this.manageColumnsDialog = true
      // let listOfFieldsClone = this.$formatter.cloneVariable(this.payload.listOfAllActiveFields.filter((item) => (item.name !== 'create_for')))
      let listOfFieldsClone = (this.userDetails.isadmin) ? this.$formatter.cloneVariable(this.payload.listOfAllActiveFieldsForManageColumn) : this.$formatter.cloneVariable(this.payload.listOfAllActiveFieldsForManageColumn.filter((item) => (item.name !== 'create_for')))
      this.listOfFieldsClone = listOfFieldsClone.filter(x => x.type !== 10)
      this.handleSelectedColumnsonLoad()
    },
    handleSelectedColumnsonLoad () { // Setting manage column fields for sorting and seletion while opening
      let result = this.listOfFieldsManageColumns.filter(x => x.show_in_list)
      if (result && result.length === this.listOfFieldsManageColumns.length) {
        this.allColumnsSelected = true
      } else if (result && result.length) {
        this.someColumnsSelected = true
      } else this.noColumnsSeleced = true
    },
    toggleSelection (index) { // Selection toggle actions  (Single checkbox)
      if (this.listOfFieldsManageColumns[index].name !== 'name' && this.pagination.sortBy[0] !== this.listOfFieldsManageColumns[index].name && this.listOfFieldsManageColumns[index]._id !== this.fieldSelectedForKView && !this.listOfFieldsManageColumns[index].restrictEditShowInList) {
        this.listOfFieldsManageColumns[index].show_in_list = !this.listOfFieldsManageColumns[index].show_in_list
        let selctedItems = this.listOfFieldsManageColumns.filter(x => x.show_in_list)
        if (!selctedItems || !selctedItems.length) {
          this.allColumnsSelected = false
          this.someColumnsSelected = false
        } else if (selctedItems && selctedItems.length) {
          if (selctedItems.length === this.listOfFieldsManageColumns.length) {
            this.allColumnsSelected = true
            this.someColumnsSelected = false
          } else {
            this.allColumnsSelected = false
            this.someColumnsSelected = true
          }
        }
      }
    },
    handleAllSelectedColumns () { // All toggle actions  (All checkbox)
      if (this.noColumnsSeleced || this.someColumnsSelected) {
        this.listOfFieldsManageColumns.forEach(node => {
          if (!node.restrictEditShowInList) node.show_in_list = true
        })
        this.noColumnsSeleced = this.someColumnsSelected = false
        this.allColumnsSelected = true
      } else {
        this.listOfFieldsManageColumns.forEach(columns => {
          if (columns.name !== 'name' && this.pagination.sortBy[0] !== columns.name && columns._id !== this.fieldSelectedForKView) columns.show_in_list = false
        })
        this.noColumnsSeleced = this.allColumnsSelected = false
        this.someColumnsSelected = true
      }
    },
    saveColumnsPreference () {
      this.manageColumnsDialog = false
      this.searchColumns = ''
      let list = this.$formatter.cloneVariable(this.listOfFieldsManageColumns)
      list.forEach((element, index) => {
        element.column_order = ''
        element.column_order = index
        element.default_value = element.default_value ? JSON.stringify(element.default_value) : element.default_value
      })
      this.payload.list = []
      this.payload.loading = true
      this.$eventBus.$emit('saveColumnsPreference', list)
      this.reRender++
    },
    closeManageColumnsDialog () {
      this.manageColumnsDialog = false
      this.payload.tableFilters.search = ''
      this.allColumnsSelected = this.listOfFieldsManageColumns.every(x => x.show_in_list)
      this.someColumnsSelected = this.listOfFieldsManageColumns.some(x => x.show_in_list)
    },
    // Navigation to customize modules
    navigateCustomModule () {
      // this.$router.push(`/modules/actions/${this.currentModule._id}/fields`)
      this.$router.push(`/modules/actions/${this.currentModule._id}`)
    },
    // Navigation to submodule modules
    navigateTosubModule (item, field) {
      let moduleName = field.split('_')
      let subModule = this.listOfModules.find(x => x.name.toLowerCase() === moduleName[0])
      let recordId = item[`${moduleName[0]}_id`]
      if (subModule) {
        const redirectPath = `/module/${subModule.name}/${subModule._id}/preview/${recordId}`
        if (this.$route.fullPath === redirectPath) {
          this.$root.$emit('snackbar', { snackbar: true, color: 'primary', text: 'alreadyInDestinationRoute' })
        } else this.$router.push(redirectPath)
      }
    },
    /* Filters handlers */
    openFilterDialog () {
      this.$parent.constructFilterList()
      this.filterDrawerKey++
      this.filterDialog = true
    },
    applyFilters () {
      this.$root.$emit('getFilters')
      this.filterDialog = false
    },
    closeFilterDialog () {
      // this.uncheckNoValueSetFilterItems()
      this.filterDialog = false
      this.payload.tableFilters.search = ''
    },
    /** Permission Dialog handlers */
    openPermissionDialog () {
      this.permissionDialog = true
    },
    openPermissionDialogOtherView (assignedPermissions, hideforadminsFlag, listOfIds) { // Setting permission data for record if it is from tiles/kanban
      if (assignedPermissions) this.listOfPermissionAssinged = assignedPermissions
      this.hideforadminsFlag = hideforadminsFlag
      this.otherViewpermissionRecordIds = listOfIds
      this.openPermissionDialog()
    },
    closePermissionDialogHandler () {
      this.permissionDialog = false
      this.hideforadminsFlag = false
    },
    closeRewardsDialog () {
      this.rewardDialog = false
      // this.constructRewardEditor = {}
    },
    applyPermission (data) {
      if (this.moduleName) {
        let permissionsObj = this.$formatter.cloneVariable(data)
        const hasDuplicate = this.findDuplicateExists(permissionsObj.permissions)
        let ids
        if (!hasDuplicate) {
          if (this.selected.length) ids = this.selected
          else ids = this.$formatter.cloneVariable(this.otherViewpermissionRecordIds)
          let obj = {}
          obj.ids = ids
          obj.permissions = permissionsObj.permissions
          this.$api.execute('post', `/moduledata/${this.moduleName}/set_permissions_on_multiple?hideforadmin=${permissionsObj.hideforadmins || false}`, obj).then(() => {
            this.closePermissionDialogHandler()
            this.selected = []
            if (this.currentView.value === 3) this.$eventBus.$emit('kanbanClearSelected')
            else this.$root.$emit('reloadList')
            this.clearSelected()
          })
        } else this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'permissionValidation' })
      }
    },
    clearSPRef (data) {
      let ids = []
      if (data && data.length) ids = data
      else ids = this.selected
      this.$api.execute('post', `moduledata/${this.moduleName}/clear_sharepoint_reference`, { ids })
        .then(() => {
          this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'actionSuccess' })
        }).finally(() => {
          this.clearSelected()
          if (data && data.length) {
            let clearSPflag = true
            this.$root.$emit('reloadList', clearSPflag)
          } else this.$root.$emit('reloadList')
        })
    },
    clearSelected () {
      this.selected = []
      this.addRecordToSelectedItems()
      // clear in tiles view
      var tilesViewComponent = this.$refs.tilesViewList
      if (tilesViewComponent && tilesViewComponent.clearSelected) tilesViewComponent.clearSelected()
      // clear in tiles view
      var kanbanViewComponent = this.$refs.kanbanViewList
      if (kanbanViewComponent && kanbanViewComponent.clearSelected) kanbanViewComponent.clearSelected()
    },
    exportClickHandler (data) {
      // const model = data || ((this.selected.length) ? this.selected : this.getAllRecordIds())
      if (this.payload.list && this.payload.list.length) {
        if (this.currentView.value === 1) this.payload.loading = true // Need to replace this code
        else this.exportLoader = true
        let exportRequestModel = {
          records: data || ((this.selected.length) ? this.selected : []),
          langCode: this.$i18n.locale,
          exportTo: 'excel'
        }
        if (this.paginateFilterQueryObject) {
          exportRequestModel.paginationRequest = this.$formatter.cloneVariable(this.paginateFilterQueryObject)
        }
        this.$api.execute('post', `/moduledata/${this.moduleName}/export`, exportRequestModel)
          .then(({ data } = {}) => {
            if (data.statuscode === 0) this.exportedMoreRecords = true
            else if (data.filepath) window.open(`${process.env.VUE_APP_URL}files/download?fileName=${data.filepath}`, '_blank')
          }).finally(() => {
            this.clearSelected()
            this.payload.loading = false
            this.exportLoader = false
          })
      }
    },
    exportAsPdfHandler (data) {
      // const model = data || ((this.selected.length) ? this.selected : this.getAllRecordIds())
      if (this.payload.list && this.payload.list.length) {
        if (this.currentView.value === 1) this.payload.loading = true // Need to replace this code
        else this.exportLoader = true
        let exportRequestModel = {
          records: data || ((this.selected.length) ? this.selected : []),
          langCode: this.$i18n.locale,
          exportTo: 'pdf'
        }
        if (this.paginateFilterQueryObject) {
          exportRequestModel.paginationRequest = this.$formatter.cloneVariable(this.paginateFilterQueryObject)
        }
        this.$api.execute('post', `/moduledata/${this.moduleName}/export`, exportRequestModel)
          .then(({ data } = {}) => {
            window.open(`${process.env.VUE_APP_URL}files/download?fileName=${data.filepath}`, '_blank')
          }).finally(() => {
            this.clearSelected()
            this.payload.loading = false
            this.exportLoader = false
          })
      }
    },
    getAllRecordIds () {
      return this.payload.list.map((item) => item._id)
    },
    /** List view handlers */
    setView (item) {
      if (this.currentView.value === item.value) return
      let obj = {}
      this.payload.loading = true
      this.payload.list = []
      obj.module_name = this.moduleName
      obj.view_id = item.value
      let findModule = this.getCustomViews.find(x => x.module_name === this.moduleName)
      if (findModule) {
        findModule['view_id'] = obj.view_id
        localStorage.setItem(`${process.env.VUE_APP_NAME}_custom_view`, JSON.stringify(this.getCustomViews))
      } else {
        this.getCustomViews.push(obj)
        localStorage.setItem(`${process.env.VUE_APP_NAME}_custom_view`, JSON.stringify(this.getCustomViews))
      }
      this.currentView = item
      this.$emit('changeView', this.currentView)
    },
    findView (viewArray) {
      let findModule = viewArray.find(x => x.module_name === this.moduleName)
      if (findModule) {
        let view = this.listOfViewMenu.find((y) => y.value === findModule.view_id)
        if (view) this.currentView = view
        this.$emit('changeView', view)
      } else {
        this.currentView = this.listOfViewMenu[0]
        this.$emit('changeView', this.listOfViewMenu[0])
      }
    },
    redirectToPreview (item) { // Record opening
      try {
        let url = this.payload.editURL(item)
        if (url !== this.$router.history.current.fullPath) this.$router.push(url)
      } catch {
        this.payload.editHandler(item._id)
      }
    },
    /* When user selected field for filter but not selecting value then when close dialog unselect the field.
    Note: if saved then don't unselect it */
    // uncheckNoValueSetFilterItems () {
    //   let filtersList = localStorage.getItem(`${process.env.VUE_APP_NAME}_${this.userDetails.tenantname}_filtersHistory`)
    //   if (!filtersList) filtersList = []
    //   else filtersList = JSON.parse(filtersList)
    //   if (filtersList && filtersList.length) {
    //     const activeModule = filtersList.find(x => x.name === this.moduleName)
    //     const activeModuleFilter = activeModule ? activeModule.filters : []
    //     const alreadyStoredFieldIds = activeModuleFilter.map(x => x._id)
    //     let itemsCheckedAndNoValueSet = this.listOfAllActiveFieldsWithValues.filter(x => !alreadyStoredFieldIds.includes(x._id) && x.show)
    //     itemsCheckedAndNoValueSet.forEach(x => {
    //       x.selectBox = x.show = false
    //       x.selected = 'is'
    //     })
    //   }
    // },
    removeAllFilters () {
      if (this.$refs.filterDrawer && this.$refs.filterDrawer.removeAllFilters) this.$refs.filterDrawer.removeAllFilters()
      this.filterDrawerKey++
    },
    closeAndReloadList () {
      this.sharepointImportDialog = false
      this.$root.$emit('reloadList')
    }
  }
}
