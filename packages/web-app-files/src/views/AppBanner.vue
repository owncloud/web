<template>
  <div class="app-banner hide-desktop">
    <a href="javascript:void(0);" class="app-banner-exit" aria-label="Close"></a>
    <div
      class="app-banner-icon"
      style="
        background-image: url('https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/87/4c/3c/874c3c90-d58d-837f-63fe-6a7dae6fd320/AppIcon-1x_U007emarketing-0-7-0-sRGB-85-220.png/460x0w.png');
      "
    ></div>
    <div class="info-container">
      <div>
        <div class="app-title">ownCloud</div>
        <div class="app-publisher">ownCloud GmbH</div>
        <div class="app-additional-info">FREE - On the App Store</div>
      </div>
    </div>
    <a
      :href="generateAppUrl(fileId)"
      target="_blank"
      class="app-banner-cta"
      rel="noopener"
      aria-label="VIEW"
      >VIEW</a
    >
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, unref } from 'vue'
import { useStore } from 'web-pkg'

export default defineComponent({
  components: {},
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup() {
    const store = useStore()
    const mobileAppScheme = store.getters.configuration.commonTheme.mobileAppScheme || 'owncloud'

    const generateAppUrl = (fileId: string) => {
      return `${mobileAppScheme}://${window.location.host}/f/${fileId}`
    }
    return {
      generateAppUrl
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
  position: absolute;
  top: 0;
  left: 0;
  overflow-x: hidden;
  width: 100%;
  height: 84px;
  background: #f3f3f3;
  font-family: Helvetica, sans, sans-serif;
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
.app-banner-exit::after {
  transform: rotate(-45deg);
}

.app-banner-exit::before,
.app-banner-exit::after {
  position: absolute;
  width: 1px;
  height: 12px;
  background: #767676;
  content: ' ';
}

.app-banner-exit::before {
  transform: rotate(45deg);
}

.app-banner-exit {
  position: absolute;
  top: calc(50% - 6px);
  left: 9px;
  display: block;
  margin: 0;
  width: 12px;
  height: 12px;
  border: 0;
  text-align: center;
}
</style>
