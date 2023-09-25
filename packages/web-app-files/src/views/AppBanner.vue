<template>
  <portal to="app.app-banner">
    <div class="app-banner hide-desktop" :hidden="shouldShow === false">
      <oc-button
        variation="brand"
        appearance="raw"
        class="app-banner-exit"
        aria-label="Close"
        @click="close"
      >
        <oc-icon name="close" size="small" />
      </oc-button>
      <div
        class="app-banner-icon"
        :style="{ 'background-image': `url('${appBannerSettings.icon}')` }"
      ></div>
      <div class="info-container">
        <div>
          <div class="app-title">{{ appBannerSettings.title }}</div>
          <div class="app-publisher">{{ appBannerSettings.publisher }}</div>
          <div class="app-additional-info">{{ appBannerSettings.price }}</div>
        </div>
      </div>
      <a
        :href="generateAppUrl(fileId)"
        target="_blank"
        class="app-banner-cta"
        rel="noopener"
        aria-label="{{ appBannerSettings.ctaText }}"
        >{{ appBannerSettings.ctaText }}</a
      >
    </div>
  </portal>
</template>

<script lang="ts">
import { defineComponent, ref, unref } from 'vue'
import { useRouter, useStore } from 'web-pkg'
import { buildUrl } from 'web-pkg/src/helpers/router'
import { useSessionStorage } from '@vueuse/core'

export default defineComponent({
  components: {},
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup() {
    const appBannerWasClosed = useSessionStorage('app_banner_closed', null)
    const shouldShow = ref<boolean>(unref(appBannerWasClosed) === null)
    const store = useStore()
    const router = useRouter()

    const appBannerSettings = unref(store.getters.configuration.currentTheme.appBanner)

    const generateAppUrl = (fileId: string) => {
      return buildUrl(router, `/f/${fileId}`)
        .toString()
        .replace(/^(http)(s)?/, (_, p1, p2) => (p2 ? appBannerSettings.appScheme : p1))
    }

    const close = () => {
      shouldShow.value = false
      useSessionStorage('app_banner_closed', 1)
    }

    return {
      generateAppUrl,
      close,
      shouldShow,
      appBannerSettings
    }
  }
})
</script>

<style scoped lang="scss">
.hide-desktop {
  @media (min-width: 768px) {
    display: none;
  }
}

.app-banner {
  //top: 0;
  //left: 0;
  overflow-x: hidden;
  width: 100%;
  height: 84px;
  background: #f3f3f3;
  font-family: Helvetica, sans, sans-serif;
  z-index: 5;
}

.info-container {
  position: absolute;
  top: 10px;
  left: 104px;
  display: flex;
  overflow-y: hidden;
  width: 60%;
  height: 64px;
  align-items: center;
  color: #000;
}

.app-banner-icon {
  position: absolute;
  top: 10px;
  left: 30px;
  width: 64px;
  height: 64px;
  border-radius: 15px;
  background-size: 64px 64px;
}

.app-banner-cta {
  position: absolute;
  top: 32px;
  right: 10px;
  z-index: 1;
  display: block;
  padding: 0 10px;
  min-width: 10%;
  border-radius: 5px;
  background: #f3f3f3;
  color: #1474fc;
  font-size: 18px;
  text-align: center;
  text-decoration: none;
}

.app-title {
  font-size: 14px;
}

.app-publisher,
.app-additional-info {
  font-size: 12px;
}

.app-banner-exit {
  position: absolute;
  top: 34px;
  left: 9px;
  margin: 0;
  width: 12px;
  height: 12px;
  border: 0;
  text-align: center;
  display: inline;
}
</style>
