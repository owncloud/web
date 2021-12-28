<template>
  <div class="oc-p-s">
    <h2 class="" v-text="$gettext('Spaces')"></h2>
    <div class="">
      <span v-text="$gettext('Access all project related files on one place.')"></span>
      <a href="#" v-text="$gettext('Learn more about spaces.')"></a>
      <h3 v-text="$gettext('Your spaces')"></h3>
      <hr class="uk-margin-bottom" />
    </div>
    <div class="spaces-list uk-container uk-container-expand uk-padding-remove">
      <div
        v-if="!!spaces.length"
        class="
          uk-grid-match uk-grid-column-small uk-grid-row-large uk-text-center uk-child-width-1-3@s
        "
        uk-grid
      >
        <a v-for="space in spaces" :key="space.id" href="#">
          <span class="spaces-list-card oc-border uk-card uk-card-default">
            <span class="uk-card-media-top oc-border-b">
              <img
                :src="space.image ? space.image : defaultImg"
                :class="{ 'spaces-list-default-img': !space.image }"
                :alt="$gettext('Space image')"
              />
            </span>
            <span class="uk-card-body">
              <h3 class="uk-card-title">{{ space.name }}</h3>
            </span>
          </span>
        </a>
      </div>
      <div v-else>
        <no-content-message id="files-spaces-empty" class="files-empty" icon="space">
          <template #message>
            <span v-translate>You don't have any spaces currently</span>
          </template>
        </no-content-message>
      </div>
    </div>
  </div>
</template>

<script>
import NoContentMessage from '../../components/FilesList/NoContentMessage.vue'
import { ref, onMounted } from '@vue/composition-api'
import { useStore } from '../../composables'
import { spacesSDK } from '../sdk'

export default {
  components: {
    NoContentMessage
  },
  setup() {
    const store = useStore()
    const spaces = ref([])
    const defaultImg = store.getters.configuration.theme.spaces?.defaultImg
    const localSDK = spacesSDK(store.getters.configuration.server, store.getters.getToken)

    onMounted(async () => {
      const myDrives = (await localSDK.drives.listMyDrives()).data?.value

      if (!myDrives) {
        return
      }

      spaces.value = myDrives.filter((drive) => drive.driveType === 'project')
    })

    return {
      spaces,
      defaultImg
    }
  }
}
</script>

<style lang="scss">
.spaces-list {
  &-card {
    box-shadow: none !important;
  }

  .uk-card-media-top {
    display: inline-block;
    width: 100%;
    background-color: var(--oc-color-background-muted);
  }

  .uk-card-media-top img {
    max-height: 150px;
  }

  &-default-img {
    padding: 40px;
  }
}
</style>
