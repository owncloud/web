import _ from 'lodash'


const start = [
  'Feature: Kindergarten can use web to organize a day',
  'Background:',
  'Given the following users have been created',
  '|id|',
  '|Alice|',
  '|Brian|',
  'And the default folder for received shares has been set to "Shares"',
  'And auto-accept shares has been disabled',
  'Scenario: Alice can share this weeks meal plan with all parents',
  'When "Alice" logs in',
  'And "Alice" opens the "files" app',
  'And "Alice" navigates to the personal space page',
  'And "Alice" creates the following resources',
  '|resource|type|',
  '|groups/Kindergarten Koalas/meal plan|folder|',
  'And "Alice" uploads the following resources',
  '|resource|to|',
  '|data.zip|groups/Kindergarten Koalas/meal plan|',
  'When "Brian" logs in',
  'And "Brian" opens the "files" app'
]

const load = []

const end = [
  'And "Alice" logs out',
  'And "Brian" logs out',
]

_.times(100, () => {
  load.push(
    'And "Alice" shares the following resources using the sidebar panel',
    '|resource|user|role|',
    '|groups/Kindergarten Koalas/meal plan|Brian|editor|',
    'And "Brian" navigates to the shared with me page',
    'And "Brian" accepts the following share',
    '|name|',
    '|meal plan|',
    'And "Brian" navigates to the personal space page',
    'And "Brian" downloads the following resources',
    '|resource|from|',
    '|data.zip|Shares/meal plan|',
    'And "Alice" removes following sharee',
    '|resource|user|',
    '|groups/Kindergarten Koalas/meal plan|Brian|',)
})

console.log([...start, ...load, ...end].join('\n'))


