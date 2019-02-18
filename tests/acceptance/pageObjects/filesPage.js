module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/files/list/home'
  },
  commands: {
    navigateToFolder: function (folder) {
      return this.api.url(this.api.launchUrl + '/#/files/list/' + folder)
    }
  },
  elements: {
    filesTable: {
      selector: '#files-list'
    },
    fileRows: {
      selector: 'div.file-row:nth-of-type(2)'
    },
    newFileMenuButton: {
      selector: '#new-file-menu-btn'
    },
    newFolderButton : {
      selector: '#new-folder-btn'
    },
    newFolderInput: {
      selector: '#new-folder-input'
    },
    newFolderOkButton: {
      selector: '#new-folder-ok'
    }
  }
}
