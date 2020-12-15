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
        <label class="oc-label"><span v-translate>Name:</span></label>
        <input id="oc-files-file-link-name" v-model="name" class="uk-input" />
      </div>
      <oc-grid child-width="1-1" gutter="small">
        <roles-select
          :roles="$_roles"
          :selected-role="$_selectedRole"
          mode="file-link"
          @roleSelected="$_selectRole"
        />
      </oc-grid>
      <div class="oc-mb uk-grid-small uk-flex uk-flex-middle" uk-grid>
        <div v-if="$_expirationDate" class="uk-width-1-1 uk-width-2-5@m">
          <label class="oc-label" for="oc-files-file-link-expire-date">
            <span v-translate>Expiration date:</span>
            <translate v-if="$_expirationDate.enforced" tag="em">(required)</translate>
          </label>
          <div class="uk-position-relative">
            <oc-datepicker
              id="oc-files-file-link-expire-date"
              :key="'oc-datepicker-' + expireDate"
              :class="{ 'uk-form-danger': !$_expirationIsValid }"
              :date="expireDate"
              :max-datetime="$_maxExpirationDate"
              :min-datetime="$_minExpirationDate"
              :placeholder="placeholder.expireDate"
              @input="expireDate = $event"
            />
            <div
              v-if="!$_expirationDate.enforced && !!expireDate"
              id="oc-files-file-link-expire-date-delete"
              :uk-tooltip="$_expirationDateRemoveText"
              class="uk-position-small uk-position-center-right oc-cursor-pointer"
              uk-close
              @click="expireDate = null"
            />
          </div>
        </div>
        <div class="uk-width-1-1 uk-width-3-5@m">
          <label class="oc-label" for="oc-files-file-link-password">
            <span v-translate>Password:</span
            ><em v-if="$_passwordEnforced" class="oc-ml-s">(<span v-translate>required</span>)</em>
          </label>
          <div class="uk-position-relative">
            <input
              id="oc-files-file-link-password"
              v-model="password"
              :class="{ 'uk-form-danger': !$_passwordIsValid }"
              :placeholder="hasPassword && password === null ? '********' : placeholder.password"
              autocomplete="new-password"
              class="uk-input"
              type="password"
            />
            <div
              v-if="!$_passwordEnforced && hasPassword"
              id="oc-files-file-link-password-delete"
              :uk-tooltip="$_passwordRemoveText"
              class="uk-position-small uk-position-center-right oc-cursor-pointer"
              uk-close
              @click="password = ''"
            />
          </div>
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
          <oc-button v-if="saving" variation="primary" disabled>
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
              @click="$_addLink"
            >
              <translate>Create</translate>
            </oc-button>
            <oc-button
              v-else
              id="oc-files-file-link-save"
              :disabled="!$_isValid || !$_hasChanges"
              variation="primary"
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
import filter from 'lodash/filter'
import first from 'lodash/first'
import values from 'lodash/values'
import publicLinkRoles from '../../helpers/publicLinkRolesDefinition'
const RolesSelect = () => import('../Roles/RolesSelect.vue')

export default {
  components: {
    RolesSelect
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
      permissions: 1,
      placeholder: {
        expireDate: this.$gettext('Expiration date'),
        password: this.$gettext('Password'),
        mailTo: this.$gettext('Mail recipients'),
        mailBody: this.$gettext('Personal note')
      }
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
        this.permissions !== this.publicLinkInEdit.permissions ||
        (this.publicLinkInEdit.hasPassword
          ? this.password !== null
          : this.password !== null && this.password.trim().length > 0)
      )
    },

    $_sendMailEnabled() {
      return Object.keys(this.capabilities.files_sharing.public.send_mail).length > 0
    },

    $_roles() {
      const $gettext = this.$gettext
      return publicLinkRoles({
        $gettext,
        isFolder: this.$_isFolder
      })
    },

    $_selectedRole() {
      const permissions = parseInt(this.permissions, 10)
      if (permissions) {
        const matchingRoles = filter(this.$_roles, r => r.permissions === permissions)
        if (matchingRoles.length > 0) {
          return first(values(matchingRoles))
        }
      }
      return this.$_roles.viewer
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

    $_expirationDateRemoveText() {
      return this.$gettext('Remove expiration date')
    },

    $_passwordRemoveText() {
      return this.$gettext('Remove password')
    }
  },
  created() {
    this.name = this.publicLinkInEdit.name
    this.hasPassword = this.publicLinkInEdit.hasPassword
    this.expireDate = this.publicLinkInEdit.expireDate
    this.permissions = this.publicLinkInEdit.permissions
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACCORDION_CONTEXT']),

    $_selectRole(role) {
      this.permissions = role.permissions
    },

    $_addLink() {
      this.saving = true

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
        permissions: this.permissions,
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
    }
  }
}
</script>
