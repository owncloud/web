const { After, Before, Given } = require('@cucumber/cucumber')
const fetch = require('node-fetch')
const { client } = require('nightwatch-api')

function handler(statement1, statement2, table = undefined) {
  let statement = ''
  if (statement1) {
    statement = statement + statement1.trim()
  }

  if (statement1 && statement2 && statement2 !== ':') {
    statement = statement + ' '
  }

  if (statement2) {
    statement = statement + statement2.trim()
  }
  const data = {
    step: 'Given ' + statement
  }

  if (table) {
    data.table = table
  }

  return fetch(client.globals.middlewareUrl + '/execute', {
    method: 'POST',
    body: JSON.stringify(data),
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

Given(
  /^((?:(?!these|following).)*\S)\s(in the server|on remote server|in the middleware)(.*)$/,
  (st1, st2, st3) => {
    if (st2 === 'on remote server') {
      st1 = st1 + ' ' + st2
    }
    return handler(st1, st3)
  }
)

Given(
  /^(.*(?=these|following).*\S)\s(in the server|on remote server|in the middleware)(.*)$/,
  (st1, st2, st3, table) => {
    if (st2 === 'on remote server') {
      st1 = st1 + ' ' + st2
    }
    return handler(st1, st3, table.raw())
  }
)
