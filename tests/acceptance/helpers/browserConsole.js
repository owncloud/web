import { client } from 'nightwatch-api'

function cleanupLogMessage(message) {
  return message.replace(/\\u003C/gi, '').replace(/\\n/g, '\n') // revive newlines
}

function formatLog(log) {
  return (
    new Date(log.timestamp).toLocaleTimeString() +
    ' - ' +
    log.level +
    ' - ' +
    cleanupLogMessage(log.message)
  )
}

async function getAllLogs() {
  let logs = []
  await client.getLog('browser', entries => {
    logs = entries
  })
  return logs
}

export async function getAllLogsWithDateTime(level = null) {
  let logs = await getAllLogs()
  if (level) {
    logs = logs.filter(entry => entry.level === level)
  }

  return logs.filter(e => !e.message.includes('favicon.ico')).map(formatLog)
}
