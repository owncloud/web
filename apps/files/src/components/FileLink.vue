<template>
  <div id="oc-files-file-link">
    <div class="uk-text-right">
      <oc-button variation="primary" icon="add" @click="$_openForm()" translate>Add Link</oc-button>
    </div>

    <transition-group tag="ul" name="custom-classes-transition" enter-active-class="uk-animation-slide-left-medium" leave-active-class="uk-animation-slide-right-medium uk-animation-reverse" class="uk-list uk-list-divider">
      <li v-for="(link, index) in $_links" :key="index">
        <oc-grid flex gutter="small">
          <div class="uk-width-auto">
            <oc-icon v-if="link.password" name="lock" class="uk-icon-button" />
            <oc-icon v-else name="link" class="uk-icon-button" />
          </div>
          <div class="uk-width-expand">
            <span class="uk-text-bold">{{ link.name }}</span><br>
            <span class="uk-text-meta">{{ link.description }} | Expires {{ formDateFromNow(link.expiration) }}</span>
          </div>
          <div class="uk-width-auto uk-button-group">
            <oc-button icon="edit" @click="$_editLink(link)"/>
            <oc-button icon="delete" @click="$_removeLink(link)" />
          </div>
        </oc-grid>
      </li>
    </transition-group>

    <div id="oc-files-file-link-modal" uk-modal>
      <div class="uk-modal-dialog">
        <div class="uk-modal-header">
          <h3 v-translate>
            Create a public link
          </h3>
          <p class="uk-text-bold">
            {{ highlightedFile.name }}
          </p>
        </div>
        <div class="uk-modal-body" uk-overflow-auto>
          <div class="uk-margin">
            <label class="uk-form-label" v-translate>Name your link</label>
            <input class="uk-input" v-model="params.name" />
          </div>
          <h4 class="uk-heading-divider">
            <template v-translate v-if="$_isFile">File permissions</template>
            <template v-translate v-else-if="$_isFolder">Folder permissions</template>
            <template v-translate v-else>Set permissions</template>
          </h4>
          <div class="uk-margin uk-grid-small" uk-grid>
          <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="params.permissions" value="1" />
          </div>
          <label class="uk-width-expand" @click="params.permissions = 1">
              <span>Viewer</span><br>
              <span class="uk-text-meta">Recipients can view and download contents.</span>
          </label>
          </div>
          <div v-if="$_isFolder" class="uk-margin uk-grid-small" uk-grid>
          <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="params.permissions" value="15" />
          </div>
          <label class="uk-width-expand" @click="params.permissions = 15">
              <span v-translate>Contributor</span><br>
              <span class="uk-text-meta">Recipients can view, download and upload contents.</span>
          </label>
          </div>
          <div v-if="$_isFolder" class="uk-margin uk-grid-small" uk-grid>
          <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="params.permissions" value="5" />
          </div>
          <label class="uk-width-expand" @click="params.permissions = 5">
              <span>Editor</span><br>
              <span class="uk-text-meta">Recipients can view, download, edit, delete and upload contents.</span>
          </label>
          </div>
          <div v-if="$_isFolder" class="uk-margin uk-grid-small" uk-grid>
          <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="params.permissions" value="4" />
          </div>
          <label class="uk-width-expand" @click="params.permissions = 4">
              <span v-translate>Uploader</span><br>
              <span class="uk-text-meta">Receive files from multiple recipients without revealing the contents of the folder.</span>
          </label>
          </div>
          <h4 class="uk-margin-medium-top uk-heading-divider">
              Security settings
          </h4>
          <div class="uk-margin uk-grid-small uk-flex uk-flex-middle" uk-grid>
          <div v-if="$_expirationDate" class="uk-width-1-1 uk-width-2-5@m">
              <label class="uk-form-label" for="">Expiration date<em v-if="$_expirationDate.enforced" class="uk-margin-small-left">(required)</em></label>
              <input type="text" class="uk-input" :class="{ 'uk-form-danger': !$_expirationIsValid }" v-model="params.expireDate" />
          </div>
          <div class="uk-width-1-1 uk-width-3-5@m">
              <label class="uk-form-label" for="">Password<em v-if="$_passwordEnforced" class="uk-margin-small-left">(required)</em></label>
              <input type="password" class="uk-input" :class="{ 'uk-form-danger': !$_passwordIsValid }" v-model="params.password" :placeholder="params.hasPassword && params.password === null? '********' : ''"/>
          </div>
          </div>
          <template v-if="$_sendMailEnabled">
              <h4 class="uk-margin-medium-top uk-heading-divider">
                  Send mail notification
              </h4>
              <div class="uk-margin">
                  <!-- <input type="text" class="uk-input" placeholder="E-Mail-Recipients" /> -->
                  <input type="text" class="uk-input" placeholder="E-Mail-Recipients (API MISSING)" disabled />
              </div>
              <div class="uk-margin">
                  <!-- <textarea class="uk-textarea" placeholder="Personal note" rows="4"></textarea> -->
                  <textarea class="uk-textarea" placeholder="Personal note (API MISSING)" rows="4" disabled></textarea>
              </div>
              <div class="uk-margin">
                  <!-- <label><input type="checkbox" class="uk-checkbox uk-margin-small-right"> Send a copy to myself</label> -->
                  <label><input type="checkbox" class="uk-checkbox uk-margin-small-right" disabled> Send a copy to myself</label>
              </div>
          </template>
        </div>
        <div class="uk-modal-footer uk-text-right">
            <oc-button @click="$_closeForm">Cancel</oc-button>
            <oc-button v-if="!linksLoading && $_isNew" :disabled="!$_isValid" variation="primary" @click="$_addLink" v-translate>Create</oc-button>
            <oc-button v-else-if="!linksLoading && !$_isNew" :disabled="!$_isValid" variation="primary" @click="$_updateLink" v-translate>Save</oc-button>
            <button v-if="linksLoading" disabled class="uk-button uk-button-default uk-position-relative" @click="$_addLink"><oc-spinner class="uk-position-small uk-position-center-left" size="small" /><span class="uk-margin-small-left" v-translate>Working</span></button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import uikit from 'uikit'
