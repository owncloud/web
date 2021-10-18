<template>
  <div>
    <oc-button
      :id="roleButtonId"
      data-testid="files-recipient-role-select-btn"
      appearance="raw"
      justify-content="left"
      gap-size="xsmall">
      <oc-icon name="more_vert" />
    </oc-button>
    <oc-drop
      ref="rolesDrop"
      data-testid="files-recipient-roles-drop"
      :toggle="'#' + roleButtonId"
      mode="click"
    >
      <template #special>
        <oc-list class="show-collaborators-edit-options oc-p-xs" :aria-label="rolesListAriaLabel">
          <li v-for="(option, i) in options" :key="i" class="oc-p-s" @click="option.method()">
            <oc-button class="edit-option" appearance="raw">
              <oc-icon :name="option.icon" />
              {{ option.title }}
            </oc-button>
          </li>
          <li>
            <collaborators-edit-options
              :minimal="true"
              :permissions-input="false"
              :expiration-date-input="true"
              :expiration-date="expirationDate"
              class="oc-mb"
              @optionChange="expirationDateChanged"
            />
          </li>
        </oc-list>
      </template>
    </oc-drop>
  </div>
</template>

<script>
import CollaboratorsMixins from '../../../../mixins/collaborators'
import Mixins from '../../../../mixins'
import CollaboratorsEditOptions from './CollaboratorsEditOptions.vue'

export default {
  name: 'ShowCollaboratorEditOptions',
  mixins: [Mixins, CollaboratorsMixins],
  props: {
    collaborator: {
      type: Object,
      required: true
    },
    expirationDate: {
      type: Date,
      required: false,
      default: undefined
    },
  },
  components: {
    CollaboratorsEditOptions
  },
  data: function () {
    return {
      options: [
        {
          title: 'Expiration Date',
          icon: 'text-calendar'
        },
        {
          title: 'Remove',
          icon: 'delete',
          method: this.removeShare
        }
      ]
    }
  },
  computed: {
    roleButtonId() {
      return 'files-collaborators-role-button-' + this._uid
    }
  },
  methods: {
    test() {
      alert('hi')
    },
    removeShare() {
      this.$emit('removeShare')
    },
    expirationDateChanged({expirationDate}){
      this.$emit('expirationDateChanged', {expirationDate})
    }
  }
}
</script>

<style lang="scss" scoped="scoped">
.oc-drop {
  background-color: var(--oc-color-swatch-inverse-default);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.show-collaborators-edit-options .edit-option:hover {
  color: black !important;
}
</style>
