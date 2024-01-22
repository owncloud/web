<template>
  <span class="oc-flex oc-flex-middle">
    <oc-button :id="editShareBtnId" class="collaborator-edit-dropdown-options-btn" appearance="raw">
      <oc-icon name="more-2" />
    </oc-button>
    <oc-drop
      ref="expirationDateDrop"
      :toggle="'#' + editShareBtnId"
      mode="click"
      padding-size="small"
    >
      <oc-list class="collaborator-edit-dropdown-options-list" :aria-label="shareEditOptions">
        <li v-if="canEditOrDelete && isExpirationSupported" class="oc-rounded oc-menu-item-hover">
          <oc-datepicker
            v-model="enteredExpirationDate"
            :min-date="minExpirationDate"
            :max-date="maxExpirationDate"
            :locale="$language.current"
            :is-required="isExpirationDateEnforced"
            class="files-recipient-expiration-datepicker oc-flex"
            data-testid="recipient-datepicker"
          >
            <template #default="{ togglePopover }">
              <oc-button
                class="files-collaborators-expiration-button oc-p-s action-menu-item"
                data-testid="recipient-datepicker-btn"
                appearance="raw"
                @click="togglePopover"
              >
                <oc-icon name="calendar-event" fill-type="line" size="medium" variation="passive" />
                <span
                  v-if="isExpirationDateSet"
                  class="oc-ml-s"
                  v-text="$gettext('Expires %{expires}', { expires: dateExpire })"
                />
                <span v-else v-text="$gettext('Set expiration date')" />
              </oc-button>
              <oc-button
                v-if="isRemoveExpirationPossible"
                class="remove-expiration-date"
                data-testid="collaborator-remove-expiration-btn"
                appearance="raw"
                :aria-label="$gettext('Remove expiration date')"
                @click="removeExpirationDate"
              >
                <oc-icon name="close" />
              </oc-button>
            </template>
          </oc-datepicker>
        </li>
        <li v-for="(option, i) in options" :key="i" class="oc-rounded oc-menu-item-hover">
          <template v-if="option.enabled">
            <div
              v-if="option.hasSwitch"
              class="action-menu-item item-has-switch oc-p-s oc-flex oc-flex-center"
            >
              <oc-icon :name="option.icon" fill-type="line" size="medium" variation="passive" />
              <oc-switch
                class="oc-ml-s oc-flex oc-width-1-1 oc-button-justify-content-space-between"
                :checked="isShareDenied"
                :class="option.class"
                :label="option.title"
                @update:checked="option.method"
              />
            </div>
            <oc-button
              v-else
              appearance="raw"
              class="oc-p-s action-menu-item"
              :class="option.class"
              v-bind="option.additionalAttributes || {}"
              @click="option.method"
            >
              <oc-icon :name="option.icon" fill-type="line" size="medium" variation="passive" />
              <span v-text="option.title" />
            </oc-button>
          </template>
        </li>
      </oc-list>
    </oc-drop>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, inject, Ref } from 'vue'
