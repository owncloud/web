const httpHelper = require('./httpHelper')
module.exports = {
  SHARE_TYPES: Object.freeze({
    user: 0,
    group: 1,
    public_link: 3,
    federated_cloud_share: 6
  }),
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
  },

  /**
   * Asynchronously fetches the last public link created by the given link creator
   *
   * @async
   * @param {string} linkCreator link creator
   * @return {Promise<Object>} last share token
   */
  fetchLastPublicLinkShare: async function (linkCreator) {
    const self = this
    const apiURL = 'apps/files_sharing/api/v1/shares'
    let lastShareToken
    let lastShare
    await httpHelper
      .getOCS(apiURL, linkCreator)
      .then((res) => res.json())
      .then(function (sharesResult) {
        httpHelper.checkOCSStatus(
          sharesResult,
          'Could not get shares. Message: ' + sharesResult.ocs.meta.message
        )
        const shares = sharesResult.ocs.data
        let lastShareSTime = 0
        for (const share of shares) {
          if (share.share_type === self.SHARE_TYPES.public_link && share.stime > lastShareSTime) {
            lastShareSTime = share.stime
            lastShareToken = share.token
            lastShare = share
          }
        }
        if (lastShareToken === null) {
          throw Error(
            'Could not find public shares. All shares: ' + JSON.stringify(shares, null, 2)
          )
        }
      })
    return lastShare
  }
}
