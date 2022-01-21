<template>
  <div class="space-overview oc-p-s">
    <list-loader v-if="loadSpaceTask.isRunning" />
    <template v-else>
      <not-found-message v-if="!space.id" class="files-not-found oc-height-1-1" />
      <div v-else class="oc-grid oc-grid-match oc-child-width-1-3@s">
        <div>
          <img
            class="space-overview-image"
            alt=""
            :src="'data:image/jpeg;base64,' + imageContent"
          />
        </div>
        <div>
          <h3 class="oc-mb-s">{{ space.name }}</h3>
          <span v-if="space.description">{{ space.description }}</span>
          <div>
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
      <no-content-message v-if="isEmpty" id="files-spaces-empty" class="files-empty" icon="folder">
        <template #message>
          <p class="oc-text-muted">
            <span v-translate>No resources found</span>
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
import { useStore, useRouter } from 'web-pkg/src/composables'
import marked from 'marked'
import { arrayBuffToB64 } from '../../helpers/commonUtil'
import axios from 'axios'
import MixinAccessibleBreadcrumb from '../../mixins/accessibleBreadcrumb'
import { bus } from 'web-pkg/src/instance'

export default {
  components: {
    NoContentMessage,
    ListLoader,
    NotFoundMessage
  },
  mixins: [MixinAccessibleBreadcrumb],
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

      if (ref.markdownResizeObserver) {
        ref.markdownResizeObserver.unobserve(ref.$refs.markdownContainer)
      }

      markdownContent.value = marked.parse(response.data)

      if (markdownContent.value) {
        ref.markdownResizeObserver.observe(ref.$refs.markdownContainer)
      }
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

    const loadResourcesTask = useTask(function* (signal, ref) {
      yield loadSpaceTask.perform(ref)
      loadReadmeTask.perform(ref)
      loadImageTask.perform(ref)
    })

    return {
      space,
      loadSpaceTask,
      loadImageTask,
      loadReadmeTask,
      markdownContent,
      imageContent,
      loadResourcesTask
    }
  },
  data: function () {
    return {
      markdownCollapsed: true,
      markdownContainerCollapsedClass: 'collapsed',
      showMarkdownCollapse: false,
      markdownResizeObserver: new ResizeObserver(this.onMarkdownResize),
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
    await this.loadResourcesTask.perform(this)

    document.title = `${this.space.name} - ${this.$route.meta.title}`
    this.$route.params.name = this.space.name

    const loadSpaceEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this)
    })

    this.$on('beforeDestroy', () => bus.unsubscribe('app.files.list.load', loadSpaceEventToken))
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
      if (!this.$refs.markdownContainer) {
        return
      }

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
    border-radius: 10px;
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
