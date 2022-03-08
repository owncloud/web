<template>
  <nav id="shares-navigation" class="oc-py-s" :aria-label="$gettext('Shares pages navigation')">
    <oc-list class="oc-flex oc-visible@s">
      <li v-for="navItem in navItems" :key="`shares-navigation-desktop-${navItem.to}`">
        <oc-button
          type="router-link"
          class="oc-mr-s"
          appearance="raw"
          :variation="navItem.active ? 'primary' : 'passive'"
          :to="navItem.to"
        >
          <span v-text="navItem.text" />
        </oc-button>
      </li>
    </oc-list>
    <div class="oc-hidden@s">
      <oc-button id="shares_navigation_mobile" appearance="raw" v-text="$gettext('Shares pages')" />
      <oc-drop toggle="#shares_navigation_mobile" mode="click" close-on-click padding-size="small">
        <oc-list>
          <li v-for="navItem in navItems" :key="`shares-navigation-mobile-${navItem.to}`">
            <oc-button
              type="router-link"
              appearance="raw"
              :variation="navItem.active ? 'primary' : 'passive'"
              :to="navItem.to"
            >
              <span v-text="navItem.text" />
            </oc-button>
          </li>
        </oc-list>
      </oc-drop>
    </div>
  </nav>
</template>

<script>
import {
  isLocationSharesActive,
  locationSharesViaLink,
  locationSharesWithMe,
  locationSharesWithOthers
} from '../../router/shares'
import { computed, getCurrentInstance } from '@vue/composition-api'
import { useRouter } from 'web-pkg/src/composables'

export default {
  setup() {
    const $gettext = getCurrentInstance().proxy.$gettext
    const router = useRouter()
    const sharesRoutes = [
      locationSharesWithMe,
      locationSharesWithOthers,
      locationSharesViaLink
    ].reduce((routes, route) => {
      routes[route.name] = router.getRoutes().find((r) => r.name === route.name)
      return routes
    }, {})
    const navItems = computed(() => [
      {
        to: sharesRoutes[locationSharesWithMe.name].path,
        text: $gettext('Shared with me'),
        active: isLocationSharesActive(router, 'files-shares-with-me')
      },
      {
        to: sharesRoutes[locationSharesWithOthers.name].path,
        text: $gettext('Shared with others'),
        active: isLocationSharesActive(router, 'files-shares-with-others')
      },
      {
        to: sharesRoutes[locationSharesViaLink.name].path,
        text: $gettext('Shared via link'),
        active: isLocationSharesActive(router, 'files-shares-via-link')
      }
    ])
    return {
      navItems
    }
  }
}
</script>
<style lang="scss" scoped>
.router-link-active {
  text-decoration: underline;
}
</style>
