<template>
  <div class="oc-mt-xl">
    <div class="oc-flex space-info">
      <oc-icon name="layout-grid" size="xxlarge" />
      <p>{{ selectedSpacesString }}</p> 
        <p v-translate>
          Total: {{ totalSelectedSpaceQuotaTotal }},
          Remaining: {{ totalSelectedSpaceQuotaRemaining }},
          Used: {{ totalSelectedSpaceQuotaUsed }}
        </p>
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
    console.log(props.selectedSpaces)
    const totalSelectedSpaceQuotaTotal = computed(() => {
      let total = 0
      props.selectedSpaces.forEach((space) => {
        total += space.spaceQuota.total
      })
      return filesize(total)
    })
    const totalSelectedSpaceQuotaRemaining = computed(() => {
      let remaining = 0
      props.selectedSpaces.forEach((space) => {
        remaining += space.spaceQuota.remaining
      })
      return filesize(remaining)
    })
    const totalSelectedSpaceQuotaUsed = computed(() => {
      let used = 0
      props.selectedSpaces.forEach((space) => {
        used += space.spaceQuota.used
      })
      return filesize(used)
    })
    const selectedSpacesString = computed(() =>{
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
.space-info {
  align-items: center;
  flex-direction: column;
}
</style>
