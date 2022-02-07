const fetch = require('node-fetch')
const { client } = require('nightwatch-api')

const { BACKENDS } = require('./backendHelper')

const passwords = {
  admin: process.env.ADMIN_PASSWORD || 'admin',
  regular: process.env.REGULAR_USER_PASSWORD || '123456',
  alt1: process.env.ALT1_USER_PASSWORD || '1234',
  alt2: process.env.ALT2_USER_PASSWORD || 'AaBb2Cc3Dd4',
  alt3: process.env.ALT3_USER_PASSWORD || 'aVeryLongPassword42TheMeaningOfLife',
  alt4: process.env.ALT4_USER_PASSWORD || 'ThisIsThe4thAlternatePwd',
  alt11: process.env.ALT11_USER_PASSWORD || 'E-leven'
}

const adminUsername = process.env.ADMIN_USERNAME || 'admin'
module.exports = {
  passwords,
  // list of default users
  defaultUsers: {
    admin: {
      displayname: adminUsername,
      password: passwords.admin
    },
    regularuser: {
      displayname: 'Regular User',
      password: passwords.regular,
      email: 'regularuser@example.org'
    },
    user0: {
      displayname: 'Regular User',
      password: passwords.regular,
      email: 'user0@example.org'
    },
    Alice: {
      displayname: 'Alice Hansen',
      password: passwords.alt1,
      email: 'alice@example.org'
    },
    Brian: {
      displayname: 'Brian Murphy',
      password: passwords.alt2,
      email: 'brian@example.org'
    },
    Carol: {
      displayname: 'Carol King',
      password: passwords.alt3,
      email: 'carol@example.org'
    },
    David: {
      displayname: 'David Lopez',
      password: passwords.alt4,
      email: 'david@example.org'
    },
    user11: {
      displayname: 'User Eleven',
      password: passwords.alt11,
      email: 'user11@example.org'
    },
    usergrp: {
      displayname: 'User Grp',
      password: passwords.regular,
      email: 'usergrp@example.org'
    },
    sharee1: {
      displayname: 'Sharee One',
      password: passwords.regular,
      email: 'sharee1@example.org'
    },
    // These users are available by default only in ocis backend when not using ldap
    Einstein: {
      displayname: 'Albert Einstein',
      password: 'relativity',
      email: 'einstein@example.org'
    },
    Richard: {
      displayname: 'Richard Feynman',
      password: 'superfluidity',
      email: 'richard@example.org'
    },
    Marie: {
      displayname: 'Marie Curie',
      password: 'radioactivity',
      email: 'marie@example.org'
    },
    Moss: {
      displayname: 'Maurice Moss',
      password: 'vista',
      email: 'moss@example.org'
    }
  },
  createdUsers: {},
  createdRemoteUsers: {},
  createdGroups: [],

  state: null,
  fetchState: function () {
    return fetch(client.globals.middlewareUrl + '/state')
      .then((res) => res.json())
      .then((data) => {
        this.state = data
      })
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
  getDisplayNameForUser: async function (userId, fetchState = true) {
    if (fetchState) {
      await this.fetchState()
    }
    let user = {}
    if (userId in this.state.created_users) {
      user = this.state.created_users[userId]
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
   * gets the username of a previously created user from displayName
   *
   * @param {string} displayName
   */
  getUsernameFromDisplayname: async function (displayName) {
    await this.fetchState()
    for (const userid in this.state.created_users) {
      if (this.state.created_users[userid].displayname === displayName) {
        return userid
      }
    }
  },

  /**
   *
   * @returns {module.exports.createdUsers|{}}
   */
  getCreatedUsers: async function (server = BACKENDS.local) {
    await this.fetchState()
    for (const userId in this.state.created_users) {
      this.state.created_users[userId].displayName = await this.getDisplayNameForUser(userId)
    }

    for (const userId in this.state.created_remote_users) {
      this.state.created_remote_users[userId].displayName = await this.getDisplayNameForUser(userId)
    }

    switch (server) {
      case BACKENDS.local:
        return this.state.created_users
      case BACKENDS.remote:
        return this.state.created_remote_users
      default:
        throw new Error('Invalid value for server. want = "REMOTE"/"LOCAL", got = ' + server)
    }
  },
  /**
   *
   * @returns {Array}
   */
  getCreatedGroups: function () {
    this.fetchState()
    return this.state.created_groups
  }
}
