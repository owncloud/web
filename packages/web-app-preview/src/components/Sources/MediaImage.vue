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
import { defineComponent, PropType, onMounted, ref, watch } from 'vue'
import { CachedFile } from '../../helpers/types'
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
    const img = ref()
    let panzoom: PanzoomObject

    onMounted(() => {
      panzoom = Panzoom(img.value, {
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

          panzoom.setStyle(
            'transform',
            `rotate(${props.currentImageRotation}deg) scale(${scale}) translate(${h}px, ${v}px)`
          )
        }
      })
    })

    watch([() => props.currentImageZoom, () => props.currentImageRotation], () => {
      panzoom.zoom(props.currentImageZoom)
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
