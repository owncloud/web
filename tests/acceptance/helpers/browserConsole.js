import { client } from 'nightwatch-api'

export async function getAllLogsWithDateTime (level = null) {
  let logs
  await client.elementIdText('debugArray', text => {
    console.log('found debugArray text: ', text.value)
    logs = text.value.split('\n')
  })
  return logs
}
