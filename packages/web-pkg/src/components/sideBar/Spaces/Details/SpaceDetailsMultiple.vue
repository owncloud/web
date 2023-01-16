<template>
  <div id="oc-spaces-details-multiple-sidebar">
    <div class="spaces-preview oc-mb">
      <div class="spaces-preview-body">
        <oc-icon class="preview-icon" size="xxlarge" variation="passive" name="layout-grid" />
        <p class="preview-text" data-testid="selectedFilesText" v-text="selectedSpacesString" />
      </div>
    </div>
    <div>
      <table class="details-table" :aria-label="detailsTableLabel">
        <tr data-testid="filesCount">
          <th scope="col" class="oc-pr-s" v-text="$gettext('Total:')" />
          <td v-text="totalSelectedSpaceQuotaTotal" />
        </tr>
        <tr data-testid="foldersCount">
          <th scope="col" class="oc-pr-s" v-text="$gettext('Remaining:')" />
          <td v-text="totalSelectedSpaceQuotaRemaining" />
        </tr>
        <tr data-testid="spacesCount">
          <th scope="col" class="oc-pr-s" v-text="$gettext('Used:')" />
          <td v-text="totalSelectedSpaceQuotaUsed" />
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import filesize from 'filesize'
import { computed, defineComponent, PropType } from 'vue'
import { SpaceResource } from 'web-client/src'
import { useTranslations } from 'web-pkg/src'

export default defineComponent({
  name: 'SpaceDetailsMultiple',
  props: {
    selectedSpaces: {
      type: Array as PropType<Array<SpaceResource>>,
      required: true
    }
  },
  setup(props) {
    const { $ngettext, $gettextInterpolate } = useTranslations()
    const totalSelectedSpaceQuotaTotal = computed(() => {
      let total = 10
      props.selectedSpaces.forEach((space) => {
        total += space.spaceQuota.total
      })
      return filesize(total)
    })
    const totalSelectedSpaceQuotaRemaining = computed(() => {
      let remaining = 10
      props.selectedSpaces.forEach((space) => {
        remaining += space.spaceQuota.remaining
      })
      return filesize(remaining)
    })
    const totalSelectedSpaceQuotaUsed = computed(() => {
      let used = 10
      props.selectedSpaces.forEach((space) => {
        used += space.spaceQuota.used
      })
      return filesize(used)
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
      selectedSpacesString,
      totalSelectedSpaceQuotaTotal,
      totalSelectedSpaceQuotaRemaining,
      totalSelectedSpaceQuotaUsed
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
