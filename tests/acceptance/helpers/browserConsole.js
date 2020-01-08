import { client } from 'nightwatch-api'

export async function getAllLogsWithDateTime (level = null) {
  let logs
  await client.elementIdText('debugArray', text => {
    logs = 'from debugArray: ' + text.value
  })
  return logs
}
