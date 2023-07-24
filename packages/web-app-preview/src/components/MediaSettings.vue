<template>
  <div class="sidebar-tools">
    <div class="tool-list">
      <oc-button class="media-settings-button" appearance="raw" @click="$emit('download')">
        <oc-icon name="download-2" class="download-button" />
        <span>Download</span>
      </oc-button>

      <oc-button
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === 'customize' &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="handleUpdateSelectedProcessingTool('customize')"
      >
        <oc-icon name="tools" />
        <span>Customize</span>
      </oc-button>

      <oc-button
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === 'adjust' &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="handleUpdateSelectedProcessingTool('adjust')"
      >
        <oc-icon name="equalizer" />
        <span>Adjust</span>
      </oc-button>

      <oc-button
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === 'write' &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="handleUpdateSelectedProcessingTool('write')"
      >
        <oc-icon name="pencil" />
        <span>Write</span>
      </oc-button>

      <oc-button
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === 'draw' &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="handleUpdateSelectedProcessingTool('draw')"
      >
        <oc-icon name="brush" />
        <span>Draw</span>
      </oc-button>
    </div>
    <div v-if="selectedProcessingTool === 'customize'" class="options-bar">
      <adjustment-parameters-category
        name="General"
        icon-name="equalizer"
        :variable-type="AdjustmentParametersCategoryEnum.General"
      />
      <adjustment-parameters-category
        name="Fine Tune"
        icon-name="contrast-drop-2"
        is-fill-type-line
        :variable-type="AdjustmentParametersCategoryEnum.FineTune"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AdjustmentParametersCategoryEnum } from '../helpers'
import AdjustmentParametersCategory from './StylebarComponents/AdjustmentParamtersCategory.vue'
import { useStore } from 'web-pkg/src'
import { mapMutations } from 'vuex'
import { computed } from 'vue'

export default defineComponent({
  components: { AdjustmentParametersCategory },
  emits: ['download'],
  setup() {
    const store = useStore()
    const selectedProcessingTool = computed(
      () => store.getters['Preview/getSelectedProcessingTool']
    )

    return {
      selectedProcessingTool
    }
  },
  data() {
    return {
      AdjustmentParametersCategoryEnum: AdjustmentParametersCategoryEnum
    }
  },
  methods: {
    ...mapMutations('Preview', ['CHANGE_SELECTED_PROCESSING_TOOL']),
    handleUpdateSelectedProcessingTool(name: string) {
      this.CHANGE_SELECTED_PROCESSING_TOOL(name)
    }
  }
})
</script>

<style lang="scss" scoped>
.sidebar-tools {
  height: 100vh;
  box-shadow: 0px 0 25px rgba(0, 0, 0, 0.3);
  display: flex;
}

.tool-list {
  list-style-type: none;
  padding: 0;
  height: 100vh;
  width: 6rem;
}

.media-settings-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: var(--oc-font-size-small);
  width: 100%;
  border-radius: 0;
  padding: $oc-space-small;
  box-sizing: border-box;

  &:hover {
    background-color: var(--oc-color-background-highlight);
  }
}

.download-button {
  margin-top: $oc-space-small;
}

.options-bar {
  height: 100vh;
  width: 18rem;
  box-sizing: border-box;
  padding: $oc-space-small;
}
</style>
