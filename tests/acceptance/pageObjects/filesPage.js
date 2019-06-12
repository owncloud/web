module.exports = {
  url: function () {
    return this.api.launchUrl + ''
  },
  commands: {
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: function (folder) {
      return this.page.FilesPageElement.filesList().navigateToFolder(folder)
        .waitForElementVisible('@breadcrumb')
        .assert.containsText('@breadcrumb', folder)
    },
    /**
     *
     * @param {string} name
     * @param {boolean} expectToSucceed
     */
    createFolder: function (name, expectToSucceed = true) {
      this
        .waitForElementVisible('@newFileMenuButton', 500000)
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFolderButton')
        .click('@newFolderButton')
        .waitForElementVisible('@newFolderInput')
        .setValue('@newFolderInput', name)
        .click('@newFolderOkButton')
        .waitForElementNotPresent('@createFolderLoadingIndicator')
      if (expectToSucceed) {
        this.waitForElementNotVisible('@newFolderDialog')
      }
      return this
    },
    /**
     *
     * @param {string} localFileName
     */
    uploadFile: function (localFileName) {
      return this
        .waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@fileUploadButton')
        .uploadLocalFile(
          '@fileUploadInput',
          require('path').join(this.api.globals.filesForUpload, localFileName)
        )
        .waitForElementVisible(
          '@fileUploadProgress',
          this.api.globals.waitForConditionTimeout,
          this.api.globals.waitForConditionPollInterval,
          false
        )
        .waitForElementNotVisible('@fileUploadProgress')
        .click('@newFileMenuButton')
    },

    dropFileForUpload: function (localFileName) {
      const jsDropCode = `
      var args = arguments,
      element = document.getElementById(args[0]),
      offsetX = args[1],
      offsetY = args[2],
      doc = element.ownerDocument || document;
    
      for (var i = 0; ;) {
        var box = element.getBoundingClientRect(),
          clientX = box.left + (offsetX || (box.width / 2)),
          clientY = box.top + (offsetY || (box.height / 2)),
          target = doc.elementFromPoint(clientX, clientY);
        
        if (target && element.contains(target))
            break;
        
        if (++i > 1) {
          var ex = new Error('Element not interactable');
          ex.code = 15;
          throw ex;
        }
        
        element.scrollIntoView({behavior: 'instant', block: 'center', inline: 'center'});
      }
      
      var input = doc.createElement('INPUT');
      input.setAttribute('type', 'file');
      input.setAttribute('id', 'seleniumDropUpload');
      input.setAttribute('multiple', '');
      input.setAttribute('style', 'position:fixed;z-index:2147483647;left:0;top:0;');
      input.onchange = function (ev) {
        input.parentElement.removeChild(input);
        ev.stopPropagation();
      
        var dataTransfer = {
          constructor   : DataTransfer,
          effectAllowed : 'all',
          dropEffect    : 'none',
          types         : [ 'Files' ],
          files         : input.files,
          setData       : function setData(){},
          getData       : function getData(){},
          clearData     : function clearData(){},
          setDragImage  : function setDragImage(){}
        };
      
        if (window.DataTransferItemList) {
        console.log("DataTransferItemList : " + window.DataTransferItemList);
          dataTransfer.items = Object.setPrototypeOf(Array.prototype.map.call(input.files, function(file) {
            return {
              constructor : DataTransferItem,
              kind        : 'file',
              type        : file.type,
              getAsFile   : function getAsFile () { return file },
              getAsString : function getAsString (callback) {
                var reader = new FileReader();
                reader.onload = function(ev) { callback(ev.target.result) };
                reader.readAsText(file);
              }
            }
          }), {
            constructor : DataTransferItemList,
            add    : function add(){},
            clear  : function clear(){},
            remove : function remove(){}
          });
        }
        
        ['dragenter', 'dragover', 'drop'].forEach(function (type) {
          var event = doc.createEvent('DragEvent');
          event.initMouseEvent(type, true, true, doc.defaultView, 0, 0, 0, clientX, clientY, false, false, false, false, 0, null);
          
          Object.setPrototypeOf(event, null);
          event.dataTransfer = dataTransfer;
          Object.setPrototypeOf(event, DragEvent.prototype);
          
          target.dispatchEvent(event);
        });
      };
      
      doc.documentElement.appendChild(input);
      input.getBoundingClientRect(); /* force reflow for Firefox */
      return input;

      `
      return this
        .api.execute(jsDropCode, ['files-app', 100, 100])
        .waitForElementVisible('#seleniumDropUpload')
        .uploadLocalFile(
          '#seleniumDropUpload',
          require('path').join(this.api.globals.filesForUpload, localFileName)
        )
    },
    showHiddenFiles: function () {
      return this
        .waitForElementVisible('@filterListButton')
        .click('@filterListButton')
        .waitForElementVisible('@hiddenFilesLabel')
        .click('@hiddenFilesCheckbox')
    },
    /**
     *
     * @param {string} fileOrFolder
     * @param {string} enableOrDisable
     */
    toggleFilterFileOrFolder: function (fileOrFolder, enableOrDisable) {
      let labelSelector, checkboxId
      if (fileOrFolder === 'folder') {
        labelSelector = '@filterFolderLabel'
        checkboxId = this.elements['filterFolderCheckbox']
      } else if (fileOrFolder === 'file') {
        labelSelector = '@filterFileLabel'
        checkboxId = this.elements['filterFileCheckbox']
      } else {
        throw new Error(`Expected 'file' or 'folder', ${fileOrFolder} given`)
      }
      return this
        .waitForElementVisible('@filterListButton')
        .click('@filterListButton')
        .waitForElementVisible(labelSelector)
        .toggleCheckbox(enableOrDisable, checkboxId)
        .click('@filterListButton')
    }
  },
  elements: {
    newFileMenuButton: {
      selector: '#new-file-menu-btn'
    },
    newFolderButton: {
      selector: '#new-folder-btn'
    },
    newFolderDialog: {
      selector: '#new-folder-dialog'
    },
    newFolderInput: {
      selector: '#new-folder-input'
    },
    newFolderOkButton: {
      selector: '#new-folder-ok'
    },

    breadcrumb: {
      selector: '#files-breadcrumb li:nth-of-type(1)'
    },
    filterListButton: {
      selector: '#oc-filter-list-btn'
    },
    hiddenFilesLabel: {
      selector: '#oc-filter-hidden-label'
    },
    hiddenFilesCheckbox: {
      selector: '#oc-filter-hidden-checkbox'
    },
    filterFolderLabel: {
      selector: '#oc-filter-folder-label'
    },
    filterFolderCheckbox: {
      selector: '#oc-filter-folder-checkbox'
    },
    filterFileLabel: {
      selector: '#oc-filter-file-label'
    },
    filterFileCheckbox: {
      selector: '#oc-filter-file-checkbox'
    },
    createFolderLoadingIndicator: {
      selector: '//div[@id="new-folder-dialog"]//div[@class="oc-loader"]',
      locateStrategy: 'xpath'
    },
    fileUploadButton: {
      selector: '//span[@data-msgid="Upload"]',
      locateStrategy: 'xpath'
    },
    fileUploadInput: {
      selector: '#fileUploadInput'
    },
    fileUploadProgress: {
      selector: '#oc-progress-pie'
    }
  }
}
