<template>
  <iframe
    id="drawio-editor"
    ref="drawIoEditor"
    :src="iframeSource"
    :title="$gettext('Draw.io editor')"
  />
</template>

<script lang="ts">
import qs from 'qs'
import {
  defineComponent,
  unref,
  PropType,
  computed,
  onMounted,
  onBeforeUnmount,
  VNodeRef,
  ref,
  watch,
  nextTick
} from 'vue'
import { Resource } from '@ownclouders/web-client'
import { AppConfigObject } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'DrawIoEditor',
  props: {
    resource: {
      type: Object as PropType<Resource>,
      required: true
    },
    applicationConfig: {
      type: Object as PropType<AppConfigObject>,
      required: true
    },
    currentContent: {
      type: String,
      required: true
    },
    isReadOnly: {
      type: Boolean,
      required: true
    },
    isDirty: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:currentContent', 'save', 'close'],
  setup(props, { emit }) {
    const drawIoEditor: VNodeRef = ref()

    const config = computed(() => {
      const { url = 'https://embed.diagrams.net', theme = 'minimal' } =
        props.applicationConfig as any
      return { url, theme }
    })

    const urlHost = computed(() => {
      const url = new URL(unref(config).url)
      const urlHost = `${url.protocol}//${url.hostname}`
      return url.port ? `${urlHost}:${url.port}` : urlHost
    })

    const iframeSource = computed(() => {
      const query = qs.stringify({
        embed: 1,
        chrome: props.isReadOnly ? 0 : 1,
        picker: 0,
        stealth: 1,
        spin: 1,
        proto: 'json',
        ui: unref(config).theme
      })

      return `${unref(config).url}?${query}`
    })

    const loadCurrentContent = () => {
      postMessage({
        action: 'load',
        xml: props.currentContent,
        autosave: true
      })
    }

    watch(
      () => props.isDirty,
      () => {
        postMessage({
          action: 'status',
          modified: props.isDirty
        })
      }
    )

    watch(
      () => props.resource,
      () => {
        loadCurrentContent()
      }
    )

    const postMessage = (
      payload:
        | { action: string; xml: string; autosave?: boolean }
        | { action: 'status'; modified: boolean }
    ) => {
      try {
        if (!unref(drawIoEditor)) {
          return
        }
        return (unref(drawIoEditor) as HTMLIFrameElement).contentWindow.postMessage(
          JSON.stringify(payload),
          unref(urlHost)
        )
      } catch (e) {
        console.error(e)
      }
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.data.length > 0) {
        if (event.origin !== unref(config).url) {
          return
        }
        await nextTick()
        const payload = JSON.parse(event.data)
        switch (payload?.event) {
          case 'init':
            loadCurrentContent()
            break
          case 'autosave':
            emit('update:currentContent', payload.xml)
            break
          case 'save':
            emit('save')
            break
          case 'exit':
            emit('close')
            break
        }
      }
    }

    onMounted(() => {
      window.addEventListener('message', handleMessage)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('message', handleMessage)
    })

    return {
      config,
      drawIoEditor,
      iframeSource
    }
  }
})
</script>
<style scoped>
#drawio-editor {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
