<template>
  <div class="oc-files-edit-public-link uk-background-muted uk-padding-small">
    <transition enter-active-class="uk-animation-slide-top-small" leave-active-class="uk-animation-slide-top-small uk-animation-reverse"
                name="custom-classes-transition">
      <div class="uk-alert-danger" uk-alert v-if="errors">
        <a class="uk-alert-close" uk-close/>
        <p v-text="errors"/>
      </div>
    </transition>
    <div class="uk-margin">
      <label class="uk-form-label" v-translate>Name your link</label>
      <input class="uk-input" id="oc-files-file-link-name" v-model="name"/>
    </div>
    <h4 class="uk-margin-medium-top uk-heading-divider" v-translate>
      Set Roles
    </h4>
    <div class="uk-margin uk-grid-small" uk-grid>
      <div class="uk-width-auto">
        <input class="uk-radio" id="oc-files-file-link-collaborator-role-viewer" type="radio" v-model="permissions"
               value="1"/>
      </div>
      <label @click="permissions = 1" class="uk-width-expand">
        <span>Viewer</span><br>
        <span class="uk-text-meta" v-translate>Recipients can view and download contents.</span>
      </label>
    </div>
    <div class="uk-margin uk-grid-small" uk-grid v-if="$_isFolder">
      <div class="uk-width-auto">
        <input class="uk-radio" id="oc-files-file-link-collaborator-role-contributor" type="radio" v-model="permissions"
               value="5"/>
      </div>
      <label @click="permissions = 5" class="uk-width-expand">
        <span v-translate>Contributor</span><br>
        <span class="uk-text-meta" v-translate>Recipients can view, download and upload contents.</span>
      </label>
    </div>
    <div class="uk-margin uk-grid-small" uk-grid v-if="$_isFolder">
      <div class="uk-width-auto">
        <input class="uk-radio" id="oc-files-file-link-collaborator-role-editor" type="radio" v-model="permissions"
               value="15"/>
      </div>
      <label @click="permissions = 15" class="uk-width-expand">
        <span v-translate>Editor</span><br>
        <span class="uk-text-meta" v-translate>Recipients can view, download, edit, delete and upload contents.</span>
      </label>
    </div>
    <div class="uk-margin uk-grid-small" uk-grid v-if="$_isFolder">
      <div class="uk-width-auto">
        <input class="uk-radio" id="oc-files-file-link-collaborator-role-uploader" type="radio" v-model="permissions"
               value="4"/>
      </div>
      <label @click="permissions = 4" class="uk-width-expand">
        <span v-translate>Uploader</span><br>
        <span class="uk-text-meta" v-translate>Receive files from multiple recipients without revealing the contents of the folder.</span>
      </label>
    </div>
    <h4 class="uk-margin-medium-top uk-heading-divider" v-translate>
      Security settings
    </h4>
    <div class="uk-margin uk-grid-small uk-flex uk-flex-middle" uk-grid>
      <div class="uk-width-1-1 uk-width-2-5@m" v-if="$_expirationDate">
        <label class="uk-form-label" for=""><span v-translate>Expiration date</span><em class="uk-margin-small-left"
                                                                                        v-if="$_expirationDate.enforced">(<span
          v-translate>required</span>)</em></label>
        <oc-datepicker :class="{ 'uk-form-danger': !$_expirationIsValid }" :date="expireDate" :maxDatetime="$_maxExpirationDate"
                       :minDatetime="$_minExpirationDate" :placeholder="placeholder.expireDate"
                       @input="expireDate = $event" id="oc-files-file-link-expire-date"/>
      </div>
      <div class="uk-width-1-1 uk-width-3-5@m">
        <label class="uk-form-label" for=""><span v-translate>Password</span><em class="uk-margin-small-left"
                                                                                 v-if="$_passwordEnforced">(<span
          v-translate>required</span>)</em></label>
        <div class="uk-position-relative">
          <input :class="{ 'uk-form-danger': !$_passwordIsValid }" :placeholder="hasPassword && password === null? '********' : placeholder.password" autocomplete="new-password"
                 class="uk-input" id="oc-files-file-link-password"
                 type="password"
                 v-model="password"/>
          <div :uk-tooltip="$_passwordRemoveText" @click="password=''"
               class="uk-position-small uk-position-center-right oc-cursor-pointer" uk-close
               v-if="!$_passwordEnforced && hasPassword"/>
        </div>
      </div>
    </div>
    <hr class="divider"/>
    <oc-grid class="uk-margin-bottom" gutter="small">
      <div>
        <oc-button :disabled="linksLoading" @click="$_closeForm" v-translate>Cancel</oc-button>
        <oc-button :disabled="!$_isValid" @click="$_addLink" v-if="!linksLoading && $_isNew" v-translate
                   variation="primary">Create
        </oc-button>
        <oc-button :disabled="!$_isValid || !$_hasChanges" @click="$_updateLink" v-else-if="!linksLoading && !$_isNew"
                   v-translate variation="primary">Save
        </oc-button>
        <button class="uk-button uk-button-default uk-position-relative" disabled v-else>
          <template v-if="$_isNew">
            <oc-spinner :ariaLabel="$gettext('Creating Public Link')" class="uk-position-small uk-position-center-left" size="small"/>
            <span class="uk-margin-small-left" :aria-hidden="true" v-translate>Creating Public Link</span>
          </template>
          <template v-else>
            <oc-spinner :ariaLabel="$gettext('Saving Public Link')" class="uk-position-small uk-position-center-left" size="small"/>
            <span class="uk-margin-small-left" :aria-hidden="true" v-translate>Saving Public Link</span>
          </template>
        </button>
      </div>
    </oc-grid>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import mixins from '../../mixins'
