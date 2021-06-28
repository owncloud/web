<template>
  <div class="files-search-preview" @click="$_fileActions_triggerDefaultAction(resource)">
    <oc-resource
      :resource="resource"
      :is-path-displayed="true"
      :target-route="{ name: 'files-personal' }"
    />
  </div>
</template>

<script>
import MixinFileActions from '../../mixins/fileActions'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension } from '../../constants'
import { loadPreview } from '../../helpers/resource'
import debounce from 'lodash-es/debounce'
import Vue from 'vue'
import { mapGetters } from 'vuex'

const visibilityObserver = new VisibilityObserver()

export default {
  mixins: [MixinFileActions],
  props: {
    searchResult: {
      type: Object,
      default: function() {
        return {}
      }
    },
    provider: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      resource: undefined
    }
  },
  computed: {
    ...mapGetters(['Files', ['configuration', 'user', 'getToken']])
  },
  beforeMount() {
    this.resource = this.searchResult.data
  },
  mounted() {
    const debounced = debounce(async ({ unobserve }) => {
      unobserve()
      const preview = await loadPreview(
        {
          resource: this.resource,
          isPublic: false,
          dimensions: ImageDimension.ThumbNail,
          server: this.configuration.server,
          userId: this.user.id,
          token: this.getToken
        },
        true
      )
      preview && Vue.set(this.resource, 'preview', preview)
    }, 250)

    visibilityObserver.observe(this.$el, { onEnter: debounced, onExit: debounced.cancel })
  },
  beforeDestroy() {
    visibilityObserver.disconnect()
  }
}
</script>

<style lang="scss">
.files-search-preview {
  button {
    font-size: 0.8rem;
  }

  .oc-icon,
  .oc-icon > svg,
  img {
    height: 24px;
    max-height: 24px;
    max-width: 24px;
    width: 24px;
  }
}
</style>
