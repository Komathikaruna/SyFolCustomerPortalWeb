export default {
  methods: {
    // Common validation rules handler
    rulesHandler (item, value) {
      if (item.type === 14 && value) return this.$_phoneNumberValidationWithCC
      if (item && item.validation) {
        if ((item.type === 5 || item.type === 15) && item.default_value && item.default_value.is_multiselect && value && !value.length) return this.getValidation(item.validation, 'multiselect')
        else if (!value) return this.getValidation(item.validation, null)
        else if (!value && item.type === 14) return [...this.$_phoneNumberValidationWithCC, ...this.$_requiredValidation]
        else if (item.validationscript) {
          let validationScript = this.decodeStringTobase64(item.validationscript)
          validationScript = `var valid;\n${validationScript}\n return valid`
          // eslint-disable-next-line
          let validationFunction = new Function('instance', 'input', 'data', validationScript)
          let result = validationFunction(this, value, this.fields)
          return result ? [result] : []
        }
      }
    },
    getValidation (validate, type = null) {
      if (validate === 'required') return (type) ? this.$_multiSelectValidation : this.$_requiredValidation
      else return null
    }
  }
}