import moment from 'moment'

export default {
  mixins: [mixins],
  props: ['params'],
  data () {
    return {
      password: null,
      errors: false,
      ...this.params,

      placeholder: {
        expireDate: this.$gettext('Expiration date'),
        password: this.$gettext('Password'),
        mailTo: this.$gettext('Mail recipients'),
        mailBody: this.$gettext('Personal note')
      }
    }
  },
  title: ($gettext) => {
    return $gettext('Links')
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'linksLoading']),
    ...mapGetters(['getToken', 'capabilities']),

    $_isNew () {
      return !this.params.id
    },

    $_isFolder () {
      return this.highlightedFile.type === 'folder'
    },

    $_isFile () {
      return !this.$_isFolder
    },

    $_hasChanges () {
      return (this.expireDate !== this.params.expireDate) ||
          (this.name !== this.params.name) ||
          (this.permissions !== this.params.permissions) ||
          (this.password !== null)
    },

    $_sendMailEnabled () {
      return Object.keys(this.capabilities.files_sharing.public.send_mail).length > 0
    },

    $_expirationDate () {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: (expireDate.days) ? expireDate.days : false,
        enforced: expireDate.enforced === '1'
      }
    },

    $_minExpirationDate () {
      return moment().add(1, 'days').endOf('day').toISOString()
    },

    $_maxExpirationDate () {
      if (!this.$_expirationDate.enforced) {
        return null
      }

      const days = parseInt(this.$_expirationDate.days)

      return moment().add(days, 'days').endOf('day').toISOString()
    },

    $_expirationIsValid () {
      return !(this.$_expirationDate.enforced && this.expireDate === '')
    },

    $_passwordIsValid () {
      if (this.hasPassword) {
        return true
      }

      return !(this.$_passwordEnforced && (this.password === '' || this.password === null))
    },

    $_isValid () {
      return this.$_expirationIsValid && this.$_passwordIsValid
    },

    $_passwordEnforced () {
      const permissions = parseInt(this.permissions)
      const password = this.capabilities.files_sharing.public.password.enforced_for

      if (permissions === 1 && password.read_only === '1') {
        return true
      }
      if (permissions === 4 && password.upload_only === '1') {
        return true
      }
      if (permissions >= 5 && password.read_write === '1') {
        return true
      }

      return false
    },

    $_passwordRemoveText () {
      return this.$gettext('Remove password')
    }
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink']),

    $_addLink () {
      const params = {
        expireDate: this.expireDate,
        permissions: this.permissions,
        name: this.name
      }

      if (this.password !== null) {
        params.password = this.password
      }

      this.addLink({
        path: this.highlightedFile.path,
        client: this.$client,
        $gettext: this.$gettext,
        params
      }).then(e => {
        this.errors = false
        this.$_closeForm()
      }).catch(e => {
        this.errors = e
      })
    },

    $_updateLink () {
      const params = {
        expireDate: this.expireDate,
        permissions: this.permissions,
        name: this.name
      }

      if (this.password !== null) {
        params.password = this.password
      }

      this.updateLink({
        id: this.params.id,
        client: this.$client,
        $gettext: this.$gettext,
        params
      }).then(() => {
        this.errors = false
        this.$_closeForm()
      }).catch(e => {
        this.errors = e
      })
    },

    $_closeForm () {
      this.$emit('close')
    }
  }
}
</script>
