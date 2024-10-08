<template>
  <div class="oc-flex oc-flex-center oc-flex-middle oc-flex-column page-not-found">
    <oc-icon name="emotion-normal" fill-type="line" size="xxlarge" />
    <h1 class="oc-text-muted">404</h1>
    <p
      class="oc-text-xlarge oc-m-rm oc-text-muted"
      v-text="$gettext('The requested page you are looking for does not exist.')"
    />
  </div>
</template>

<script setup lang="ts">
import { $gettext } from '@ownclouders/web-pkg/src/router/utils'
</script>
