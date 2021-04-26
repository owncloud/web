<template>
  <div class="oc-files-edit-public-link oc-files-file-link-form">
    <form @submit.prevent>
      <transition
        enter-active-class="uk-animation-slide-top-small"
        leave-active-class="uk-animation-slide-top-small uk-animation-reverse"
        name="custom-classes-transition"
      >
        <oc-alert v-if="errors" class="oc-files-file-link-error-alert" variation="danger">
          {{ errors }}
        </oc-alert>
      </transition>
      <div class="oc-mb">
        <oc-text-input id="oc-files-file-link-name" v-model="name" :label="$gettext('Name')" />
      </div>
      <translate tag="label" for="files-file-link-role-button" class="oc-label">
        Role
      </translate>
      <oc-select
        v-model="selectedRole"
        input-id="files-file-link-role-button"
        :options="roles"
        :clearable="false"
        label="label"
        class="oc-mb files-file-link-role-button-wrapper"
      >
        <template v-slot:option="option">
          <role-item :role="option" />
        </template>
        <template #no-options v-translate>
          No matching role found
        </template>
      </oc-select>
      <div class="oc-mb uk-grid-small uk-flex" uk-grid>
        <div v-if="$_expirationDate" class="uk-width-1-1 uk-width-2-5@m">
          <div class="uk-position-relative">
            <oc-datepicker
              id="oc-files-file-link-expire-date"
              :key="'oc-datepicker-' + expireDate"
              :label="expirationDateLabel"
              :date="expireDate"
              :max-datetime="$_maxExpirationDate"
              :min-datetime="$_minExpirationDate"
              @input="expireDate = $event"
            />
            <oc-button
              v-if="!$_expirationDate.enforced && !!expireDate"
              id="oc-files-file-link-expire-date-delete"
              class="oc-mt-s"
              appearance="raw"
              @click="expireDate = null"
              v-text="$gettext('Remove expiration date')"
            />
          </div>
        </div>
        <div class="uk-width-1-1 uk-width-3-5@m">
          <oc-text-input
            id="oc-files-file-link-password"
            v-model="password"
            type="password"
            :label="passwordLabel"
          />
          <oc-button
            v-if="!$_passwordEnforced && (password || hasPassword)"
            id="oc-files-file-link-password-delete"
            class="oc-mt-s"
            appearance="raw"
            @click="removePassword"
            v-text="$gettext('Remove password')"
          />
        </div>
      </div>
      <!-- @TODO: Enable Mail API to use the following
                  ++++++++++++++++++++++++++++++++++++
        <template v-if="$_sendMailEnabled">
            <h4 class="oc-mt-top uk-heading-divider">
                Send mail notification
            </h4>
            <div class="oc-mb">
                <input type="text" class="uk-input" :placeholder="placeholder.mailTo" />
            </div>
            <div class="oc-mb">
                <textarea class="uk-textarea" :placeholder="placeholder.mailBody rows="4"></textarea>
            </div>
            <div class="oc-mb">
                <label><input type="checkbox" class="uk-checkbox oc-mr-s" v-translate>Send a copy to myself</label>
            </div>
        </template>
        -->
      <hr class="divider" />
      <oc-grid class="oc-mb" gutter="small">
        <div>
          <oc-button id="oc-files-file-link-cancel" :disabled="saving" @click="$_closeForm">
            <translate>Cancel</translate>
          </oc-button>
        </div>
        <div>
          <oc-button v-if="saving" variation="primary" appearance="filled" disabled>
            <template v-if="$_isNew">
              <oc-spinner :aria-label="$gettext('Creating Public Link')" size="small" />
              <span v-translate :aria-hidden="true">Creating</span>
            </template>
            <template v-else>
              <oc-spinner :aria-label="$gettext('Saving Public Link')" size="small" />
              <span v-translate :aria-hidden="true">Saving</span>
            </template>
          </oc-button>
          <template v-else>
            <oc-button
              v-if="$_isNew"
              id="oc-files-file-link-create"
              :disabled="!$_isValid"
              variation="primary"
              appearance="filled"
              @click="$_addLink"
            >
              <translate>Create</translate>
            </oc-button>
            <oc-button
              v-else
              id="oc-files-file-link-save"
              :disabled="!$_isValid || !$_hasChanges"
              variation="primary"
              appearance="filled"
              @click="$_updateLink"
            >
              <translate>Save</translate>
            </oc-button>
          </template>
        </div>
      </oc-grid>
    </form>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import mixins from '../../mixins'
import moment from 'moment'
import publicLinkRoles from '../../helpers/publicLinkRolesDefinition'
import RoleItem from '../RoleItem.vue'

