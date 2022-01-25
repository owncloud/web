module.exports = {
  PERMISSION_TYPES: Object.freeze({
    read: 1,
    update: 2,
    create: 4,
    delete: 8,
    share: 16,
    all: 31
  }),
  SHARE_STATE: Object.freeze({
    accepted: 0,
    pending: 1,
    declined: 2
  }),
  COLLABORATOR_PERMISSION_ARRAY: ['share', 'update', 'create', 'delete'],

  /**
   * if the given string starts with a `+` or `-` the function will calculate the date (from today) and return the string of the new date
   * @param {string} dateString
   * @returns {string}
   */
  calculateDate: function (dateString) {
    if (dateString.startsWith('+') || dateString.startsWith('-')) {
      dateString = parseInt(dateString)
      const date = new Date()
      date.setDate(date.getDate() + dateString)
      dateString =
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0') +
        ' 00:00:00'
    }
    return dateString
  },

  /**
   * Given the string that can be parsed into Date, returns the string that should be displayed in the UI input fields
   * @param {string} date
   * @returns {string}
   */
  calculateDateString: function (date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]

    const expectedDate = new Date(Date.parse(date))
    const expectedMonth = months[expectedDate.getMonth()]
    return `${expectedMonth} ${expectedDate.getDate().toString()}, ${expectedDate.getFullYear()}`
  }
}