import mixins from '../mixins'

export default {
  mixins: [mixins],
  title: ($gettext) => {
    return $gettext('Links')
  },
  data () {
    return {
      // Render template only when needed
      formOpen: false,
      linkId: false,

      // group for easy payload
      params: {
        name: '',
        permissions: 1,
        hasPassword: false,
        password: '',
        expireDate: null
      }
    }
  },
  mounted () {
    if (this.highlightedFile) {
      this.loadLinks({
        client: this.$client,
        path: this.highlightedFile.path
      })
    } else {
      this.purgeLinks()
    }

    this.$root.$on('oc-files-file-link', e => {
      switch (e.action) {
        case 'closeForm' :
          this.$_closeForm()
          break
      }
    })
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

    $_isNew () {
      return !this.linkId
    },

    $_isFolder () {
      return this.highlightedFile.type === 'folder'
    },

    $_isFile () {
      return !this.$_isFolder
    },

    $_sendMailEnabled () {
      return Object.keys(this.capabilities.files_sharing.public.send_mail).length > 0
    },

    $_expirationIsValid () {
      return !(this.$_expirationDate.enforced && this.expireDate === '')
    },

    $_passwordIsValid () {
      if (this.params.hasPassword) { return true }

      return !(this.$_passwordEnforced && (this.params.password === '' || this.params.password === null))
    },

    $_isValid () {
      return this.$_expirationIsValid && this.$_passwordIsValid
    },

    $_passwordEnforced () {
      const permissions = parseInt(this.permissions)
      const password = this.capabilities.files_sharing.public.password.enforced_for

      if (permissions === 1 && password.read_only === '1') { return true }
      if (permissions === 4 && password.upload_only === '1') { return true }
      if (permissions >= 5 && password.read_write === '1') { return true }

      return false
    }
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink', 'loadLinks', 'purgeLinks', 'removeLink']),

    $_resetData () {
      this.params = {
        name: this.capabilities.files_sharing.public.defaultPublicLinkShareName,
        permissions: 1,
        hasPassword: false,
        expireDate: (this.$_expirationDate.days) ? moment().add(this.$_expirationDate.days, 'days').format('YYYY-MM-DD') : null
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
        expireDate: moment(link.expiration).format('YYYY-MM-DD')
      }
      uikit.modal('#oc-files-file-link-modal').show()
    },
    $_openForm () {
      uikit.modal('#oc-files-file-link-modal').show()
      this.$_resetData()
    },
    $_closeForm () {
      uikit.modal('#oc-files-file-link-modal').hide()
      this.linkId = false
    },
    $_addLink () {
      const params = {
        expireDate: this.params.expireDate,
        permissions: this.params.permissions,
        name: this.params.name
      }

      if (this.params.password !== null) { params.password = this.params.password }

      this.addLink({
        path: this.highlightedFile.path,
        client: this.$client,
        $gettext: this.$gettext,
        params
      }).then(e => {
        this.$_closeForm()
      }).catch(e => console.warn(e))
    },

    $_updateLink () {
      const params = {
        expireDate: this.params.expireDate,
        permissions: this.params.permissions,
        name: this.params.name
      }

      if (this.params.password !== null) { params.password = this.params.password }

      this.updateLink({
        id: this.linkId,
        client: this.$client,
        $gettext: this.$gettext,
        params
      }).then(e => {
        this.$_closeForm()
      }).catch(e => console.warn(e))
    }
  }
}
</script>
