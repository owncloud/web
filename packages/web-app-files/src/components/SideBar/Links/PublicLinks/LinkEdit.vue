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
        <oc-text-input
          id="oc-files-file-link-name"
          ref="nameInput"
          v-model="name"
          :label="$gettext('Name')"
        />
      </div>
      <oc-select
        id="files-file-link-role-button"
        v-model="selectedRole"
        :options="roles"
        :clearable="false"
        :label="selectedRoleLabel"
        class="oc-mb files-file-link-role-button-wrapper"
      >
        <template #option="option">
          <role-item :role="option" />
        </template>
        <template #no-options v-translate> No matching role found </template>
      </oc-select>
      <div v-if="$_expirationDate" class="oc-mb">
        <label for="files-links-expiration-btn" v-text="expirationDateLabel" />
        <oc-datepicker
          id="oc-files-file-link-expire-date"
          :key="'oc-datepicker-' + expireDate"
          v-model="expireDate"
          :min-date="minExpirationDate"
          :max-date="maxExpirationDate"
          :locale="$language.current"
          :is-required="$_expirationDate.enforced"
          class="files-recipient-expiration-datepicker"
          data-testid="recipient-datepicker"
        >
          <template #default="{ togglePopover }">
            <oc-button
              id="files-links-expiration-btn"
              data-testid="recipient-datepicker-btn"
              class="uk-width-1-1 expiration-dialog-btn"
              justify-content="space-between"
              gap-size="xsmall"
              @click="togglePopover"
            >
              <translate v-if="!expireDate" key="no-expiration-date-label"
                >Set expiration date</translate
              >
              <translate
                v-else
                key="set-expiration-date-label"
                :translate-params="{ expires: relativeExpirationDate }"
              >
                Expires %{expires}
              </translate>
              <oc-icon name="expand_more" />
            </oc-button>
          </template>
        </oc-datepicker>
        <oc-button
          v-if="!$_expirationDate.enforced && !!expireDate"
          id="oc-files-file-link-expire-date-delete"
          class="oc-mt-s"
          appearance="raw"
          @click="expireDate = null"
          v-text="$gettext('Remove expiration date')"
        />
      </div>
      <div>
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
          <oc-button
            v-if="saving"
            id="oc-files-file-link-saving"
            variation="primary"
            appearance="filled"
            disabled
          >
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
import { mapGetters, mapActions, mapState } from 'vuex'

import mixins from '../../../../mixins'
import { DateTime } from 'luxon'
import publicLinkRoles from '../../../../helpers/publicLinkRolesDefinition'

import RoleItem from '../../Shared/RoleItem.vue'

export default {
  components: {
    RoleItem
  },
  mixins: [mixins],
  inject: ['changeView'],
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
  title: ($gettext) => {
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
      const expireDateNow = this.expireDate
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

    minExpirationDate() {
      return DateTime.now().setLocale(this.$language.current).toJSDate()
    },

    maxExpirationDate() {
      if (!this.$_expirationDate.enforced) {
        return null
      }

      const days = parseInt(this.$_expirationDate.days, 10)
      return DateTime.now().setLocale(this.$language.current).plus({ days: days }).toJSDate()
    },

    $_expirationIsValid() {
      return !(this.$_expirationDate.enforced && !this.expireDate)
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
        return this.$gettext('Expiration date (required)')
      }

      return this.$gettext('Expiration date')
    },

    passwordLabel() {
      if (this.$_passwordEnforced) {
        return this.$gettext('Password (required)')
      }

      return this.$gettext('Password')
    },
    selectedRoleLabel() {
      return this.$gettext('Role')
    },

    relativeExpirationDate() {
      return DateTime.fromJSDate(this.expireDate)
        .setLocale(this.$language.current)
        .endOf('day')
        .toRelative()
    },

    defaultExpireDate() {
      if (!this.$_expirationDate.days) {
        return null
      }

      const days = parseInt(this.$_expirationDate.days)
      return DateTime.now().setLocale(this.$language.current).plus({ days: days }).toJSDate()
    }
  },
  created() {
    const link = this.publicLinkInEdit

    this.name = link?.name
    this.hasPassword = link?.hasPassword
    const expireDateOrNull = link.expireDate ? new Date(this.publicLinkInEdit.expireDate) : null
    this.expireDate = link?.id ? expireDateOrNull : this.defaultExpireDate
    this.setRole()
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.nameInput.focus()
    })
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink']),

    setRole() {
      const permissions = parseInt(this.publicLinkInEdit.permissions, 10)

      if (permissions) {
        const role = this.roles.find((r) => r.permissions === permissions)

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
        expireDate: DateTime.fromJSDate(this.expireDate)
          .setLocale(this.$language.current)
          .endOf('day')
          .toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ"),
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
        .then((e) => {
          this.saving = false
          this.errors = false
          this.$_closeForm()
        })
        .catch((e) => {
          this.saving = false
          this.errors = e
        })
    },

    $_updateLink() {
      this.saving = true

      const params = {
        expireDate: DateTime.fromJSDate(this.expireDate)
          .setLocale(this.$language.current)
          .endOf('day')
          .toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ"),
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
        .catch((e) => {
          this.saving = false
          this.errors = e
        })
    },

    $_closeForm() {
      this.changeView('showLinks')
    },

    removePassword: function () {
      this.password = ''
      this.hasPassword = false
    }
  }
}
</script>