export default {
  components: {
    RoleItem
  },
  mixins: [mixins],
  data() {
    return {
      saving: false,
      password: null,
      errors: false,
      name: null,
      hasPassword: false,
      expireDate: null,
      placeholder: {
        mailTo: this.$gettext('Mail recipients'),
        mailBody: this.$gettext('Personal note')
      },
      selectedRole: null
    }
  },
  title: $gettext => {
    return $gettext('Links')
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken', 'capabilities']),
    ...mapState('Files', ['publicLinkInEdit']),

    $_isNew() {
      return !this.publicLinkInEdit.id
    },

    $_isFolder() {
      return this.highlightedFile.type === 'folder'
    },

    $_isFile() {
      return !this.$_isFolder
    },

    $_hasChanges() {
      const expireDateBefore = this.publicLinkInEdit.expireDate
        ? moment(this.publicLinkInEdit.expireDate).format('DD-MM-YYYY')
        : null
      const expireDateNow = this.expireDate ? moment(this.expireDate).format('DD-MM-YYYY') : null
      return (
        expireDateNow !== expireDateBefore ||
        this.name !== this.publicLinkInEdit.name ||
        this.selectedRole.permissions !== this.publicLinkInEdit.permissions ||
        (this.publicLinkInEdit.hasPassword
          ? this.password !== null
          : this.password !== null && this.password.trim().length > 0)
      )
    },

    $_sendMailEnabled() {
      return Object.keys(this.capabilities.files_sharing.public.send_mail).length > 0
    },

    roles() {
      const $gettext = this.$gettext
      return publicLinkRoles({
        $gettext,
        isFolder: this.$_isFolder
      })
    },

    $_expirationDate() {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: expireDate.days ? expireDate.days : false,
        enforced: !!expireDate.enforced
      }
    },

    $_minExpirationDate() {
      return moment()
        .add(1, 'days')
        .endOf('day')
        .toISOString()
    },

    $_maxExpirationDate() {
      if (!this.$_expirationDate.enforced) {
        return null
      }

      const days = parseInt(this.$_expirationDate.days, 10)

      return moment()
        .add(days, 'days')
        .endOf('day')
        .toISOString()
    },

    $_expirationIsValid() {
      return !(this.$_expirationDate.enforced && this.expireDate === '')
    },

    $_passwordIsValid() {
      if (this.hasPassword) {
        return true
      }

      return !(this.$_passwordEnforced && (this.password === '' || this.password === null))
    },

    $_isValid() {
      return this.$_expirationIsValid && this.$_passwordIsValid
    },

    $_passwordEnforced() {
      const permissions = parseInt(this.selectedRole.permissions, 10)
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

    expirationDateLabel() {
      if (this.$_expirationDate.enforced) {
        return `${this.$gettext('Expiration date')} (${this.$gettext('required')})`
      }

      return this.$gettext('Expiration date')
    },

    passwordLabel() {
      if (this.$_passwordEnforced) {
        return `${this.$gettext('Password')} (${this.$gettext('required')})`
      }

      return this.$gettext('Password')
    }
  },
  created() {
    this.name = this.publicLinkInEdit.name
    this.hasPassword = this.publicLinkInEdit.hasPassword
    this.expireDate = this.publicLinkInEdit.expireDate

    this.setRole()
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACCORDION_CONTEXT']),

    setRole() {
      const permissions = parseInt(this.publicLinkInEdit.permissions, 10)

      if (permissions) {
        const role = this.roles.find(r => r.permissions === permissions)

        if (role) {
          this.selectedRole = role

          return
        }
      }

      this.selectedRole = this.roles[0]
    },

    $_addLink() {
      this.saving = true

      const params = {
        expireDate: this.expireDate,
        permissions: this.selectedRole.permissions,
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
      })
        .then(e => {
          this.saving = false
          this.errors = false
          this.$_closeForm()
        })
        .catch(e => {
          this.saving = false
          this.errors = e
        })
    },

    $_updateLink() {
      this.saving = true

      const params = {
        expireDate: this.expireDate,
        permissions: this.selectedRole.permissions,
        name: this.name
      }

      if (this.password !== null) {
        params.password = this.password
      }

      this.updateLink({
        id: this.publicLinkInEdit.id,
        client: this.$client,
        $gettext: this.$gettext,
        params
      })
        .then(() => {
          this.saving = false
          this.errors = false
          this.$_closeForm()
        })
        .catch(e => {
          this.saving = false
          this.errors = e
        })
    },

    $_closeForm() {
      this.SET_APP_SIDEBAR_ACCORDION_CONTEXT('showLinks')
    },

    removePassword: function() {
      this.password = ''
      this.hasPassword = false
    }
  }
}
</script>
