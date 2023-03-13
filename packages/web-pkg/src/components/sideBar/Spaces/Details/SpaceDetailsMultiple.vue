<template>
  <div id="oc-spaces-details-multiple-sidebar">
    <div class="spaces-preview oc-mb">
      <div class="spaces-preview-body">
        <oc-icon class="preview-icon" size="xxlarge" variation="passive" name="layout-grid" />
        <p class="preview-text" v-text="selectedSpacesString" />
      </div>
    </div>
    <div>
      <!-- <table class="details-table" :aria-label="detailsTableLabel">
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Total quota:')" />
          <td v-text="totalSelectedSpaceQuotaTotal" />
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Remaining quota:')" />
          <td v-text="totalSelectedSpaceQuotaRemaining" />
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Used quota:')" />
          <td v-text="totalSelectedSpaceQuotaUsed" />
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Enabled:')" />
          <td v-text="totalEnabledSpaces" />
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Disabled:')" />
          <td v-text="totalDisabledSpaces" />
        </tr>
      </table> -->
    </div>
  </div>
</template>
<script lang="ts">
import { formatFileSize } from 'web-pkg/src/helpers'
import { computed, defineComponent, PropType } from 'vue'
import { SpaceResource } from 'web-client/src'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'SpaceDetailsMultiple',
  props: {
    selectedSpaces: {
      type: Array as PropType<Array<SpaceResource>>,
      required: true
    }
  },
  setup(props) {
    const {
      $gettext,
      $ngettext,
      interpolate: $gettextInterpolate,
      current: currentLanguage
    } = useGettext()
    const totalSelectedSpaceQuotaTotal = computed(() => {
      let total = 0
      props.selectedSpaces.forEach((space) => {
        total += space.spaceQuota.total
      })
      return formatFileSize(total, currentLanguage)
    })
    const totalSelectedSpaceQuotaRemaining = computed(() => {
      let remaining = 0
      props.selectedSpaces.forEach((space) => {
        if (space.disabled) {
          return
        }
        remaining += space.spaceQuota.remaining
      })
      return formatFileSize(remaining, currentLanguage)
    })
    const totalSelectedSpaceQuotaUsed = computed(() => {
      let used = 0
      props.selectedSpaces.forEach((space) => {
        if (space.disabled) {
          return
        }
        used += space.spaceQuota.used
      })
      return formatFileSize(used, currentLanguage)
    })
    const totalEnabledSpaces = computed(() => {
      return props.selectedSpaces.filter((s) => !s.disabled).length
    })
    const totalDisabledSpaces = computed(() => {
      return props.selectedSpaces.filter((s) => s.disabled).length
    })
    const detailsTableLabel = computed(() => {
      return $gettext('Overview of the information about the selected spaces')
    })
    const selectedSpacesString = computed(() => {
      return $gettextInterpolate(
        $ngettext(
          '%{ itemCount } space selected',
          '%{ itemCount } spaces selected',
          props.selectedSpaces.length
        ),
        {
          itemCount: props.selectedSpaces.length
        }
      )
    })
    return {
      detailsTableLabel,
      selectedSpacesString,
      totalSelectedSpaceQuotaTotal,
      totalSelectedSpaceQuotaRemaining,
      totalSelectedSpaceQuotaUsed,
      totalEnabledSpaces,
      totalDisabledSpaces
    }
  }
})
</script>
<style lang="scss">
.spaces-preview {
  position: relative;
  background-color: var(--oc-color-background-muted);
  border: 10px solid var(--oc-color-background-muted);
  height: 230px;
  text-align: center;
  color: var(--oc-color-swatch-passive-muted);

  &-body {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);

    .preview-icon {
      display: inline-block;
    }
    .preview-text {
      display: block;
    }
  }
}
.details-table {
  text-align: left;

  tr {
    height: 1.5rem;
  }

  th {
    font-weight: 600;
  }
}
</style>
