<template>
  <div id="oc-files-file-link" class="uk-position-relative">
    <div
      v-show="visiblePanel === PANEL_SHOW"
      :key="PANEL_SHOW"
      :aria-hidden="visiblePanel !== PANEL_SHOW"
    >
      <oc-loader v-if="linksLoading" :aria-label="$gettext('Loading list of file links')" />
      <template v-else>
        <section v-if="$_privateLinkOfHighlightedFile">
          <div class="uk-text-bold">
            <span v-translate>Private Link</span>
            <oc-button
              :aria-label="$_privateLinkCopyLabel"
              variation="raw"
              class="uk-margin-small-left"
            >
              <oc-icon
                v-if="!linksCopied[$_privateLinkOfHighlightedFile]"
                id="files-sidebar-private-link-label"
                @click="$_copyPrivateLinkToClipboard()"
                name="copy_to_clipboard"
                size="small"
              />
              <oc-icon
                v-else
                id="files-sidebar-private-link-icon-copied"
                name="ready"
                size="small"
                class="_clipboard-success-animation"
              />
            </oc-button>
          </div>
          <div class="uk-text-meta">
            <i><translate>Only invited collaborators can use this link.</translate></i>
          </div>
          <hr />
        </section>
        <section>
          <div class="uk-text-bold">
            <translate>Public Links</translate>
          </div>
          <div class="uk-text-meta">
            <i
              ><translate
                >Any external collaborator with the respective link can access this resource. No
                sign-in required. Assign a password to avoid unintended document
                exposure.</translate
              ></i
            >
          </div>
          <div class="uk-margin-small-top uk-margin-small-bottom">
            <oc-button
              id="files-file-link-add"
              icon="add"
              variation="primary"
              @click="$_addPublicLink"
              >{{ $_addButtonLabel }}</oc-button
            >
          </div>
          <transition-group
            class="uk-list uk-list-divider uk-overflow-hidden uk-margin-remove"
            :enter-active-class="$_transitionGroupEnter"
            :leave-active-class="$_transitionGroupLeave"
            name="custom-classes-transition"
            tag="ul"
          >
            <li v-for="link in links" :key="link.key">
              <public-link-list-item
                :link="link"
                :modifiable="!link.indirect"
                :indirect="link.indirect"
                :links-copied="linksCopied"
                @onCopy="$_clipboardSuccessHandler"
                @onDelete="$_removePublicLink"
                @onEdit="$_editPublicLink"
              />
            </li>
          </transition-group>
        </section>
        <div v-if="$_noPublicLinks" key="oc-file-links-no-results">
          <translate>No public links</translate>
        </div>
      </template>
    </div>
    <div v-if="visiblePanel === PANEL_EDIT" :key="PANEL_EDIT">
      <transition
        enter-active-class="uk-animation-slide-right uk-animation-fast"
        leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast"
        name="custom-classes-transition"
      >
        <div class="uk-position-cover oc-default-background">
          <edit-public-link :params="params" @close="$_showList()" />
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import moment from 'moment'
import mixins from '../mixins'
import copyToClipboard from 'copy-to-clipboard'
import { shareTypes } from '../helpers/shareTypes'
import { getParentPaths } from '../helpers/path'
import { dirname } from 'path'
import { textUtils } from '../helpers/textUtils'

const EditPublicLink = _ => import('./PublicLinksSidebar/EditPublicLink.vue')
const PublicLinkListItem = _ => import('./PublicLinksSidebar/PublicLinkListItem.vue')

const PANEL_SHOW = 'showLinks'
const PANEL_EDIT = 'editPublicLink'

