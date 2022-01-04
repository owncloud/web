import { Given, DataTable, After, Before } from '@cucumber/cucumber'
import { config } from '../../config'
import fetch from 'node-fetch'

const middlewareHost = config.baseUrlMiddleware

function handler(statement1: string, statement2: string, table?: DataTable): Promise<any> {
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
    step: 'Given ' + statement,
    table: null
  }

  if (table) {
    data.table = table.raw()
  }

  return fetch(middlewareHost + '/execute', {
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
  return fetch(middlewareHost + '/init', {
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
  return fetch(middlewareHost + '/cleanup', {
    method: 'POST'
  })
})

Given(
  /^((?!these).*)(in the server|on remote server)(.*)$/,
  (st1: string, st2: string, st3: string) => {
    if (st2 === 'on remote server') {
      st1 = st1 + st2
    }
    return handler(st1, st3)
  }
)

Given(
  /^(.*these.*)(in the server|on remote server)(.*)$/,
  (st1: string, st2: string, st3: string, table: DataTable) => {
    if (st2 === 'on remote server') {
      st1 = st1 + st2
    }
    return handler(st1, st3, table)
  }
)
