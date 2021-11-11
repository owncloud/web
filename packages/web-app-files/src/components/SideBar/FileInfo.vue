<template>
  <div class="file_info">
    <oc-icon :name="file.icon" size="large" class="file_info__icon" />
    <div class="file_info__body oc-text-overflow">
      <h3 tabindex="-1">
        <oc-resource-name
          :name="file.name"
          :extension="file.extension"
          :type="file.type"
          :full-path="file.path"
          :is-path-displayed="false"
        />
      </h3>
      <p class="oc-my-rm">
        <template v-if="file.size > -1">{{ getResourceSize(file.size) }},</template>
        {{ modificationTime }}
      </p>
    </div>
    <oc-button
      v-if="!publicPage() && isFavoritesEnabled"
      :aria-label="
        file.starred
          ? $gettext('Click to remove this file from your favorites')
          : $gettext('Click to mark this file as favorite')
      "
      appearance="raw"
      class="file_info__favorite"
      @click.native.stop="toggleFileFavorite(file)"
    >
      <oc-icon :class="file.starred ? 'oc-star-shining' : 'oc-star-dimm'" name="star" />
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
  inject: ['displayedItem'],
  props: {
    isContentDisplayed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['capabilities']),
    modificationTime() {
      if (this.isTrashbinRoute) {
        return this.formDateFromNow(this.file.ddate, 'RFC')
      }

      return this.formDateFromNow(this.file.mdate, 'Http')
    },
    isFavoritesEnabled() {
      return (
        this.capabilities.files &&
        this.capabilities.files.favorites &&
        this.isContentDisplayed &&
        !this.isAnySharedWithRoute &&
        !this.isTrashbinRoute
      )
    },

    file() {
      return this.displayedItem.value
    }
  },
  methods: {
    ...mapActions('Files', ['markFavorite']),
    toggleFileFavorite(file) {
      this.markFavorite({
        client: this.$client,
        file: file
      }).then(() => {
        this.$set(this.file, 'starred', !this.file.starred)
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

  &__body {
    text-align: left;
    font-size: 0.75rem;

    h3 {
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