export default {
  components: {
    EditPublicLink,
    PublicLinkListItem
  },
  mixins: [mixins],
  title: $gettext => {
    return $gettext('Links')
  },
  data() {
    return {
      visiblePanel: 'showLinks',
      linksCopied: {},
      transitionGroupActive: false,

      // panel types
      PANEL_SHOW: PANEL_SHOW,
      PANEL_EDIT: PANEL_EDIT,

      // group for easy payload
      params: {
        id: null,
        name: '',
        permissions: 1,
        hasPassword: false,
        expireDate: null
      }
    }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFileOutgoingLinks',
      'currentFileOutgoingSharesLoading',
      'sharesTreeLoading'
    ]),
    ...mapGetters(['getToken', 'capabilities']),
    ...mapState('Files', ['sharesTree']),

    $_transitionGroupEnter() {
      return this.transitionGroupActive ? 'uk-animation-slide-left-medium' : ''
    },
    $_transitionGroupLeave() {
      return this.transitionGroupActive
        ? 'uk-animation-slide-right-medium uk-animation-reverse'
        : ''
    },

    linksLoading() {
      return this.currentFileOutgoingSharesLoading || this.sharesTreeLoading
    },

    links() {
      return [...this.currentFileOutgoingLinks, ...this.indirectLinks]
        .sort(this.linksComparator)
        .map(share => {
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

      parentPaths.forEach(parentPath => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach(share => {
            if (share.outgoing && share.shareType === shareTypes.link) {
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
      return this.$gettext('Add public link')
    },
    $_privateLinkCopyLabel() {
      return this.$gettext('Copy private link url')
    },
    $_privateLinkOfHighlightedFile() {
      if (!this.highlightedFile) {
        return false
      }
      if (this.highlightedFile.isMounted()) {
        const file = encodeURIComponent(this.highlightedFile.name)
        return window.location.href.split('?')[0] + `?scrollTo=${file}`
      }
      return this.highlightedFile.privateLink
    }
  },
  watch: {
    highlightedFile(newItem, oldItem) {
      if (oldItem !== newItem) {
        this.transitionGroupActive = false
        this.$_reloadLinks()
      }
    }
  },
  mounted() {
    this.transitionGroupActive = false
    this.$_reloadLinks()
  },
  methods: {
    ...mapActions('Files', ['loadSharesTree', 'loadCurrentFileOutgoingShares', 'removeLink']),
    $_resetData() {
      this.params = {
        id: null,
        name: this.capabilities.files_sharing.public.defaultPublicLinkShareName,
        permissions: 1,
        hasPassword: false,
        expireDate: this.$_expirationDate.days
          ? moment()
              .add(this.$_expirationDate.days, 'days')
              .endOf('day')
              .toISOString()
          : null
      }
    },
    $_removePublicLink(link) {
      this.transitionGroupActive = true
      this.removeLink({
        client: this.$client,
        share: link
      })
    },
    $_editPublicLink(link) {
      this.params = {
        id: link.id,
        name: link.name,
        permissions: parseInt(link.permissions),
        hasPassword: link.password,
        expireDate:
          link.expiration !== null
            ? moment(link.expiration)
                .endOf('day')
                .toISOString()
            : null
      }
      this.visiblePanel = PANEL_EDIT
    },
    $_addPublicLink() {
      this.transitionGroupActive = true
      this.$_resetData()
      this.visiblePanel = PANEL_EDIT
    },
    $_copyPrivateLinkToClipboard() {
      copyToClipboard(this.$_privateLinkOfHighlightedFile)
      this.$_clipboardSuccessHandler({ action: 'copy', text: this.$_privateLinkOfHighlightedFile })
    },
    $_clipboardSuccessHandler(event) {
      this.$set(this.linksCopied, event.text, true)
      setTimeout(() => {
        this.linksCopied[event.text] = false
      }, 550)
    },
    $_showList() {
      this.visiblePanel = PANEL_SHOW
    },
    $_reloadLinks() {
      this.$_showList()
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext
      })
      this.loadSharesTree({
        client: this.$client,
        path: dirname(this.highlightedFile.path),
        $gettext: this.$gettext
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
    }
  }
}
</script>
<style scoped>
/* FIXME: Move to design system */
._clipboard-success-animation {
  animation-name: _clipboard-success-animation;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: both;
}

@keyframes _clipboard-success-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}
</style>
<style>
/* FIXME: Move to design system (copied from FileSharingSidebar.vue) */
.oc-app-side-bar .oc-label {
  display: block;
  margin-bottom: 5px;
}

.oc-app-side-bar .files-file-link-role-button {
  padding: 0 10px;
  text-align: left;
}

/** needed to cover the container below when transitioning */
.oc-app-side-bar .oc-default-background {
  background-color: white;
}
</style>
