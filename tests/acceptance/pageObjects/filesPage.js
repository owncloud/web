module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/files/list/home'
  },
  elements: {
    filesTable: {
      selector: '#files-list'
    },
    fileRows: {
      selector: 'div.file-row:nth-of-type(2)'
    }
  }
}
