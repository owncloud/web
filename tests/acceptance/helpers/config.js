const fetch = require('node-fetch')
const httpHelper = require('./httpHelper')
const occHelper = require('./occHelper')
const { join } = require('./path')
const { difference } = require('./objects')
const _ = require('lodash')

let config

async function setSkeletonDirectory (server, admin) {
  const data = JSON.stringify({ directory: 'webUISkeleton' })
  const headers = {
    ...httpHelper.createAuthHeader(admin),
    'Content-Type': 'application/json'
  }
  const apiUrl = join(
    server,
    '/ocs/v2.php/apps/testing',
    '/api/v1/testingskeletondirectory?format=json'
  )

  const resp = await fetch(
    apiUrl,
    { method: 'POST', headers, body: data }
  )

  httpHelper.checkStatus(resp, 'Could not set skeletondirectory.')
}

async function rollbackSystemConfigs (configToChange, oldSysConfig) {
  for (const key in configToChange) {
    if (typeof configToChange[key] === 'object') {
      continue
    }
    const value = _.get(oldSysConfig, [key])
    if (value === undefined) {
      await occHelper.runOcc([
        'config:system:delete',
        key
      ])
    } else {
      await occHelper.runOcc([
        'config:system:set',
        key,
        `--value=${value}`
      ])
    }
  }
}

async function rollbackAppConfigs (configToChange, oldAppConfig) {
  for (const app in configToChange) {
    for (const key in configToChange[app]) {
      const value = _.get(oldAppConfig, [app, key])
      if (value === undefined) {
        await occHelper.runOcc(
          [
            'config:app:delete',
            app,
            key
          ]
        )
      } else {
        await occHelper.runOcc(
          [
            'config:app:set',
            app,
            key,
            `--value=${value}`
          ]
        )
      }
    }
  }
}

export async function getConfigs () {
  const resp = await occHelper.runOcc([
    'config:list'
  ])
  let stdOut = _.get(resp, 'ocs.data.stdOut')
  if (stdOut === undefined) {
    throw new Error('stdOut notFound, Found:', resp)
  }
  stdOut = JSON.parse(stdOut)
  return stdOut
}

export async function cacheConfigs () {
  config = await getConfigs()
  return config
}

export async function setConfigs (server, admin = 'admin') {
  await setSkeletonDirectory(server, admin)
}

export async function rollbackConfigs () {
  const newConfig = await getConfigs()

  const appConfig = _.get(newConfig, 'apps')
  const systemConfig = _.get(newConfig, 'system')

  const initialAppConfig = _.get(config, 'apps')
  const initialSysConfig = _.get(config, 'system')

  await rollbackSystemConfigs(
    difference(systemConfig, initialSysConfig),
    initialSysConfig
  )
  await rollbackAppConfigs(
    difference(appConfig, initialAppConfig),
    initialAppConfig
  )
}
