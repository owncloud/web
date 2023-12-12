<template>
  <img
    ref="img"
    :key="`media-image-${file.id}`"
    :src="file.url"
    :alt="file.name"
    :data-id="file.id"
    :style="`transform: rotate(${currentImageRotation}deg)`"
  />
</template>
<script lang="ts">
import { CachedFile } from '../../helpers/types'
import { defineComponent, PropType, onMounted, ref, VNodeRef, watch, unref, nextTick } from 'vue'
import type { PanzoomObject } from '@panzoom/panzoom'
import Panzoom from '@panzoom/panzoom'

export default defineComponent({
  name: 'MediaImage',
  props: {
    file: {
      type: Object as PropType<CachedFile>,
      required: true
    },
    currentImageZoom: {
      type: Number,
      required: true
    },
    currentImageRotation: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const img = ref<VNodeRef>()
    const panzoom = ref<PanzoomObject>()

    const initPanzoom = async () => {
      if (unref(panzoom)) {
        unref(panzoom)?.destroy()
      }

      // wait for next tick until image is rendered
      await nextTick()

      panzoom.value = Panzoom(unref(img) as any, {
        animate: true,
        duration: 300,
        overflow: 'auto',
        maxScale: 10,
        setTransform: (_, { scale, x, y }) => {
          let h: number
          let v: number

          switch (props.currentImageRotation) {
            case -270:
            case 90:
              h = y
              v = 0 - x
              break
            case -180:
            case 180:
              h = 0 - x
              v = 0 - y
              break
            case -90:
            case 270:
              h = 0 - y
              v = x
              break
            default:
              h = x
              v = y
          }

          unref(panzoom).setStyle(
            'transform',
            `rotate(${props.currentImageRotation}deg) scale(${scale}) translate(${h}px, ${v}px)`
          )
        }
      })
    }

    watch(img, initPanzoom)
    onMounted(initPanzoom)

    watch([() => props.currentImageZoom, () => props.currentImageRotation], () => {
      unref(panzoom).zoom(props.currentImageZoom)
    })

    return {
      img
    }
  }
})
</script>
<style lang="scss" scoped>
img {
  max-width: 80%;
  max-height: 80%;
}
</style>
