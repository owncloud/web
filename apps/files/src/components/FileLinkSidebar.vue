<template>
  <div class="uk-position-relative" id="oc-files-file-link">
    <div v-if="visiblePanel === PANEL_SHOW">
      <oc-loader :aria-label="$gettext('Loading list of file links')" v-if="linksLoading"/>
      <template v-else>
        <template v-if="$_privateLinkOfHighlightedFile">
          <div class="uk-text-bold" v-translate>Private Link</div>
          <div class="uk-link" id="files-sidebar-private-link-label" name="link"
               v-clipboard:copy="$_privateLinkOfHighlightedFile"
               v-clipboard:success="$_clipboardSuccessHandler"
               v-show="!linkCopied">
            {{ $_copyPrivateLinkLabel }}
          </div>
          <oc-icon id="files-sidebar-private-link-icon-copied" name="ready" v-show="linkCopied"/>
          <hr/>
        </template>
        <div class="uk-text-bold" v-translate>Public Links</div>
        <div class="uk-text-right">
          <oc-button @click="$_addPublicLink" icon="add" variation="primary">{{ $_addButtonLabel }}</oc-button>
        </div>
        <transition-group class="uk-list uk-list-divider uk-overflow-hidden"
                          enter-active-class="uk-animation-slide-left-medium"
                          leave-active-class="uk-animation-slide-right-medium uk-animation-reverse"
                          name="custom-classes-transition"
                          tag="ul">
          <li :key="'li-' + index" v-for="(link, index) in $_links">
            <oc-grid flex gutter="small">
              <div class="uk-width-auto">
                <oc-icon name="lock" size="medium" v-show="link.password"/>
                <oc-icon name="link" size="medium" v-show="!link.password"/>
              </div>
              <div class="uk-width-expand uk-text-truncate">
                <span class="uk-text-bold">{{ link.name }}</span><br>
                <a :href="link.url" :uk-tooltip="$_tooltipTextLink" class="uk-text-small uk-link">{{ link.token }}</a>
                <span class="uk-text-meta">| {{ link.description }}<template v-if="link.expiration"> | <span
                  v-translate>Expires</span> {{ formDateFromNow(link.expiration) }}</template></span>
              </div>
              <div class="uk-width-auto uk-button-group">
                <button :aria-label="$_copyButtonLabel" @click.stop="$_copyToClipboard(link, $event)"
                        class="uk-button uk-button-default uk-position-relative">
                  <oc-icon class="uk-position-center" name="copy_to_clipboard"/>
                </button>
                <oc-button :aria-label="$_editButtonLabel" @click="$_editPublicLink(link)" icon="edit"/>
                <oc-button :aria-label="$_deleteButtonLabel" @click="$_removePublicLink(link)" icon="delete"/>
              </div>
            </oc-grid>
          </li>
        </transition-group>
        <p class="uk-text-meta" v-if="$_links.length === 0" v-translate>
          Links can be shared with external collaborators.
        </p>
      </template>
    </div>
    <div v-else-if="visiblePanel === PANEL_EDIT">
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
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import mixins from '../mixins'

const EditPublicLink = _ => import('./PublicLinksSidebar/EditPublicLink.vue')

const PANEL_SHOW = 'showLinks'
const PANEL_EDIT = 'editPublicLink'

export default {
  mixins: [mixins],
  components: {
    EditPublicLink
  },
  title: ($gettext) => {
    return $gettext('Links')
  },
  data () {
    return {
      visiblePanel: 'showLinks',
      linkCopied: false,

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
  mounted () {
    if (this.highlightedFile && this.$_links.length === 0) {
      this.loadLinks({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext
      })
    }
  },
  watch: {
    highlightedFile (n, o) {
      if (n === o) {
        return
      }

      this.visiblePanel = PANEL_SHOW
      this.loadLinks({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext
      })
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'links', 'linksLoading', 'linksError']),
    ...mapGetters(['getToken', 'capabilities']),

    $_links () {
      return this.links.filter(link => {
        return this.compareIds(link.itemSource, this.highlightedFile.id)
      })
    },

    $_expirationDate () {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: (expireDate.days) ? expireDate.days : false,
        enforced: expireDate.enforced === '1'
      }
    },
    $_tooltipTextLink () {
      return `title: ${this.$gettext('Click to open the link')}; pos: bottom`
    },
    $_addButtonLabel () {
      return this.$gettext('Add public link')
    },
    $_deleteButtonLabel () {
      return this.$gettext('Delete public link')
    },
    $_editButtonLabel () {
      return this.$gettext('Edit public link')
    },
    $_copyButtonLabel () {
      return this.$gettext('Copy link url')
    },
    $_copyPrivateLinkLabel () {
      return this.$gettext('Copy Private Link')
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
  methods: {
    ...mapActions('Files', ['loadLinks', 'purgeLinks', 'removeLink']),
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
      this.removeLink({
        client: this.$client,
        id: link.id
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
      this.$_resetData()
      this.visiblePanel = PANEL_EDIT
    },
    $_copyToClipboard (link) {
      this.$copyText(link.url)

      const clone = event.currentTarget.firstElementChild.cloneNode(true)
      clone.classList.add('_clipButton')
      event.currentTarget.append(clone)

      // Remove clone after animation ends
      setTimeout(() => clone.remove(), 500)
    },
    $_clipboardSuccessHandler () {
      this.linkCopied = true

      // Use copy icon after some time
      setTimeout(() => {
        this.linkCopied = false
      }, 1000)
    },
    $_showList () {
      this.visiblePanel = PANEL_SHOW
    }
  }
}
</script>
<style scoped>
  ._clipButton {
    animation-name: _clipButton;
    animation-duration: .5s;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
  }

  @keyframes _clipButton {
    0% {
      transform: translate(-50%, -50%);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -125%);
      opacity: 0;
    }
  }
</style>
