<template>
  <div class="oc-files-edit-public-link oc-files-file-link-form">
    <form @submit.prevent>
      <transition enter-active-class="uk-animation-slide-top-small" leave-active-class="uk-animation-slide-top-small uk-animation-reverse"
                  name="custom-classes-transition">
        <div class="uk-alert-danger" uk-alert v-if="errors">
          <a class="uk-alert-close" uk-close/>
          <p v-text="errors"/>
        </div>
      </transition>
      <div class="uk-margin">
        <label class="oc-label"><span v-translate>Name your link</span>:</label>
        <input class="uk-input" id="oc-files-file-link-name" v-model="name"/>
      </div>
      <oc-grid childWidth="1-1" gutter="small">
        <roles-select :roles="$_roles" :selectedRole="$_selectedRole" @roleSelected="$_selectRole" mode="file-links"/>
        <div class="uk-text-muted" v-if="$_selectedRole_description" v-text="$_selectedRole_description"></div>
      </oc-grid>
      <h4 class="uk-margin-medium-top uk-heading-divider" v-translate>
        Security settings
      </h4>
      <div class="uk-margin uk-grid-small uk-flex uk-flex-middle" uk-grid>
        <div class="uk-width-1-1 uk-width-2-5@m" v-if="$_expirationDate">
          <label class="oc-label" for="oc-files-file-link-expire-date">
            <span v-translate>Expiration date</span>:<em class="uk-margin-small-left" v-if="$_expirationDate.enforced">(<span v-translate>required</span>)</em>
          </label>
          <div class="uk-position-relative">
            <oc-datepicker :class="{ 'uk-form-danger': !$_expirationIsValid }" :date="expireDate" :key="'oc-datepicker-' + expireDate"
                           :maxDatetime="$_maxExpirationDate" :minDatetime="$_minExpirationDate"
                           :placeholder="placeholder.expireDate" @input="expireDate = $event" id="oc-files-file-link-expire-date"/>
            <div :uk-tooltip="$_expirationDateRemoveText" @click="expireDate=null" class="uk-position-small uk-position-center-right oc-cursor-pointer" uk-close
                 v-if="!!expireDate"/>
          </div>
        </div>
        <div class="uk-width-1-1 uk-width-3-5@m">
          <label class="oc-label" for="oc-files-file-link-password">
            <span v-translate>Password</span>:<em class="uk-margin-small-left" v-if="$_passwordEnforced">(<span v-translate>required</span>)</em>
          </label>
          <div class="uk-position-relative">
            <input :class="{ 'uk-form-danger': !$_passwordIsValid }" :placeholder="hasPassword && password === null? '********' : placeholder.password"
                   autocomplete="new-password" class="uk-input" id="oc-files-file-link-password" type="password" v-model="password"/>
            <div :uk-tooltip="$_passwordRemoveText" @click="password=''" class="uk-position-small uk-position-center-right oc-cursor-pointer" uk-close
                 v-if="!$_passwordEnforced && hasPassword"/>
          </div>
        </div>
      </div>
      <!-- @TODO: Enable Mail API to use the following
                  ++++++++++++++++++++++++++++++++++++
        <template v-if="$_sendMailEnabled">
            <h4 class="uk-margin-medium-top uk-heading-divider">
                Send mail notification
            </h4>
            <div class="uk-margin">
                <input type="text" class="uk-input" :placeholder="placeholder.mailTo" />
            </div>
            <div class="uk-margin">
                <textarea class="uk-textarea" :placeholder="placeholder.mailBody rows="4"></textarea>
            </div>
            <div class="uk-margin">
                <label><input type="checkbox" class="uk-checkbox uk-margin-small-right" v-translate>Send a copy to myself</label>
            </div>
        </template>
        -->
      <hr class="divider"/>
      <oc-grid class="uk-margin-bottom" gutter="small">
        <div>
          <oc-button :disabled="linksLoading" @click="$_closeForm"><translate>Cancel</translate></oc-button>
          <oc-button :disabled="!$_isValid" @click="$_addLink" v-if="!linksLoading && $_isNew" variation="primary"><translate>Create</translate></oc-button>
          <oc-button :disabled="!$_isValid || !$_hasChanges" @click="$_updateLink" v-else-if="!linksLoading && !$_isNew" variation="primary"><translate>Save</translate></oc-button>
          <button class="uk-button uk-button-default uk-position-relative" disabled v-else>
            <template v-if="$_isNew">
              <oc-spinner :ariaLabel="$gettext('Creating Public Link')" class="uk-position-small uk-position-center-left" size="small"/>
              <span :aria-hidden="true" class="uk-margin-small-left" v-translate>Creating Public Link</span>
            </template>
            <template v-else>
              <oc-spinner :ariaLabel="$gettext('Saving Public Link')" class="uk-position-small uk-position-center-left" size="small"/>
              <span :aria-hidden="true" class="uk-margin-small-left" v-translate>Saving Public Link</span>
            </template>
          </button>
        </div>
      </oc-grid>
    </form>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import mixins from '../../mixins'
import moment from 'moment'
import filter from 'lodash/filter'
import first from 'lodash/first'
import values from 'lodash/values'
import publicLinkRoles from '../../helpers/publicLinkRolesDefinition'
const RolesSelect = () => import('../Roles/RolesSelect.vue')

export default {
  mixins: [mixins],
  props: ['params'],
  components: {
    RolesSelect
  },
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

    $_roles () {
      const $gettext = this.$gettext
      return publicLinkRoles({
        $gettext,
        isFolder: this.$_isFolder
      })
    },

    $_selectedRole () {
      const permissions = parseInt(this.permissions, 10)
      if (permissions) {
        const matchingRoles = filter(this.$_roles, r => r.permissions === permissions)
        if (matchingRoles.length > 0) {
          return first(values(matchingRoles))
        }
      }
      return this.$_roles.viewer
    },

    $_selectedRole_description () {
      return this.$_selectedRole ? this.$_selectedRole.description : ''
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

      const days = parseInt(this.$_expirationDate.days, 10)

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
      const permissions = parseInt(this.permissions, 10)
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

    $_expirationDateRemoveText () {
      return this.$gettext('Remove expiration date')
    },

    $_passwordRemoveText () {
      return this.$gettext('Remove password')
    }
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink']),
    $_selectRole (role) {
      this.permissions = role.permissions
    },

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
