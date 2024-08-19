import { api } from './axios_settings'
export default {
  install (Vue) {
    Vue.prototype.$api = {
      execute (method, url, model) {
        return api[method](url, model)
      },
      getSingleRecordHandler (url) {
        return this.execute('get', url)
      },
      getSingleHandler (url) {
        return new Promise((resolve, reject) => {
          this.execute('get', url).then(response => {
            resolve(response.data)
          }).catch((error) => {
            reject(error)
          })
        })
      },
      saveUpdateHandler (urlVal, model) {
        return new Promise((resolve, reject) => {
          let method = model._id ? 'put' : 'post'
          let url = model._id ? `${urlVal}/${model._id}` : urlVal
          let text = model._id ? 'updatedSuccess' : 'addedSucess'
          this.execute(method, url, model)
            .then(response => {
              response.data = { ...response.data, ...{ snackbar: { snackbar: true, color: 'success', text: text } } }
              resolve(response.data)
            })
            .catch((error) => {
              reject(error)
            })
        })
      },
      queryHandler (model, url, havingMatch) {
        let pageVal = model.page || 1
        let queries = [
          { ...model.match },
          { $sort: { [model.sortBy]: model.sortDesc ? -1 : 1 } },
          {
            $facet: {
              data: [{ $skip: ((pageVal - 1) * model.itemsPerPage) }, { $limit: model.itemsPerPage }],
              count: [{ $count: 'count' }]
            }
          }
        ]
        if (model.itemsPerPage === -1) queries[2].$facet.data.splice(1, 1)
        if (!model.search && !havingMatch) queries.splice(0, 1)
        if (model.lookup) queries.splice(queries.length - 1, 0, model.lookup)
        return new Promise((resolve, reject) => {
          this.execute('post', url, queries).then(response => {
            resolve(response.data)
          }).catch((error) => {
            reject(error)
          })
        })
      }
    }
  }
}
