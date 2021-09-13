<template>
  <div class="file_info">
    <oc-icon :name="highlightedFile.icon" size="large" class="file_info__icon" />
    <div class="file_info__body">
      <h2 tabindex="-1">
        <oc-resource-name
          :name="highlightedFile.name"
          :extension="highlightedFile.extension"
          :type="highlightedFile.type"
          :full-path="highlightedFile.path"
          :is-path-displayed="false"
        />
      </h2>
      <div>
        <template v-if="highlightedFile.size > -1">
          {{ getResourceSize(highlightedFile.size) }},
        </template>
        {{ modificationTime }}
      </div>
    </div>
    <oc-button
      v-if="!publicPage() && isFavoritesEnabled"
      :aria-label="
        highlightedFile.starred
          ? $gettext('Click to remove this file from your favorites')
          : $gettext('Click to mark this file as favorite')
      "
      appearance="raw"
      class="file_info__favorite"
      @click.native.stop="toggleFileFavorite(highlightedFile)"
    >
      <oc-icon :class="highlightedFile.starred ? 'oc-star-shining' : 'oc-star-dimm'" name="star" />
    </oc-button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../../mixins'
import MixinResources from '../../mixins/resources'
import MixinRoutes from '../../mixins/routes'

export default {
  name: 'FileInfo',
  mixins: [Mixins, MixinResources, MixinRoutes],
  props: {
    isContentDisplayed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['capabilities']),
    modificationTime() {
      if (this.isTrashbinRoute) {
        return this.formDateFromNow(this.highlightedFile.ddate, 'RFC')
      }

      return this.formDateFromNow(this.highlightedFile.mdate, 'Http')
    },
    isFavoritesEnabled() {
      return (
        this.capabilities.files &&
        this.capabilities.files.favorites &&
        this.isContentDisplayed &&
        !this.isAnySharedWithRoute &&
        !this.isTrashbinRoute
      )
    }
  },
  methods: {
    ...mapActions('Files', ['markFavorite']),
    toggleFileFavorite(file) {
      this.markFavorite({
        client: this.$client,
        file: file
      })
    }
  }
}
</script>

<style lang="scss">
.file_info {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  grid-gap: 5px;

  &__icon {
  }

  &__body {
    text-align: left;
    font-size: 0.75rem;

    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
    }
  }

  &__favorite {
    .oc-star {
      display: inline-block;

      &-shining svg {
        fill: #ffba0a !important;

        path:not([fill='none']) {
          stroke: var(--oc-color-swatch-passive-default);
        }
      }
    }
  }
}
</style>
