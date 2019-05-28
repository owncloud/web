const adminUsername = process.env.ADMIN_USERNAME || 'admin'
const adminPassword = process.env.ADMIN_PASSWORD || 'admin'
const regularUserPassword = process.env.REGULAR_USER_PASSWORD || '123456'
const alt1UserPassword = process.env.ALT1_USER_PASSWORD || '1234'
const alt2UserPassword = process.env.ALT2_USER_PASSWORD || 'AaBb2Cc3Dd4'
const alt3UserPassword = process.env.ALT3_USER_PASSWORD || 'aVeryLongPassword42TheMeaningOfLife'
const alt4UserPassword = process.env.ALT4_USER_PASSWORD || 'ThisIsThe4thAlternatePwd'

module.exports = {
  // list of default users
  defaultUsers: {
    admin: {
      displayname: adminUsername,
      password: adminPassword
    },
    regularuser: {
      displayname: 'Regular User',
      password: regularUserPassword,
      email: 'regularuser@example.org'
    },
    user0: {
      displayname: 'Regular User',
      password: regularUserPassword,
      email: 'user0@example.org'
    },
    user1: {
      displayname: 'User One',
      password: alt1UserPassword,
      email: 'user1@example.org'
    },
    user2: {
      displayname: 'User Two',
      password: alt2UserPassword,
      email: 'user2@example.org'
    },
    user3: {
      displayname: 'User Three',
      password: alt3UserPassword,
      email: 'user3@example.org'
    },
    user4: {
      displayname: 'User Four',
      password: alt4UserPassword,
      email: 'user4@example.org'
    },
    usergrp: {
      displayname: 'User Grp',
      password: regularUserPassword,
      email: 'usergrp@example.org'
    },
    sharee1: {
      displayname: 'Sharee One',
      password: regularUserPassword,
      email: 'sharee1@example.org'
    }
  },
  /**
   *
   * @param {string} userId
   * @returns {string}
   */
  getPasswordForUser: function (userId) {
    if (userId in this.defaultUsers) {
      return this.defaultUsers[userId].password
    } else {
      return this.defaultUsers.regularuser.password
    }
  },
  /**
   *
   * @param {string} userId
   * @returns {null|string}
   */
  getDisplayNameForUser: function (userId) {
    if (userId in this.defaultUsers) {
      return this.defaultUsers[userId].displayname
    } else {
      return null
    }
  },
  /**
   *
   * @param {string} userId
   * @returns {null|string}
   */
  getEmailAddressForUser: function (userId) {
    if (userId in this.defaultUsers) {
      return this.defaultUsers[userId].email
    } else {
      return null
    }
  },
  /**
   *
   * @param {string} userId
   * @returns {string}
   */
  getActualPassword: function (userId) {
    if (userId in this.defaultUsers) {
      return this.defaultUsers[userId].password
    } else {
      return userId
    }
  }
}
