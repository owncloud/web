<template>
  <ul class="commands-list">
    <li>
      <oc-button size="small" :aria-label="$gettext('Close')" @click="$emit('close')">
        <oc-icon name="close" size="small" />
      </oc-button>
    </li>
    <li>
      <oc-button
        size="small"
        :aria-label="$gettext('Fullscreen')"
        @click="$emit('toggleFullScreen')"
      >
        <oc-icon name="fullscreen" size="small" />
      </oc-button>
    </li>
    <li>
      <oc-button size="small" :aria-label="$gettext('Zoom in')" @click="imageZoom">
        <oc-icon name="zoom-in" size="small" fill-type="line" />
      </oc-button>
    </li>
    <li>
      <oc-button size="small" :aria-label="$gettext('Zoom out')" @click="imageShrink">
        <oc-icon name="zoom-out" size="small" fill-type="line" />
      </oc-button>
    </li>
    <li>
      <oc-button
        v-if="isImage && isSaveable"
        size="small"
        :aria-label="$gettext('Save')"
        @click="saveTask.perform"
      >
        <oc-icon name="save" size="small" fill-type="line" />
      </oc-button>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Task } from 'vue-concurrency'
import { PropType } from 'vue'

export default defineComponent({
  name: 'QuickCommands',
  props: {
    currentImageZoom: {
      type: Number,
      default: 1
    },
    saveTask: {
      type: Object as PropType<Task<void, []>>,
      default: null
    },
    isImage: {
      type: Boolean,
      default: false
    },
    isSaveable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'setZoom', 'toggleFullScreen', 'delete'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const calculateZoom = (zoom, factor) => {
      return Math.round(zoom * factor * 20) / 20
    }
    const imageShrink = () => {
      emit('setZoom', Math.max(0.1, calculateZoom(props.currentImageZoom, 0.8)))
    }
    const imageZoom = () => {
      const maxZoomValue = calculateZoom(9, 1.25)
      emit('setZoom', Math.min(calculateZoom(props.currentImageZoom, 1.25), maxZoomValue))
    }

    return {
      imageShrink,
      imageZoom,
      $gettext
    }
  }
})
</script>

<style lang="scss" scoped>
.commands-list {
  list-style-type: none;
  padding: 0;
  gap: $oc-space-small;
  width: 3rem;

  & li {
    margin-right: $oc-space-medium;
  }

  & > :not(:first-child) {
    margin-top: $oc-space-small;
  }
}
</style>
