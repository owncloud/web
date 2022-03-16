<template>
  <div id="oc-files-file-link" class="oc-position-relative">
    <div
      v-show="currentView === VIEW_SHOW"
      :key="VIEW_SHOW"
      :aria-hidden="currentView !== VIEW_SHOW"
    >
      <oc-loader v-if="linksLoading" :aria-label="$gettext('Loading list of file links')" />
      <template v-else>
        <private-link-item v-if="privateLinkEnabled" />
        <h3 v-translate class="oc-text-bold oc-m-rm oc-text-initial">Public Links</h3>
        <div v-if="canCreatePublicLinks" class="oc-my-s">
          <p v-translate class="oc-text-muted">
            Any external person with the respective link can access this resource. No sign-in
            required. Assign a password to avoid unintended document exposure.
          </p>
          <oc-button
            id="files-file-link-add"
            icon="add"
            variation="primary"
            data-testid="files-link-add-btn"
            :aria-label="$_addButtonAriaLabel"
            @click="addNewLink"
          >
            <oc-icon name="add" />
            {{ $_addButtonLabel }}
          </oc-button>
        </div>
        <p
          v-else
          data-testid="files-links-no-reshare-permissions-message"
          class="oc-mt-s"
          v-text="noResharePermsMessage"
        />
        <ul class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm">
          <li v-for="link in links" :key="link.key">
            <list-item :data-testid="`files-link-id-${link.id}`" :link="link" />
          </li>
        </ul>
        <p
          v-if="$_noPublicLinks && canCreatePublicLinks"
          id="oc-file-links-no-results"
          key="oc-file-links-no-results"
          v-translate
          class="oc-my-rm"
        >
          No public links
        </p>
      </template>
    </div>
    <div v-if="currentView === VIEW_EDIT" :key="VIEW_EDIT">
      <link-edit />
    </div>
  </div>
</template>
<script>
import { DateTime } from 'luxon'
import { dirname } from 'path'
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import mixins from '../../../mixins'
import { getParentPaths } from '../../../helpers/path'
import { textUtils } from '../../../helpers/textUtils'
import { cloneStateObject } from '../../../helpers/store'
import LinkEdit from './PublicLinks/LinkEdit.vue'
import ListItem from './PublicLinks/ListItem.vue'
import PrivateLinkItem from './PrivateLinkItem.vue'
import { ShareTypes } from '../../../helpers/share'

const VIEW_SHOW = 'showLinks'
const VIEW_EDIT = 'editPublicLink'

export default {
  name: 'FileLinks',
  components: {
    LinkEdit,
    ListItem,
    PrivateLinkItem
  },
  mixins: [mixins],
  title: ($gettext) => {
    return $gettext('Links')
  },
  provide() {
    return {
      changeView: (view) => (this.$data.currentView = view)
    }
  },
  data() {
    return {
      VIEW_SHOW,
      VIEW_EDIT,
      currentView: VIEW_SHOW
    }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFileOutgoingLinks',
      'currentFileOutgoingSharesLoading',
      'sharesTreeLoading'
    ]),
    ...mapGetters(['capabilities']),
    ...mapState('Files', ['sharesTree']),

    canCreatePublicLinks() {
      return this.highlightedFile.canShare()
    },

    noResharePermsMessage() {
      const translatedFile = this.$gettext("You don't have permission to share this file.")
      const translatedFolder = this.$gettext("You don't have permission to share this folder.")
      return this.highlightedFile.type === 'file' ? translatedFile : translatedFolder
    },

    linksLoading() {
      return this.currentFileOutgoingSharesLoading || this.sharesTreeLoading
    },

    links() {
      return [...this.currentFileOutgoingLinks, ...this.indirectLinks]
        .sort(this.linksComparator)
        .map((share) => {
          share.key = 'direct-link-' + share.id
          return share
        })
    },

    indirectLinks() {
      const allShares = []
      const parentPaths = getParentPaths(this.highlightedFile.path, false)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      parentPaths.forEach((parentPath) => {
        const shares = cloneStateObject(this.sharesTree[parentPath])
        if (shares) {
          shares.forEach((share) => {
            if (share.outgoing && share.shareType === ShareTypes.link.value) {
              share.key = 'indirect-link-' + share.id
              allShares.push(share)
            }
          })
        }
      })

      return allShares.sort(this.linksComparator)
    },

    $_noPublicLinks() {
      return this.links.length === 0
    },

    $_expirationDate() {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: expireDate.days ? expireDate.days : false,
        enforced: expireDate.enforced === '1'
      }
    },
    $_addButtonLabel() {
      return this.$gettext('Public link')
    },
    $_addButtonAriaLabel() {
      return this.$gettext('Create new public link')
    },

    privateLinkEnabled() {
      return this.capabilities.files.privateLinks
    }
  },
  watch: {
    highlightedFile(newItem, oldItem) {
      if (oldItem !== newItem) {
        this.$_reloadLinks()
      }
    }
  },
  mounted() {
    this.$_reloadLinks()
  },

  methods: {
    ...mapActions('Files', ['loadSharesTree', 'loadCurrentFileOutgoingShares']),
    ...mapMutations('Files', ['TRIGGER_PUBLIC_LINK_CREATE']),

    $_showList() {
      this.currentView = VIEW_SHOW
    },
    $_reloadLinks() {
      this.$_showList()
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        storageId: this.$route.params.storageId
      })
      this.loadSharesTree({
        client: this.$client,
        path: dirname(this.highlightedFile.path),
        $gettext: this.$gettext,
        storageId: this.$route.params.storageId
      })
    },
    linksComparator(l1, l2) {
      // sorting priority 1: display name (lower case, ascending), 2: creation time (descending)
      const name1 = l1.name.toLowerCase().trim()
      const name2 = l2.name.toLowerCase().trim()
      const l1Direct = !l1.indirect
      const l2Direct = !l2.indirect

      if (l1Direct === l2Direct) {
        if (name1 === name2) {
          return l1.stime - l2.stime
        }

        return textUtils.naturalSortCompare(name1, name2)
      }

      return l1Direct ? -1 : 1
    },

    addNewLink() {
      this.TRIGGER_PUBLIC_LINK_CREATE({
        name: this.capabilities.files_sharing.public.defaultPublicLinkShareName,
        expireDate: this.$_expirationDate.days
          ? DateTime.now().plus({ days: this.$_expirationDate.days }).endOf('day').toISO()
          : null
      })

      this.currentView = VIEW_EDIT
    }
  }
}
</script>
