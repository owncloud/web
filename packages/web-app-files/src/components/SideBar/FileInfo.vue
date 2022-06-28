<template>
  <div class="file_info">
    <oc-resource-icon :resource="file" size="large" class="file_info__icon" />
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
      <p class="oc-my-rm">
        <template v-if="file.size > -1">{{ getResourceSize(file.size) }},</template>
        <span
          v-oc-tooltip="timeData.time"
          data-testid="files-info-mdate"
          tabindex="0"
          :aria-label="timeData.ariaLabel"
          >{{ timeData.infoString }}</span
        >
      </p>
    </div>
    <private-link-item v-if="privateLinkEnabled" />
  </div>
</template>

<script>
import Mixins from '../../mixins'
import MixinResources from '../../mixins/resources'
import { isLocationSpacesActive, isLocationTrashActive } from '../../router'
import { mapGetters, mapState } from 'vuex'
import PrivateLinkItem from './PrivateLinkItem.vue'
import { useActiveLocation } from '../../composables'

export default {
  name: 'FileInfo',
  components: {
    PrivateLinkItem
  },
  mixins: [Mixins, MixinResources],
  inject: ['displayedItem'],
  props: {
    isContentDisplayed: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
      isPersonalLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-personal')
    }
  },
  computed: {
    ...mapGetters(['capabilities', 'user']),
    ...mapState('Files', ['areFileExtensionsShown']),
    timeData() {
      const interpolate = (obj) => {
        obj.time = this.formDateFromRFC(obj.sourceTime)
        obj.timeRelative = this.formRelativeDateFromRFC(obj.sourceTime)

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
      return (
        this.isPersonalLocation &&
        this.capabilities.files.privateLinks &&
        this.file?.owner?.username === this.user?.username
      )
    },

    file() {
      return this.displayedItem.value
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
