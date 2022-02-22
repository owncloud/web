<template>
  <div id="oc-space-details-sidebar">
    <input
      id="space-image-upload-input"
      ref="spaceImageInput"
      type="file"
      name="file"
      multiple
      tabindex="-1"
      accept="image/*"
      @change="$_uploadImage_uploadImageSpace"
    />
    <div class="oc-space-details-sidebar-image oc-text-center">
      <oc-spinner v-if="loadImageTask.isRunning" />
      <div v-else-if="spaceImage" class="oc-position-relative">
        <oc-button
          id="space-image-upload-button"
          class="oc-position-absolute oc-mt-s oc-mr-s"
          variation="passive"
          size="small"
          appearance="filled"
          @click="$_uploadImage_trigger({ resources: [space] })"
        >
          <oc-icon name="image-add" />
          <translate>Upload new space image</translate>
        </oc-button>
        <img :src="'data:image/jpeg;base64,' + spaceImage" alt="" class="oc-mb-m" />
      </div>
      <oc-icon
        v-else
        name="layout-grid"
        size="xxlarge"
        class="space-default-image oc-px-m oc-py-m"
      />
    </div>
    <div v-if="hasPeopleShares || hasLinkShares" class="oc-flex oc-flex-middle oc-mb-m">
      <oc-icon v-if="hasPeopleShares" name="group" class="oc-mr-s" />
      <oc-icon v-if="hasLinkShares" name="link" class="oc-mr-s" />
      <span class="oc-text-small" v-text="shareLabel" />
    </div>
    <div>
      <table class="details-table" :aria-label="detailsTableLabel">
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Last activity')" />
          <td v-text="lastModifyDate" />
        </tr>
        <tr v-if="space.description">
          <th scope="col" class="oc-pr-s" v-text="$gettext('Subtitle')" />
          <td v-text="space.description" />
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Manager')" />
          <td>
            <span v-if="!loadOwnersTask.isRunning" v-text="ownerUsernames" />
          </td>
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Quota')" />
          <td>
            <space-quota :space-quota="space.spaceQuota" />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import { ref } from '@vue/composition-api'
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import { mapGetters } from 'vuex'
import { useTask } from 'vue-concurrency'
import { buildWebDavSpacesPath } from '../../../helpers/resources'
import { useStore } from 'web-pkg/src/composables'
import { clientService } from 'web-pkg/src/services'
import SpaceQuota from '../../SpaceQuota.vue'
import UploadImage from '../../../mixins/spaces/actions/uploadImage'

export default {
  name: 'SpaceDetails',
  components: { SpaceQuota },
  mixins: [Mixins, MixinResources, UploadImage],
  inject: ['displayedItem'],
  title: ($gettext) => {
    return $gettext('Details')
  },
  setup() {
    const store = useStore()
    const spaceImage = ref('')
    const owners = ref([])
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadImageTask = useTask(function* (signal, ref) {
      if (!ref.space?.spaceImageData) {
        return
      }

      const webDavPathComponents = ref.space.spaceImageData.webDavUrl.split('/')
      const path = webDavPathComponents
        .slice(webDavPathComponents.indexOf(ref.space.id) + 1)
        .join('/')

      const fileContents = yield ref.$client.files.getFileContents(
        buildWebDavSpacesPath(ref.space.id, path),
        { responseType: 'arrayBuffer' }
      )

      spaceImage.value = Buffer.from(fileContents).toString('base64')
    })

    const loadOwnersTask = useTask(function* (signal, ref) {
      const promises = []
      for (const userId of ref.ownerUserIds) {
        promises.push(graphClient.users.getUser(userId))
      }

      if (promises.length > 0) {
        yield Promise.all(promises).then((resolvedData) => {
          resolvedData.forEach((response) => {
            owners.value.push(response.data)
          })
        })
      }
    })

    return { loadImageTask, loadOwnersTask, spaceImage, owners }
  },
  computed: {
    ...mapGetters(['user']),

    space() {
      return this.displayedItem.value
    },
    detailsTableLabel() {
      return this.$gettext('Overview of the information about the selected space')
    },
    lastModifyDate() {
      return this.formDateFromISO(this.space.mdate)
    },
    ownerUserIds() {
      const permissions = this.space.spacePermissions?.filter((permission) =>
        permission.roles.includes('manager')
      )
      if (!permissions.length) {
        return []
      }

      const userIds = permissions.reduce((acc, item) => {
        const ids = item.grantedTo.map((user) => user.user.id)
        acc = acc.concat(ids)
        return acc
      }, [])

      return [...new Set(userIds)]
    },
    ownerUsernames() {
      const userId = this.user?.id
      return this.owners
        .map((owner) => {
          if (owner.onPremisesSamAccountName === userId) {
            return this.$gettextInterpolate(this.$gettext('%{displayName} (me)'), {
              displayName: owner.displayName
            })
          }
          return owner.displayName
        })
        .join(', ')
    },
    hasPeopleShares() {
      return false // @TODO
    },
    hasLinkShares() {
      return false // @TODO
    },
    peopleShareCount() {
      return 0 // @TODO
    },
    linkShareCount() {
      return 0 // @TODO
    },
    shareLabel() {
      let peopleString, linksString

      if (this.hasPeopleShares) {
        peopleString = this.$gettextInterpolate(
          this.$ngettext(
            'This space has been shared with %{peopleShareCount} person.',
            'This space has been shared with %{peopleShareCount} people.',
            this.peopleShareCount
          ),
          {
            peopleShareCount: this.peopleShareCount
          }
        )
      }

      if (this.hasLinkShares) {
        linksString = this.$gettextInterpolate(
          this.$ngettext(
            '%{linkShareCount} link giving access.',
            '%{linkShareCount} links giving access.',
            this.linkShareCount
          ),
          {
            linkShareCount: this.linkShareCount
          }
        )
      }

      if (peopleString && linksString) {
        return `${peopleString} ${linksString}`
      }

      if (peopleString) {
        return peopleString
      }

      if (linksString) {
        return linksString
      }

      return ''
    }
  },
  mounted() {
    this.loadImageTask.perform(this)
    this.loadOwnersTask.perform(this)
  }
}
</script>
<style lang="scss" scoped>
#space-image-upload-button {
  top: 0;
  right: 0;
}

.oc-space-details-sidebar {
  &-image img {
    max-height: 150px;
    object-fit: cover;
    width: 100%;
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
