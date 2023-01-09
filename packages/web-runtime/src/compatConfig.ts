import { configureCompat } from 'vue'

type CompatConfig = Parameters<typeof configureCompat>[0]
export const compatConfig: CompatConfig = {
  MODE: 2,
  // FIXME: comment in when vue-router, vue-gettext, ... are fixed
  // RENDER_FUNCTION: false
}
