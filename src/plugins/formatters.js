import VueCookie from 'vue-cookie'
import moment from 'moment'
import momentTz from 'moment-timezone'
import 'moment/min/locales'
import { decrypt } from '../utils/crypto'
const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
let timezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
timezone = (timezone && timezone !== 'undefined') ? JSON.parse(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone
moment.tz.setDefault(timezone)
export default {
  install (Vue) {
    Vue.prototype.$formatter = {
      updateTimeZone () {
        const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
        let timezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
        timezone = (timezone && timezone !== 'undefined') ? JSON.parse(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone
        moment.tz.setDefault(timezone)
      },
      replaceDotWithComma (value) {
        if (value === null || value === undefined || value === '') return ''
        return parseFloat(value).toFixed(2).toString().replace('.', ',')
      },
      replaceDotWithCommaWOFixed (value) {
        if (value === null || value === undefined || value === '') return ''
        return value.toString().replace('.', ',')
      },
      replaceCommaWithDot (value) {
        if (!value) return null
        return value.toString().replace(',', '.')
      },
      replaceCommaWithDotCal (value) {
        if (!value) return 0
        return parseFloat(value.toString().replace(',', '.'))
      },
      cloneVariable (data) {
        if (!data) return null
        return JSON.parse(JSON.stringify(data))
      },
      checkKeyExistsInObject (obj, key) {
        // eslint-disable-next-line no-prototype-builtins
        return obj.hasOwnProperty(key)
      },
      filterDate (date) {
        const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
        let dateformat = (user) ? user.dateformat : null
        if (!date) return null
        return moment(date, dateformat).isValid() ? moment(date, dateformat).format(dateformat) : null
      },
      formatDate (date, fromFormat, toFormat) {
        if (!date) return null
        return moment(date, (fromFormat || 'DD.MM.YYYYTHH.mm.ss')).isValid() ? moment(date, (fromFormat || 'DD.MM.YYYYTHH.mm.ss')).format(toFormat || 'DD.MM.YYYY HH:mm') : null
      },
      formatMomentDate (date, toFormat) {
        if (!date) return null
        return moment(date).format(toFormat)
      },
      updateMomentLocale (lang) {
        if (lang) {
          if (lang === 'no') moment.locale('nb')
          else moment.locale(lang)
        } else {
          moment.locale('en')
        }
      },
      formatDateTimeForPicker (datePicker, timePicker) {
        const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
        let dateformat = (user) ? user.dateformat : null
        if (datePicker && moment(datePicker).isValid()) datePicker = moment(datePicker).format(dateformat)
        else datePicker = this.getCurrentDate(dateformat)
        let dateTime = moment(timePicker, 'HH:mm').format('HH:mm')
        return `${datePicker} ${dateTime}`
      },
      addHoursToDate (date, hours, format) {
        const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
        let dateformat = (user) ? user.dateformat : null
        const dateFormatted = moment(date, format).format('DD.MM.YYYYTHH:mm:ss')
        return moment(dateFormatted, 'DD.MM.YYYYTHH:mm:ss').add(hours, 'hours').format(`${dateformat} HH:mm`)
      },
      getStartAndEndDatesBasedOnAction (action, format) { // action - day / month / week / year
        let startdate = moment().startOf(action).format(format || 'DD.MM.YYYYT00:00:00')
        let enddate = moment().endOf(action).format(format || 'DD.MM.YYYYT23:59:59')
        return { startdate, enddate }
      },
      // parseDate (date) {
      //   return moment(date, 'YYYY-MM-DD').isValid() ? moment(date, 'YYYY-MM-DD').format('DD.MM.YYYY') : null
      // },
      parseDate (date) {
        const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
        let dateformat = (user) ? user.dateformat : null
        return moment(date, 'YYYY-MM-DD').isValid() ? moment(date, 'YYYY-MM-DD').format(dateformat || 'DD.MM.YYYY') : null
      },
      isNullOrEmpty (val) {
        return val === undefined || val === null || val === ''
      },
      isNull (val) {
        return val === null
      },
      isEmptyObject (obj) {
        return Object.entries(obj).length === 0 && obj.constructor === Object
      },
      isArrayHasData (array) {
        return array && array.length > 0
      },
      isArray (array) {
        return Array.isArray(array)
      },
      getRandomNumberInBW (min, max) {
        return parseInt(Math.random() * (max - min) + min)
      },
      debounce (func, delay) {
        let debounceTimer
        return function () {
          const context = this
          const args = arguments
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => func.apply(context, args), delay)
        }
      },
      // _getSumBy([4, 2, 8, 6]) // 20
      getSum (arr) {
        return [...arr].reduce((acc, val) => acc + val, 0)
      },
      // _getSumBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], x => x.n) // 20
      getSumBy (arr, fn) {
        let self = this
        if (this.isArrayHasData(arr)) {
          return arr.map(typeof fn === 'function' ? fn : val => val[fn]).reduce(function (acc, val) {
            return self.replaceCommaWithDotCal(acc) + self.replaceCommaWithDotCal(val)
          }, null)
        } else return 0
      },
      getCurrentDate (format = 'DD.MM.YYYY') {
        return moment().format(format)
      },
      getCurrentDateAndTime (format = 'DD.MM.YYYY HH:mm') {
        return moment().format(format)
      },
      getSameorBefore (currentDate, date) {
        return moment(date).isSameOrBefore(currentDate)
      },
      getBefore (currentDate, date) {
        return moment(date).isBefore(currentDate)
      },
      getCurrentDateTimeUTC () {
        // return moment.utc().format('DD.MM.YYYYTHH:mm:ss')
        const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
        let timezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
        timezone = (timezone && timezone !== 'undefined') ? JSON.parse(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone
        return momentTz().tz(timezone).format('DD.MM.YYYYTHH:mm:ss')
      },
      getMoment (date, format) {
        return moment(date, format)
      },
      groupBy (array, key) {
        return array.reduce(function (total, item) {
          total[item[key]] = total[item[key]] || []
          total[item[key]].push(item)
          return total
        }, {})
      },
      groupByModuleRecords (array, key) { // Spefically for modules list kanban view to group
        let resultItems = {}
        resultItems = array.reduce(function (result, item) {
          if (!item[key]) {
            result._undefined = []
            return result
          }
          if (item[key].value === 'unset') item[key].value = null
          result[item[key].value] = result[item[key].value] || []
          result[item[key].value].push(item)
          return result
        }, {})
        delete resultItems._undefined
        return resultItems
      },
      // _findValueInArray([{ n: 4, b: 10 }, { n: 2, b: 11 }], x => x.b === 10) // { n: 4, b: 10 }
      findValueInArray (array, condition) {
        let getObj = array.find(condition)
        if (getObj) return getObj
        else return null
      },
      // _getSingleValueFromObject([{ n: 4, b: 10 }, { n: 2, b: 11 }], x => x.b) // [10, 11]
      mapDataInArray (array, condition) {
        let getObj = array.map(condition)
        if (getObj) return getObj
        else return null
      },
      /* {
          number: { list:['qty', 'price'], format: 'replaceCommaWithDot' },
          date: { list:['start', 'end'], from: 'DD.MM.YYYY', to: 'YYYY.MM.DD'},
          status: { list:['status'], text: '', value: '$_ccsheetStatus' },
          merge: { list:['firstname', 'lastname'], property: 'username' }
      */
      formatModel (model, data) {
        model = JSON.parse(JSON.stringify(model))
        let keys = Object.keys(data)
        keys.forEach(key => {
          switch (key) {
            case 'number': {
              let formatObj = data['number']
              formatObj['list'].forEach(item => {
                model[item] = this[formatObj['format']](model[item])
              })
              break
            }
            case 'date': {
              let formatObj = data['date']
              formatObj['list'].forEach(item => {
                let dateObj = this.formatDate(model[item], formatObj['from'], formatObj['to'])
                model[item] = dateObj
              })
              break
            }
            case 'status': {
              let formatObj = data['status']
              formatObj['list'].forEach(item => {
                let statusArray = this[formatObj['value']]
                statusArray.map(function (x) {
                  if (x.value === model[item]) model[item] = { text: x.text, value: model[item] }
                })
              })
              break
            }
            default:
              break
          }
        })
        return model
      },
      // Object format and parse numbers
      formatAndParseModel (model, listOfValues, methodName) {
        const modelData = this.cloneVariable(model)
        listOfValues.forEach(element => {
          modelData[element] = parseFloat(this[methodName](modelData[element]))
        })
        return modelData
      },
      // Array of $_formatModel FUNCTION
      formatListModel (listOfModel, data) {
        if (this.isArrayHasData(listOfModel)) {
          let result = []
          listOfModel.forEach(model => {
            result.push(this.formatModel(model, data))
          })
          return result
        } else return []
      },
      sortByType (item1, item2) {
        if (typeof (item1) === 'string' && typeof (item2) === 'string') {
          if (/^\d+$/.test(item2) && /^\d+$/.test(item1)) {
            return item1.localeCompare(item2, undefined, {
              numeric: true
            })
          }
          return item1.localeCompare(item2)
        } else {
          return item1 < item2 ? -1 : 1
        }
      },
      // Array format and parse number
      formatAndParseList (list, listOfValues, methodName) {
        if (list.length > 0) {
          const result = []
          list.forEach(element => {
            result.push(this.formatAndParseModel(element, listOfValues, methodName))
          })
          return result
        } else return []
      },
      customSorting (items, index, isDesc, dateColumnArray, type) {
        items.sort((a, b) => {
          if (dateColumnArray.includes(index)) {
            let date1 = a[index]
            let date2 = b[index]
            if (!isDesc) {
              return this.sortWithDates(date1, date2, type)
            } else {
              return this.sortWithDates(date2, date1, type)
            }
          } else {
            if (!a[index]) a[index] = ''
            if (!b[index]) b[index] = ''
            if (!isDesc) {
              return this.sortByType(a[index], b[index])
            } else {
              return this.sortByType(b[index], a[index])
            }
          }
        })
        return items
      },
      validEmail (email) {
        // eslint-disable-next-line no-useless-escape
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(email)
      },
      validateEmailDomain (email) {
        var invalidDomains = ['@gmail.', '@yahoo.', '@hotmail.', '@live.', '@aol.', '@outlook.']
        for (var i = 0; i < invalidDomains.length; i++) {
          var domain = invalidDomains[i]
          if (email.indexOf(domain) !== -1) {
            return false
          }
        }
        return true
      },
      sortWithDates (date1, date2, type) {
        if (date1 === '' || date1 === null) return -1
        if (date2 === '' || date2 === null) return 1
        var dateA = moment(date1, type)
        var dateB = moment(date2, type)
        return dateA - dateB
      },
      // Set Foreground color based on the background color
      foreGroundColor (colorValue) {
        let rgbCode = colorValue ? this.hexToRgbA(colorValue) : ''
        let color = rgbCode ? rgbCode.toString().split('(')[1] : ''
        let resultOnColor = color.split(',', 3)
        let R, G, B, C, L
        R = resultOnColor[0]
        G = resultOnColor[1]
        B = resultOnColor[2] ? resultOnColor[2].toString().replace(')', '') : 0
        C = [R / 255, G / 255, B / 255]
        for (var i = 0; i < C.length; ++i) {
          if (C[i] <= 0.03928) {
            C[i] = C[i] / 12.92
          } else {
            C[i] = Math.pow((C[i] + 0.055) / 1.055, 2.4)
          }
        }
        L = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2]
        if (L > 0.179) {
          return 'black'
        } else {
          return 'white'
        }
      },
      hexToRgbA (hex) {
        hex = hex.slice(0, -2)
        var c
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
          c = hex.substring(1).split('')
          if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]]
          }
          c = '0x' + c.join('')
          return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)'
        }
        return null
      },
      stringToProperCase (value) {
        if (value) {
          return value.toLowerCase().split('_').map(function (word) {
            return (word.charAt(0).toUpperCase() + word.slice(1))
          }).join('_')
        }
      },
      // getHumanzieTime (time, locale) {
      //   moment.locale(locale)
      //   return (moment(time, 'DD.MM.YYYY HH:mm:ss').isValid()) ? moment(time, 'DD.MM.YYYY HH:mm:ss').fromNow() : null
      // },
      getHumanzieTime (time, locale) {
        const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
        let dateformat = (user) ? user.dateformat : null
        moment.locale(locale)
        return (moment(time, `${dateformat} HH:mm:ss`).isValid()) ? moment(time, `${dateformat} HH:mm:ss`).fromNow() : null
      },
      UtcToLocal (date, fromFormat, toFormat) { // eslint-disable-line camelcase
        if (!date) return null
        const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
        let timezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
        timezone = (timezone && timezone !== 'undefined') ? JSON.parse(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone
        return (date) ? momentTz.utc(date, (fromFormat || 'DD.MM.YYYYTHH.mm.ss')).tz(timezone).format((toFormat || fromFormat || 'DD.MM.YYYYTHH.mm.ss')) : null
      },
      parseIfStringified (str) {
        try {
          return { value: JSON.parse(str), isStringified: true }
        } catch (err) {
          return { value: str, isStringified: false }
        }
      },
      recursiveUpdate (obj, options) { // eslint-disable-line camelcase
        if (obj && (typeof obj === 'object')) {
          if (Array.isArray(obj) && obj.length) {
            for (const arrayItemIndex in obj) {
              obj[arrayItemIndex] = this.recursiveUpdate(obj[arrayItemIndex], options)
            }
            return obj
          } else if ((typeof obj === 'object') && Object.keys(obj).length) {
            const newobj = {}
            for (const key in obj) {
              if (obj[key] && (typeof obj[key] === 'object')) newobj[key] = this.recursiveUpdate(obj[key], options)
              else {
                if ((obj[key] && (typeof (obj[key]) === 'string'))) {
                  if (moment(obj[key], options.fromFormat, true).isValid()) {
                    if (options.localToUtc) newobj[key] = momentTz.tz(obj[key], options.fromFormat, options.timezone).utc().format((options.toFormat || options.fromFormat))
                    else if (options.UtcToLocal) newobj[key] = this.UtcToLocal(obj[key], options.fromFormat, (options.toFormat || options.fromFormat))
                    else newobj[key] = obj[key]
                  } else newobj[key] = obj[key]
                } else newobj[key] = obj[key]
              }
            }
            return newobj
          } else return obj
        } else return obj
      },
      mimeTypeOfDocument (type) {
        let image = ''
        switch (type) {
          case 'image/png':
          case 'image/jpeg':
          case 'image/gif':
          case 'image/svg+xml':
            image = { icon: 'mdi-file-image', color: 'grey' }
            break
          case 'application/pdf':
            image = { icon: 'mdi-file-pdf', color: 'error' }
            break
          case 'text/html':
            image = { icon: 'mdi-language-html5', color: '#f16428' }
            break
          case 'video/mp4':
            image = { icon: 'mdi-file-video', color: 'grey' }
            break
          case 'audio/mpeg':
            image = { icon: 'mdi-audiobook', color: 'grey' }
            break
          case 'application/msword':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
            image = { icon: 'mdi-file-word', color: 'info' }
            break
          case 'application/vnd.ms-excel':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
            image = { icon: 'mdi-file-excel', color: 'green' }
            break
          case 'application/vnd.ms-powerpoint':
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          case 'application/vnd.openxmlformats-officedocument.presentationml.template':
          case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
            image = { icon: 'mdi-file-powerpoint', color: 'error' }
            break
          case 'application/x-rar-compressed':
          case 'application/octet-stream':
          case 'application/zip':
          case 'application/x-zip-compressed':
          case 'multipart/x-zip':
            image = { icon: 'mdi-zip-box', color: 'grey' }
            break
          case 'folder':
            image = { icon: 'mdi-folder', color: '#ffda6b' }
            break
          default:
            image = { icon: 'mdi-file-cloud', color: 'grey' }
            break
        }
        return image
      },
      // Permission Handling
      permissionSetting (listOfModules, moduleId, userDetails) {
        let modules = this.cloneVariable(listOfModules)
        let result = modules.find(x => x._id === moduleId)
        let hasManagePermission = false
        if (userDetails.isadmin || userDetails.iscontentadmin) hasManagePermission = { add: true, view: true, edit: true, delete: true }
        else if (result && result.accesscontrol) hasManagePermission = result.accesscontrol
        return hasManagePermission
      },
      /* DataGrid Component addition */
      findWidthPercent (gridCols) {
        let percentNo = 5
        if (!isNaN(gridCols)) {
          percentNo = (100 / gridCols).toFixed(3).slice(0, -1)
        }
        return percentNo
      },
      findWidthPixel () {
        return 200
      },
      /* Capitalize First Letter */
      capitalizeFirstLetter (string) {
        return string ? string.charAt(0).toUpperCase() + string.slice(1) : ''
      },
      checkForIsSameDateTimeOrInvertedTimeRange (startDate, endDate) {
        if (startDate && endDate) {
          let start = moment(startDate, 'DD.MM.YYYYTHH:mm:ss')
          let end = moment(endDate, 'DD.MM.YYYYTHH:mm:ss')
          return end.isSameOrBefore(start)
        } else return true
      },
      enumerateDaysBetweenDates (startDate, endDate, returnDateFormat = 'YYYY-MM-DD') {
        if (startDate.format('DD.MM.YYYY') === '01.01.0001') startDate = moment(endDate).clone() // temporary handling for invalid date #riyaz
        if (endDate.format('DD.MM.YYYY') === '01.01.0001') endDate = moment(startDate).clone() // temporary handling for invalid date #riyaz

        var now = startDate
        var dates = []
        while (now.isSameOrBefore(endDate)) {
          dates.push(now.format(returnDateFormat))
          now.add(1, 'days')
        }
        return dates
      },
      getAppImageURL () {
        return process.env.VUE_APP_IMAGE_URL
      },
      generateRandomColor () {
        var letters = '0123456789ABCDEF'
        var color = '#'
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)]
        }
        return color
      },
      generateRandomColorWithBackground () {
        let colorSet = { backgroundColor: this.generateRandomColor(), color: '' }
        colorSet.color = this.foreGroundColor(colorSet.backgroundColor)
        return colorSet
      },
      setSignaturePadHeight (columns) {
        let initialHeights = { 1: 75, 2: 90, 3: 105, 4: 120 }
        let height = 250
        if (initialHeights[columns]) height = initialHeights[columns]
        else height = columns * 25
        return height > 250 ? 250 : height
      },
      makeListEmpty (listName) {
        this[listName] = []
      },
      hexToRgbaHalfOpacity (hex) {
        let c
        hex = (!(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) && (/^#[a-fA-F0-9]{8}$|^#[a-fA-F0-9]{6}$/.test(hex))) ? hex.slice(0, -2) : hex
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
          c = hex.substring(1).split('')
          if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]]
          }
          c = '0x' + c.join('')
          return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.5)'
        }
      },
      tabStyle (color) {
        return {
          boxShadow: `${color} 0px 0px 5px -1px`,
          borderBottom: `2px solid ${color}`
        }
      },
      // activeTabStyle (color, text) {
      //   return {
      //     boxShadow: `${color} 0px 0px 5px -1px`,
      //     borderBottom: `2px solid ${color}`,
      //     color: text,
      //     backgroundImage: `linear-gradient(to right, ${color}, ${this.hexToRgbaHalfOpacity(color)})`
      //   }
      // }
      activeTabStyle (color, text, isDark) {
        if (!isDark) {
          return {
            boxShadow: `${color} 0px 0px 5px -1px`,
            borderBottom: `2px solid ${color}`,
            color: text,
            backgroundImage: `linear-gradient(to right, ${color}, ${this.hexToRgbaHalfOpacity(color)})`
          }
        } else {
          return {
            color: 'black',
            backgroundColor: 'white'
          }
        }
      },
      conventToPositive (number) {
        return Math.abs((number))
      },
      optionsValuesDuplication (options) {
        let values = options.map(x => x.value)
        return values.some((x, i) => values.indexOf(x) !== i)
      },
      optionsLabelDuplication (options) {
        let labels = options.map(x => x.label)
        return labels.some((x, i) => labels.indexOf(x) !== i)
      },
      formatBytes (bytes) {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
      },
      hasliveSearchRestrictedKeycodes (event) {
        return [16, 17, 18, 20, 27, 30, 32, 37, 38, 39, 40].indexOf(event.keyCode) > -1
      }
    }
  }
}
