<template>
  <div id="oc-files-file-link">
    <template v-if="$_privateLinkOfHighlightedFile">
      <div class="uk-text-bold">
        Private Link
      </div>
      <div name="link" class="uk-link" v-show="!linkCopied"
         id="files-sidebar-private-link-label"
         v-clipboard:copy="$_privateLinkOfHighlightedFile"
         v-clipboard:success="$_clipboardSuccessHandler">
        {{ $_copyPrivateLinkLabel }}
      </div>
      <oc-icon name="ready" id="files-sidebar-private-link-icon-copied" v-show="linkCopied" />
    </template>
    <hr v-if="$_privateLinkOfHighlightedFile" />
    <div class="uk-text-bold">
      Public Link
    </div>
    <div class="uk-text-left">
      <oc-button v-if="!linksLoading" :disabled="!!(formOpen || linkId)" variation="primary" icon="add" @click="$_openForm()" v-translate>Add Link</oc-button>
      <button v-else disabled class="uk-button uk-button-default uk-position-relative"><oc-spinner class="uk-position-small uk-position-center-left" size="small" /><span class="uk-margin-small-left" v-translate>Loading</span></button>
    </div>
    <FileLinkForm v-if="formOpen" v-bind:params="params" :linkId="linkId" class="uk-margin" />
    <transition-group tag="ul" name="custom-classes-transition" enter-active-class="uk-animation-slide-left-medium" leave-active-class="uk-animation-slide-right-medium uk-animation-reverse" class="uk-list uk-list-divider uk-overflow-hidden">
      <li v-for="(link, index) in $_links" :key="'li-' + index">
        <oc-grid flex gutter="small">
          <div class="uk-width-auto">
            <oc-icon v-show="link.password" name="lock" size="medium" />
            <oc-icon v-show="!link.password" name="link" size="medium" />
          </div>
          <div class="uk-width-expand uk-text-truncate">
            <span class="uk-text-bold">{{ link.name }}</span><br>
            <a :href="link.url" :uk-tooltip="$_tooltipTextLink" class="uk-text-small uk-link">{{ link.token }}</a> <span class="uk-text-meta">| {{ link.description }}<template v-if="link.expiration"> | <span v-translate>Expires</span> {{ formDateFromNow(link.expiration) }}</template></span>
          </div>
          <div class="uk-width-auto uk-button-group">
            <button class="uk-button uk-button-default uk-position-relative" :aria-label="$_copyButtonLabel" @click.stop="$_copyToClipboard(link, $event)">
              <oc-icon name="copy_to_clipboard" class="uk-position-center" />
            </button>
            <oc-button :disabled="!!(formOpen || linkId)" :aria-label="$_editButtonLabel" icon="edit" @click="$_editLink(link)"/>
            <oc-button :disabled="!!(formOpen || linkId)" :aria-label="$_deleteButtonLabel" icon="delete" @click="$_removeLink(link)" />
          </div>
        </oc-grid>
        <FileLinkForm v-if="linkId === link.id" class="uk-margin-top" :params="params" :context="'edit'" :linkId="linkId"/>
      </li>
    </transition-group>
    <p v-if="$_links.length === 0" class="uk-text-meta" v-translate>
      Links can be shared with external collaborators.
    </p>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import mixins from '../mixins'

const FileLinkForm = _ => import('./FileLinkForm.vue')

export default {
  mixins: [mixins],
  components: { FileLinkForm },
  title: ($gettext) => {
    return $gettext('Links')
  },
  data () {
    return {
      // Render template only when needed
      formOpen: false,
      linkId: false,
      linkCopied: false,

      // group for easy payload
      params: {
        name: '',
        permissions: 1,
        password: '',
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

    this.$root.$on('oc-files-file-link', e => {
      switch (e.action) {
        case 'closeForm' :
          this.$_closeForm()
          break
      }
    })
  },
  watch: {
    highlightedFile (n, o) {
      if (n === o) { return }

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
        return parseInt(link.itemSource) === parseInt(this.highlightedFile.id)
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
        name: this.capabilities.files_sharing.public.defaultPublicLinkShareName,
        permissions: 1,
        hasPassword: false,
        expireDate: (this.$_expirationDate.days) ? moment().add(this.$_expirationDate.days, 'days').endOf('day').toISOString() : null
      }
    },
    $_removeLink (link) {
      this.removeLink({
        client: this.$client,
        id: link.id
      })
    },
    $_editLink (link) {
      this.linkId = link.id
      this.params = {
        name: link.name,
        permissions: parseInt(link.permissions),
        hasPassword: link.password,
        expireDate: (link.expiration !== null) ? moment(link.expiration).endOf('day').toISOString() : null
      }
    },
    $_openForm () {
      this.formOpen = true
      this.$_resetData()
    },
    $_closeForm () {
      this.formOpen = false
      this.linkId = false
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
      transform: translate(-50%,-50%);
      opacity: 1;
    }
    100% {
      transform: translate(-50%,-125%);
      opacity: 0;
    }
  }
</style>
