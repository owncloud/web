<template>
  <div class="oc-flex">
    <oc-button
      v-for="action in filteredActions"
      :key="action.label($gettext)"
      v-oc-tooltip="action.label($gettext)"
      :aria-label="action.label($gettext)"
      appearance="raw"
      class="oc-mr-xs quick-action-button oc-p-xs"
      :class="`files-quick-action-${action.id}`"
      @click="
        action.handler({ ability, clientService, passwordPolicyService, item, language, store })
      "
    >
      <oc-icon :name="action.icon" fill-type="line" />
    </oc-button>
  </div>
</template>

<script lang="ts">
import pickBy from 'lodash-es/pickBy'
import { computed, defineComponent } from 'vue'
import {
  useAbility,
  useClientService,
  usePasswordPolicyService,
  useStore
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'QuickActions',

  props: {
    actions: {
      type: Object,
      required: true
    },
    item: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const ability = useAbility()
    const clientService = useClientService()
    const passwordPolicyService = usePasswordPolicyService()
    const language = useGettext()

    const filteredActions = computed(() =>
      pickBy(props.actions, (action) => action.displayed(props.item, store) === true)
    )

    return {
      ability,
      clientService,
      passwordPolicyService,
      store,
      language,
      filteredActions
    }
  }
})
</script>

<style lang="scss">
.quick-action-button {
  &:hover {
    background-color: var(--oc-color-background-secondary) !important;
  }
}
</style>
