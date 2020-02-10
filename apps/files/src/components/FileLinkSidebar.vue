<template>
  <div class="uk-position-relative" id="oc-files-file-link">
    <div v-show="visiblePanel === PANEL_SHOW" :aria-hidden="visiblePanel !== PANEL_SHOW" :key="PANEL_SHOW">
      <oc-loader v-if="currentFileOutgoingSharesLoading" :aria-label="$gettext('Loading list of file links')"/>
      <template v-else>
        <section v-if="$_privateLinkOfHighlightedFile">
          <div class="uk-text-bold">
            <span v-translate>Private Link</span>
            <oc-button :aria-label="$_privateLinkCopyLabel" variation="raw" class="uk-margin-small-left">
              <oc-icon v-if="!linksCopied[$_privateLinkOfHighlightedFile]" name="copy_to_clipboard" size="small" id="files-sidebar-private-link-label"
                       v-clipboard:copy="$_privateLinkOfHighlightedFile" v-clipboard:success="$_clipboardSuccessHandler"/>
              <oc-icon v-else name="ready" size="small" id="files-sidebar-private-link-icon-copied" class="_clipboard-success-animation"/>
            </oc-button>
          </div>
          <div class="uk-text-meta">
            <i><translate>Only invited collaborators can use this link.</translate></i>
          </div>
          <hr/>
        </section>
        <section>
          <div class="uk-text-bold">
            <translate>Public Links</translate>
          </div>
          <div class="uk-text-meta">
            <i><translate>Any external collaborator with the respective link can access this resource. No sign-in required. Assign a password to avoid unintended document exposure.</translate></i>
          </div>
          <div class="uk-margin-small-top uk-margin-small-bottom">
            <oc-button @click="$_addPublicLink" icon="add" variation="primary" id="files-file-link-add">{{ $_addButtonLabel }}</oc-button>
          </div>
          <transition-group class="uk-list uk-list-divider uk-overflow-hidden uk-margin-remove"
                            :enter-active-class="$_transitionGroupEnter"
                            :leave-active-class="$_transitionGroupLeave"
                            name="custom-classes-transition"
                            tag="ul">
            <li v-for="link in $_directLinks" :key="link.key">
              <public-link-list-item :link="link"
                                     :modifiable="true"
                                     :indirect="false"
                                     :linksCopied="linksCopied"
                                     @onCopy="$_clipboardSuccessHandler"
                                     @onDelete="$_removePublicLink"
                                     @onEdit="$_editPublicLink" />
            </li>
          </transition-group>
          <hr class="uk-margin-small-top uk-margin-small-bottom" v-if="$_directLinks.length > 0 && $_indirectLinks.length > 0"/>
        </section>
        <section v-if="$_indirectLinks.length > 0">
          <ul class="uk-list uk-list-divider uk-overflow-hidden uk-margin-remove">
            <li v-for="link in $_indirectLinks" :key="'li-' + link.id">
              <public-link-list-item :link="link"
                                     :modifiable="false"
                                     :indirect="true"
                                     :linksCopied="linksCopied"
                                     @onCopy="$_clipboardSuccessHandler" />
            </li>
          </ul>
        </section>
        <div v-if="$_noPublicLinks" key="oc-file-links-no-results">
          <translate>No public links</translate>
        </div>
      </template>
    </div>
    <div v-if="visiblePanel === PANEL_EDIT" :key="PANEL_EDIT">
      <transition enter-active-class="uk-animation-slide-right uk-animation-fast"
                  leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast"
                  name="custom-classes-transition">
        <div class="uk-position-cover oc-default-background">
          <edit-public-link :params="params" @close="$_showList()"/>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import moment from 'moment'
