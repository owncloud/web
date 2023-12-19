<template>
  <span v-text="message" />
  <div class="oc-my-m">
    <oc-checkbox
      v-if="conflictCount > 1"
      v-model="checkboxValue"
      size="medium"
      :label="checkboxLabel"
      :aria-label="checkboxLabel"
    />
  </div>
  <div class="oc-flex oc-flex-right oc-flex-middle oc-mt-m">
    <oc-button
      class="oc-modal-body-actions-cancel oc-ml-s"
      appearance="outline"
      variation="passive"
      @click="onCancel"
      >{{ $gettext('Skip') }}
    </oc-button>
    <oc-button
      class="oc-modal-body-actions-secondary oc-ml-s"
      appearance="outline"
      variation="passive"
      @click="onConfirmSecondary"
      >{{ $gettext('Replace') }}
    </oc-button>
    <oc-button
      class="oc-modal-body-actions-confirm oc-ml-s"
      appearance="filled"
      variation="primary"
      @click="onConfirm"
      >{{ $gettext('Keep both') }}
    </oc-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useStore } from '../../composables'
import { Resource } from '@ownclouders/web-client/src'
import { ResolveConflict, ResolveStrategy } from '../../helpers/resource'

export default defineComponent({
  name: 'ResourceConflictModal',
  props: {
    resource: { type: Object as PropType<Resource>, required: true },
    conflictCount: { type: Number, required: true },
    callbackFn: {
      type: Function as PropType<(resolveConflict: ResolveConflict) => void>,
      required: true
    },
    suggestMerge: { type: Boolean, default: true },
    separateSkipHandling: { type: Boolean, default: false }
  },
  setup(props, { expose }) {
    const store = useStore()
    const { $gettext } = useGettext()

    const checkboxValue = ref()
    const checkboxLabel = computed(() => {
      if (props.conflictCount < 2) {
        return ''
      }
      if (!props.separateSkipHandling) {
        return $gettext(
          'Apply to all %{count} conflicts',
          { count: props.conflictCount.toString() },
          true
        )
      } else if (props.resource.isFolder) {
        return $gettext(
          'Apply to all %{count} folders',
          { count: props.conflictCount.toString() },
          true
        )
      } else {
        return $gettext(
          'Apply to all %{count} files',
          { count: props.conflictCount.toString() },
          true
        )
      }
    })

    const message = computed(() =>
      props.resource.isFolder
        ? $gettext(
            'Folder with name "%{name}" already exists.',
            { name: props.resource.name },
            true
          )
        : $gettext('File with name "%{name}" already exists.', { name: props.resource.name }, true)
    )

    const onConfirm = async () => {
      await store.dispatch('hideModal')
      props.callbackFn({
        strategy: ResolveStrategy.KEEP_BOTH,
        doForAllConflicts: unref(checkboxValue)
      })
    }

    const onConfirmSecondary = async () => {
      await store.dispatch('hideModal')
      const strategy = props.suggestMerge ? ResolveStrategy.MERGE : ResolveStrategy.REPLACE
      props.callbackFn({
        strategy,
        doForAllConflicts: unref(checkboxValue)
      })
    }

    const onCancel = async () => {
      await store.dispatch('hideModal')
      props.callbackFn({
        strategy: ResolveStrategy.SKIP,
        doForAllConflicts: unref(checkboxValue)
      })
    }

    expose({ onConfirm, onConfirmSecondary, onCancel })

    return {
      message,
      checkboxValue,
      checkboxLabel,
      onConfirm,
      onConfirmSecondary,
      onCancel
    }
  }
})
</script>
