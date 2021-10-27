const httpHelper = require('./httpHelper')
const occHelper = require('./occHelper')
const { difference } = require('./objects')
const _ = require('lodash')

const config = {}

async function setSkeletonDirectory(skeletonType) {
  const directoryName = getActualSkeletonDir(skeletonType)

  if (!directoryName) {
    try {
      await occHelper.runOcc(['config:system:get', 'skeletondirectory'])
    } catch (e) {
      if (e.toString().includes('400 undefined')) return
    }
    return await occHelper.runOcc(['config:system:delete', 'skeletondirectory'])
  }

  const data = JSON.stringify({ directory: directoryName })
  const apiUrl = 'apps/testing/api/v1/testingskeletondirectory'
  const resp = await httpHelper.postOCS(apiUrl, 'admin', data, {
    'Content-Type': 'application/json'
  })

  httpHelper.checkStatus(resp, 'Could not set skeletondirectory.')
}

async function rollbackSystemConfigs(oldSysConfig, newSysConfig) {
  const configToChange = difference(newSysConfig, oldSysConfig)

  for (const key in configToChange) {
    if (typeof configToChange[key] === 'object') {
      continue
    }
    const value = _.get(oldSysConfig, [key])
    if (value === undefined) {
      await occHelper.runOcc(['config:system:delete', key])
    } else if (typeof value === 'boolean') {
      await occHelper.runOcc(['config:system:set', key, `--type=boolean --value=${value}`])
    } else {
      await occHelper.runOcc(['config:system:set', key, `--value=${value}`])
    }
  }
}

async function rollbackAppConfigs(oldAppConfig, newAppConfig) {
  const configToChange = difference(newAppConfig, oldAppConfig)

  for (const app in configToChange) {
    for (const key in configToChange[app]) {
      const value = _.get(oldAppConfig, [app, key])
      if (value === undefined) {
        await occHelper.runOcc(['config:app:delete', app, key])
      } else {
        await occHelper.runOcc(['config:app:set', app, key, `--value=${value}`])
      }
    }
  }
}

const getConfigs = async function () {
  const resp = await occHelper.runOcc(['config:list'])
  let stdOut = _.get(resp, 'ocs.data.stdOut')
  if (stdOut === undefined) {
    throw new Error('stdOut notFound, Found:', resp)
  }
  stdOut = JSON.parse(stdOut)
  return stdOut
}

exports.getConfigs = getConfigs

exports.cacheConfigs = async function (server) {
  config[server] = await getConfigs()
  return config
}

exports.setConfigs = async function (skeletonType) {
  await setSkeletonDirectory(skeletonType)
}

exports.rollbackConfigs = async function (server) {
  const newConfig = await getConfigs()

  const appConfig = _.get(newConfig, 'apps')
  const systemConfig = _.get(newConfig, 'system')

  const initialAppConfig = _.get(config[server], 'apps')
  const initialSysConfig = _.get(config[server], 'system')

  await rollbackSystemConfigs(initialSysConfig, systemConfig)
  await rollbackAppConfigs(initialAppConfig, appConfig)
}

const getActualSkeletonDir = function (skeletonType) {
  let directoryName

  switch (skeletonType) {
    case 'large':
      directoryName = 'webUISkeleton'
      break
    case 'small':
      directoryName = 'apiSkeleton'
      break
    default:
      directoryName = false
      break
  }
  return directoryName
}

exports.getActualSkeletonDir = getActualSkeletonDir