import mixins from '../mixins'
import { shareTypes } from '../helpers/shareTypes'
import { getParentPaths } from '../helpers/path'
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
  title: ($gettext) => {
    return $gettext('Links')
  },
  data () {
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
    ...mapGetters('Files', ['highlightedFile', 'currentFileOutgoingLinks', 'currentFileOutgoingSharesLoading']),
    ...mapGetters(['getToken', 'capabilities']),
    ...mapState('Files', [
      'sharesTree'
    ]),

    $_transitionGroupEnter () {
      return this.transitionGroupActive ? 'uk-animation-slide-left-medium' : ''
    },
    $_transitionGroupLeave () {
      return this.transitionGroupActive ? 'uk-animation-slide-right-medium uk-animation-reverse' : ''
    },

    $_directLinks () {
      return [...this.currentFileOutgoingLinks]
        .sort(this.$_linksComparator)
        .map(share => {
          share.key = 'direct-link-' + share.id
          return share
        })
    },

    $_indirectLinks () {
      const allShares = []
      const parentPaths = getParentPaths(this.highlightedFile.path, true)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      parentPaths.forEach((parentPath) => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
            if (share.outgoing && share.shareType === shareTypes.link) {
              share.key = 'indirect-link-' + share.id
              allShares.push(share)
            }
          })
        }
      })

      return allShares.sort(this.$_linksComparator)
    },

    $_noPublicLinks () {
      return (this.$_directLinks.length + this.$_indirectLinks.length) === 0
    },

    $_expirationDate () {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: (expireDate.days) ? expireDate.days : false,
        enforced: expireDate.enforced === '1'
      }
    },
    $_addButtonLabel () {
      return this.$gettext('Add public link')
    },
    $_privateLinkCopyLabel () {
      return this.$gettext('Copy private link url')
    },
    $_privateLinkOfHighlightedFile () {
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
    highlightedFile (newItem, oldItem) {
      if (oldItem !== newItem) {
        this.transitionGroupActive = false
        this.$_reloadLinks()
      }
    }
  },
  mounted () {
    this.transitionGroupActive = false
    this.$_reloadLinks()
  },
  methods: {
    ...mapActions('Files', ['loadCurrentFileOutgoingShares', 'removeLink']),
    $_resetData () {
      this.params = {
        id: null,
        name: this.capabilities.files_sharing.public.defaultPublicLinkShareName,
        permissions: 1,
        hasPassword: false,
        expireDate: (this.$_expirationDate.days) ? moment().add(this.$_expirationDate.days, 'days').endOf('day').toISOString() : null
      }
    },
    $_removePublicLink (link) {
      this.transitionGroupActive = true
      this.removeLink({
        client: this.$client,
        share: link
      })
    },
    $_editPublicLink (link) {
      this.params = {
        id: link.id,
        name: link.name,
        permissions: parseInt(link.permissions),
        hasPassword: link.password,
        expireDate: (link.expiration !== null) ? moment(link.expiration).endOf('day').toISOString() : null
      }
      this.visiblePanel = PANEL_EDIT
    },
    $_addPublicLink () {
      this.transitionGroupActive = true
      this.$_resetData()
      this.visiblePanel = PANEL_EDIT
    },
    $_clipboardSuccessHandler (event) {
      this.$set(this.linksCopied, event.text, true)
      setTimeout(() => {
        this.linksCopied[event.text] = false
      }, 550)
    },
    $_showList () {
      this.visiblePanel = PANEL_SHOW
    },
    $_reloadLinks () {
      this.$_showList()
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext
      })
    },
    $_linksComparator (l1, l2) {
      const name1 = l1.name.toLowerCase().trim()
      const name2 = l2.name.toLowerCase().trim()
      // sorting priority 1: display name (lower case, ascending), 2: id (ascending)
      if (name1 === name2) {
        return textUtils.naturalSortCompare(l1.info.id + '', l2.info.id + '')
      } else {
        return textUtils.naturalSortCompare(name1, name2)
      }
    }
  }
}
</script>
<style scoped>
  /* FIXME: Move to design system */
  ._clipboard-success-animation {
    animation-name: _clipboard-success-animation;
    animation-duration: .5s;
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
