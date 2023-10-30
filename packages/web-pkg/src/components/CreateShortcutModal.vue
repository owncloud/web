<template>
  <portal to="app.runtime.modal">
    <oc-modal
      :title="$gettext('Create a Shortcut')"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Create')"
      :button-confirm-disabled="confirmButtonDisabled"
      @confirm="confirm"
      @cancel="cancel"
    >
      <template #content> hello </template>
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { $gettext } from '../router/utils'

export default defineComponent({
  name: 'CreateShortcutModal',
  props: {
    cancel: {
      type: Function as PropType<(...args: any) => unknown>,
      required: true
    },
    confirm: {
      type: Function as PropType<(...args: any) => unknown>,
      required: true
    }
  },
  setup(props) {
    const confirmButtonDisabled = ref(false)

    return {
      confirmButtonDisabled
    }
  },
  methods: { $gettext }
})
</script>
