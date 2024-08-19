/* eslint-disable */
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      isAction: false,
      MODULE: 'users',
      currentListView: 1,
      listOfRecords: [],
      currentLoopIndex: null,
      listOfSubmoduleFieldColumns: [],
      rewardModule: {},
      childCount: 0,
      limit: 30,
      listData: [],
      loadingValues: false,
      showNoData: false,
      paginationFilter: null,
    }
  },
  mounted () {
    this.$root.$on('getAPIValues', data => { // Get values from defined api - Select type custom
      this.getValuesFromAPI(data.searchText, data.value, data.index)
    })
    this.$root.$on('profileUpdated', ({ filename, recordId, indexObj }) => {
      if (this.currentListView === 3) {
        this.$root.$emit('updateInlineEditValue', { isProfileUpdateFromEditPreview: true, filename, recordId, indexObj })
        return
      }
      if (this.listPayloadObj) {
        let selectedItem = this.listPayloadObj.list.findIndex(x => x._id === recordId)
        if (selectedItem !== -1) this.listPayloadObj.list[selectedItem].profile = filename ? `${process.env.VUE_APP_IMAGE_URL}${this.userDetails.domain}/module_profiles/${filename}` : null
      }
    })
    this.$root.$on('updatedValuesFromEditPreview', async ({ data, updatedModelValues, recordId, moduleDataObj, updatedRecordData } = {}) => {
      if (this.listPayloadObj) {
        if (this.currentListView !== 3) {
          this.listPayloadObj.refreshHandler({ noLoader: true })
          return
        }

        let { data: filterResult } = await this.$api.execute('get', `moduledata/${this.listPayloadObj.moduleName}/${recordId}`) || {}
        if (!(filterResult) || (filterResult._id !== recordId)) {
          this.$root.$emit('updateInlineEditValue', { removeItem: updatedRecordData, kanbanViewModel: { ...data.indexObj, field: data.fields.name, fromEditPreview: true } })
          this.$root.$emit('closeNavigateDrawer', { drawer: false })
          return
        }

        let selectedItem = this.listPayloadObj.list.findIndex(x => x._id === recordId)
        if (selectedItem !== -1) {
          if (data.fields.show_in_list) {
            this.listPayloadObj.list[selectedItem][data.fields.name].text = updatedModelValues.text
            this.listPayloadObj.list[selectedItem][data.fields.name].value = updatedModelValues.value
            if (data.fields.type === 15) this.listPayloadObj.list[selectedItem][data.fields.name].profile = updatedModelValues.profile || null
            else if (data.fields.type === 5 && data.fields.default_value.selectType === 'default') {
              this.listPayloadObj.list[selectedItem][data.fields.name].color = updatedModelValues.color || null
              this.listPayloadObj.list[selectedItem][data.fields.name].fontcolor = updatedModelValues.fontcolor || null
            }
            if (updatedModelValues.options) this.listPayloadObj.list[selectedItem][data.fields.name].options = updatedModelValues.options 
          }
          this.$set(this.listPayloadObj.list, selectedItem, {
            ...this.listPayloadObj.list[selectedItem],
            modified_at: moduleDataObj.modified_at,
            modified_by: moduleDataObj.modified_by
          })
        }

        if (this.currentListView === 3) {
          this.$root.$emit('updateInlineEditValue', {
            data,
            model: updatedModelValues,
            editFromPreview: true
          })
        }
      }
    })
  },
  computed: {
    ...mapGetters(['getListOfFiltersHistory']),
  },
  methods: {
    constructCustomScript (element) {
      if (element.validationscript) {
        if (element.validateon === 'blur') {
          let validationScript = this.decodeStringTobase64(element.validationscript)
          this.addValidationMethod(`${element.name}_inline_validation`, validationScript)
          element.validationCallback = this[`${element.name}_inline_validation`]
        } else {
          element.validationCallback = [true]
        }
      }
      return element
    },
    addValidationMethod (name, script) { // Common validation method on blur
      this[name] = () => [
        // eslint-disable-next-line
        new Function('input', 'instance', 'data', script)
      ]
    },
    /* Fields construction start */
    async getFieldsListForTableHeaderHandler (moduleId) { // Get list of fields for current module
      if (!this.listPayloadObj.isactivesubmodule) await this.getAllFilterViews()
      this.listPayloadObj.headerLoading = true
      this.activeFieldHeaders = []
      let model = {
        moduleid: moduleId,
        sort_by_field: 'Tab_Order',
        sort_by: 1,
        isactive_alone: true,
        include_default_fields: true,
        exceptfieldtypes: [9, 11],
        isticketmetarequest: !!this.isTicketSidebar
      }
      this.$api.execute('get', `modules/${moduleId}`).then (data => {
        this.rewardModule = data.data
      })
      this.$api.execute('post', 'modulefields/filter', model)
        .then(async ({ data }) => {
          let activeFieldHeadersList = await data.filter((fields) => fields.show_in_list && fields.name !== 'isanonymous') // Filtering fields that set to show in list true
          if (activeFieldHeadersList && !activeFieldHeadersList.length) this.listPayloadObj.noFieldsActive = true // Temporary fix need to remove afterwards
          this.listPayloadObj.listOfAllActiveFields = []
          this.listOfAllActiveFieldsWithValues = []
          this.listPayloadObj.listOfSubModuleFieldsActive = []
          if (this.currentModule) {
            let activeSubmoduleAsColumns = this.currentModule.submoduleascolumns && this.currentModule.submoduleascolumns.length ? this.currentModule.submoduleascolumns : []
            activeSubmoduleAsColumns = activeSubmoduleAsColumns.filter(subModule => {
              return this.listOfModules.find(x => x.name === subModule.module) && this.listOfModules.find(x => x.name === subModule.module).isactive
            })
            let listOfAllActiveFields = this.$formatter.cloneVariable([...data, ...activeSubmoduleAsColumns]) // Including active submodules to fields list
            if (!this.userDetails.isadmin) listOfAllActiveFields = listOfAllActiveFields.filter((field) => (field.name !== 'create_for' && field.label !== 'Event_create_for'))
            for (let i = 0; i < listOfAllActiveFields.length; i++) {
              const fields = listOfAllActiveFields[i];
              fields.systemValue =
                ['created_by', 'created_at', 'modified_by', 'modified_at'].includes(fields.name) ||
                (fields.name === 'create_for' && fields.label === 'Event_create_for') || (fields.name === 'routingstatus');
              fields.hasEditPermission = !fields.accesscontrol || fields.accesscontrol.edit;
              fields.default_value = fields.default_value ? JSON.parse(fields.default_value) : fields.default_value;
            }
            this.listPayloadObj.listOfAllActiveFields = this.$formatter.cloneVariable(listOfAllActiveFields)
            for (let i = 0; i < this.listPayloadObj.listOfAllActiveFields.length; i++) {
              let hasExternalLink = this.listPayloadObj.listOfAllActiveFields[i].linkedmodulefields
              if(hasExternalLink !== undefined) {
                if (hasExternalLink.length > 0) {
                  hasExternalLink = hasExternalLink[0].url
                }
              }
              
            }
            
            // if (!this.listPayloadObj.isactivesubmodule) this.setPaginationForFilterView(this.activeFilterView.appliedfilter)
            this.sortTableHeaderBasedOnSelectedView(listOfAllActiveFields)
          }
        }).finally(() => {
          this.listPayloadObj.headerLoading = false
        })
    },
    async sortTableHeaderBasedOnSelectedView (fields) {
      let pageViewFields = (this.columnSortOrder && this.columnSortOrder.length) ? this.$formatter.cloneVariable(this.columnSortOrder) : null
      if (this.listPayloadObj.isactivesubmodule) {
        let listOfStoredPageViews = localStorage.getItem(`${process.env.VUE_APP_NAME}_recent_pageview`) ? JSON.parse(localStorage.getItem(`${process.env.VUE_APP_NAME}_recent_pageview`)) : null
        // if (listOfStoredPageViews && listOfStoredPageViews.length) {
          let currentSubModulePageView = (listOfStoredPageViews && listOfStoredPageViews.length) ? listOfStoredPageViews.find(x => (x.user_id === this.userDetails._id) && (x.moduleid === this.moduleObj._id)) : null
          await this.$api.execute('get', `pageviews/get_page_views/${this.moduleObj._id}`)
            .then(({ data }) => {
              if (data && data.length) {
                let activeFilterView = (currentSubModulePageView && data.find(x => x._id === currentSubModulePageView._id)) ? data.find(x => x._id === currentSubModulePageView._id) : data[0]
                // pageViewFields = (activeFilterView && activeFilterView.modulefields) ? JSON.parse(activeFilterView.modulefields) : []
                pageViewFields = this.getStoredPageViewFields(activeFilterView)
              }
              else if (this.noDashboardNavigationOnApiFail) {
                // handle if service fails
                console.log('handle if service fails')
              } else this.$router.push('/dashboard')
          })
        // }
      }
      let actualModuleFields = this.$formatter.cloneVariable(fields)
      actualModuleFields = actualModuleFields || [] // Getting this issue in actualModuleFields.find saying undefined after the list pagination remmeber changes done by vinoth, added this handling for now
      let sortedFields = []
      if (pageViewFields && pageViewFields.length) {
        pageViewFields.sort((a, b) => a.column_order - b.column_order)
        pageViewFields.forEach(field => {
          if (field._id || field.module) {
            // let fieldItem = actualModuleFields.find(x => x._id ? x._id === field._id : x.module === field.module)
            let fieldItem = actualModuleFields.find(x => (x._id && x._id === field._id) || (x.module && x.module === field.module))
            if (fieldItem) {
              if (fieldItem.show_in_list) fieldItem.show_in_list = field.show_in_list
              else fieldItem.restrictEditShowInList = true
              sortedFields.push(fieldItem)
            }
          }
        })
        let ids = pageViewFields.map(x => x._id ? x._id : x.module)
        let newFields = actualModuleFields.filter(x => x._id ? !ids.includes(x._id) : !ids.includes(x.module))
        newFields = newFields.map(x => {
          if (!x.show_in_list) x.restrictEditShowInList = true
          return x
        })
        sortedFields = [ ...sortedFields, ...newFields ]
        // sortedFields = [ ...sortedFields, ...newFields.filter(x => x.show_in_list) ]
      } else {
        sortedFields = actualModuleFields.sort(function (a, b) {
          return a.column_order - b.column_order
        })
      }
      this.listPayloadObj.listOfAllActiveFieldsForManageColumn = this.$formatter.cloneVariable(sortedFields.filter(x => !x.restrictEditShowInList))
      await this.constructFieldsWithDataForFiltersAndHeadersHandler(sortedFields)
      this.constructFilterList(this.appliedFilters)
    },
    async constructFieldsWithDataForFiltersAndHeadersHandler(listOfAllActiveFields) {
      let activeFieldHeaders = [];
      this.listOfAllActiveFieldsWithValues = [];
      // if (this.rewardModule !== null) {
      //   // Code for rewardModule
      // }
      for (let i = 0; i < listOfAllActiveFields.length; i++) {
        let field = listOfAllActiveFields[i];
        field.validationCallback = [true];
        field = this.constructCustomScript(field);
        field.label = field.label ? field.label.trim() : '';
        field.default_value = field.isSubModule ? { options: [] } : field.default_value;
        if (field.type === 20) {
          let sumOfRewards = field.default_value.options.reduce((acc, item) => item.worthOf > 0 ? acc + item.worthOf : acc, 0);
          field.label = `${this.$t(field.label)} (${sumOfRewards})`;
        }
        if (this.listOfAllActiveFieldsWithValues) {
          this.listOfAllActiveFieldsWithValues.push(this.constructFieldValues(field))
        }
        if (field.show_in_list && field.type !== 10) {
          activeFieldHeaders.push(this.constructActiveFieldHeader(field))
          if (field.isSubModule) {
            this.listPayloadObj.listOfSubModuleFieldsActive.push(`${field.module.toLowerCase()}_name`);
          }
        }
      }
      this.constructTableHeaders(activeFieldHeaders.filter(x => x.name !== 'create_for' && x.label !== 'Event_create_for'));
    },
    constructFieldValues(field) {
      return {
        _id: field._id,
        text: this.$t(field.label),
        value: field.name,
        dbRef: this.$formatter.stringToProperCase(field.name),
        default_value: field.default_value,
        type: field.type, 
        show: false,
        selected: 'is',
        isSignColumn: field.type === 10,
        allValues: field,
        isSubModule: field.isSubModule,
        module: field.isSubModule ? field.module : null
      };
    },
    constructActiveFieldHeader(field) {
      return {
        text: this.$t(field.label),
        value: field.isSubModule ? `${field.module.toLowerCase()}_name` : field.name,
        dbRef: field.isSubModule ? 'name' : field.name ? this.$formatter.stringToProperCase(field.name) : field.label,
        default_value: field.default_value,
        type: field.type,
        isSignColumn: field.type === 10,
        isShow: false,
        width: '100px',
        hasEditPermission: field.hasEditPermission,
        sortable: field.isSubModule ? false : true,
        allValues: field,
        systemValue: field.name === 'created_by' || field.name === 'created_at' || field.name === 'modified_by' || field.name === 'modified_at' || field.name === 'routingstatus' ||(field.name === 'create_for' && field.label === 'Event_create_for')
      };
    },
    async constructTableHeaders (activeFieldHeaders) {
      this.listPayloadObj.headers = this.activeFieldHeaders = this.$formatter.cloneVariable(activeFieldHeaders);
      this.getListHandler()
      // if (this.currentListView !== 2) this.getListHandler() // Added condition to avoid service calling duplication
    },
    /* End */
    async getListOfRecords ({ type, kanbanViewModel = null, noLoader = false, subModuleFilters, ticketId } = {}) { // Get Values for list (both main & submodules)
      this.listPayloadObj.loading = true
      let query = {}
      // comment
      let { search } = this.$formatter.cloneVariable(this.pagination)
      const globalSearchText = (window.localStorage.getItem(`${process.env.VUE_APP_NAME}_globalsearchterm`) || '')
      search = globalSearchText || search
      if (kanbanViewModel && kanbanViewModel.query) {
        query = kanbanViewModel.query
        query.filters = this.constructFilterList(this.appliedFilters)
        // check for searchterm
        // query.searchterm = search
        query = { kanbanViewPaginateModel: query.kanbanviewpaginatemodel, pageViewId: this.activeFilterView._id, ...(search && {searchterm: search}) }
        if (kanbanViewModel.query.skip) query = { ...query, ...{ skip: kanbanViewModel.query.skip } }
      } else {
        // query = (!this.listPayloadObj.isActiveSubmodule) ? await this.listPaginateQueryConstruction({ noLoader }, []) : {}
        if (this.listPayloadObj.isactivesubmodule) {
          query = await this.listPaginateQueryConstruction({ noLoader }, subModuleFilters ? subModuleFilters : [])
          query.ticketid = this.$route.params && this.$route.params.ticket_id ? this.$route.params.ticket_id : undefined
        } else {
          const { page, itemsPerPage } = this.$formatter.cloneVariable(this.pagination)
          const pageVal = page || 1
          // const calculatedSkip = this.total >= itemsPerPage ? (pageVal - 1) * itemsPerPage : 0
          // const calculatedSkip = this.hasMoreRecords ? (pageVal - 1) * itemsPerPage : 0
          const calculatedSkip =  (pageVal - 1) *  ( this.isItemsPerPage ?  0 : itemsPerPage )
          const { appliedfilter, _id } = this.activeFilterView;
          const appliedFilterConstruct = {
            filters: appliedfilter.filters || [],
            pageviewid: _id,
            pagination: appliedfilter.pagination,
            sort: appliedfilter.sort,
            sortby: appliedfilter.sortby,
            sortbyfield: appliedfilter.sortbyfield
          };
          query = {
            ...(search && { searchterm: search }),
            islistview: this.currentListView === 1 && this.currentModule.enablechildrelation ? true : false,
            ...appliedFilterConstruct,
            skip: calculatedSkip,
            limit: itemsPerPage
          }
        }
        // query = {}
      }
      // To differentiate modules & submoduleslist
      // let pageView = this.activeFilterView._id
      let moduleName = this.isMainModule ? this.moduleName : this.moduleObj.name
      this.restartDataTable = true
      // added logic for restrict the paginate_filter in dashboard
      this.paginationFilter = this.$formatter.cloneVariable(query)
      if(this.currentListView !== 4) {
        this.$api.execute('post', `moduledata/${moduleName}/paginate_filter`, query)
        .then(async (response) => {
          if (kanbanViewModel && kanbanViewModel.query) {
            let { data } = response.data;
            const result = {};
            
            kanbanViewModel.recordLength({
              hasRecordsLength: response.data.data.length,
            })
            if (!(data && data.length)) {
              kanbanViewModel.callback({
                result,
                // total: 0,
                responseData: []
              });
              return;
            }
            await data.map((item) => {
              item._id = item._id ? item._id : null;
              this.constructPayloadList(item.records)
                .then((payloadList) => {
                  result[item._id] = payloadList;
                });
            });
            kanbanViewModel.callback({
              result,
              // total: count,
              // responseData: (response.data && response.data.count) ? response.data.data : []
              responseData: (response.data) ? response.data.data : []
            });
            // kanbanViewModel.recordLength({
            //   hasRecordsLength: response.data.data.length,
            // })
            return;
          } else if (response.data.data && response.data.data.length) {
            let { data, hasmorerecords } = response.data;
            if (data && data.length) {
              this.constructPayloadList(data)
                .then((payloadList) => {
                  this.$set(this.listPayloadObj, 'list', payloadList);
                  // this.total = total || 0;
                  this.listPayloadObj.loading = false;
                  this.hasMoreRecords = hasmorerecords
                  this.getLength = response.data.data.length
                })
            }
          } else {
            this.listPayloadObj.list = [];
          }
        }).finally(() => {
          this.$root.$emit('disableLoader');
          this.listPayloadObj.loading = false;
        });
      }
    },
    async getListOfRecordsCount ({ type, kanbanViewModel = null, noLoader = false, subModuleFilters } = {}) { // Get Values for list (both main & submodules)
      let query = {}
      let { search } = this.$formatter.cloneVariable(this.pagination)
      const globalSearchText = (window.localStorage.getItem(`${process.env.VUE_APP_NAME}_globalsearchterm`) || '')
      search = globalSearchText || search
      if (kanbanViewModel && kanbanViewModel.query) {
        query = kanbanViewModel.query
        query.filters = this.constructFilterList(this.appliedFilters)
        // check for searchterm
        // query.searchterm = search
        query = { kanbanViewPaginateModel: query.kanbanviewpaginatemodel, pageViewId: this.activeFilterView._id, ...(search && {searchterm: search}) }
        if (kanbanViewModel.query.skip) query = { ...query, ...{ skip: kanbanViewModel.query.skip } }
      }
      if (this.listPayloadObj.isactivesubmodule) {
        query = await this.listPaginateQueryConstruction({ noLoader }, subModuleFilters ? subModuleFilters : [])
      } else {
          const { page, itemsPerPage } = this.$formatter.cloneVariable(this.pagination)
          const pageVal = page || 1
          const calculatedSkip = this.total >= itemsPerPage ? (pageVal - 1) * itemsPerPage : 0
          const { appliedfilter, _id } = this.activeFilterView;
          const appliedFilterConstruct = {
            filters: appliedfilter.filters,
            pageviewid: this.activeFilterView ? _id : null,
            pagination: appliedfilter.pagination,
            sort: appliedfilter.sort,
            sortby: appliedfilter.sortby,
            sortbyfield: appliedfilter.sortbyfield
          };
          query = {
            ...(search && { searchterm: search }),
            pageViewId: this.activeFilterView ? this.activeFilterView._id : null,
            islistview: this.currentListView === 1 && this.currentModule.enablechildrelation ? true : false,
            ...appliedFilterConstruct,
            skip: calculatedSkip,
            limit: itemsPerPage
          }
      }
      let moduleName = this.moduleName
      if(this.currentListView !== 4) { // We don't take total for Dashboard view
        this.$api.execute('post', `moduledata/${moduleName ? moduleName : this.moduleObj.name}/get_total_count`, query)
        .then(async (response) => {
          if (kanbanViewModel && kanbanViewModel.query) {
            let { total } = response.data;
            kanbanViewModel.totalCallback({
              total: total,
            });
            this.countLoading = false
            return;
          } else 
          if (response.data) {
            let { total } = response.data;
            if (total) {
              this.total = total;
              this.countLoading = false
              this.showCount = true

          }
        }
        }).finally(() => {

        });
      }
    },
    listPaginateQueryConstruction ({ noLoader }, filters) {
      if (!noLoader) this.listPayloadObj.loading = true
      // this.listPayloadObj.list = []
      this.listPayloadObj.module = this.MODULE_URL
      this.listPayloadObj.moduleName = this.isMainModule ? this.moduleName : this.moduleObj.name
      let pagination = this.$formatter.cloneVariable(this.pagination)
      let { page, sortBy, sortDesc, itemsPerPage, search } = pagination
      if (this.moduleName) {
        const globalSearchText = (window.localStorage.getItem(`${process.env.VUE_APP_NAME}_globalsearchterm`) || '')
        search = globalSearchText || search
      }    
      sortDesc = sortDesc[0]
      let pageVal = page || 1
      // including search term in query if exists
      let matchArray = []
      if (filters) matchArray = this.constructFilterList(filters)
      else {
        let conditions = (this.activeFilterView && this.activeFilterView.appliedfilter && this.activeFilterView.appliedfilter.filters && this.activeFilterView.appliedfilter.filters.length) ? this.activeFilterView.appliedfilter.filters : []
        matchArray = this.constructFilterList(conditions.map(x => JSON.parse(x.element)))
      }
      // Query for paginate filter
      let model = {
        searchterm: search ? search : undefined,
        // filters :  this.isMainModule ? matchArray.length !== 0 ? matchArray : [] : null,
        filters :  (this.isMainModule || this.moduleObj.name)  &&  matchArray.length !== 0 ? matchArray : [],
        relationid:  !this.isMainModule && (this.moduleObj && !this.moduleObj.isChildrenOfTheModule) ? this.parentModuleObj.recordId : null,
        sort: { $sort: { [`Data.${[sortBy[0]]}`]: sortDesc ? -1 : 1 } },
        sortbyfield: sortBy[0],
        sortby: sortDesc ? -1 : 1,
        islistview: this.currentListView === 1 && this.currentModule.enablechildrelation ? true : false,
        // IsListView: false
        // skip: search ? (this.total >= itemsPerPage ? ((pageVal - 1) * itemsPerPage) : 0) : ((pageVal - 1) * itemsPerPage),
        limit: itemsPerPage,
        parentid: this.moduleObj && this.moduleObj.isChildrenOfTheModule ? this.parentModuleObj.recordId : undefined,
      }
      // Condition added for making search query to fix pagination issue
      // model.skip = (this.total >= itemsPerPage ? ((pageVal - 1) * itemsPerPage) : 0)
      model.skip = (pageVal - 1) * itemsPerPage
      return model
    },
    getChildrenRecursive(item) {
      item.hideCollpased = false;
      if (item.children && item.children.length) {
        for (let i = 0; i < item.children.length; i++) {
          const child = item.children[i];
          if (child.ancestors && child.ancestors.length) {
            child.class = `__hierarchy-group-${child.ancestors.join(' ')}`;
          }
          child.showExpandCollpase = child.children && child.children.length > 0;
          child.textIndent = item.textIndent ? item.textIndent + 25 : 25;
          this.constructRecordAndOtherValues(child);
          this.listOfRecords.push({
            _id: child._id,
            ...child.data,
            relationModule: child.relationModule,
            permissions: child.permissions,
            accesscontrol: child.accesscontrol,
            hasManagePermission: child.hasManagePermission,
            ancestors: child.ancestors,
            masterid: child.masterid,
            showMore: child.showMore,
          });
          if (child.children && child.children.length) {
            this.getChildrenRecursive(child, false);
          }
        }
      } else {
        item.showExpandCollpase = false;
      }
    },
    constructRecordAndOtherValues(item) {
      item.data = this.constructRecordValues(item);
      this.constructOtherValues(item);
    },    
    constructPayloadList (data, { moduleObj = null } = {}) {
      return new Promise(async (resolve) => {
        let payloadList = []
        let selectedId = (this.isMainModule) ? this.$route.params.id : this.moduleObj._id
        let module = moduleObj || this.listOfModules.find(x => x._id === selectedId)
        this.listOfSubmoduleFieldColumns = module && module.submoduleascolumns ? module.submoduleascolumns.filter(x => x.show_in_list)  : []
        let actualList = this.$formatter.cloneVariable(data)
        for (let index = 0; index < actualList.length; index++) {
          const item = actualList[index];
          item.showExpandCollpase = false;
          item.hideCollpased = false;
          this.listOfRecords = [];
          item.showMore = false; // Added flag for tilesview & kanabanview
          if (this.currentListView === 1 && !moduleObj && this.currentModule.enablechildrelation && item.children && item.children.length) {
            item.showExpandCollpase = true;
            item.hideCollpased = false;
            this.listOfRecords = [];
            this.currentLoopIndex = item;
            this.getChildrenRecursive(item, true);
          }
          item.data = this.constructRecordValues(item);
          item = this.constructOtherValues(item);
          payloadList.push({
            _id: item._id,
            ...item.data,
            relationModule: item.relationModule,
            ...item.relationModule,
            permissions: item.permissions,
            accesscontrol: item.accesscontrol,
            hasManagePermission: item.hasManagePermission,
            ancestors: item.ancestors,
            masterid: item.masterid,
            showMore: item.showMore,
            profile: item.profile,
            isanonymous: item.isanonymous,
            hideforadmins: item.hideforadmins,
            sharepoint_id: item.sharepoint_id // added for handling sharepoint permissions in list page
          });
          if (this.listOfRecords.length) {
            payloadList.push(...this.listOfRecords);
            this.childCount += this.listOfRecords.length
            this.childrenRecords = this.childCount
          }
        }
        resolve(payloadList)
      })
    },
    // async constructRelationModuleData (listOfSubmoduleFieldColumns, element) {
    //   let relationModule = {}
    //   listOfSubmoduleFieldColumns.forEach(submodule => {
    //     let name = submodule.module.toLowerCase()
    //     if (element[name] && element[name].length > 0) {
    //       relationModule[`${name}_name`] = {
    //         value: element[name][0].data.name,
    //         text: element[name][0].data.name,
    //         isShow: false
    //       }
    //       relationModule[`${name}_id`] = element[name][0]._id
    //     }
    //   })
    //   return relationModule
    // },

    //Added simplified code
    constructRelationModuleData (listOfSubmoduleFieldColumns, element) {
      let relationModule = {};
      for (let i = 0; i < listOfSubmoduleFieldColumns.length; i++) {
        const { module } = listOfSubmoduleFieldColumns[i];
        const submodulename = module.toLowerCase();
        if (element && element[submodulename] && element[submodulename].length) {
          const { data, _id } = element[submodulename][0];
          relationModule[`${submodulename}_name`] = {
            value: data.name,
            text: data.name,
            isShow: false,
          };
          relationModule[`${submodulename}_id`] = _id;
        }
      }
      return relationModule;
    },
    // constructRecordValues(recordDetails) {
    //   recordDetails.data = {
    //     ...recordDetails.data,
    //     created_at: recordDetails.created_at,
    //     created_by: recordDetails.created_by,
    //     modified_at: recordDetails.modified_at,
    //     modified_by: recordDetails.modified_by,
    //   };
    //   return this.activeFieldHeaders.reduce((customizedFieldValue, header) => {
    //     customizedFieldValue[header.value] = {
    //       value: recordDetails.data[header.value],
    //       text: recordDetails.data[header.value] || '',
    //       isShow: false,
    //       padding: recordDetails.padding,
    //       textIndent: recordDetails.textIndent,
    //       showExpandCollpase: recordDetails.showExpandCollpase,
    //       class: recordDetails.class,
    //     };
    //     this.constructFieldDataBasedOnType(header, this.$formatter.cloneVariable(recordDetails), customizedFieldValue[header.value], header.value);
    //     // console.log('return result', customizedFieldValue)
    //     return customizedFieldValue;
    //   }, {});
    // },
    constructRecordValues(recordDetails) {
      const { data, created_at, created_by, modified_at, modified_by } = recordDetails; 
      // Ensure created_at, created_by, modified_at, modified_by are part of the data object
      const record = {
        ...data,
        created_at: created_at,
        created_by: created_by,
        modified_at: modified_at,
        modified_by: modified_by
      };  

      const recordDetailsProperties = {
        isShow: false,
        padding: recordDetails.padding,
        textIndent: recordDetails.textIndent,
        showExpandCollpase: recordDetails.showExpandCollpase,
        class: recordDetails.class,
      }; 

      let returnValue = {}
      const result = this.activeFieldHeaders.reduce((customizedFieldValue, header) => {
        const value = record[header.value] || '';
        customizedFieldValue[header.value] = {
          value,
          text: value,
          ...recordDetailsProperties,
        };
        returnValue = this.constructFieldDataBasedOnType(header, recordDetails, customizedFieldValue[header.value], header.value);
        customizedFieldValue[header.value] = returnValue
        return customizedFieldValue;
      }, {});
    // format into datetime   using  the formatDateTimeForPicker() method
    result.created_at = { value: this.$formatter.formatDate(created_at, 'DD.MM.YYYYTHH.mm.ss', 'YYYY-MM-DDTHH:mm') || '',   text: this.$formatter.formatDate(created_at, 'DD.MM.YYYYTHH.mm.ss', `${this.userDetails.dateformat} HH:mm`), isShow: false };
    result.modified_at = { value: this.$formatter.formatDate(modified_at, 'DD.MM.YYYYTHH.mm.ss', 'YYYY-MM-DDTHH:mm') || '', text: this.$formatter.formatDate(modified_at, 'DD.MM.YYYYTHH.mm.ss', `${this.userDetails.dateformat} HH:mm`), isShow: false };
    return result;
    },     
    
    constructOtherValues (item) {
      let permission = this.recordPermissionHandler(item.permissions || []) // Checking record permission
      item.hasManagePermission = permission ? permission === 'manage' : false
      if (item.accesscontrol && item.accesscontrol.delete) this.recordsHasManagePermissionCount++
      // if (item.item) this.recordsHasManagePermissionCount++
      item.relationModule = this.constructRelationModuleData(this.listOfSubmoduleFieldColumns, item)
      let profileUrl = ''
      if (item.profileimage) {
        if (item.profileimage.includes('http')) {
          profileUrl = item.profileimage
        } else {
          profileUrl = `${process.env.VUE_APP_IMAGE_URL}${this.userDetails.domain}/module_profiles/${item.profileimage}`
        }
      }
      item.profile = profileUrl ? profileUrl : null
      return item
    },

    // old logic 

    constructFieldDataBasedOnType (fieldHeaderObj, recordDetails, customizedValue, property) {
      // Constructing value for type checkbox, select and user
      // console.log(fieldHeaderObj)
      switch (fieldHeaderObj.type) {
        case 1:
          if (fieldHeaderObj.value === 'routingstatus' && recordDetails.data[property]) {
            const workflowStatus = this.listOfDocumentWorkflowStatus.find(x => x.id === recordDetails.data[property])
            customizedValue.text = workflowStatus.name
          }
          break
        case 3: // Checkbox
          customizedValue.text = recordDetails.data[property] ? this.$t('yes') : this.$t('no')
          break
        case 4: // Radio
          let value = fieldHeaderObj.default_value.options.find(x => x.value === recordDetails.data[property])
          customizedValue = { value: recordDetails.data[property], text: recordDetails.data[property], isShow: false }
          if (recordDetails.data[property] && value) customizedValue.text = fieldHeaderObj.allValues.enableoptiontranslations ? this.$t(`${ this.isMainModule ? this.moduleName : this.moduleObj.name }_${ fieldHeaderObj.value }_option_${recordDetails.data[property]}`) : value.label
          // if (value) customizedValue.text = value.label
          break
        case 5: // Select
          switch (fieldHeaderObj.default_value.selectType) {
            case 'module':
            case 'default':
              if (typeof recordDetails.data[property] !== 'string' && recordDetails.data[property] && recordDetails.data[property].length) {
                if (fieldHeaderObj.allValues.iscolorpickerenabled) {
                  customizedValue.color = recordDetails.data[property][0].color
                  customizedValue.fontcolor = this.$formatter.foreGroundColor(customizedValue.color)
                }
                if (recordDetails.data[property]) {
                  customizedValue.text = fieldHeaderObj.allValues.enableoptiontranslations ? recordDetails.data[property].map(x => this.$t(`${this.isMainModule ? this.moduleName : this.moduleObj.name}_${fieldHeaderObj.value}_option_${x.value}`)).join(',') : recordDetails.data[property].map(x => x.name).join(',')
                } else customizedValue.text = ''
                // customizedValue.text = recordDetails.data[property] ? recordDetails.data[property].map(x => this.$t(`${this.moduleName}_${fieldHeaderObj.value}_option_${x.value}`)).join(',') : ''
                if (fieldHeaderObj.default_value.selectType === 'module') {
                  customizedValue.text = fieldHeaderObj.default_value.is_multiselect ?  recordDetails.data[property].map(x => x.data.name).join(', ') :  recordDetails.data[property][0].data.name
                  customizedValue.value = fieldHeaderObj.default_value.is_multiselect ?  recordDetails.data[property].map(x => x._id) :  recordDetails.data[property][0]._id
                  customizedValue.options = recordDetails.data[property]
                } else customizedValue.value = fieldHeaderObj.default_value.is_multiselect ?  recordDetails.data[property].map(x => x.value) :  recordDetails.data[property][0].value
              } else customizedValue.text = ''
            break
            case 'custom':
              customizedValue.text = fieldHeaderObj.default_value.is_multiselect ? '' : recordDetails.data[property] || ''
              customizedValue.value = fieldHeaderObj.default_value.is_multiselect ? '' : recordDetails.data[property] || ''
              customizedValue.options = []
              if (fieldHeaderObj.default_value.is_multiselect) {
                if (recordDetails.data[property] && recordDetails.data[property].length) {
                  customizedValue.text = this.$formatter.cloneVariable( recordDetails.data[property].join(','))
                  customizedValue.value = recordDetails.data[property]
                  customizedValue.options = []
                   recordDetails.data[property].forEach((x) => { 
                    customizedValue.options.push({ name: x })
                  })
                }
              } else {
                customizedValue.options = recordDetails.data[property] ? [recordDetails.data[property]] : []
              }
            break
          }
          break
        case 6: // Date
          // let date = recordDetails.data[property] ? this.$formatter.fromUtcToLocal(recordDetails.data[property], 'DD.MM.YYYYTHH.mm.ss') : null
          // recordDetails.data[property] = date ? this.$formatter.formatDate(date, '', 'DD.MM.YYYY') : null
          // customizedValue.text = recordDetails.data[property]
          customizedValue.text = (recordDetails.data[property]) ? this.$formatter.formatDate(recordDetails.data[property], '', this.userDetails.dateformat) : null
          break
        case 15: // User
          let fieldValue = (fieldHeaderObj.value === 'created_by' || fieldHeaderObj.value === 'modified_by') ? recordDetails[fieldHeaderObj.value] : recordDetails.data[property]
          if (recordDetails.data.isanonymous && fieldHeaderObj.value === 'created_by') fieldValue = ''
          if (fieldValue && fieldValue.length) {
            let eValue = fieldValue.map(e => `${e.firstname} ${e.lastname || ''}`).join(',')
            customizedValue.text = eValue
            customizedValue.value = fieldHeaderObj.default_value.is_multiselect ?  fieldValue.map(x => x._id) :  fieldValue[0]._id
            customizedValue.profile = fieldValue && fieldValue[0].profile ? fieldValue[0].profile : null
          } else{
            customizedValue.text = ''
            customizedValue.profile = null
            customizedValue.value = null
          }
          break
        case 16: // DateTime
          customizedValue.text = (recordDetails.data[property]) ? this.$formatter.formatDate(recordDetails.data[property], '', `${this.userDetails.dateformat} HH:mm`) : null
          customizedValue.value = (recordDetails.data[property]) ? this.$formatter.formatDate(recordDetails.data[property], '', 'YYYY-MM-DDTHH:mm:ss') : null
          break
        case 20: // Rewards
        if (recordDetails.data[property] && recordDetails.data[property].length > 0) {
          customizedValue.earnedRewards = recordDetails.data[property].reduce((acc, item) => item.rating > 0 ? acc + item.rating : acc, 0)
        } else {
          customizedValue.earnedRewards = 0
        }
        break
      }
      return customizedValue
    },  
    // Get values from localstorage and save to variable
    constructFilterList (filters, activeFields) {
      if (filters && ((this.listPayloadObj && this.listPayloadObj.listOfAllActiveFields && this.listPayloadObj.listOfAllActiveFields.length) || (activeFields && activeFields.length))) {
        let listOfAllActiveFields = null
        if (activeFields) listOfAllActiveFields = this.$formatter.cloneVariable(activeFields)
        else listOfAllActiveFields = this.$formatter.cloneVariable(this.listPayloadObj.listOfAllActiveFields)
          this.listOfAllActiveFieldsWithValues.forEach((field, idx) => {
            let hasItemIndex = filters.findIndex(x => (x._id || x.module) ? (x._id ? (x._id === field._id) : (x.module === field.module)) : (x.element && JSON.parse(x.element).allValues.module === field.allValues.module))
            if (hasItemIndex !== -1) {
              this.listOfAllActiveFieldsWithValues[idx] = { ...this.$formatter.cloneVariable(filters[hasItemIndex]) }
              this.listOfAllActiveFieldsWithValues[idx].show = true
              // this.listOfAllActiveFieldsWithValues[idx] = { ...this.$formatter.cloneVariable(filters[hasItemIndex]), ...{default_value: this.listOfAllActiveFieldsWithValues[idx].default_value} }
            } else {
              let fieldItem = listOfAllActiveFields.find(x => x._id ? x._id === field._id : x.module === field.allValues.module)
              this.listOfAllActiveFieldsWithValues[idx] = {
                _id: fieldItem._id,
                text: this.$t(fieldItem.label),
                value: fieldItem.name,
                dbRef: this.$formatter.stringToProperCase(fieldItem.name),
                default_value: field.default_value,
                type: fieldItem.type, 
                show: false,
                selected: 'is',
                isSignColumn: fieldItem.type === 10,
                allValues: fieldItem,
                isSubModule: fieldItem.isSubModule,
                module: fieldItem.isSubModule ? field.module : null
              }
            }
          })
        let getActiveItems = this.listOfAllActiveFieldsWithValues.filter(x => x.show)
        let conditions = []
        if (getActiveItems.length) {
          getActiveItems.forEach((element) => {
            var value = {}
            element.date = element.inputValue
            for (let i in element) {
              if (!['field', 'selected', 'type', '_id', 'dbRef', 'selectBox', 'show', 'text', 'value'].includes(i)) value[i] = element[i]
            }
            conditions.push({ condition: element.selected, field: element._id, fieldtype: element.type, value: JSON.stringify(value), inputValue: element.inputValue, module: element.isSubModule ? element.allValues.module : undefined, element: JSON.stringify(element) })
          })
          this.searchArray = this.$formatter.cloneVariable(conditions)
        } else this.searchArray = []
        return this.searchArray
      } else {
        return []
      }
    },
    // Setting Forms fields (Action page)
    getFieldsForModule (fromCalendar, fromTicketSidebar) {
      this.fieldsLoading = true
      // || this.moduleObj._id -> is added by vinoth, there is a scenario where the moduleObj._id will present instead of moduleid
      const moduleId = this.moduleObj.moduleId || this.moduleObj._id
      let query = [{ $match: { Module_Id: moduleId } }, { $sort: { Tab_Order: 1 } }]
      this.$api.execute('post', 'modulefields/query', query)
        .then( async (result) => {
          if (result.data) {
            let skip = 0
            await this.constructModuleFields(result.data, fromCalendar, skip)
            this.moduleFieldsFinally()
            if (this.$route.query.fromviewRecord) this.setModuleFields()
          }
        })
    },
    async constructModuleFields (list, fromCalendarPage, skip) {
      return new Promise((resolve, reject) => {
        if (this.$route.params.record_id && (!this.userDetails.isadmin || this.$route.params.name === 'Event')) list = list.filter((item) => item.label !== 'Event_create_for')
        // Sorting fields by tab order
        if (list && list.length) {
          list = list.sort(function (a, b) {
            return a.tab_order - b.tab_order
          })
          // Constructing fields with default value
          for (let i = 0; i < list.length; i++) {
            this.fields[list[i].name] = ''
            // list[i].default_value = list[i].default_value ? JSON.parse(list[i].default_value) : null
            if (list[i].default_value && typeof list[i].default_value === 'string') list[i].default_value = list[i].default_value ? JSON.parse(list[i].default_value) : null
            if (list[i].default_value) {
              if (list[i].type === 3 || list[i].type === 4 || list[i].type === 5) {
                if (list[i].default_value.is_multiselect && !this.moduleObj._id) {
                  this.fields[list[i].name] = null
                } else if (list[i].type === 3 && !list[i].default_value.is_multiselect && !this.moduleObj._id) this.fields[list[i].name] = false
                else if (list[i].type !== 3 && !this.moduleObj._id) this.fields[list[i].name] = list[i].default_value.default_value
              } else if (!this.moduleObj._id) {
                if (list[i].type === 6 && list[i].default_value && list[i].default_value.setcurrentdate) {
                  this.fields[list[i].name] = this.$formatter.getCurrentDate(this.userDetails.dateformat)
                } else if (list[i].type === 6 && list[i].default_value && list[i].default_value) {
                  this.fields[list[i].name] = this.$formatter.formatDate(list[i].default_value.default_value, 'YYYY-MM-DDTHH:mm:ss', this.userDetails.dateformat)
                } else if (list[i].type === 16 && list[i].default_value && list[i].default_value.setcurrentdate) {
                  this.fields[list[i].name] = this.$formatter.getCurrentDateAndTime(`${this.userDetails.dateformat} HH:mm`)
                  list[i].dateTimePicker = this.$formatter.formatDate( this.fields[list[i].name], `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DD')
                  list[i].timePicker = this.$formatter.formatDate(this.fields[list[i].name], `${this.userDetails.dateformat} HH:mm`, 'HH:mm')
                } else if (list[i].type === 14) {
                  this.fields[list[i].name].replace(/\s/g, '').trim()
                }
                else if (list[i].type === 15 && list[i].default_value && list[i].default_value.setcurrentuserasdefault) {
                  this.fields[list[i].name] = list[i].default_value.is_multiselect ? [this.userDetails._id] : this.userDetails._id
                } else this.fields[list[i].name] = (list[i].default_value && list[i].default_value['default_value']) ? list[i].default_value['default_value'] === '0' ? null : list[i].default_value['default_value'] : null
              }
              // separete panel fields and other fields
              let getPanelFieldIndex = -1
              if (list[i].default_value.panelId) getPanelFieldIndex = list.findIndex(x => x._id === list[i].default_value.panelId)
              if (getPanelFieldIndex >= 0) {
                list[i].isPanelField = true
                if (!list[getPanelFieldIndex].panel_fields) list[getPanelFieldIndex].panel_fields = []
                // check if item already added before inserting
                const panelFieldIndex = list[getPanelFieldIndex].panel_fields.findIndex(x => x._id === list[i]._id)
                if (panelFieldIndex === -1) {
                  const fieldClone = this.$formatter.cloneVariable(list[i])
                  list[getPanelFieldIndex].panel_fields.push(Object.assign({ ...fieldClone }, { isPanelField: false }))
                }
              }
            }
          }
          this.listOfFields = list
          if (fromCalendarPage) this.$root.$emit('listOfFieldsUpdated')
          // if (this.listOfFields) {
          //   this.listOfFields.forEach(async (element, index) => {
          //     if (element.default_value && element.default_value.selectType === 'module' && (element.load_all_records || this.booking)) {
          //       await this.getValuesFromModule({ searchText: '', moduleName: element.default_value.selectedModule, index, skip, limit: this.limit })
          //     }
          //   })
          // }
        }
        resolve()
      })
    },
    // Render form and get record if it is in edit action page
    moduleFieldsFinally () {
      this.$root.$emit('rerenderComponent')
      this.$root.$emit('callRerenderEventForm')
      if (this.isAction && this.moduleObj._id) this.getSingleRecordHandler()
      else if (this.formId) this.getSingleRecordHandler()
      else {
        this.fieldsLoading = false
        this.showFormLoader = false
      }
      this.$root.$emit('calendarDateField')
    },
    // Get Module List to load in select with module list items
    async getModuleList (item) {
      await this.$api.execute('get', `moduledata/${item.default_value.selectedModule}`).then((result) => {
        return result
      })
    },
    // Get text names from supporting lists items (Module View page)
    getValues (item, element) {
      if (item.default_value && item.default_value.options) {
        if (item.default_value.selectType === 'default') {
          if (item.default_value.is_multiselect) {
            let ids = item ? item.value : []
            let result = item.default_value.options.filter(x => {
              if (ids.length && ids.includes(x.value)) {
                x.label = x.label
                return x
              }
            })
            return result.map(e => e.label).join(',')
          } else {
            let result = item.default_value.options.find(x => x.value === item.value)
            if (result) {
              return result
            }
          }
        }
      }
    },
    // Load username in custom module view page / Listpage
    getUsername (item, data, fromView) {
      var name = ''
      if (this.getUsers.length) {
        if (fromView ? data.default_value && data.default_value.is_multiselect : data && data.is_multiselect) {
          let ids = item || []
          let result = this.getUsers.filter(x => ids.includes(x._id))
          name = result.map(e => e.name).join(',')
          return name
        } else {
          let result = this.getUsers.find(x => x._id === item)
          if (result) name = result.name
          return name
        }
      } else return ''
    },
    // Load list with external API
    getValuesFromAPI (serachRef, value, index) {
      let options = []
      this.$api.execute('get', value.apiUrl, { activeFieldHeaders: '' }).then(response => {
        if (value.objectName) options = response.data[value.objectName]
        else options = response.data
        let fieldItem = this.listOfFields[index]
        fieldItem['default_value']['options'] = []
        fieldItem['default_value'].options = options
        this.$set(this.listOfFields, index, { ...fieldItem })
      })
    },
    // Load Module List items
    async getValuesFromModule ({ searchText: search, moduleName, index, skip, limit }) {
      return new Promise((resolve, reject) => {
        if (this.listOfFields && this.listOfFields[index]) {
          let fieldItem = this.$formatter.cloneVariable(this.listOfFields[index])
          let options = []
          if (fieldItem) {
            let query = []
            let currentModule = this.$route.params ? this.$route.params.name : ''
            // query = [ { $match: { $or: [{ [`Data.name`]: { $options: 'i', $regex: (search && search.target && search.target.value) ? search.target.value : search } }, { delete: false }] } }, { $project: { "_id": 1, "Data.name": 1 }}, {$skip: skip},  {$limit: limit} ]
            query = [ { $match: { $or: [{ [`Data.name`]: { $options: 'i', $regex: (search && search.target && search.target.value) ? search.target.value : search } }, { delete: false }] } }, {$skip: skip},  {$limit: limit} ]
            // start - this Query will be constructed to load contact by account only for sales module
            if (currentModule && currentModule === 'Sale') {
              if (moduleName === 'Contact') {
                query = [{
                  $match: {
                    $and: [{
                      [`Data.name`]: { $options: 'i', $regex: (search && search.target && search.target.value) ? search.target.value : search }
                    }, {
                      Relations: { $elemMatch: { _id: { $eq: this.fields['company'] } } }
                    }]
                  }
                }]
              }
            }
            this.loadingValues = true
            this.showNoData = false
            // end
            this.$api.execute('post', `moduledata/${moduleName}/query`, query)
              .then(({ data }) => {
                this.loadingValues = false
                if (!data.length) {
                  this.showNoData = true
                }
                if (data.length > 0) {
                  const options = []
                  data.forEach((element) => {
                    options.push({ name: element.data.name, _id: element._id, ...element.data })
                })
                if (!fieldItem.default_value) {
                 this.$set(fieldItem, 'default_value', {})
                 }
                 if (!fieldItem.default_value.options) {
                  this.$set(fieldItem.default_value, 'options', [])          
                }
                fieldItem.default_value.options = [...fieldItem.default_value.options, ...options]
                fieldItem.hasNoOptionsValues = false
               } else {
                 fieldItem.hasNoOptionsValues = true
                 this.$set(this.listOfFields, index, { ...fieldItem })
                }
                // options = this.listData
              })
          } else {
            if (fieldItem.default_value && !fieldItem.default_value.options) fieldItem.default_value.options = []
            else if (this.fields[fieldItem.name] && !this.fields[fieldItem.name].length) fieldItem.default_value.options = []
          }
          this.$set(this.listOfFields, index, { ...fieldItem })
        }
        resolve()
      })
    },
    recordPermissionHandler (permissionArray) {
      if (this.userDetails.isadmin || this.userDetails.iscontentadmin) return 'manage'
      else {
        let userPermission = permissionArray.find(x => x.user_id === this.userDetails._id)
        if (userPermission) return userPermission.access_level
        else {
          let groupPermissionData = permissionArray.filter(x => this.userDetails.groups.includes(x.group_id))
          if (groupPermissionData) {
            let permission = groupPermissionData.find(x => x.access_level === 'manage')
            return permission ? 'manage' : 'view'
          } else return false
        }
      }
    },
    // Get single record for all form
    getRecordHandler (url, type) {
      this.fieldsLoading = true
      this.showFormLoader = true
      this.$api.execute('get', url).then(response => {
        if (response && response.data) {
          this.dialog = true
          this.recordName = response.data.data.name ? response.data.data.name : ''
          response.data.data.relations = []
          response.data.data.permissions = response.data.permissions
          response.data.data.relations = response.data.relations
          response.data.data._id = response.data._id
          this.fields = this.$formatter.cloneVariable(response.data.data)
          this.dataObj = this.$formatter.cloneVariable(response.data)
          // if (this.fields.start_date) this.fields.start_date = this.$formatter.formatDate(this.fields.start_date, 'DD.MM.YYYYTHH.mm.ss', 'DD.MM.YYYY')
          // if (this.fields.end_date) this.fields.end_date = this.$formatter.formatDate(this.fields.end_date, 'DD.MM.YYYYTHH.mm.ss', 'DD.MM.YYYY')
          // if (this.fields.due_date)  this.fields.due_date = this.$formatter.formatDate(this.fields.due_date, 'DD.MM.YYYYTHH.mm:ss', 'DD.MM.YYYY')
          // if (this.fields.repeat_from)  this.fields.repeat_from = this.$formatter.formatDate(this.fields.repeat_from, 'DD.MM.YYYYTHH.mm:ss', 'DD.MM.YYYY')
          let values = this.$formatter.cloneVariable(response.data.data)
          if (response.data.profileimage) {
            if (response.data.profileimage.includes('http')) {
              this.moduleObj.profileimage = response.data.profileimage
            } else {
              this.moduleObj.profileimage = `${process.env.VUE_APP_IMAGE_URL}${this.userDetails.domain}/module_profiles/${response.data.profileimage}`
            }
          }
          this.checkRecordPermission({ values, accesscontrol: response.data.accesscontrol })
        } else this.$router.push('/notavailable')
      }).finally(() => {
        this.showFormLoader = false
        setTimeout(() => {
          this.fieldsLoading = false
        }, 100)
      })
    },
    customizeValue (fieldValues) { // Load form values after checking permission
      this.fieldsLoading = true
      this.listOfFields.forEach((element, index) => {
        switch (element.type) {
          case 5:
            switch (element.default_value.selectType) {
              case 'default':
                if (fieldValues[element.name] && fieldValues[element.name].length) {
                  if (element.default_value.is_multiselect)  fieldValues[element.name] = fieldValues[element.name].map(x => x.value)
                  else fieldValues[element.name] = fieldValues[element.name][0].value
                }
                break
              case 'module':
                if (fieldValues[element.name] && fieldValues[element.name].length && !this.isBooking) {
                  if (element.default_value.is_multiselect) {
                    if (!this.listOfFields[index].default_value.options) this.listOfFields[index].default_value.options = []
                    fieldValues[element.name].forEach(moduleValue => {
                      this.listOfFields[index].default_value.options.push({ _id: moduleValue._id, name: moduleValue.data.name })
                    })
                    fieldValues[element.name] = fieldValues[element.name].map(x => x._id)
                  } else {
                    if (!this.listOfFields[index].default_value.options) this.listOfFields[index].default_value.options = []
                    this.listOfFields[index].default_value.options.push({ _id: fieldValues[element.name][0]._id, name: fieldValues[element.name][0].data ? fieldValues[element.name][0].data.name : '' })
                    fieldValues[element.name] = fieldValues[element.name][0]._id
                  }
                }
              break
              case 'custom':
                element.customOptions = []
                element.optionName = 'name'
                element.optionValue = 'name'
                let value = this.$formatter.cloneVariable(fieldValues[element.name])
                if (value) {
                  if (element.default_value.is_multiselect) {
                    value.forEach(item => {
                      element.customOptions.push({ name: item })
                    })
                  } else {
                    element.customOptions.push({ name: value })
                  }
                }
                fieldValues[element.name] = fieldValues[element.name]
            }
            break
          case 6:
            if (fieldValues && fieldValues[element.name]) {
              // let date = fieldValues[element.name] ? this.$formatter.fromUtcToLocal(fieldValues[element.name], 'DD.MM.YYYYTHH:mm:ss') : null
              // fieldValues[element.name] = this.$formatter.formatDate(fieldValues[element.name], '', 'DD.MM.YYYY')
              // element.date_value = this.$formatter.formatDate(fieldValues[element.name], 'DD.MM.YYYY', 'YYYY-MM-DD')
              fieldValues[element.name] = this.$formatter.formatDate(fieldValues[element.name], '', this.userDetails.dateformat)
              element.date_value = this.$formatter.formatDate(fieldValues[element.name], this.userDetails.dateformat, 'YYYY-MM-DD')
            } else {
              element.date_value = fieldValues[element.name] = null
            }
            break
          case 10:
            setTimeout(() => {
              if (this.$refs.formReferences && this.$refs.formReferences.$refs[`signaturePad_${element._id}`] && this.$refs.formReferences.$refs[`signaturePad_${element._id}`].length) {
                this.$refs.formReferences.$refs[`signaturePad_${element._id}`][0].fromDataURL(fieldValues[element.name])
              }
              if (this.$refs.formReferences.$refs.panelFormReference) {
                this.$refs.formReferences.$refs.panelFormReference.forEach((x) => {
                  if ((x.$refs[`signaturePad_${element._id}`] && x.$refs[`signaturePad_${element._id}`].length)) {
                    x.$refs[`signaturePad_${element._id}`][0].fromDataURL(fieldValues[element.name])
                  }
                })
              }
            }, 500)
            break
            break
          case 15:
            if (fieldValues && fieldValues[element.name] && fieldValues[element.name].length) {
              if (element.default_value.is_multiselect) fieldValues[element.name] =  fieldValues[element.name].map(x => x._id)
              else fieldValues[element.name] = fieldValues[element.name][0]._id
            }
            break
          case 16:
            if (fieldValues && fieldValues[element.name]) {
              // fieldValues[element.name] = this.$formatter.formatDate(fieldValues[element.name], '', 'DD.MM.YYYY HH:mm')
              fieldValues[element.name] = this.$formatter.formatDate(fieldValues[element.name], '', `${this.userDetails.dateformat} HH:mm`)
              element.dateTimePicker = this.$formatter.formatDate(fieldValues[element.name], `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DD')
              element.timePicker = this.$formatter.formatDate(fieldValues[element.name], `${this.userDetails.dateformat} HH:mm`, 'HH:mm')
            } else {
              fieldValues[element.name] = null
              fieldValues[element.name] = element.dateTimePicker = element.timePicker = null
            }
            break
          case 17:
            if (fieldValues && fieldValues[element.name]) {
              var oldAttachments = this.$formatter.cloneVariable(fieldValues[element.name])
              fieldValues[element.name] = null
              fieldValues[`${element.name} oldAttachments`] = JSON.parse(oldAttachments)
            }
            break
        }
      })
      this.fields = fieldValues
      setTimeout(() => {
        this.fieldsLoading = false
      })
    },
    getValuesFromModuleInline (search, data, recordIndex) {
      if (search) {
        let query = []
        let currentModule = data.default_value.selectedModule
        query = [ { $match: { $or: [{ [`Data.name`]: { $options: 'i', $regex: search } }] } } ]
        this.$api.execute('post', `moduledata/${currentModule}/query`, query).then(response => {
          let index =  this.activeFieldHeaders.findIndex(x => x.value === data.value)
          let getContent = this.$formatter.cloneVariable(this.activeFieldHeaders[index])
          getContent.default_value.options = response.data
          this.$set(this.activeFieldHeaders, index, getContent)
        })
      }
    },
    reconstructModuleFieldValues (fromBooking) {
      let model = this.$formatter.cloneVariable(this.fields)
      this.listOfFields.forEach((element, index) => {
        if (element.type === 5 || element.type === 15) {
          if (!fromBooking) {
            if (this.moduleName === 'Account' && element.name === 'name') {
              model[element.name] = model[element.name] ?  typeof model[element.name] === 'object'  ? model[element.name].navn : model[element.name] : null
            }
            if(model[element.name] === '0') model[element.name] = null
          }
        }
        if(element.type === 14 && model[element.name]) {
          model[element.name] = model[element.name].replace(/\s/g, '').trim()
          this.fields[element.name] =  model[element.name]
        }
        if (element.type === 10) {
          // let isEmpty = null
          // let data = null 
          if (this.$refs.formReferences.$refs[`signaturePad_${element._id}`] && this.$refs.formReferences.$refs[`signaturePad_${element._id}`].length) {
            let isEmpty = null
            let data = null 
            let signatureData = this.$refs.formReferences.$refs[`signaturePad_${element._id}`][0].saveSignature()
            isEmpty = signatureData.isEmpty
            data = signatureData.data
           
          if (!isEmpty) { 
            model[element.name] = data 
          } else {
            model[element.name] = ''
          }
        }
          if (this.$refs.formReferences.$refs.panelFormReference) {
            this.$refs.formReferences.$refs.panelFormReference.forEach((x) => {
              if ((x.$refs[`signaturePad_${element._id}`] && x.$refs[`signaturePad_${element._id}`].length)) {
                let signatureData = x.$refs[`signaturePad_${element._id}`][0].saveSignature()
                let data = null
                data = signatureData.data
                model[element.name] = data
              }
            })
        }
        }
        if (element.type === 6) {
          model[element.name] = model[element.name] ? this.$formatter.formatDate(model[element.name], this.userDetails.dateformat, 'YYYY-MM-DD') : null
        }
        if ([16].includes(element.type)) {
          // model[element.name] = model[element.name] ? this.$formatter.formatDate(model[element.name], 'DD.MM.YYYY', 'YYYY-MM-DDTHH:mm:ss') : null
          if (this.$route.params.name === 'Event' && element.type === 6) {
            if (element.name === 'start_date') {
              model[element.name] = model[element.name] ? this.$formatter.formatDate(`${model[element.name]} ${model.start_time ? model.start_time : '00:00'}`, `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DDTHH:mm:ss') : null
            } else if (element.name === 'end_date') {
              model[element.name] = model[element.name] ? this.$formatter.formatDate(`${model[element.name]} ${model.end_at ? model.end_at : '00:00'}`, `${this.userDetails.dateformat} HH:mm`, 'YYYY-MM-DDTHH:mm:ss') : null
            }
          } else {
             // model[element.name] = model[element.name] ? this.$formatter.formatDate(model[element.name], (element.type === 16) ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY', 'YYYY-MM-DDTHH:mm:ss') : null
             // model[element.name] = model[element.name] ? this.$formatter.formatDate(model[element.name], this.userDetails.dateformat, (element.type === 16) ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY') : null
             model[element.name] = model[element.name] ? this.$formatter.formatDate(model[element.name], (element.type === 16) ? `${this.userDetails.dateformat} HH:mm` : this.userDetails.dateformat, 'YYYY-MM-DDTHH:mm:ss') : null
            }
        }
        if (element.type === 13) {
          model[element.name] = model[element.name] ? parseFloat(model[element.name]) : 0
        }
        if (element.type === 17) {
          model[element.name] = this.fields[element.name] 
        }
      })
      return model
    },
    checkRecordPermission ({ values }) {
      this.customizeValue(values)
    },
    // Save/Update module records Handler
    saveUpdateRecordHandler ({ id, moduleName, moduleId, type, from, template_id, ticketid, saveAndCreate, saveWithFiles = false, relationModule, fromTicket, onResolveHandler = async () => {} } = {}) {
      this.recordName = this.fields.name
      if (this.$refs.formReferences && this.$refs.formReferences.$refs && this.$refs.formReferences.$refs.validateForm.validate()) {
        if (type === this.SAVE || type === this.UPDATE) this.saveUpdateLoader = true
        else if (type === this.SAVE_AND_CREATE) this.saveCreateLoader = true
        else if (type === this.UPDATE_CLOSE) this.updateCloseLoader = true
        let model = this.reconstructModuleFieldValues(false)

        var url
        if (id) {
          url = `${this.MODULE_URL}/${moduleName}/${id}${(this.userDetails.isadmin && moduleName === 'Event') ? `?event_for=${model.create_for}` : ''}`
        } else {
          if (template_id) url = `${this.MODULE_URL}/${moduleName}?template_id=${template_id}${(this.userDetails.isadmin && moduleName === 'Event') ? `&event_for=${model.create_for}` : ''}`
          else {
            const isSendEventForParam = (this.userDetails.isadmin && moduleName === 'Event')
            url = `${this.MODULE_URL}/${moduleName}${(isSendEventForParam) ? `?event_for=${model.create_for}` : '' }`
            url += (saveWithFiles && this.userDetails.issharepointstorage) ? `${(isSendEventForParam) ? '&' : '?'}returnspid=true` : ''
          }
        }
        let relations = model.relations
        let permissions = model.permissions && model.permissions.length > 0 ? model.permissions : null
        model.relations = undefined
        if (this.moduleObj.profileimage) {
          if (this.moduleObj.profileimage.includes('http')) {
            this.moduleObj.profileimage = this.moduleObj.profileimage
          } else {
            this.moduleObj.profileimage = `${process.env.VUE_APP_IMAGE_URL}${this.userDetails.domain}/module_profiles/${this.moduleObj.profileimage}`
          }
        }
        model.cloneList = model.hasPermission = model.headers = model.list = model.listOfAllActiveFields = model.listOfSubModuleFieldEnabledAsLink = model.listOfSubModuleFieldsActive = undefined
        let modelJson = {
          data: {
            ...model,
            isanonymous: model.isanonymous || false,
            ...((moduleName === 'Event') && {
              create_for: model.create_for || this.userDetails._id
            })
          },
          isanonymous: model.isanonymous || false,
          template_id: template_id ? template_id : undefined,
          ticketid: ticketid ? ticketid : undefined,
          relations,
          permissions,
          profileimage: this.moduleObj.profileimage ? this.moduleObj.profileimage : '',
          _id: id || undefined
        }
        if (relationModule && relationModule.recordId) {
          if (relationModule.isChildrenOfTheModule) {
            modelJson.parentid = relationModule.recordId
          } else if (relationModule.moduleName) {
            url += `${url.includes('?') ? '&' : '?'}relation_module=${relationModule.moduleName}&relation_id=${relationModule.recordId}`
          }
        }
        this.$api.execute(id ? 'put' : 'post', url, modelJson)
          .then(async ({ data: responseData }) => {
            await onResolveHandler({ responseData })
            if (from === 'calendar') {
              this.selectedId = ''
              this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: id ? 'updatedSuccess' : 'addedSucess' })
              this.closeDialogHandler()
              this.getEventsAndTasks()
            } else {
              if (!id)  { 
                this.$root.$emit('constructKanbanViewList')
                this.$root.$emit('FromModuleData', responseData)
              }
              this.moduleObj._id = responseData._id
              this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: modelJson._id ? 'updatedSuccess' : 'addedSucess' })
              if (type && type !== this.UPDATE && type !== this.NAVIGATIONDRAWER && type !== this.SAVE_AND_CREATE && type !== this.FROM_MODULE_SAVE) this.$router.push(`/module/${moduleName}/${moduleId}/preview/${responseData._id}`)
              
              // if (type === this.SAVE_AND_CREATE) this.$router.push(`/module/${moduleName}/${moduleId}/actions`)
             else if (type === this.SAVE_AND_CREATE)  {
                this.moduleObj._id = undefined
                this.getFieldsForModule(false, fromTicket)
              }
              else if (type === this.FROM_MODULE_SAVE) {
                this.fromModuleAddRecord = false
              }
              if (type && type === this.NAVIGATIONDRAWER) {
                if (saveAndCreate) {
                  this.moduleObj._id = undefined
                  if (fromTicket) {
                    this.$root.$emit('resetAddOrPreviewDialog')
                  } else {
                    this.$root.$emit('navigationDrawer', JSON.parse(localStorage.getItem('createOpenNavigationDrawer')), null, { saveAndCreate: true })
                  }
                  this.$root.$emit('reloadList')
                } else {
                  this.$root.$emit('closeNavigateDrawer', {
                    drawer: false,
                    newRecord: responseData,
                    isOpenQuickEditView: true
                  })
                  this.$root.$emit('reloadList')
                }
              }
            }
          })
          .finally(() => {
            this.saveUpdateLoader = false
            this.saveCreateLoader = false
            this.updateCloseLoader = false
            if (from === 'calendar') this.$root.$emit('stopLoadingCalendar')
            else if (saveAndCreate) this.$root.$emit('saveCreateLoading')
            else this.$root.$emit('stopLoading')
          })
      } else {
        this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'validationIssue' })
        if (from === 'calendar') this.$root.$emit('stopLoadingCalendar')
        else if (saveAndCreate) this.$root.$emit('saveCreateLoading')
        else this.$root.$emit('stopLoading')
      }
    },
    uploadAccountProfileImage (event, saveandUpdate, profile) {
      return new Promise((resolve) => {
        if ((profile || this.moduleObj.profile) && saveandUpdate === 'Update') {
          var filesList = (profile || this.moduleObj.profile)
          var formData = new FormData()
          formData.append(filesList.name, filesList)
          this.$api.execute('post', `moduledata/${this.moduleName}/upload_profile?id=${this.moduleObj._id || ''}`, formData)
            .then(({ data }) => {
              this.moduleObj.profileimage = this.imageURL + this.userDetails.domain + '/module_profiles/' + data
              this.reInit++
              resolve(this.moduleObj.profileimage)
            })
        } else if ((profile || this.moduleObj.profile) && saveandUpdate === 'New') {
          this.moduleObj.profileimage = (window.URL || window.webkitURL).createObjectURL(event)
        }
      })
    },
    setRedirectionReference (path) {
      this.$router.push(path)
      localStorage.setItem(`${process.env.VUE_APP_NAME}_lastRedirection`, JSON.stringify(this.$route.fullPath))
    },
    // from view record
    setModuleFields () {
      let  values = localStorage.getItem(`${process.env.VUE_APP_NAME}_fromViewRecord`)
      this.fields = JSON.parse(values)
    },
    getCurrentPageViewFromLocalStorage (views) {
      let listOfStoredPageViews = localStorage.getItem(`${process.env.VUE_APP_NAME}_recent_pageview`) ? JSON.parse(localStorage.getItem(`${process.env.VUE_APP_NAME}_recent_pageview`)) : []
      let currentview = views[0]
      if (listOfStoredPageViews && listOfStoredPageViews.length) {
        let currentModulePageView = listOfStoredPageViews.find(x => (x.user_id === this.userDetails._id) && (x.moduleid === this.currentModule._id))
        currentview = (currentModulePageView && views.find(x => x._id === currentModulePageView._id)) ? views.find(x => x._id === currentModulePageView._id) : views[0]
      }
      return currentview
    },
    async getAllFilterViews () {
      this.getViewsLoader = true
      await this.$api.execute('get', `pageviews/get_page_views/${this.moduleId}`)
        .then(({ data }) => {
          if (data && data.length) {
            let views = this.$formatter.cloneVariable(data)
            let activeFilterView = this.$formatter.cloneVariable(this.getCurrentPageViewFromLocalStorage(views))
            this.listOfFilterViews = this.$formatter.cloneVariable(views)
            // this.columnSortOrder = (activeFilterView && activeFilterView.modulefields) ? JSON.parse(activeFilterView.modulefields) : []
            this.columnSortOrder = this.getStoredPageViewFields(activeFilterView)
            this.activeFilterView = activeFilterView
            if (activeFilterView.appliedfilter && activeFilterView.appliedfilter.filters && activeFilterView.appliedfilter.filters.length) {
              this.appliedFilters = activeFilterView.appliedfilter.filters.map(x => {
                return JSON.parse(x.element)
              })
            } else this.appliedFilters = []
            this.setPaginationForFilterView(activeFilterView.appliedfilter)
            this.getViewsLoader = false
            this.saveItemPerPagePageView()
          } else {
            this.$router.push('dashboard')
          }
        })
    },
    getStoredPageViewFields (activePageView) {
      if (activePageView) {
        let moduleFields = (activePageView.modulefields) ? JSON.parse(activePageView.modulefields) : []
        let defaultFields = (activePageView.additionalfields && activePageView.additionalfields.submodules) ? JSON.parse(activePageView.additionalfields.submodules) : []
        let subModuleFields = (activePageView.additionalfields && activePageView.additionalfields.defaultfields) ? JSON.parse(activePageView.additionalfields.defaultfields) : []
        return [...moduleFields, ...defaultFields, ...subModuleFields]
      } else return []
    },
    changeActiveFilterView (item) {
      this.setCurrentPageViewInLocalStorage(item)
      if (this.activeFilterView._id !== item._id) {
        this.restartDataTable = false
        let pagination = JSON.parse(item.appliedfilter.pagination)
        this.activeFilterView = item
        let sortFieldName = (pagination && pagination.sortBy && pagination.sortBy.length) ? pagination.sortBy[0] : null
        let sortField = (sortFieldName && this.listPayloadObj && this.listPayloadObj.listOfAllActiveFields) ? this.listPayloadObj.listOfAllActiveFields.find(x => x.name === sortFieldName) : null
        if (!sortField || !sortField.isactive || !sortField.show_in_list) pagination.sortBy = ['name']
        // this.$root.$emit('updatePaginationChangingFilter', pagination ? this.$formatter.cloneVariable(pagination) : this.paginationObj)
        setTimeout(() => {
          this.$root.$emit('updatePaginationTilesView', pagination ? this.$formatter.cloneVariable(pagination) : this.paginationObj)
        }, 450)
        this.columnSortOrder = (this.activeFilterView && this.activeFilterView.modulefields) ? JSON.parse(this.activeFilterView.modulefields) : []
        // this.columnSortOrder = this.getStoredPageViewFields(this.activeFilterView)
        this.pagination = pagination ? this.$formatter.cloneVariable(pagination) : this.paginationObj        
        this.$root.$emit('updateKanbanViewDisableField', this.activeFilterView._id)
        this.saveItemPerPagePageView()
      }
    },
    setCurrentPageViewInLocalStorage (item) {
      let listOfStoredPageViews = localStorage.getItem(`${process.env.VUE_APP_NAME}_recent_pageview`) ? JSON.parse(localStorage.getItem(`${process.env.VUE_APP_NAME}_recent_pageview`)) : []
      let currentViewIndex = listOfStoredPageViews.findIndex(x => (x.user_id === this.userDetails._id) && (x.moduleid === this.currentModule._id))
      if (currentViewIndex >= 0) listOfStoredPageViews[currentViewIndex] = { _id: item._id, name: item.name, moduleid: item.moduleid, user_id: this.userDetails._id }
      else listOfStoredPageViews.push({ _id: item._id, name: item.name, moduleid: item.moduleid, user_id: this.userDetails._id })
      localStorage.setItem(`${process.env.VUE_APP_NAME}_recent_pageview`, JSON.stringify(listOfStoredPageViews))
    },
    saveFilterViewHandler () {
      let noLoader = true
      if (this.$refs.saveFilterView.validate()) {
        // this.listPayloadObj.headers = []
        this.listPayloadObj.loading = true
        this.filterLoader = true
        let query = this.listPaginateQueryConstruction({ noLoader })
        let model = this.$formatter.cloneVariable(this.filterBasedView)
        let filters = (this.activeFilterView.appliedfilter && this.activeFilterView.appliedfilter.filters && this.activeFilterView.appliedfilter.filters.length) ? this.constructFilterList(this.activeFilterView.appliedfilter.filters.map(x => JSON.parse(x.element))) : this.constructFilterList()
        model = { ...model, ...{ moduleId: this.currentModule._id, appliedfilter: { filters, ...query } } }
        model.appliedfilter.sort = JSON.stringify(model.appliedfilter.sort)
        let pagination = this.pagination ? JSON.stringify(this.$formatter.cloneVariable(this.pagination)) : ''
        model.appliedfilter.pagination = pagination
        model.appliedfilter.limit = model.appliedfilter.limit || this.userDetails.userpagination || 25
        model.modulefields = this.activeFilterView.modulefields
        this.$api.execute('post', 'pageviews', model)
        .then(({ data }) => {
          this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'saveSuccess' })
          this.activeFilterView = this.$formatter.cloneVariable(data)
          this.setCurrentPageViewInLocalStorage(data)
          this.listOfFilterViews.push(data)
          this.sortTableHeaderBasedOnSelectedView(this.listPayloadObj.listOfAllActiveFields)
          setTimeout(() => {
            if (this.currentListView === 3) this.$root.$emit('constructKanbanViewListForPageView')
          })
          })
          .finally(() => {
            this.closePageViewDialog()
          })
      } else this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'validationIssue' })
    },
    updateFilterView () {
      if (this.$refs.saveFilterView.validate()) {
        this.filterLoader = true
        let model = this.$formatter.cloneVariable(this.filterBasedView)
        this.activeFilterView = model
        this.$api.execute('put', `pageviews/${model._id}`, model)
        .then(({ data }) => {
          this.$root.$emit('snackbar', { snackbar: true, color: 'success', text: 'updateSuccess' })
          let index = this.listOfFilterViews.findIndex(x => x._id === data._id)
          let listOfFilters = this.$formatter.cloneVariable(this.listOfFilterViews)
          listOfFilters[index] = this.$formatter.cloneVariable(data)
          this.listOfFilterViews = listOfFilters
        })
        .finally(() => {
          this.closePageViewDialog()
        })
      } else this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'validationIssue' })
    },
    closePageViewDialog () {
      this.$refs.saveFilterView.reset()
      this.$refs.saveFilterView.resetValidation()
      this.saveViewDialog = false
      this.filterLoader = false
    },
    deleteFilterView (id) {
      this.loaderForFilterView = true
      this.listPayloadObj.headers = []
      this.$api.execute('delete', `pageviews/${id}`)
        .then(() => {
          let index = this.listOfFilterViews.findIndex(x => x._id === id)
          this.listOfFilterViews.splice(index, 1)
          this.activeFilterView = this.listOfFilterViews[0]
          this.setCurrentPageViewInLocalStorage(this.activeFilterView)
          let pagination = JSON.parse(this.activeFilterView.appliedfilter.pagination)
          this.pagination = pagination ? this.$formatter.cloneVariable(pagination) : this.paginationObj
          // this.sortTableHeaderBasedOnSelectedView(this.listPayloadObj.listOfAllActiveFields)
          this.$root.$emit('updatePaginationChangingFilter', pagination ? this.$formatter.cloneVariable(pagination) : this.paginationObj)
          setTimeout(() => {
            this.$root.$emit('updatePaginationTilesView', pagination ? this.$formatter.cloneVariable(pagination) : this.paginationObj)
          }, 200)
        })
        .finally(() => {
          this.loaderForFilterView = false
          this.deleteViewDialog = false
        })
    },
     paginationPayload (paginationObject) { 
         return paginationObject
     }
  }
}
