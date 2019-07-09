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
  createdUsers: {},

  /**
   *
   * @param {string} userId
   * @param {string} password
   * @param {string} displayname
   * @param {string} email
   */
  addUserToCreatedUsersList: function (userId, password, displayname = null, email = null) {
    this.createdUsers[userId] = { password: password, displayname: displayname, email: email }
  },

  /**
   * gets the password of a previously created user
   * if the user was not created yet, gets the password from the default Users list
   * if the user is not in that list either, returns the userId as password
   *
   * @param {string} userId
   * @returns {string}
   */
  getPasswordForUser: function (userId) {
    if (userId in this.createdUsers) {
      return this.createdUsers[userId].password
    } else if (userId in this.defaultUsers) {
      return this.defaultUsers[userId].password
    } else {
      // user was not created yet and is not in the default users list, let the userId be the password
      return userId
    }
  },
  /**
   * gets the display name of a previously created user
   * if the user was not created yet, gets the display name from the default Users list
   * if the user is not in that list either, returns the userId as display name
   *
   * @param {string} userId
   * @returns {string}
   */
  getDisplayNameForUser: function (userId) {
    let user = {}
    if (userId in this.createdUsers) {
      user = this.createdUsers[userId]
    } else if (userId in this.defaultUsers) {
      user = this.defaultUsers[userId]
    } else {
      return userId
    }
    if ('displayname' in user && user.displayname !== null) {
      return user.displayname
    } else {
      return userId
    }
  },
  /**
   * gets the display name of the specified user from the default users list
   * returns null if the user is not in that list
   *
   * @param {string} userId
   * @returns {null|string}
   */
  getDisplayNameOfDefaultUser: function (userId) {
    if (userId in this.defaultUsers) {
      return this.defaultUsers[userId].displayname
    } else {
      return null
    }
  },
  /**
   * gets the email address of a previously created user
   * if the user was not created yet, gets the email address from the default Users list
   * if the user is not in that list either, returns null
   *
   * @param {string} userId
   * @returns {null|string}
   */
  getEmailAddressForUser: function (userId) {
    let user = {}
    if (userId in this.createdUsers) {
      user = this.createdUsers[userId]
    } else if (userId in this.defaultUsers) {
      user = this.defaultUsers[userId]
    } else {
      return null
    }
    if ('email' in user && user.email !== null) {
      return user.email
    } else {
      return null
    }
  },
  /**
   * gets the email address of the specified user from the default users list
   * returns null if the user is not in that list
   *
   * @param {string} userId
   * @returns {null|string}
   */
  getEmailAddressOfDefaultUser: function (userId) {
    if (userId in this.defaultUsers) {
      return this.defaultUsers[userId].email
    } else {
      return null
    }
  }
}
