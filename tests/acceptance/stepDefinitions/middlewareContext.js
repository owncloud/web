const { After, Before, Given } = require('@cucumber/cucumber')
const fetch = require('node-fetch')
const { client } = require('nightwatch-api')

function handler(statement1, statement2) {
  let statement = ''
  if (statement1) {
    statement = statement + statement1.trim()
  }

  if (statement1 && statement2) {
    statement = statement + ' '
  }

  if (statement2) {
    statement = statement + statement2.trim()
  }

  return fetch(client.globals.middlewareUrl + '/execute', {
    method: 'POST',
    body: JSON.stringify({ step: 'Given ' + statement }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (res) => {
      if (res.ok) {
        return res.text()
      } else {
        const message = await res.text()
        throw new Error(message)
      }
    })
    .catch((err) => {
      console.error(err)
      return Promise.reject(err)
    })
}

Before(function () {
  return fetch(client.globals.middlewareUrl + '/init', {
    method: 'POST'
  })
    .then((res) => {
      return res.json()
    })
    .then((res) => {
      if (!res.success) {
        throw new Error('Failed to initialize the middleware: ' + res.message)
      }
    })
})

After(function () {
  return fetch(client.globals.middlewareUrl + '/cleanup', {
    method: 'POST'
  })
})

Given(/^(.*)in the server(.*)$/, handler)