import { DateTime } from 'luxon'
import uniqueId from 'design-system/src/utils/uniqueId'
import { OcDrop } from 'design-system/src/components'
import { Resource } from '@ownclouders/web-client/src'
import { isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'
import {
  formatRelativeDateFromDateTime,
  useCapabilityStore,
  useConfigStore
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'EditDropdown',
  props: {
    expirationDate: {
      type: Date,
      required: false,
      default: undefined
    },
    shareCategory: {
      type: String,
      required: false,
      default: null,
      validator: function (value: string) {
        return ['user', 'group'].includes(value) || !value
      }
    },
    canEditOrDelete: {
      type: Boolean,
      required: true
    },
    isShareDenied: {
      type: Boolean,
      default: false
    },
    deniable: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'expirationDateChanged',
    'removeShare',
    'showAccessDetails',
    'setDenyShare',
    'notifyShare'
  ],
  setup(props, { emit }) {
    const capabilityStore = useCapabilityStore()
    const capabilityRefs = storeToRefs(capabilityStore)
    const language = useGettext()
    const configStore = useConfigStore()

    const toggleShareDenied = (value) => {
      emit('setDenyShare', value)
    }

    const dateExpire = computed(() =>
      formatRelativeDateFromDateTime(
        DateTime.fromJSDate(props.expirationDate).endOf('day'),
        language.current
      )
    )

    return {
      configStore,
      resource: inject<Ref<Resource>>('resource'),
      toggleShareDenied,
      dateExpire,
      userExpirationDate: capabilityRefs.sharingUserExpireDate,
      groupExpirationDate: capabilityRefs.sharingGroupExpireDate
    }
  },
  data: function () {
    return {
      enteredExpirationDate: null
    }
  },
  computed: {
    options() {
      return [
        {
          title: isProjectSpaceResource(this.resource)
            ? this.$gettext('Remove member')
            : this.$gettext('Remove share'),
          method: this.removeShare,
          class: 'remove-share',
          enabled: this.canEditOrDelete,
          icon: 'delete-bin-5',
          additionalAttributes: {
            'data-testid': 'collaborator-remove-share-btn'
          }
        },
        {
          title: this.$gettext('Access details'),
          method: this.showAccessDetails,
          enabled: true,
          icon: 'information',
          class: 'show-access-details'
        },
        {
          title: this.$gettext('Deny access'),
          method: this.toggleShareDenied,
          enabled: this.deniable,
          icon: 'stop-circle',
          class: 'deny-share',
          hasSwitch: true
        },
        {
          title: this.$gettext('Notify via mail'),
          method: () => this.$emit('notifyShare'),
          enabled: this.configStore.options.isRunningOnEos,
          icon: 'mail',
          class: 'notify-via-mail'
        }
      ]
    },

    editShareBtnId() {
      return uniqueId('files-collaborators-edit-button-')
    },
    shareEditOptions() {
      return this.$gettext('Context menu of the share')
    },

    editingUser() {
      return this.shareCategory === 'user'
    },

    editingGroup() {
      return this.shareCategory === 'group'
    },

    isExpirationSupported() {
      return this.editingUser || this.editingGroup
    },

    isExpirationDateSet() {
      return !!this.expirationDate
    },

    isRemoveExpirationPossible() {
      return (
        this.canEditOrDelete &&
        this.isExpirationSupported &&
        this.isExpirationDateSet &&
        !this.isExpirationDateEnforced
      )
    },

    isDefaultExpirationEnabled() {
      if (this.editingUser) {
        return this.userExpirationDate.enabled
      }

      if (this.editingGroup) {
        return this.groupExpirationDate.enabled
      }

      return this.userExpirationDate.enabled || this.groupExpirationDate.enabled
    },

    defaultExpirationDate() {
      if (!this.isDefaultExpirationEnabled) {
        return null
      }

      const userMaxExpirationDays = parseInt(this.userExpirationDate.days)
      const groupMaxExpirationDays = parseInt(this.groupExpirationDate.days)
      let days = 0

      if (this.editingUser) {
        days = userMaxExpirationDays
      } else if (this.editingGroup) {
        days = groupMaxExpirationDays
      } else if (userMaxExpirationDays && groupMaxExpirationDays) {
        days = Math.min(userMaxExpirationDays, groupMaxExpirationDays)
      } else {
        days = userMaxExpirationDays || groupMaxExpirationDays
      }

      const date = new Date()
      date.setDate(new Date().getDate() + days)
      return date
    },

    isExpirationDateEnforced() {
      if (this.editingUser) {
        return this.userExpirationDate?.enforced
      }

      if (this.editingGroup) {
        return this.groupExpirationDate?.enforced
      }

      return this.userExpirationDate?.enforced || this.groupExpirationDate?.enforced
    },

    maxExpirationDate() {
      if (!this.isExpirationDateEnforced) {
        return null
      }
      return this.defaultExpirationDate
    },

    minExpirationDate() {
      const date = new Date()
      date.setDate(new Date().getDate() + 1)
      return date
    }
  },
  watch: {
    enteredExpirationDate: {
      handler: 'updateExpirationDate'
    }
  },
  methods: {
    updateExpirationDate() {
      this.$emit('expirationDateChanged', {
        expirationDate: DateTime.fromJSDate(this.enteredExpirationDate).endOf('day').toISO()
      })
      ;(this.$refs.expirationDateDrop as InstanceType<typeof OcDrop>).hide()
    },
    removeExpirationDate() {
      this.$emit('expirationDateChanged', {
        expirationDate: null
      })
      ;(this.$refs.expirationDateDrop as InstanceType<typeof OcDrop>).hide()
    },
    removeShare() {
      this.$emit('removeShare')
    },
    showAccessDetails() {
      this.$emit('showAccessDetails')
    }
  }
})
</script>
<style lang="scss">
.collaborator-edit-dropdown-options-list .action-menu-item {
  width: 100%;
  justify-content: flex-start;
  color: var(--oc-color-swatch-passive-default);
  gap: var(--oc-space-small);
}
</style>
