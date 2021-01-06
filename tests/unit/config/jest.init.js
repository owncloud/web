import { config } from '@vue/test-utils'

const $gettext = str => str

config.mocks = {
  $gettext
}
