export default {
  data () {
    return {
      editorAddLinkMenu: false,
      editorMentionsMenu: false,
      editorMentionsMenuPos: {},
      editorLoading: false,
      commentFiles: [],
      editorLinkContent: 'https://',
      showEditor: false,
      editActivityObj: null,
      mentionUserSearch: '',
      mentionUserList: [],
      selectedUser: null,
      caretActiveElement: null,
      selection: null,
      selectionString: '',
      overedRow: 0,
      overedCol: 0,
      editorTableMenu: false,
      insertColumnItems: [{
        title: 'Insert column left',
        value: 'left'
      }, {
        title: 'Insert column right',
        value: 'right'
      }, {
        title: 'Delete column',
        value: 'delete'
      }],
      insertRowItems: [{
        title: 'Insert row above',
        value: 'above'
      }, {
        title: 'Insert row below',
        value: 'below'
      }, {
        title: 'Delete row',
        value: 'delete'
      }],
      mergeCellItems: [{
        title: 'Merge cell up',
        value: 'up'
      }, {
        title: 'Merge cell down',
        value: 'down'
      }, {
        title: 'Merge cell right',
        value: 'right'
      }, {
        title: 'Merge cell left',
        value: 'left'
      }],
      textAlignments: [{ title: 'justifyLeft', icon: 'mdi-format-align-left' }, { title: 'justifyFull', icon: 'mdi-format-align-justify' }, { title: 'justifyCenter', icon: 'mdi-format-align-center' }, { title: 'justifyRight', icon: 'mdi-format-align-right' }],
      headings: [{ title: 'h1', text: 'Heading1' }, { title: 'h2', text: 'Heading2' }, { title: 'h3', text: 'Heading3' }, { title: 'h4', text: 'Heading4' }, { title: 'h5', text: 'Heading5' }, { title: 'h6', text: 'Heading6' }],
      fontSizes: [{ title: 'Tiny', size: 2 }, { title: 'Small', size: 1 }, { title: 'Default', size: 3 }, { title: 'Big', size: 4 }, { title: 'Huge', size: 5 }],
      fontStyleDesigns: [{ command: 'bold', icon: 'mdi-alpha-b' }, { command: 'italic', icon: 'mdi-alpha-i' }, { command: 'underline', icon: 'mdi-alpha-u' }, { command: 'strikethrough', icon: 'mdi-format-strikethrough' }],
      insertOrderAndUnorderLists: [{ command: 'insertOrderedList', icon: 'mdi-format-list-numbered' }, { command: 'insertUnorderedList', icon: 'mdi-format-list-bulleted' }],
      color: '#000000',
      rowValue: null,
      colValue: null,
      tbodyValue: null,
      trowValue: null,
      mergeCellRow: null,
      mergeCellCol: null,
      selectedRowOnAction: null,
      editorTextAlignmentMenu: false,
      editorHeadingMenu: false
    }
  },
  mounted () {
    window.onkeydown = (ev) => {
      if (!ev) return
      if ((ev.key === 'Backspace')) { // handle backspace event at texteditor
        if ((this.$refs.menuListSearch && !this.$refs.menuListSearch.hasFocused)) {
          this.editorMentionsMenu = false
        }
      }
      setTimeout(() => this.updateEditorValue(), 0)
    }
  },
  watch: {
    mentionUserSearch: {
      handler (term) {
        if (term) {
          this.mentionUserList = this.getUsers.filter((user) => (!!user.isactive && (user._id !== this.userDetails._id) && user.name.toLowerCase().includes(term.toLowerCase())))
        } else {
          this.mentionUserList = this.getUsers.filter((user) => !!user.isactive && (user._id !== this.userDetails._id))
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ctrlButtons () {
      return [{
        icon: 'mdi-format-font',
        title: this.$t('Font styles'),
        class: '',
        isdropDownIcon: true,
        isButtonHandler: true
      }, {
        icon: 'mdi-format-list-bulleted-type',
        title: this.$t('numberedList'),
        class: 'mx-1',
        isdropDownIcon: true,
        isInsertList: true
      }, {
        icon: 'mdi-table',
        title: 'insert table',
        class: '',
        isTableHandler: true,
        click: (row, col) => {
          this.executeJSCommand({ command: 'insertTable', value: this.generateTable(row, col) })
        }
      }, {
        icon: 'mdi-link-variant',
        title: this.$t('pageLink'),
        class: 'mx-1',
        isLinkHandler: true,
        click: () => {
          const anchorNode = window.getSelection().anchorNode.parentElement
          const focusNode = window.getSelection().focusNode.parentElement
          let element
          if (anchorNode.hasAttribute('href')) element = anchorNode
          if (!element && focusNode.hasAttribute('href')) element = focusNode
          if (element) {
            window.getSelection().selectAllChildren(element)
            this.selection = this.saveSelection()
            this.editorLinkContent = element.getAttribute('href')
            this.selectionString = element.textContent
            this.editorAddLinkMenu = true
            return
          }

          const selectedSelectionString = window.getSelection().toString().trim()
          if (selectedSelectionString.length) {
            this.selection = this.saveSelection()
            this.selectionString = selectedSelectionString
            this.editorLinkContent = 'https://'
            this.editorAddLinkMenu = true
          } else {
            this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'plsMakeSelection' })
          }
          setTimeout(() => this.updateEditorValue(), 0)
        }
      }, {
        icon: 'mdi-format-indent-increase',
        title: 'indent',
        class: 'mx-1',
        click: () => this.executeJSCommand({ command: 'indent' })
      }, {
        icon: 'mdi-format-annotation-plus',
        title: 'textAlignment',
        class: '',
        isdropDownIcon: true,
        istextAlignmentHandler: true
      }, {
        icon: 'mdi-format-color-text',
        title: 'font size',
        class: 'mx-1',
        isFontSizeHandler: true,
        isdropDownIcon: true
      }, {
        icon: 'mdi-border-color',
        title: 'font color',
        class: '',
        isFontColorHandler: true,
        isdropDownIcon: true
      }, {
        title: 'heading',
        class: 'mx-1',
        isdropDownIcon: true,
        headingHandler: true
      }, {
        title: 'Insert Image',
        class: '',
        isImageUpload: true
      }, {
        icon: 'mdi-restore',
        title: this.$t('restore'),
        class: 'mx-1',
        click: () => {
          const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
          editorElem.innerHTML = ''
          // eslint-disable-next-line
          this.commentFiles = []
          // eslint-disable-next-line
          this.editActivityObj = null
          editorElem.focus()
          this.inputvalue = { reset: true } // validating this input in texteditor component
        }
      }]
    },
    domainValidation () {
      return [
        (v) => v ? /(((https?:\/\/)|(www\.))[^\s]+)$/g.test(v) || 'Invalid Domain Address' : true
      ]
    }
  },
  methods: {
    onKeyPressComment (event) {
      setTimeout(() => { // create first { div } element
        const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
        if (!editorElem.children.length) {
          let caretActiveElement = window.getSelection().anchorNode.parentElement
          if (caretActiveElement.hasAttribute('data-editor-root-container')) {
            caretActiveElement = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
          }
          if (caretActiveElement.innerHTML.length === 1) {
            caretActiveElement.innerHTML = `<div data-row-container="1">${caretActiveElement.innerHTML}</div>`
            this.setCaretPosition(caretActiveElement, 1)
          }
        }
      }, 0)

      if (((event.code === 'Enter') || (event === 'enter')) && (!event.ctrlKey)) {
        const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
        setTimeout(() => {
          let divRowElementIndex = 1
          for (let divRowElement of editorElem.children) {
            divRowElement.setAttribute('data-row-container', divRowElementIndex)
            divRowElementIndex += 1
          }
        }, 0)
      }
      // handling only { ctrl + enter }
      // if ((event.code === 'Enter' && event.ctrlKey) && (!event.shiftKey)) {
      //   this.addNewComment()
      // }
      // handling { @ } and other keypress events
      if (event.key === '@') {
        event.preventDefault()
        this.executeJSCommand({ command: 'insertHTML', value: `<span id="atChar">@</span>` })
        let caretPos = this.getCaretCoordinates()
        caretPos = caretPos || { x: 80, y: 278 }
        this.editorMentionsMenuPos = { top: (caretPos.y + 7), left: (caretPos.x - 5) }
        this.mentionUserSearch = ''
        this.caretActiveElement = window.getSelection().anchorNode.parentElement
        this.editorMentionsMenu = true
      } else {
        this.editorMentionsMenu = false
      }
      setTimeout(() => this.updateEditorValue(), 0) // update input value
    },
    onKeyDownComment (event) {
      if (event.keyCode === 9) {
        event.preventDefault()
        document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`).ownerDocument.execCommand('indent', false, '')
      }
    },
    async onImageUploadEvent (event) { // image Uploaded
      var blob = await this.toBase64(event)
      const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
      let divElement = document.createElement('div')
      divElement.innerHTML = `<div data-row-container="1">
        <img src="${blob}" alt="image" style="height:100px">
      </div>`
      if (this.caretActiveElement != null) {
        this.caretActiveElement[(this.caretActiveElement.id === 'commentEditor') ? 'appendChild' : 'after'](divElement)
        if (divElement === divElement.parentNode.children[divElement.parentNode.children.length - 1]) {
          let lastDivElement = document.createElement('div')
          lastDivElement.innerHTML = '<br/>'
          divElement.after(lastDivElement)
          this.setCaretPosition(lastDivElement, 1)
        }
        setTimeout(() => {
          let divRowElementIndex = 1
          for (let divRowElement of editorElem.children) {
            divRowElement.setAttribute('data-row-container', divRowElementIndex)
            divRowElementIndex += 1
          }
        }, 0)
        this.onKeyPressComment('enter')
        this.setCaretPosition(editorElem, 1)
      }
    },
    divRowElementIndex () {
      const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
      if (this.editorElem != null) {
        this.editorElem = window.getSelection().anchorNode.parentElement
        setTimeout(() => {
          let divRowElementIndex = 1
          for (let divRowElement of editorElem.children) {
            divRowElement.setAttribute('data-row-container', divRowElementIndex)
            divRowElementIndex += 1
          }
        }, 0)
      }
    },
    onEditorPasteEvent (event) { // handles onpaste event in texteditor
      event.preventDefault()
      let pastedText = (event.originalEvent || event).clipboardData.getData('Text') // gets pasted text as it is with styles
      let isImagePasted = false
      if (pastedText && pastedText.length) {
        pastedText = (event.originalEvent || event).clipboardData.getData('text/plain') // gets pasted text as plain without any styles
        pastedText = this.detectURLs(pastedText)
      } else {
        let item = (event.originalEvent || event).clipboardData.items[0]
        if (item.type.indexOf('image') === 0 || (item.type && item.type.includes('image'))) {
          let blob = item.getAsFile()
          let reader = new FileReader()
          reader.onload = (event) => {
            isImagePasted = true
            pastedText = event.target.result
          }
          reader.readAsDataURL(blob)
        }
      }
      setTimeout(() => {
        let caretActiveElement = window.getSelection().anchorNode.parentElement
        if (caretActiveElement.hasAttribute('data-editor-root-container')) {
          caretActiveElement = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
        }
        if (isImagePasted) {
          if (event.target.hasAttribute('data-row-container')) {
            event.target.innerHTML += `
              <img src="${pastedText}" alt="image" style="height:100px">
            `
            this.onKeyPressComment('enter')
            this.setCaretPosition(caretActiveElement)
          } else {
            if (event.target.parentElement.hasAttribute('data-row-container')) { // to avoid inserting image into { <br> } like tags
              caretActiveElement = event.target.parentElement
              if (caretActiveElement.firstChild.nodeName === 'BR') caretActiveElement.firstChild.remove()
              caretActiveElement.innerHTML += `
                <img src="${pastedText}" alt="image" style="height:100px">
              `
              this.onKeyPressComment('enter')
              this.setCaretPosition(caretActiveElement)
            } else { // to insert root tag when there isn't one
              caretActiveElement.innerHTML += `
              <div data-row-container="1">
                <img src="${pastedText}" alt="image" style="height:100px">
              </div>
              `
              this.onKeyPressComment('enter')
              this.setCaretPosition(caretActiveElement)
            }
          }
        } else {
          const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
          if (editorElem.children.length) {
            this.executeJSCommand({ command: 'insertHTML', value: pastedText })
          } else {
            caretActiveElement.innerHTML = `<div data-row-container="1">${pastedText}&nbsp;</div>`
            this.onKeyPressComment('enter')
            this.setCaretPosition(caretActiveElement, 1)
          }
        }
      }, 10)
    },
    executeJSCommand ({ command, value }) {
      const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
      if (command === 'insertUser') {
        if (this.caretActiveElement.innerHTML) {
          this.caretActiveElement.innerHTML += `<span id="data-mention-container"><span data-user-id="${value._id}" data-user-email="${value.email}" class="font-weight-medium user-mention" disabled>${value.name}</span>&nbsp;</span>`
        }
        this.setCaretPosition(this.caretActiveElement)
        this.editorMentionsMenu = false
      } else if (command === 'createLink') {
        if (this.$refs.editorLinkContentForm[0] && this.$refs.editorLinkContentForm[0].validate()) {
          this.restoreSelection(this.selection)
          editorElem.ownerDocument.execCommand(command, false, value)
          this.editorLinkContent = null
          this.editorAddLinkMenu = false
          this.clearSelection()
          // this.setCaretPosition(editorElem, 1)
        } else {
          this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: 'validationIssue' })
        }
      } else if (command === 'unlink') {
        this.restoreSelection(this.selection)
        editorElem.target.ownerDocument.execCommand(command, false, '')
        this.editorAddLinkMenu = false
        this.clearSelection()
      } else if (command === 'textAlignment') {
        this.editorTextAlignmentMenu = true
      } else if (command === 'insertTable' && this.caretActiveElement) {
        const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
        setTimeout(() => {
          let divRowElementIndex = 1
          for (let divRowElement of editorElem.children) {
            divRowElement.setAttribute('data-row-container', divRowElementIndex)
            divRowElementIndex += 1
          }
        }, 0)
        let divElement = document.createElement('div')
        divElement.innerHTML = value
        this.caretActiveElement[(this.caretActiveElement.id === 'commentEditor') ? 'appendChild' : 'after'](divElement)
        if (divElement === divElement.parentNode.children[divElement.parentNode.children.length - 1]) {
          let lastDivElement = document.createElement('div')
          lastDivElement.innerHTML = '<br/>'
          divElement.after(lastDivElement)
          this.setCaretPosition(lastDivElement, 1)
        }
        setTimeout(() => {
          document.querySelectorAll('.setColumn').forEach((elem) => this.eventLisnerForTable(elem))
        }, 0)
      } else {
        editorElem.ownerDocument.execCommand(command, false, value)
      }
      setTimeout(() => this.updateEditorValue(), 0) // update input value
    },

    executeJsFontCommand (command, title) {
      var editorTextElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
      if (title) {
        editorTextElem.ownerDocument.execCommand(command, false, title)
      } else {
        editorTextElem.ownerDocument.execCommand(command, false, '')
      }
      setTimeout(() => this.updateEditorValue(), 0)
    },

    executeJsHeadingCommand (command, title) {
      var editorTextElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
      editorTextElem.ownerDocument.execCommand('formatblock', false, title)
      if (editorTextElem.firstChild.tagName.toLowerCase() !== 'div') {
        const parentDiv = document.createElement('div')
        parentDiv.setAttribute('data-row-container', 1)
        editorTextElem.insertBefore(parentDiv, editorTextElem.firstChild)
      }
      setTimeout(() => this.updateEditorValue(), 0)
    },

    getCaretCoordinates () { // this method returns the coordinates of the caret
      let result = {}
      if (typeof window.getSelection !== 'undefined') {
        const selection = window.getSelection()
        if (selection.rangeCount) {
          const range = selection.getRangeAt(0).cloneRange()
          range.collapse(true)
          result = range.getClientRects()[0]
        }
      }
      return result
    },
    // to set caret position immediately after pasted or entered { text/ element }
    setCaretPosition (element, caretPos = 2) {
      let range = document.createRange()
      let sel = window.getSelection()
      range.setStart(element, caretPos)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      element.focus()
    },
    onEditorClickEvent () {
      setTimeout(() => { // create first { div } element
        const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
        if (!editorElem.children.length) {
          this.caretActiveElement = editorElem
        } else {
          let selectDiv = window.getSelection().anchorNode
          if (selectDiv instanceof Element || selectDiv instanceof HTMLDocument) {
            this.caretActiveElement = window.getSelection().anchorNode
          } else {
            this.caretActiveElement = window.getSelection().anchorNode.parentElement
          }
        }
      }, 0)
    },
    detectURLs (message) { // replaces url in plain string
      if (!message) return ''
      let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g
      return message.replace(urlRegex, function (url) {
        let hyperlink = url
        // eslint-disable-next-line
        if (!hyperlink.match('^https?:\/\/')) {
          hyperlink = 'http://' + hyperlink
        }
        return '<a href="' + hyperlink + '" target="_blank" class="pd-editor-link">' + url + '</a>'
      })
    },
    replaceSelectionWithHtml ({ selection, html } = {}) {
      let range
      selection = selection || window.getSelection
      if (selection && selection() && selection().getRangeAt) {
        range = selection().getRangeAt(0)
        range.deleteContents()
        let div = document.createElement('div')
        div.innerHTML = html
        let frag = document.createDocumentFragment()
        // let child
        // eslint-disable-next-line
        // while (child = div.firstChild) {
        //   frag.appendChild(child)
        // }
        frag.appendChild(div.firstChild)
        range.insertNode(frag)
      } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange()
        range.pasteHTML(html)
      }
    },
    saveSelection () {
      if (window.getSelection) {
        var sel = window.getSelection()
        if (sel.getRangeAt && sel.rangeCount) {
          return sel.getRangeAt(0)
        }
      } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange()
      }
      return null
    },
    restoreSelection (range) {
      if (range) {
        if (window.getSelection) {
          var sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
        } else if (document.selection && range.select) {
          range.select()
        }
      }
    },
    clearSelection () {
      if (window.getSelection) {
        if (window.getSelection().empty) { // Chrome
          window.getSelection().empty()
        } else if (window.getSelection().removeAllRanges) { // Firefox
          window.getSelection().removeAllRanges()
        }
      } else if (document.selection) { // IE?
        document.selection.empty()
      }
    },
    updateEditorValue () {
      const editorElem = document.querySelector(`.texteditor.${this.uniqueClassIdentifier} .editor-content`)
      if (!editorElem) return

      // adding { target } attribute for anchor elements
      const anchorElements = document.querySelectorAll(`.texteditor.${this.uniqueClassIdentifier} .editor-content a`)
      if (anchorElements.length)  for (let anchorElemIndex of anchorElements.length) anchorElements[anchorElemIndex].target = '_blank'

      let editorValue = editorElem.innerHTML.toString().replace(/\&nbsp;/g, '') // eslint-disable-line
      editorValue = editorValue ? editorValue.replace(/\<br>a/g, '') : editorValue // eslint-disable-line
      this.inputvalue = editorValue
    },
    handleTableSelecetion (row, col) {
      this.overedRow = row
      this.overedCol = col
    },
    generateTable (row, col) { // table generation
      let table = '<table class="timeline-editor-table" id="timeline-table">'
      for (let i = 0; i < row; i++) {
        table += `<tr data-table-row-index="${i}" class="setRow" colspan = '1' rowspan = '1'>`
        for (let j = 0; j < col; j++) {
          table += `<td data-table-row-index="${i}" class="setColumn" data-table-column-index="${j}" colspan = '1' rowspan = '1'> &nbsp; </td>`
        }
        table += '</tr>'
      }
      table += '</table>'
      return table
    },
    addAditionalColumn (value) {
      this.columnModification(this.tbodyValue, this.rowValue, this.colValue, 'column', value)
    },
    addAditionalRow (value) {
      this.rowModification(this.tbodyValue, this.rowValue, this.colValue, 'row', value)
    },
    mergeCellROwAndColumn (value) {
      if (value === 'up' || value === 'down') {
        this.mergeCellRowModification(this.tbodyValue, this.rowValue, this.colValue, 'row', value)
      } else {
        this.mergeCellColumnModification(this.tbodyValue, this.rowValue, this.colValue, 'column', value)
      }
    },
    eventLisnerForTable (element) {
      if (element) {
        element.addEventListener('click', (ev) => {
          this.rowValue = ev.target.getAttribute('data-table-row-index')
          this.selectedRowOnAction = element.parentElement
          this.colValue = ev.target.getAttribute('data-table-column-index')
          this.tbodyValue = ev.target.parentElement.parentElement
          this.trowValue = ev.target.parentElement
          this.editorTableMenu = true
          setTimeout(() => {
            this.setTableActionMenuPosition(ev)
          }, 50)
        })
      }
    },
    columnModification (body, row, col, target, direction) { // added additional column right,left and delete table
      const removableElement = []
      const skipRemovingTd = (body.querySelector(`td[data-table-row-index="${row}"][data-table-column-index="${col}"]`).getAttribute('rowspan')) - 1
      const colspanCount = (body.querySelector(`td[data-table-row-index="${row}"][data-table-column-index="${col}"]`).getAttribute('colspan')) - 1
      let restrictedRowsCount = 1
      body.querySelectorAll('tr').forEach((element, index) => {
        let child = element.children
        let orginalTdValue = null
        let colValue = +col
        do {
          orginalTdValue = child[colValue]
          colValue--
        } while (!orginalTdValue)
        let newTdValue = orginalTdValue.cloneNode()
        newTdValue.innerHTML = '&nbsp;'
        newTdValue.setAttribute('colspan', 1)
        newTdValue.setAttribute('rowspan', 1)
        if (direction === 'left') {
          orginalTdValue.before(newTdValue)
          this.eventLisnerForTable(newTdValue)
          this.editorTableMenu = true
        }
        if (direction === 'right') {
          orginalTdValue.after(newTdValue)
          this.eventLisnerForTable(newTdValue)
        }
        if (direction === 'delete') {
          let canAddTdToList = true
          if (index > row && skipRemovingTd >= restrictedRowsCount) {
            canAddTdToList = false
            restrictedRowsCount++
          }
          if (orginalTdValue.getAttribute('colspan') > '1' && colspanCount >= restrictedRowsCount) {
            canAddTdToList = false
            orginalTdValue.setAttribute('colspan', (Number(orginalTdValue.getAttribute('colspan') - 1)))
            restrictedRowsCount++
          }
          if (canAddTdToList) {
            removableElement.push(orginalTdValue)
          }
        }
        if (direction === 'select') {
          orginalTdValue.setAttribute('id', 'highlight')
        }
      })
      removableElement.forEach(x => x.remove())
      body.querySelectorAll('tr').forEach(element => {
        [...element.children].forEach((x, y) => {
          x.setAttribute('data-table-column-index', y)
        })
      })
    },
    rowModification (body, row, col, target, direction) { // added additional row above,below and delete table
      let removableElement = []
      let orginalTrValue = body.querySelector(`tr:nth-child(${Number(row) + 1})`)
      var childCount = this.findColumnLength(orginalTrValue)
      let activeRow = body.querySelector(`tr[data-table-row-index="${row}"]`).querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan')
      let activeNextSibling = body.querySelector(`tr[data-table-row-index="${row}"]`).nextElementSibling
      let newTrValue = orginalTrValue.cloneNode()
      let childColumn = document.createElement('td')
      childColumn.innerHTML = '&nbsp;'
      childColumn.classList.add('setColumn')
      for (let i = 0; i < childCount; i++) {
        let newChildColumn = childColumn.cloneNode(true)
        newChildColumn.setAttribute('data-table-row-index', row)
        newChildColumn.setAttribute('data-table-column-index', i)
        newChildColumn.setAttribute('colspan', 1)
        newChildColumn.setAttribute('rowspan', 1)
        this.eventLisnerForTable(newChildColumn)
        newTrValue.append(newChildColumn)
      }
      if (direction === 'above') {
        orginalTrValue.before(newTrValue)
      }
      if (direction === 'below') {
        let selectedRowColumns = Array.from(this.selectedRowOnAction.children)
        let columnReduceCount = 0
        selectedRowColumns.forEach((column) => {
          let rowspan = column.getAttribute('rowspan')
          rowspan = +rowspan
          if (rowspan > 1) {
            columnReduceCount += 1
            column.setAttribute('rowspan', rowspan + 1)
          }
        })
        if (columnReduceCount) {
          for (var i = 0; (i < columnReduceCount && i < (newTrValue.children.length - 1)); i++) {
            newTrValue.children[i].remove()
          }
        }
        orginalTrValue.after(newTrValue)
      }
      if (direction === 'delete') {
        if (activeRow > 1) {
          activeNextSibling.remove()
        }
        removableElement.push(orginalTrValue)
      }
      if (direction === 'select') {
        orginalTrValue.setAttribute('id', 'highlight')
      }
      removableElement.forEach(x => x.remove())
      body.querySelectorAll('tr').forEach((element, z) => {
        element.setAttribute('data-table-row-index', z)
        let colChiold = [...element.children]
        colChiold.forEach((x, y) => {
          x.setAttribute('data-table-row-index', z)
          x.setAttribute('data-table-column-index', y)
        })
      })
    },
    mergeCellColumnModification (body, row, col, target, direction) { // merge cell column value in the table
      if (target === 'column') {
        let targetDom = body.querySelector(`td[data-table-row-index="${row}"][data-table-column-index="${col}"]`)
        let rowDom = body.querySelector(`tr[data-table-row-index="${row}"]`)
        if ((!targetDom.nextElementSibling && direction === 'right') || (!targetDom.previousElementSibling && direction === 'left')) {
          this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: (`Column ${direction} cannot merge `) })
        } else {
          if (direction === 'right') {
            let rowspanCount = rowDom.querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan')
            let leftCellRowSpanCount = rowDom.querySelector(`[data-table-column-index="${((Number(col) + 1))}"]`).getAttribute('rowspan')
            if (Number(rowspanCount) > 1 || leftCellRowSpanCount > 1) {
              this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: (`Merge cell right not created`) })
            } else {
              let dom = targetDom.nextElementSibling
              targetDom.innerHTML += '<br>' + dom.innerHTML
              while (dom) {
                dom.innerHTML = dom.nextElementSibling ? dom.nextElementSibling.innerHTML : ''
                dom = dom.nextElementSibling
              }
              let targetDomColSpan = targetDom.getAttribute('colspan')
              let nextSibilingColspanCount = targetDom.nextElementSibling.getAttribute('colspan')
              targetDomColSpan = targetDomColSpan ? (Number(nextSibilingColspanCount) + Number(targetDomColSpan)) : 2
              targetDom.setAttribute('colspan', targetDomColSpan)
              targetDom.parentElement.lastChild.remove()
            }
          } else {
            let rowspanCount = rowDom.querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan')
            let rightCellRowSpanCount = rowDom.querySelector(`[data-table-column-index="${((Number(col) - 1))}"]`).getAttribute('rowspan')
            if (Number(rowspanCount) > 1 || rightCellRowSpanCount > 1) {
              this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: (`Merge cell left not created`) })
            } else {
              let dom = targetDom
              targetDom = targetDom.previousElementSibling
              targetDom.innerHTML += '<br>' + dom.innerHTML
              let targetDomColSpan = dom.getAttribute('colspan')
              let targetDomColspanCount = dom.previousElementSibling.getAttribute('colspan')
              targetDomColSpan = targetDomColSpan ? (Number(targetDomColspanCount) + Number(targetDomColSpan)) : 2
              targetDom.setAttribute('colspan', targetDomColSpan)
              dom.remove()
            }
          }
          body.querySelectorAll('tr').forEach(element => {
            [...element.children].forEach((x, y) => {
              x.setAttribute('data-table-column-index', y)
            })
          })
        }
      }
    },
    mergeCellRowModification (body, row, col, target, direction) { // merge cell row value in the table
      if (target === 'row') {
        let rowDom = body.querySelector(`tr[data-table-row-index="${row}"]`)
        if ((!rowDom.previousElementSibling && direction === 'up') || (!rowDom.nextElementSibling && direction === 'down')) {
          this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: (`Column ${direction} cannot merge `) })
        } else {
          if (direction === 'up') {
            if (rowDom.previousElementSibling.previousElementSibling && rowDom.previousElementSibling.previousElementSibling.querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan') > 1) {
              this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: (`Merge cell up not allowed using merge down`) })
            } else {
              let colspanCount = rowDom.querySelector(`[data-table-column-index="${col}"]`).getAttribute('colspan')
              let colspanUpCount = rowDom.previousElementSibling.querySelector(`[data-table-column-index="${col}"]`).getAttribute('colspan')
              if (Number(colspanCount > 1) || Number(colspanUpCount > 1)) {
                this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: (`Merge cell Up not created`) })
              } else {
                let targetRowDom = rowDom.previousElementSibling
                let rowDomChild = rowDom.children
                let targetRowDomChild = targetRowDom.children
                targetRowDomChild[col].innerHTML += rowDomChild[col].innerHTML
                let targetRowDomRowSpan = targetRowDomChild[col].getAttribute('rowspan')
                let targetPrevRowspamCount = rowDom.querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan')
                targetRowDomRowSpan = targetRowDomRowSpan ? (Number(targetRowDomRowSpan) + Number(targetPrevRowspamCount)) : 2
                targetRowDomChild[col].setAttribute('rowspan', targetRowDomRowSpan)
                rowDomChild[col].remove()
              }
            }
          }
          if (direction === 'down') {
            var targetRowDom = rowDom
            var rowDomChild = rowDom.nextElementSibling.children
            var targetRowDomChild = targetRowDom.children
            let colspanCount = targetRowDom.querySelector(`[data-table-column-index="${col}"]`).getAttribute('colspan')
            let colspanUpCount = targetRowDom.nextElementSibling.querySelector(`[data-table-column-index="${col}"]`).getAttribute('colspan')
            if (Number(colspanCount > 1) || Number(colspanUpCount > 1)) {
              this.$root.$emit('snackbar', { snackbar: true, color: 'error', text: (`Merge cell down not created`) })
            } else {
              if (Number(targetRowDomChild[col].getAttribute('rowspan')) === 1) {
                if (Number(rowDom.nextElementSibling.querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan')) > 1) {
                  let targetRowSpanCount = Number(rowDom.querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan'))
                  let targetNextRowSpanCount = Number(rowDom.nextElementSibling.querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan'))
                  rowDom.querySelector(`[data-table-column-index="${col}"]`).innerHTML += rowDom.nextElementSibling.querySelector(`[data-table-column-index="${col}"]`).innerHTML
                  let targetRowDomRowSpanCount = targetRowSpanCount ? Number(targetRowSpanCount) + Number(targetNextRowSpanCount) : 2
                  targetRowDomChild[col].setAttribute('rowspan', targetRowDomRowSpanCount)
                } else {
                  targetRowDomChild[col].innerHTML += rowDomChild[col].innerHTML
                  let targetRowDomRowSpan = targetRowDomChild[col].getAttribute('rowspan')
                  targetRowDomRowSpan = targetRowDomRowSpan ? Number(targetRowDomRowSpan) + 1 : 2
                  targetRowDomChild[col].setAttribute('rowspan', targetRowDomRowSpan)
                }
                rowDomChild[col].remove()
              } else if (Number(targetRowDomChild[col].getAttribute('rowspan')) > 1) {
                var rowSpanCount = Number(targetRowDomChild[col].getAttribute('rowspan'))
                var rowTdValue = body.querySelector(`tr[data-table-row-index="${rowSpanCount + Number(row)}"]`)
                let rowSapnUpCount = body.querySelector(`tr[data-table-row-index="${(rowSpanCount + Number(row))}"]`).querySelector(`[data-table-column-index="${col}"]`).getAttribute('rowspan')
                if (rowSapnUpCount > 1) {
                  targetRowDomChild[col].innerHTML += body.querySelector(`tr[data-table-row-index="${(rowSpanCount + Number(row))}"]`).querySelector(`[data-table-column-index="${col}"]`).innerHTML
                  let targetRowDomRowSpan = rowSpanCount ? ((rowSpanCount) + Number(rowSapnUpCount)) : 2
                  targetRowDomChild[col].setAttribute('rowspan', targetRowDomRowSpan)
                  body.querySelector(`tr[data-table-row-index="${(rowSpanCount + Number(row))}"]`).querySelector(`[data-table-column-index="${col}"]`).remove()
                } else {
                  targetRowDomChild[col].innerHTML += rowTdValue.children[col].innerHTML
                  let targetRowDomRowSpan = targetRowDomChild[col].getAttribute('rowspan')
                  targetRowDomRowSpan = targetRowDomRowSpan ? Number(targetRowDomRowSpan) + 1 : 2
                  targetRowDomChild[col].setAttribute('rowspan', targetRowDomRowSpan)
                  rowTdValue.children[col].remove()
                }
              }
            }
          }
        }
        body.querySelectorAll('tr').forEach((element, z) => {
          element.setAttribute('data-table-row-index', z)
          let colChiold = [...element.children]
          colChiold.forEach((x, y) => {
            x.setAttribute('data-table-row-index', z)
            x.setAttribute('data-table-column-index', y)
          })
        })
      }
    },
    findColumnLength (dom) {
      let length = 0;
      [...dom.children].forEach(e => {
        let colspan = e.getAttribute('colspan')
        length += colspan ? Number(colspan) : 1
      })
      return length
    },
    setTableActionMenuPosition (randColumnEvent) {
      let table = randColumnEvent.target.parentElement.parentElement;
      [...(table.querySelectorAll('td'))].forEach(e => e.classList.remove('active'))
      randColumnEvent.target.classList.add('active')
      let tablePos = table.getBoundingClientRect()
      let currentPathInex = window.location.pathname.indexOf('preview')
      let tableActionMenu = document.querySelector('#menu-activator').parentElement
      if (currentPathInex !== -1) {
        let xPos = ((tablePos.width + tablePos.left) / 2)
        let yPos = (tablePos.height + tablePos.top) + 40 + window.pageYOffset
        tableActionMenu.style.left = xPos + 'px'
        tableActionMenu.style.top = yPos + 'px'
      } else {
        tableActionMenu.style.left = 1600 + 'px'
        tableActionMenu.style.top = 800 + 'px'
      }
    }
  },
  beforeDestroy () {
    window.removeEventListener('keydown', () => {})
  }
}
