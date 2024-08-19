import { loadLanguageAsync } from '@/lang/config'
import { mapGetters } from 'vuex'
import moment from 'moment'
import VueCookie from 'vue-cookie'
import { encrypt, decrypt } from '../utils/crypto'

export default {
  mounted () {
    const user = VueCookie.get(process.env.VUE_APP_USER) ? decrypt(JSON.parse(VueCookie.get(process.env.VUE_APP_USER))) : null
    let timezone = (user) ? localStorage.getItem((`${process.env.VUE_APP_NAME}_${user.tenantname}_tz`)) : null
    timezone = (timezone && timezone !== 'undefined') ? JSON.parse(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone
    moment.tz.setDefault(timezone)
  },
  data () {
    return {
      imagesTypes: ['image/bmp', 'image/png', 'image/jpeg', 'image/jpeg'],
      whoHasAccessList: [
        { id: 1, name: 'anyone', whoHasAccess: 'Anyone' },
        { id: 2, name: 'onlyMe', whoHasAccess: 'Only me' },
        { id: 3, name: 'selectedUsers', whoHasAccess: 'Selected users' }
      ],
      tenantListLoading: false
    }
  },
  computed: {
    ...mapGetters(['userDetails', 'systemDetails', 'formType']),
    $_requiredValidation () {
      return [
        (val) => !!val || 'Required',
        (val) => !/^\s*$/.test(val) || 'Required'
      ]
    },
    $_excelFieldValidation () {
      return [
        (val) => !!val || 'Required',
        (val) => !/^\s*$/.test(val) || 'Required',
        (val) => {
          if (!val || typeof val !== 'object' || !val.name) {
            return 'File must be an Excel file'
          }
          return /\.(xls|xlsx)$/.test(val.name) || 'File must be an Excel file'
        }
      ]
    },
    $_fileValidation () {
      return [value => !value || value.size < 200000000 || 'File Required']
    },
    $_fileTypeValidation () {
      // eslint-disable-next-line
      return [value => !!value ? true : 'File Required']
    },
    $_multiSelectValidation () {
      return [
        val => !!val || 'Required',
        val => (val && val.length > 0) || 'Required'
      ]
    },
    $_HourValidation () {
      return [
        val => !!val || 'Required',
        val => this.$formatter.replaceCommaWithDot(val) <= 24 || 'Invalid Hours',
        val => this.$formatter.replaceCommaWithDot(val) > 0 || 'Invalid Hours'
      ]
    },
    $_toInvoiceValidation () {
      return [
        // val => !!val || 'Required',
        val => this.$formatter.replaceCommaWithDot(val) <= 24 || 'Invalid Hours',
        val => this.$formatter.replaceCommaWithDot(val) >= 0 || 'Invalid Hours'
      ]
    },
    $_YearHourValidation () {
      return [
        val => !!val || 'Required',
        val => this.$formatter.replaceCommaWithDot(val) <= 8784 || 'Invalid Hours'
      ]
    },
    $_spaceAndRequiredValidation () {
      return [
        (v) => !!(v) || 'Required', (v) => v ? /^[^-\s][a-zA-Z0-9_\s-]+$/.test(v) || 'Cannot start with space' : true
      ]
    },
    $_emailAndRequiredValidation () {
      return [
        (v) => !!(v) || 'Required', (v) => v ? /^([A-Za-z0-9_\-.+])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,})$/.test(v) || 'Invalid Email Address' : true
      ]
    },
    $_domainAndRequiredValidation () {
      return [
        (v) => !!(v) || 'Required', (v) => v ? /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(v) || 'Invalid Domain Address' : true
      ]
    },
    $_tenantNameValidation () {
      return [
        (v) => !!(v) || 'Required', (v) => v ? /^[A-Za-z0-9_-]*$/.test(v) || 'Only alphabets and numbers allowed' : true
      ]
    },
    $_numberAndRequiredValidation () {
      return [
        (v) => !!(v) || 'Required',
        val => (val) ? /^[0-9.,]+$/.test(val) || 'Not Valid Number' : true,
        val => (val) ? !isNaN(this.$formatter.replaceCommaWithDot(val)) || 'Not Valid Number' : true
      ]
    },
    $_numberValidation () {
      return [
        val => (val) ? /^[0-9]+$/.test(val) || 'Not Valid Number' : true,
        val => (val) ? !isNaN(this.$formatter.replaceCommaWithDot(val)) || 'Not Valid Number' : true
      ]
    },
    $_norwegianNumberValidation () {
      return [
        val => (val) ? /^[0-9.,]+$/.test(val) || 'Not Valid Number' : true,
        val => (val) ? !isNaN(this.$formatter.replaceCommaWithDot(val)) || 'Not Valid Number' : true
      ]
    },
    $_norwegianNumberMinusValidation () {
      return [
        val => (val) ? /^-?[0-9.,]+$/.test(val) || 'Not Valid Number' : true,
        val => (val) ? !isNaN(this.$formatter.replaceCommaWithDot(val)) || 'Not Valid Number' : true
      ]
    },
    $_emailValidation () {
      return [
        (v) => v ? /^([A-Za-z0-9_\-.+])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,})$/.test(v) || 'Invalid Email Address' : true
      ]
    },
    $_nameValidation () {
      return [v => !!v || 'Required Field',
        v => /^[A-Za-z.\s ]{3,}$/.test(v) || 'name must be valid']
    },
    $_phoneNumberValidation () {
      return [
        v => !!v || 'Required Field',
        v => /^[0-9]{10}$/.test(v) || 'Phone must be valid'
      ]
    },
    $_phoneNumberValidationWithCC () {
      return [
        v => !!v || 'Required Field'
      ]
    },
    $_discountValidation () {
      return [
        (val) => val ? (this.$formatter.replaceCommaWithDot(val) <= 100 && this.$formatter.replaceCommaWithDot(val) >= 0) || 'Invalid Number' : true
      ]
    },
    $_numberLength () {
      return [
        (val) => val ? (val && val.length <= 4) || this.$t('maxCharacters', {
          charCount: 4
        }) : true
      ]
    },
    $_fieldNameValidation () {
      return [
        (v) => v ? /^[a-zA-Z0-9_]*$/.test(v) || 'Invalid name' : true
      ]
    },
    $_columnValidation () {
      return [
        v => !!v || 'Required',
        v => (v <= 12 && v >= 1) || 'Enter columns b/w 1 to 12'
      ]
    },
    $_passwordConfirmationRules () {
      return [
        (v) => !!v || 'Required',
        (v) => v === this.resetObj.password || 'Passwords are different'
      ]
    },
    $_domainNameValidation () {
      return [
        (v) => !!v || 'Required',
        // eslint-disable-next-line
        (v) => v ? /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/.test(v) || 'Invalid name' : true
      ]
    },
    $_urlRules () {
      return [
        // eslint-disable-next-line
        (v) => !!v || 'Required', (v) => v ? /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(v) || 'Invalid Email Address' : true
      ]
    },
    $_accountType () {
      return [
        { text: 'account', value: 'account' },
        { text: 'lead', value: 'lead' },
        { text: 'customer', value: 'customer' },
        { text: 'supplier', value: 'supplier' }
      ]
    },
    $_zeroSelectValidation () {
      return [
        val => val !== '' || this.$t('required'),
        val => val !== null || this.$t('required'),
        val => val !== undefined || this.$t('required')
      ]
    },
    $_invoiceValidation () {
      return [
        val => (val) ? /^[0-9.,]+$/.test(val) || (this.$t('invalid') + ' ' + this.$t('number')) : true,
        val => (val) ? !isNaN(this.$formatter.replaceCommaWithDot(val)) || (this.$t('invalid') + ' ' + this.$t('number')) : true,
        val => (this.$formatter.replaceCommaWithDot(val) > 0) || this.$t('message.timer.invalidHours')
      ]
    },
    $_inlineEditFields () {
      return [1, 2, 3, 4, 5, 7, 12, 13, 14, 15]
    },
    $_componentValidation () {
      return [
        v => !!v || 'Required',
        v => (v <= 5 && v >= 1) || 'Enter columns b/w 1 to 5'
      ]
    },
    userAgentData () {
      return navigator.userAgentData || {}
    },
    listOfWeekDays () {
      return [{
        text: this.$t('sunday'),
        value: 0
      }, {
        text: this.$t('monday'),
        value: 1
      }, {
        text: this.$t('tuesday'),
        value: 2
      }, {
        text: this.$t('wednesday'),
        value: 3
      }, {
        text: this.$t('thursday'),
        value: 4
      }, {
        text: this.$t('friday'),
        value: 5
      }, {
        text: this.$t('saturday'),
        value: 6
      }]
    },
    autoAssignAddressType () {
      return [{
        id: 'from',
        text: this.$t('fromAddress')
      }, {
        id: 'to',
        text: this.$t('toAddress')
      }]
    },
    accessLevel () {
      return [{
        text: 'view',
        value: this.$t('view')
      }, {
        text: 'manage',
        value: this.$t('manage')
      }]
    },
    listOfViewPermission () {
      return [{
        text: 'nodata',
        value: this.$t('noData')
      }, {
        text: 'onlymydata',
        value: this.$t('onlyMyData')
      }, {
        text: 'alldata',
        value: this.$t('allData')
      }]
    },
    listOfLanguages () {
      return [{
        name: 'Abkhaz',
        code: 'ab'
      }, {
        name: 'Afar',
        code: 'aa'
      }, {
        name: 'Afrikaans',
        code: 'af'
      }, {
        name: 'Akan',
        code: 'ak'
      }, {
        name: 'Albanian',
        code: 'sq'
      }, {
        name: 'Amharic',
        code: 'am'
      }, {
        name: 'Arabic',
        code: 'ar'
      }, {
        name: 'Aragonese',
        code: 'an'
      }, {
        name: 'Armenian',
        code: 'hy'
      }, {
        name: 'Assamese',
        code: 'as'
      }, {
        name: 'Avaric',
        code: 'av'
      }, {
        name: 'Avestan',
        code: 'ae'
      }, {
        name: 'Aymara',
        code: 'ay'
      }, {
        name: 'Azerbaijani',
        code: 'az'
      }, {
        name: 'Bambara',
        code: 'bm'
      }, {
        name: 'Bashkir',
        code: 'ba'
      }, {
        name: 'Basque',
        code: 'eu'
      }, {
        name: 'Belarusian',
        code: 'be'
      }, {
        name: 'Bengali',
        code: 'bn'
      }, {
        name: 'Bihari',
        code: 'bh'
      }, {
        name: 'Bislama',
        code: 'bi'
      }, {
        name: 'Bosnian',
        code: 'bs'
      }, {
        name: 'Breton',
        code: 'br'
      }, {
        name: 'Bulgarian',
        code: 'bg'
      }, {
        name: 'Burmese',
        code: 'my'
      }, {
        name: 'Catalan; Valencian',
        code: 'ca'
      }, {
        name: 'Chamorro',
        code: 'ch'
      }, {
        name: 'Chechen',
        code: 'ce'
      }, {
        name: 'Chichewa; Chewa; Nyanja',
        code: 'ny'
      }, {
        name: 'Chinese',
        code: 'zh'
      }, {
        name: 'Chuvash',
        code: 'cv'
      }, {
        name: 'Cornish',
        code: 'kw'
      }, {
        name: 'Corsican',
        code: 'co'
      }, {
        name: 'Cree',
        code: 'cr'
      }, {
        name: 'Croatian',
        code: 'hr'
      }, {
        name: 'Czech',
        code: 'cs'
      }, {
        name: 'Danish',
        code: 'da'
      }, {
        name: 'Divehi; Dhivehi; Maldivian;',
        code: 'dv'
      }, {
        name: 'Dutch',
        code: 'nl'
      }, {
        name: 'English',
        code: 'en'
      }, {
        name: 'Esperanto',
        code: 'eo'
      }, {
        name: 'Estonian',
        code: 'et'
      }, {
        name: 'Ewe',
        code: 'ee'
      }, {
        name: 'Faroese',
        code: 'fo'
      }, {
        name: 'Fijian',
        code: 'fj'
      }, {
        name: 'Finnish',
        code: 'fi'
      }, {
        name: 'French',
        code: 'fr'
      }, {
        name: 'Fula; Fulah; Pulaar; Pular',
        code: 'ff'
      }, {
        name: 'Galician',
        code: 'gl'
      }, {
        name: 'Georgian',
        code: 'ka'
      }, {
        name: 'German',
        code: 'de'
      }, {
        name: 'Greek, Modern',
        code: 'el'
      }, {
        name: 'Guaraní',
        code: 'gn'
      }, {
        name: 'Gujarati',
        code: 'gu'
      }, {
        name: 'Haitian; Haitian Creole',
        code: 'ht'
      }, {
        name: 'Hausa',
        code: 'ha'
      }, {
        name: 'Hebrew (modern)',
        code: 'he'
      }, {
        name: 'Herero',
        code: 'hz'
      }, {
        name: 'Hindi',
        code: 'hi'
      }, {
        name: 'Hiri Motu',
        code: 'ho'
      }, {
        name: 'Hungarian',
        code: 'hu'
      }, {
        name: 'Interlingua',
        code: 'ia'
      }, {
        name: 'Indonesian',
        code: 'id'
      }, {
        name: 'Interlingue',
        code: 'ie'
      }, {
        name: 'Irish',
        code: 'ga'
      }, {
        name: 'Igbo',
        code: 'ig'
      }, {
        name: 'Inupiaq',
        code: 'ik'
      }, {
        name: 'Ido',
        code: 'io'
      }, {
        name: 'Icelandic',
        code: 'is'
      }, {
        name: 'Italian',
        code: 'it'
      }, {
        name: 'Inuktitut',
        code: 'iu'
      }, {
        name: 'Japanese',
        code: 'ja'
      }, {
        name: 'Javanese',
        code: 'jv'
      }, {
        name: 'Kalaallisut, Greenlandic',
        code: 'kl'
      }, {
        name: 'Kannada',
        code: 'kn'
      }, {
        name: 'Kanuri',
        code: 'kr'
      }, {
        name: 'Kashmiri',
        code: 'ks'
      }, {
        name: 'Kazakh',
        code: 'kk'
      }, {
        name: 'Khmer',
        code: 'km'
      }, {
        name: 'Kikuyu, Gikuyu',
        code: 'ki'
      }, {
        name: 'Kinyarwanda',
        code: 'rw'
      }, {
        name: 'Kirghiz, Kyrgyz',
        code: 'ky'
      }, {
        name: 'Komi',
        code: 'kv'
      }, {
        name: 'Kongo',
        code: 'kg'
      }, {
        name: 'Korean',
        code: 'ko'
      }, {
        name: 'Kurdish',
        code: 'ku'
      }, {
        name: 'Kwanyama, Kuanyama',
        code: 'kj'
      }, {
        name: 'Latin',
        code: 'la'
      }, {
        name: 'Luxembourgish, Letzeburgesch',
        code: 'lb'
      }, {
        name: 'Luganda',
        code: 'lg'
      }, {
        name: 'Limburgish, Limburgan, Limburger',
        code: 'li'
      }, {
        name: 'Lingala',
        code: 'ln'
      }, {
        name: 'Lao',
        code: 'lo'
      }, {
        name: 'Lithuanian',
        code: 'lt'
      }, {
        name: 'Luba-Katanga',
        code: 'lu'
      }, {
        name: 'Latvian',
        code: 'lv'
      }, {
        name: 'Manx',
        code: 'gv'
      }, {
        name: 'Macedonian',
        code: 'mk'
      }, {
        name: 'Malagasy',
        code: 'mg'
      }, {
        name: 'Malay',
        code: 'ms'
      }, {
        name: 'Malayalam',
        code: 'ml'
      }, {
        name: 'Maltese',
        code: 'mt'
      }, {
        name: 'Māori',
        code: 'mi'
      }, {
        name: 'Marathi (Marāṭhī)',
        code: 'mr'
      }, {
        name: 'Marshallese',
        code: 'mh'
      }, {
        name: 'Mongolian',
        code: 'mn'
      }, {
        name: 'Nauru',
        code: 'na'
      }, {
        name: 'Navajo, Navaho',
        code: 'nv'
      }, {
        name: 'Norwegian Bokmål',
        code: 'nb'
      }, {
        name: 'North Ndebele',
        code: 'nd'
      }, {
        name: 'Nepali',
        code: 'ne'
      }, {
        name: 'Ndonga',
        code: 'ng'
      }, {
        name: 'Norwegian Nynorsk',
        code: 'nn'
      }, {
        name: 'Norwegian',
        code: 'no'
      }, {
        name: 'Nuosu',
        code: 'ii'
      }, {
        name: 'South Ndebele',
        code: 'nr'
      }, {
        name: 'Occitan',
        code: 'oc'
      }, {
        name: 'Ojibwe, Ojibwa',
        code: 'oj'
      }, {
        name: 'Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic',
        code: 'cu'
      }, {
        name: 'Oromo',
        code: 'om'
      }, {
        name: 'Oriya',
        code: 'or'
      }, {
        name: 'Ossetian, Ossetic',
        code: 'os'
      }, {
        name: 'Panjabi, Punjabi',
        code: 'pa'
      }, {
        name: 'Pāli',
        code: 'pi'
      }, {
        name: 'Persian',
        code: 'fa'
      }, {
        name: 'Polish',
        code: 'pl'
      }, {
        name: 'Pashto, Pushto',
        code: 'ps'
      }, {
        name: 'Portuguese',
        code: 'pt'
      }, {
        name: 'Quechua',
        code: 'qu'
      }, {
        name: 'Romansh',
        code: 'rm'
      }, {
        name: 'Kirundi',
        code: 'rn'
      }, {
        name: 'Romanian, Moldavian, Moldovan',
        code: 'ro'
      }, {
        name: 'Russian',
        code: 'ru'
      }, {
        name: 'Sanskrit (Saṁskṛta)',
        code: 'sa'
      }, {
        name: 'Sardinian',
        code: 'sc'
      }, {
        name: 'Sindhi',
        code: 'sd'
      }, {
        name: 'Northern Sami',
        code: 'se'
      }, {
        name: 'Samoan',
        code: 'sm'
      }, {
        name: 'Sango',
        code: 'sg'
      }, {
        name: 'Serbian',
        code: 'sr'
      }, {
        name: 'Scottish Gaelic; Gaelic',
        code: 'gd'
      }, {
        name: 'Shona',
        code: 'sn'
      }, {
        name: 'Sinhala, Sinhalese',
        code: 'si'
      }, {
        name: 'Slovak',
        code: 'sk'
      }, {
        name: 'Slovene',
        code: 'sl'
      }, {
        name: 'Somali',
        code: 'so'
      }, {
        name: 'Southern Sotho',
        code: 'st'
      }, {
        name: 'Spanish; Castilian',
        code: 'es'
      }, {
        name: 'Sundanese',
        code: 'su'
      }, {
        name: 'Swahili',
        code: 'sw'
      }, {
        name: 'Swati',
        code: 'ss'
      }, {
        name: 'Swedish',
        code: 'sv'
      }, {
        name: 'Tamil',
        code: 'ta'
      }, {
        name: 'Telugu',
        code: 'te'
      }, {
        name: 'Tajik',
        code: 'tg'
      }, {
        name: 'Thai',
        code: 'th'
      }, {
        name: 'Tigrinya',
        code: 'ti'
      }, {
        name: 'Tibetan Standard, Tibetan, Central',
        code: 'bo'
      }, {
        name: 'Turkmen',
        code: 'tk'
      }, {
        name: 'Tagalog',
        code: 'tl'
      }, {
        name: 'Tswana',
        code: 'tn'
      }, {
        name: 'Tonga (Tonga Islands)',
        code: 'to'
      }, {
        name: 'Turkish',
        code: 'tr'
      }, {
        name: 'Tsonga',
        code: 'ts'
      }, {
        name: 'Tatar',
        code: 'tt'
      }, {
        name: 'Twi',
        code: 'tw'
      }, {
        name: 'Tahitian',
        code: 'ty'
      }, {
        name: 'Uighur, Uyghur',
        code: 'ug'
      }, {
        name: 'Ukrainian',
        code: 'uk'
      }, {
        name: 'Urdu',
        code: 'ur'
      }, {
        name: 'Uzbek',
        code: 'uz'
      }, {
        name: 'Venda',
        code: 've'
      }, {
        name: 'Vietnamese',
        code: 'vi'
      }, {
        name: 'Volapük',
        code: 'vo'
      }, {
        name: 'Walloon',
        code: 'wa'
      }, {
        name: 'Welsh',
        code: 'cy'
      }, {
        name: 'Wolof',
        code: 'wo'
      }, {
        name: 'Western Frisian',
        code: 'fy'
      }, {
        name: 'Xhosa',
        code: 'xh'
      }, {
        name: 'Yiddish',
        code: 'yi'
      }, {
        name: 'Yoruba',
        code: 'yo'
      }, {
        name: 'Zhuang, Chuang',
        code: 'za'
      }]
    },
    quotePaymentTerms () {
      return [{
        name: `0 ${this.$t('quoteDays')}`,
        id: 0
      }, {
        name: `7 ${this.$t('quoteDays')}`,
        id: 7
      }, {
        name: `10 ${this.$t('quoteDays')}`,
        id: 10
      }, {
        name: `14 ${this.$t('quoteDays')}`,
        id: 14
      }, {
        name: `15 ${this.$t('quoteDays')}`,
        id: 15
      }, {
        name: `20 ${this.$t('quoteDays')}`,
        id: 20
      }, {
        name: `25 ${this.$t('quoteDays')}`,
        id: 25
      }, {
        name: `30 ${this.$t('quoteDays')}`,
        id: 30
      }, {
        name: `40 ${this.$t('quoteDays')}`,
        id: 40
      }, {
        name: `45 ${this.$t('quoteDays')}`,
        id: 45
      }, {
        name: `60 ${this.$t('quoteDays')}`,
        id: 60
      }]
    },
    quotePaymentTypes () {
      return [{
        id: 1,
        name: 'Standard'
      }]
    },
    quoteStatus () {
      return [{
        id: 'draft',
        name: this.$t('quoteDraft')
      }, {
        id: 'completed',
        name: this.$t('quoteCompleted')
      }]
    },
    inventCompItem () {
      return ['OK', 'Def', 'R', 'J', 'S', 'E']
    },
    timerPermissions () {
      return [{
        text: this.$t('canEditOthersHours'),
        value: 1
      }, {
        text: this.$t('canApproveOthersHours'),
        value: 2
      }]
    },
    hourTypes () {
      return [{
        _id: 1,
        name: 'Normal hrs'
      }, {
        _id: 2,
        name: '50% overtime'
      }, {
        _id: 3,
        name: '100% overtime'
      }]
    },
    listSentEmailOptions () {
      return [{
        value: 1,
        title: this.$t('onlyPdf')
      }, {
        value: 2,
        title: this.$t('onlyXlsx')
      }, {
        value: 3,
        title: this.$t('both')
      }]
    },
    filterItemsDefault () {
      return [{
        text: this.$t('is'),
        value: 'is'
      }, {
        text: this.$t('isNot'),
        value: 'isnot'
      }, {
        text: this.$t('contains'),
        value: 'contains'
      }, {
        text: this.$t('startsWith'),
        value: 'startswith'
      }, {
        text: this.$t('endsWith'),
        value: 'endswith'
      }]
    },
    filterItemsSelect () {
      return [{
        text: this.$t('is'),
        value: 'is'
      }, {
        text: this.$t('isNot'),
        value: 'isnot'
      }]
    },
    filterItemsBoolen () {
      return [{
        text: this.$t('equalTo'),
        value: 'equalto'
      }, {
        text: this.$t('notequal'),
        value: 'notequalto'
      }]
    },
    filterItemsNumber () {
      return [{
        text: this.$t('equalTo'),
        value: 'equalto'
      }, {
        text: this.$t('notequal'),
        value: 'notequalto'
      }, {
        text: this.$t('lessThan'),
        value: 'lessthan'
      }, {
        text: this.$t('lessThanEqualTo'),
        value: 'lessthanorequalto'
      }, {
        text: this.$t('greaterThan'),
        value: 'greaterthan'
      }, {
        text: this.$t('greaterThanEqualTo'),
        value: 'greaterthanorequalto'
      }]
    },
    filterItemsDate () {
      return [{
        text: this.$t('today'),
        value: 'today'
      }, {
        text: this.$t('thisWeek'),
        value: 'thisweek'
      }, {
        text: this.$t('lastWeek'),
        value: 'lastweek'
      }, {
        text: this.$t('thisMonth'),
        value: 'thismonth'
      }, {
        text: this.$t('lastMonth'),
        value: 'lastmonth'
      }, {
        text: this.$t('before'),
        value: 'before'
      }, {
        text: this.$t('after'),
        value: 'after'
      }, {
        text: this.$t('between'),
        value: 'between'
      }, {
        text: this.$t('withinPast'),
        value: 'withinpast'
      }, {
        text: this.$t('withinNext'),
        value: 'withinnext'
      }]
    },
    filterItemsSystemDate () {
      return [{
        text: this.$t('today'),
        value: 'today'
      }, {
        text: this.$t('thisWeek'),
        value: 'thisweek'
      }, {
        text: this.$t('lastWeek'),
        value: 'lastweek'
      }, {
        text: this.$t('thisMonth'),
        value: 'thismonth'
      }, {
        text: this.$t('lastMonth'),
        value: 'lastmonth'
      }, {
        text: this.$t('before'),
        value: 'before'
      }, {
        text: this.$t('after'),
        value: 'after'
      }, {
        text: this.$t('between'),
        value: 'between'
      }, {
        text: this.$t('withinPast'),
        value: 'withinpast'
      }]
    },
    filterItemsTime () {
      return [{
        text: this.$t('is'),
        value: 'is'
      }, {
        text: this.$t('isNot'),
        value: 'isnot'
      }, {
        text: this.$t('between'),
        value: 'between'
      }, {
        text: this.$t('before'),
        value: 'before'
      }, {
        text: this.$t('after'),
        value: 'after'
      }]
    },
    listOfRouteActions () {
      return [{
        id: this.ACTION_APPROVE_OR_DISAPPROVE,
        text: this.$t('approveordispprove')
      }, {
        id: this.ACTION_REVIEW_AND_MAKE_CHANGES,
        text: this.$t('reviewAndMakeChanges')
      }, {
        id: this.ACTION_ACKNOWLEDGE,
        text: this.$t('acknowledge')
      }, {
        id: this.ACTION_INFORMATION,
        text: this.$t('information')
      }]
    },
    listOfEscalationItems () {
      return [{
        text: this.$t('cancelTask'),
        id: this.ESCALATION_ACTION_CANCEL_WORKFLOW
      }, {
        text: this.$t('sendReminderRecipients'),
        id: this.ESCALATION_ACTION_SEND_REMINDER
      }]
    },
    listOfNotifyActions () {
      return [{
        id: this.NOTIFY_ON_ESCALATION,
        name: this.$t('ofEscalation')
      }, {
        id: this.NOTIFY_ON_ANY_PROGRESS,
        name: this.$t('anyProgress')
      }, {
        id: this.NOTIFY_ON_COMPLETION,
        name: this.$t('taskCompletion')
      }]
    },
    listOfWorkflowStatus () {
      return [{
        id: this.ACTION_APPROVED,
        name: this.$t('approved'),
        color: 'success'
      }, {
        id: this.ACTION_DISAPPROVED,
        name: this.$t('disApproved'),
        color: 'error'
      }, {
        id: this.ACTION_REVIEWED,
        name: this.$t('reviewed'),
        color: 'success'
      }, {
        id: this.ACTION_REJECTED,
        name: this.$t('rejected'),
        color: 'error'
      }, {
        id: this.ACTION_ACKNOWLEDGED,
        name: this.$t('acknowledged'),
        color: 'success'
      }, {
        id: this.ACTION_GOTIT,
        name: this.$t('gotIt'),
        color: 'primary'
      }]
    },
    listOfDocumentWorkflowStatus () {
      return [{
        id: this.STATUS_CREATED,
        name: this.$t('created'),
        color: '#1976D2'
      }, {
        id: this.STATUS_INPROGRESS,
        name: this.$t('inProgress'),
        color: '#1fcdee'
      }, {
        id: this.STATUS_COMPLETED,
        name: this.$t('completed'),
        color: 'green'
      }, {
        id: this.STATUS_CANCELLED,
        name: this.$t('cancelled'),
        color: 'red'
      }, {
        id: this.STATUS_ONHOLD,
        name: this.$t('onHold'),
        color: '#febe30'
      }, {
        id: this.STATUS_FORCE_COMPLETED,
        name: this.$t('forceComplete'),
        color: '#aad092'
      }]
    },
    $_requiredAndMinValidation () { /* min val is 5 */
      return [
        v => !!v || 'Required',
        v => (v > 4) || 'Minimum width is 5%'
      ]
    },
    allowedFeatures () {
      return [
        { id: 5, model: 'Sales And Marketing', price: 0, selected: false, qTip: this.$t('salesandMarketing'), icon: 'mdi-home-currency-usd', color: 'purple' },
        { id: 6, model: 'Checklist', price: 0, selected: false, qTip: this.$t('allowedfeaturesChecklist'), icon: 'mdi-note-text', color: '#FF9800' },
        // { id: 7, model: 'Booking', price: 0, selected: false, qTip: 'Provides option to manage booking with booking and portal' },
        { id: 10, model: 'Timer', price: 0, selected: false, qTip: this.$t('allowedfeaturesTimer'), icon: 'mdi-timer', color: '#C62828' },
        { id: 11, model: 'Tickets', price: 0, selected: false, qTip: this.$t('allowedfeaturesTickets'), icon: 'mdi-cards-outline', color: '#009688' },
        { id: 20, model: 'Tripletex Integration', price: 0, selected: false, qTip: this.$t('tripletexintegration'), icon: 'mdi-alpha-t-circle-outline', color: '#689F38' }
        // { id: 21, model: 'Docusign Integration', price: 0, selected: false, qTip: 'You can sync your tripletex records to our system' }
      ]
    },
    menuItems () {
      const ticketObj = {
        title: 'Incident',
        icon: 'mdi-chemical-weapon',
        items: [{
          title: 'incidents',
          description: 'incidentsTypes',
          to: '/incidents'
        }, {
          title: 'customerPortal',
          description: 'customerPortal',
          to: '/customerportal'
        }
        // {
        //   title: 'mailboxConfiguration',
        //   description: 'mailboxConfigurationInfo',
        //   to: '/mail_configuration'
        // },
        // {
        //   title: 'mailaddressFilter',
        //   description: 'mailaddressFilterInfo',
        //   to: '/mailaddressfilter'
        // }
        // {
        //   title: 'ticketStatus',
        //   description: 'ticketStatusInfo',
        //   to: '/ticketstatus'
        // }, {
        //   title: 'ticketCategories',
        //   description: 'ticketCategoriesInfo',
        //   to: '/ticketcategories'
        // }, {
        //   title: 'ticketPriority',
        //   description: 'ticketPeriority',
        //   to: '/ticketpriority'
        // },
        // {
        //   title: 'advanced',
        //   description: 'advancedInfo',
        //   to: '/advanced-tickets'
        // }, {
        //   title: 'ticketCustomFields',
        //   description: 'customfieldInfo',
        //   to: '/ticket_custom_fields'
        // }
        ]
      }
      const timerObj = {
        title: 'timer',
        icon: 'mdi-timer',
        items: [{
          title: 'generalSettings',
          description: 'generalSettingsInfo',
          to: 'timer-settings'
        }, {
          title: 'formSettings',
          description: 'formSettingsInfo',
          to: '/timerform_settings'
        }, {
          title: 'workTypes',
          description: 'workTypeInfo',
          to: '/worktype'
        },
        {
          title: 'timeCode',
          description: 'timeCodeInfo',
          to: '/timecodes'
        }, {
          title: 'permission',
          description: 'permissionInfo',
          to: '/timerpermissions'
        }, {
          title: 'timeRange',
          description: 'timeRangeinfo',
          to: '/timerange'
        }]
      }
      const checklistObj = {
        title: 'checklist',
        icon: 'mdi-note-text',
        items: [
          {
            title: 'Properties',
            description: 'propertiesInfo',
            to: '/properties'
          },
          {
            title: 'Templates',
            description: 'templates',
            to: '/checklist_templates'
          }
        ]
      }
      let items = [{
        title: 'generalSettings',
        icon: 'mdi-message-cog',
        items: [{
          title: 'systemconfiguration',
          description: 'systemConfigurationInfo',
          to: '/systemconfiguration'
        }]
      }, {
        title: 'languageSettings',
        icon: 'mdi-translate',
        items: [{
          title: 'language',
          description: 'languageInfo',
          to: '/language'
        }, {
          title: 'translation',
          description: 'translationInfo',
          to: '/translations'
        }]
      }, {
        title: 'sharepoint',
        icon: 'mdi-microsoft-sharepoint',
        isShow: this.userDetails.issharepointstorage,
        items: [{
          title: 'sharePointSettings',
          description: 'sharPointSettingsInfo',
          to: '/sharepoint'
        }]
      },
      {
        title: 'userManagement',
        icon: 'mdi-account-multiple',
        items: [{
          title: 'users',
          description: 'usersInfo',
          to: '/users'
        }, {
          title: 'groups',
          description: 'groupsInfo',
          to: '/groups'
        }, {
          title: 'tenantCreation',
          description: 'tenantCreation',
          to: '/tenantcreationaccess'
        }]
      }, {
        title: 'modulesAndFields',
        icon: 'mdi-view-module',
        items: [{
          title: 'customizeModules',
          description: 'customizeModulesInfo',
          to: '/modules'
        }, {
          title: 'folderSettings',
          description: 'sharPointSettingsInfo',
          isShow: !this.userDetails.issharepointstorage,
          to: '/folder_settings'
        }]
      }, {
        title: 'webhook',
        icon: 'mdi-google-circles-extended',
        items: [{
          title: 'subscriptions',
          description: 'subscriptionsInfo',
          to: '/subscriptions'
        }, {
          title: 'status',
          description: 'statusInfo',
          to: '/webhook_status'
        }]
      }, {
        title: 'integrations',
        icon: 'mdi-all-inclusive',
        isIntegration: true,
        items: [{
          title: 'integrationOptions',
          description: 'integrationOptionInfo',
          to: '/integration_options'
        }, {
          title: 'tripletex',
          description: 'tripletexOptionInfo',
          to: '/tripletex',
          isShow: this.userDetails.allowedfeatures && this.userDetails.allowedfeatures.length > 0 ? (this.getIntegrations.tripletex && this.userDetails.allowedfeatures.includes(this.TRIPLETEX_INTEGRATION)) : false
        }, {
          title: 'docushare',
          description: 'docushareInfo',
          to: '/docushare',
          isShow: this.getIntegrations.docushare
        }, {
          title: 'docusign',
          description: 'docusignInfo',
          to: '/docusign',
          isShow: this.userDetails.allowedfeatures && this.userDetails.allowedfeatures.length > 0 ? (this.getIntegrations.docusign && this.userDetails.allowedfeatures.includes(this.DOCUSIGN_INTEGRATION)) : false
        }, {
          title: 'siesmart',
          description: 'siesmartInfo',
          to: '/siesmart',
          isShow: this.getIntegrations.siesmart
        }, {
          title: 'uni',
          description: 'uniInfo',
          to: '/uni',
          isShow: this.getIntegrations.uni
        }]
      }, {
        title: 'project',
        icon: 'mdi-book',
        items: [{
          title: 'roles',
          description: 'rolesInfo',
          to: '/projectroles'
        }]
      }, {
        title: 'statistics',
        icon: 'mdi-chart-pie',
        items: [{
          title: 'overAll',
          description: 'overAllInfo',
          to: '/statistics-overall'
        }]
      }, {
        title: 'documents',
        icon: 'mdi-file-document-edit-outline',
        items: [{
          title: 'templates',
          description: 'templatesInfo',
          to: '/templates'
        }]
      }, {
        title: 'marketing',
        icon: 'mdi-bullhorn',
        items: [{
          title: 'mailchimp',
          description: 'mailchimpInfo',
          to: '/mailchimp'
        }]
      }, {
        title: 'extensions',
        icon: 'mdi-puzzle',
        items: [{
          title: 'backend',
          description: 'backEndInfo',
          to: '/backend-extensions'
        }]
      }, {
        title: 'SMTP',
        icon: 'mdi-email',
        items: [{
          title: 'mailbox',
          description: 'mailboxInfo',
          to: '/smtp-mailbox'
        }]
      }]
      if (!this.userDetails.issharepointstorage) items.splice(2, 1)
      if (this.userDetails.allowedfeatures && this.userDetails.allowedfeatures.length > 0) {
        if (this.userDetails.allowedfeatures.includes(this.TICKETS)) items.splice(13, 0, ticketObj)
        if (this.userDetails.allowedfeatures.includes(this.TIMER)) items.splice(14, 0, timerObj)
        if (this.userDetails.allowedfeatures.includes(this.CHECKLISTS)) items.splice(12, 0, checklistObj)
      }
      return items
    },
    $baseImageURL () {
      return process.env.VUE_APP_IMAGE_URL || ''
    },
    $_appName () {
      // return 'avalia'
      return process.env.VUE_APP_LOGO_ICONS_FOLDER
    }
  },
  methods: {
    preventSpecialCharacters (e) {
      if (['(', ')', '[', ']', '\\', '*', '+', '?', '/', '!', '#', '$', '%', '^', '&'].includes(e.key)) e.preventDefault()
    },
    checkPermission () {
      if (this.$store.state.auth.userDetails._id === '-100' || this.$store.state.auth.userDetails.isadmin) this.$store.commit('hideSettingsLoader')
      else this.$router.push('/dashboard')
    },
    showUsersSelect (setDisabledForActiveUser) { // for switch worksapce selectedUsers
      if (this.tenantObj.whoHasAccessType === 3) {
        this.showUsers = true
        this.getListOfMSUsers(setDisabledForActiveUser, this.tenantObj.customerdomain)
        this.tenantObj.msUsers = [this.customerDomainInfo.email]
      } else this.showUsers = false
    },
    getListOfMSUsers (setDisabledForActiveUser, customerDomainFromTenant) {
      this.userLoading = true
      this.$api.execute('post', `initialsetup/get_domain_users?customerDomain=${customerDomainFromTenant || this.customerDomainInfo.customerdomain}`).then(response => {
        this.usersList = response.data
        /* Here add active user disable part */
        if (setDisabledForActiveUser) {
          let userIndex = this.usersList.findIndex(x => x.email === this.customerDomainInfo.email)
          if (userIndex > -1) this.usersList[userIndex].disabled = true
        }
      }).finally(() => {
        this.userLoading = false
      })
    },
    findDuplicateExists (listOfPermissionAssinged) {
      let permissions = listOfPermissionAssinged
      var valueArr = permissions.map(function (item) {
        return item.applicableEntityType
      })
      return valueArr.some(function (item, idx) {
        // eslint-disable-next-line
        return valueArr.indexOf(item) != idx
      })
    },
    // Timer report
    getStateName (state) {
      switch (state) {
        case this.DELIVERED:
          return this.$t('delivered')
        case this.NOT_DELIVERED:
          return this.$t('notDelivered')
        case this.NOT_APPROVED:
          return this.$t('notApproved')
        case this.APPROVED:
          return this.$t('approved')
      }
    },
    getWorkflowStatusName (status) {
      let resultFound = this.listOfDocumentWorkflowStatus.find(x => x.id === status)
      if (resultFound) return resultFound
      else return ''
    },
    getTime (hour) {
      let text = ''
      if (hour.start_date && hour.end_date) {
        let startTime = hour.start_date ? this.$formatter.formatDate(hour.start_date, 'DD.MM.YYYYTHH.mm.ss', 'HH:mm') : ''
        let endTime = hour.end_date ? this.$formatter.formatDate(hour.end_date, 'DD.MM.YYYYTHH.mm.ss', 'HH:mm') : ''
        text = `${startTime} - ${endTime}`
        return text
      } else return ''
    },
    checkForDuplicateNames (name, moduleName, element, index, id) {
      if (name && name !== 'undefined') {
        let query = [{ $match: { 'Data.name': name } }]
        this.$api.execute('post', `moduledata/${moduleName}/query`, query).then(response => {
          if (response.data.length > 0) {
            let filteredObj = response.data.find(x => x._id === id && x.data.name === name)
            if (!filteredObj) this.$root.$emit('snackbar', { snackbar: true, color: 'info', text: 'alreadyExists' })
          }
        })
        if (element) this.checkForValidationOrFunction(element, name, index)
      }
    },
    groupMultipleObjectEmailValue (array) {
      if (Array.isArray(array)) {
        return array.map(x => x.email).join(', ')
      }
    },
    getMimeTypeIcons (fileType = '') {
      let iconObj = {}
      switch (fileType) {
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          iconObj = {
            icon: 'mdi-file-word',
            color: 'primary'
          }
          break
        case 'application/pdf':
          iconObj = {
            icon: 'mdi-file-pdf',
            color: 'red'
          }
          break
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          iconObj = {
            icon: 'mdi-file-excel',
            color: 'green'
          }
          break
        default:
          iconObj = {
            icon: 'mdi-file',
            color: 'primary'
          }
      }
      return iconObj
    },
    getSizeInKBAndMB ({ size: sizeInBytes = 0, auto = false } = {}) {
      let kb = sizeInBytes / 1024
      let mb = kb / 1024

      kb = +kb.toFixed(2)
      mb = +mb.toFixed(2)

      if (auto) {
        if (mb <= 1) return kb + ' kb'
        return mb + ' mb'
      }
      return { kb, mb }
    },
    toBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        if (file) {
          reader.readAsDataURL(file)
        }
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    getUsername (id) {
      if (id) {
        let userFound = this.getUsers.find(x => x._id === id)
        if (userFound) return userFound.name
        else return ''
      } else return ''
    },
    getGroupName (id) {
      if (id) {
        let groupFound = this.getUserGroups.find(x => x._id === id)
        if (groupFound) return groupFound.name
        else return ''
      }
    },
    // Encode the String
    encodeStringTobase64 (string) {
      if (string) return btoa(string)
    },
    // Decode the String
    decodeStringTobase64 (string) {
      if (string) return atob(string)
    },
    navigateToOD (document) {
      window.open(document.path, '_blank')
    },
    updateAppUserCookie () {
      var date = new Date()
      date.setDate(date.getDate() + 4)
      this.$cookie.set(process.env.VUE_APP_USER, JSON.stringify(encrypt(this.$store.state.auth.userDetails)), { expires: date })
    },
    afterTenantCreationHandler (loginData, switchingWorkspace) {
      if (loginData.isactive) {
        this.$store.state.common.loadRouter = true
        localStorage.removeItem(process.env.VUE_APP_CUSTOMERSETUP)
        this.$store.dispatch('loginInitalSetup', loginData).then(() => {
          if (loginData.issharepointstorage) {
            this.$api.execute('get', 'sharepointsetting').then((response) => {
              this.$root.$emit('setSignalrAndNotification')
              this.$root.$emit('notificationUnreadCount')
              let sharepointSetting = response.data
              this.$store.dispatch('fetchIntegrations')
              this.$store.dispatch('getUserGroups').then(() => {
                this.$store.dispatch('getModuleList').then(() => {
                  this.$store.dispatch('getUsers').then(() => {
                    this.$store.dispatch('getAppLanguages').then(() => {
                      if (switchingWorkspace && loginData.domain) {
                        loadLanguageAsync({ lang: this.$cookie.get(process.env.VUE_APP_LOCALE), domain: loginData.domain, forceUpdate: true })
                      }
                    })
                    if (sharepointSetting.siteid && sharepointSetting.list_id) {
                      this.$store.dispatch('getSharepointFields')
                    }
                    if (!loginData.sharepointconfigdone && loginData.isdomainadmin && !loginData.landingpageafterlogin) {
                      this.$router.push('/sharepoint')
                    } else if (!loginData.landingpageafterlogin) {
                      this.$router.push({ path: '/dashboard' })
                    }
                    this.getWorkspacesOfCurrentUser()
                    // } else if (!loginData.landingpageafterlogin) { this.$router.push({ path: this.$route.query.redirect || '/dashboard' }) }
                    this.$store.commit('stopRouteLoader')
                    if (loginData.landingpageafterlogin) this.$router.push(loginData.landingpageafterlogin)
                  })
                })
              })
            })
          } else {
            this.$root.$emit('setSignalrAndNotification')
            this.$root.$emit('notificationUnreadCount')
            this.$store.dispatch('systemNotification').then((response) => {
              this.$root.$emit('getSystemNotificationFromTenant', response)
              this.$store.dispatch('getUserGroups').then(() => {
                this.$store.dispatch('getModuleList').then(() => {
                  this.$store.dispatch('getUsers').then(() => {
                    this.$store.dispatch('getAppLanguages').then(() => {
                      if (switchingWorkspace && loginData.domain) {
                        loadLanguageAsync({ lang: this.$cookie.get(process.env.VUE_APP_LOCALE), domain: loginData.domain, forceUpdate: true })
                      }
                    })
                    if (loginData.isdomainadmin && !loginData.landingpageafterlogin) {
                      this.$router.push('/foldersync')
                    } else if (!loginData.landingpageafterlogin) {
                      this.$router.push('/dashboard')
                    }
                    // } else if (!loginData.landingpageafterlogin) { this.$router.push({ path: this.$route.query.redirect || '/dashboard' }) }
                    this.getWorkspacesOfCurrentUser()
                    this.$store.commit('stopRouteLoader')
                    // this.$store.state.common.loadRouter = false
                    if (loginData.landingpageafterlogin) this.$router.push(loginData.landingpageafterlogin)
                  })
                })
              })
            })
          }
        })
      } else this.$root.$emit('snackbar', { snackbar: true, color: 'apiError', text: "Sorry! You don't have access to this workspace. Please contact your Administrator.", isException: true })
    },
    openMail (email) {
      window.location.href = `mailto:${email}?subject=&body=`
    },
    openDialpad (number) {
      window.location.href = `tel:${number}`
    },
    // openRewardChecklist(val, obj) {
    //   console.log(val, obj)
    // },
    getNestedObject (nestedObj, pathArr) {
      return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj)
    },
    sortingByType (items, index, isDesc, tableColumnTypes) {
      return items.sort((a, b) => {
        let array = index[0].split('.')
        let aValue = this.getNestedObject(a, array)
        let bValue = this.getNestedObject(b, array)
        if (tableColumnTypes.date.includes(index[0])) {
          if (aValue && bValue) {
            // if (isDesc[0]) return moment.utc(moment(bValue, 'DD.MM.YYYY')).diff(moment.utc(moment(aValue, 'DD.MM.YYYY')))
            // else return moment.utc(moment(aValue, 'DD.MM.YYYY')).diff(moment.utc(moment(bValue, 'DD.MM.YYYY')))
            if (isDesc[0]) return moment.utc(moment(bValue, this.userDetails.dateformat)).diff(moment.utc(moment(aValue, this.userDetails.dateformat)))
            else return moment.utc(moment(aValue, this.userDetails.dateformat)).diff(moment.utc(moment(bValue, this.userDetails.dateformat)))
          } else return 0
        } else if (tableColumnTypes.number.includes(index[0])) {
          let item1 = isDesc[0] ? aValue : bValue
          let item2 = isDesc[0] ? bValue : aValue
          return item1 - item2
        } else {
          let item1 = isDesc[0] ? aValue : bValue
          let item2 = isDesc[0] ? bValue : aValue
          if (item1) item1 = item1.toLowerCase()
          if (item2) item2 = item2.toLowerCase()
          if (!item1 || item1 < item2) return -1
          if (!item2 || item1 > item2) return 1
          return 0
        }
      })
    },
    getCommentsHistory (hourId) {
      this.commentsLoader = true
      this.$api.execute('get', `timerconversations/get_comment/${hourId}`).then(response => {
        this.listOfComments = response.data
      }).finally(() => {
        this.commentsLoader = false
        this.commentsHistoryDialog = true
      })
    },
    getWorkspacesOfCurrentUser () {
      this.tenantListLoading = true
      this.$api.execute('get', `switchworkspaces/get_workspace/${this.userDetails._id}`).then(response => {
        // this.removeOtpFromUrl()
        this.tenantListLoading = false
        response.data.availabletenants = response.data.availabletenants.filter(x => x.company)
        this.$store.commit('setListValues', { type: 'listOfTenantsAndWorkspaces', data: response.data.availabletenants })
      })
    },
    removeOtpFromUrl () {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.has('otp')) {
        // const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete('otp')
        let newPath = this.$route.fullPath.replace('/emailverification', '/dashboard')
        let newUrl = `${window.location.origin}${newPath.split('?')[0]}?${searchParams.toString()}`
        this.$router.push('/dashboard')
        window.history.pushState({ path: newUrl }, '', newUrl)
        this.$router.replace('/dashboard')
      }
    }
  },
  filters: {
    firstLetterCaptialize (string) {
      if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
      } else return ''
    }
  }
}
