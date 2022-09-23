<template>
  <div class="file_info oc-flex oc-flex-between">
    <div class="oc-flex oc-flex-middle">
      <oc-resource-icon
        v-if="isSubPanelActive"
        :resource="file"
        size="large"
        class="file_info__icon oc-mr-s"
      />
      <div class="file_info__body oc-text-overflow">
        <h3 data-testid="files-info-name">
          <oc-resource-name
            :name="file.name"
            :extension="file.extension"
            :type="file.type"
            :full-path="file.webDavPath"
            :is-extension-displayed="areFileExtensionsShown"
            :is-path-displayed="false"
            :truncate-name="false"
          />
        </h3>
      </div>
    </div>
    <private-link-item v-if="privateLinkEnabled" class="oc-ml-s" />
  </div>
</template>

<script>
import { isLocationSpacesActive, isLocationTrashActive } from '../../router'
import { mapGetters, mapState } from 'vuex'
import PrivateLinkItem from './PrivateLinkItem.vue'
import { useActiveLocation } from '../../composables'
import { formatDateFromRFC, formatRelativeDateFromRFC } from 'web-pkg/src/helpers'

export default {
  name: 'FileInfo',
  components: {
    PrivateLinkItem
  },
  inject: ['displayedItem'],
  props: {
    isSubPanelActive: {
      type: Boolean,
      default: true
    },
    displayedItem: {
      type: Object,
      default: false
    }
  },
  setup() {
    return {
      isPersonalLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-personal')
    }
  },
  computed: {
    ...mapGetters(['capabilities']),
    ...mapState('Files', ['areFileExtensionsShown']),
    timeData() {
      const interpolate = (obj) => {
        obj.time = formatDateFromRFC(obj.sourceTime, this.$language.current)
        obj.timeRelative = formatRelativeDateFromRFC(obj.sourceTime, this.$language.current)

        obj.infoString = this.$gettextInterpolate(obj.infoString, obj)
        obj.ariaLabel = this.$gettextInterpolate(obj.ariaLabel, obj)
        return obj
      }

      if (
        isLocationTrashActive(this.$router, 'files-trash-personal') ||
        isLocationTrashActive(this.$router, 'files-trash-spaces-project')
      ) {
        return interpolate({
          sourceTime: this.file.ddate,
          infoString: this.$pgettext('inline info about deletion date', 'deleted %{timeRelative}'),
          ariaLabel: this.$pgettext(
            'aria label for inline info about deletion date',
            'deleted %{timeRelative} (%{time})'
          )
        })
      }

      return interpolate({
        sourceTime: this.file.mdate,
        infoString: this.$pgettext(
          'inline info about last modification date',
          'modified %{timeRelative}'
        ),
        ariaLabel: this.$pgettext(
          'aria label for inline info about last modification date',
          'modified %{timeRelative} (%{time})'
        )
      })
    },

    privateLinkEnabled() {
      return this.isPersonalLocation && this.capabilities.files.privateLinks
    },

    file() {
      return this.displayedItem.value
    }
  }
}
</script>

<style lang="scss">
.file_info {
  button {
    white-space: nowrap;
  }

  &__body {
    text-align: left;

    h3 {
      font-size: var(--oc-font-size-medium);
      font-weight: 600;
      margin: 0;
      word-break: break-all;
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
