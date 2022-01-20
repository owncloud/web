<template>
  <div class="space-overview oc-p-s">
    <list-loader v-if="loadSpaceTask.isRunning" />
    <template v-else>
      <not-found-message v-if="!space.id" class="files-not-found oc-height-1-1" />
      <div v-else class="oc-grid oc-grid-match oc-child-width-1-3@s">
        <div class="oc-mt-s">
          <img
            class="space-overview-image"
            alt=""
            :src="'data:image/jpeg;base64,' + imageContent"
          />
        </div>
        <div>
          <h3 class="oc-mb-s">{{ space.name }}</h3>
          <span v-if="space.description">{{ space.description }}</span>
          <div v-if="markdownContent">
            <div ref="markdownContainer" class="markdown-container" v-html="markdownContent"></div>
            <div v-if="showMarkdownCollapse" class="markdown-collapse oc-text-center oc-mt-s">
              <oc-button appearance="raw" @click="toggleCollapseMarkdown">
                <oc-icon :name="markdownCollapseIcon" />
                <span>{{ markdownCollapseText }}</span>
              </oc-button>
            </div>
          </div>
        </div>
      </div>
      <no-content-message
        v-if="isEmpty"
        id="files-personal-empty"
        class="files-empty"
        icon="folder"
      >
        <template #message>
          <p class="oc-text-muted">
            <span v-translate>No resource found</span>
          </p>
        </template>
      </no-content-message>
    </template>
  </div>
</template>

<script>
import NoContentMessage from '../../components/FilesList/NoContentMessage.vue'
import NotFoundMessage from '../../components/FilesList/NotFoundMessage.vue'
import ListLoader from '../../components/FilesList/ListLoader.vue'
import { ref } from '@vue/composition-api'
import { client } from 'web-client'
import { useTask } from 'vue-concurrency'
import { useStore, useRouter } from '../../composables'
import marked from 'marked'
import { arrayBuffToB64 } from '../../helpers/commonUtil'
import axios from 'axios'

export default {
  components: {
    NoContentMessage,
    ListLoader,
    NotFoundMessage
  },
  setup() {
    const router = useRouter()
    const store = useStore()

    const spaceId = router.currentRoute.params.spaceId
    const space = ref({})
    const markdownContent = ref('')
    const imageContent = ref('')
    const { graph } = client(store.getters.configuration.server, store.getters.getToken)

    const loadSpaceTask = useTask(function* () {
      const response = yield graph.drives.getDrive(spaceId)
      space.value = response.data || {}
    })
    const loadReadmeTask = useTask(function* (signal, ref) {
      const markdownEntry = space.value?.special?.find((el) => el?.specialFolder?.name === 'readme')

      if (!markdownEntry) {
        return
      }

      const response = yield axios.get(markdownEntry.webDavUrl, {
        headers: {
          Authorization: `Bearer ${ref.getToken}`
        }
      })
      markdownContent.value = marked.parse(response.data)
    })
    const loadImageTask = useTask(function* (signal, ref) {
      const imageEntry = space.value?.special?.find((el) => el?.specialFolder?.name === 'image')

      if (!imageEntry) {
        return
      }

      const response = yield axios.get(imageEntry.webDavUrl, {
        headers: {
          Authorization: `Bearer ${ref.getToken}`
        },
        responseType: 'arraybuffer'
      })

      imageContent.value = arrayBuffToB64(response.data)
    })

    loadSpaceTask.perform()

    return {
      space,
      loadSpaceTask,
      loadImageTask,
      loadReadmeTask,
      markdownContent,
      imageContent
    }
  },
  data: function () {
    return {
      markdownCollapsed: true,
      markdownContainerCollapsedClass: 'collapsed',
      showMarkdownCollapse: false,
      markdownResizeObserver: null,
      isEmpty: true
    }
  },
  computed: {
    markdownCollapseIcon() {
      return this.markdownCollapsed === true ? 'add' : 'subtract'
    },
    markdownCollapseText() {
      return this.markdownCollapsed === true
        ? this.$gettext('Show more')
        : this.$gettext('Show less')
    }
  },
  async mounted() {
    await this.loadSpaceTask.last
    await this.loadReadmeTask.perform(this)
    await this.loadImageTask.perform(this)
    document.title = `${this.space.name} - ${this.$route.meta.title}`

    if (this.markdownContent) {
      this.markdownResizeObserver = new ResizeObserver(this.onMarkdownResize)
      this.markdownResizeObserver.observe(this.$refs.markdownContainer)
    }
  },
  beforeDestroy() {
    this.markdownResizeObserver.unobserve(this.$refs.markdownContainer)
  },
  methods: {
    toggleCollapseMarkdown() {
      this.markdownCollapsed = !this.markdownCollapsed
      return this.$refs.markdownContainer.classList.toggle(this.markdownContainerCollapsedClass)
    },
    onMarkdownResize() {
      this.$refs.markdownContainer.classList.remove(this.markdownContainerCollapsedClass)
      const markdownContainerHeight = this.$refs.markdownContainer.offsetHeight

      if (markdownContainerHeight < 150) {
        return (this.showMarkdownCollapse = false)
      }

      this.showMarkdownCollapse = true

      if (this.markdownCollapsed) {
        this.$refs.markdownContainer.classList.add(this.markdownContainerCollapsedClass)
      }
    }
  }
}
</script>

<style lang="scss">
.space-overview {
  &-image {
    border-radius: 5px;
    max-height: 250px;
  }

  .markdown-container * {
    color: grey !important;
  }

  .markdown-container.collapsed {
    max-height: 150px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(180deg, #000 90%, transparent);
  }
}
</style>
