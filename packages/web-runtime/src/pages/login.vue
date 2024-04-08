<template>
  <div class="oc-width-1-1 oc-height-1-1">
    <app-loading-spinner />
  </div>
</template>

<script lang="ts">
import { authService } from '../services/auth'
import { queryItemAsString, useRouteQuery } from '@ownclouders/web-pkg'
import { defineComponent, unref } from 'vue'
import { AppLoadingSpinner } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'LoginPage',
  components: {
    AppLoadingSpinner
  },
  setup() {
    const redirectUrl = useRouteQuery('redirectUrl')
    authService.loginUser(queryItemAsString(unref(redirectUrl)))

    return {}
  }
})
</script>
