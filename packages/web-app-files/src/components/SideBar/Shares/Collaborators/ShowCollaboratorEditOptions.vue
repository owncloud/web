<template>
  <div class="show-collaborator-edit-options">
    <oc-button
      :id="roleButtonId"
      data-testid="files-recipient-role-select-btn"
      appearance="raw"
      justify-content="left"
      gap-size="xsmall"
    >
      <oc-icon name="more_vert" />
    </oc-button>
    <oc-drop
      ref="rolesDrop"
      data-testid="files-recipient-roles-drop"
      :toggle="'#' + roleButtonId"
      mode="click"
    >
      <template #special>
        <oc-list class="list-collaborator-edit-options oc-p-xs" :aria-label="rolesListAriaLabel">
          <li v-if="expirationDateExists" class="oc-pl-xs">
            <collaborators-edit-options
              :minimal="true"
              :permissions-input="false"
              :expiration-date-input="true"
              :expiration-date="expirationDate"
              @optionChange="expirationDateChanged"
            />
          </li>
          <li v-for="(option, i) in options" :key="i" @click="option.method()" class="oc-pl-xs">
              <oc-icon :variation="option.variation" :name="option.icon" />
              <span :class="option.class">{{ option.title }}</span>
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
  components: {
    CollaboratorsEditOptions
  },
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
    }
  },
  data: function () {
    return {
      options: [
        {
          title: 'Remove',
          icon: 'delete',
          variation: 'danger',
          method: this.removeShare,
          class: 'remove-share'
        }
      ]
    }
  },
  computed: {
    roleButtonId() {
      return 'files-collaborators-role-button-' + this._uid
    },

    rolesListAriaLabel() {
      return this.$gettext('Sharing roles')
    }
  },
  methods: {
    expirationDateExists() {
      return this.collaborator.expires
    },
    removeShare() {
      this.$emit('removeShare')
    },
    expirationDateChanged({ expirationDate }) {
      this.$emit('expirationDateChanged', { expirationDate })
    }
  }
}
</script>

<style lang="scss" scoped="scoped">
.oc-drop {
  background-color: var(--oc-color-swatch-inverse-default);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.list-collaborator-edit-options .edit-option:hover {
  color: black !important;
}
.show-collaborator-edit-options {
  display: flex;
  align-items: center;

  li {
    display: table;
    table-layout: fixed;
    width: 100%;
    height: 35px;
    cursor: pointer;

    div {
      width: 100%;
    }
    span {
      display: table-cell;
      vertical-align: middle;
    }
    .oc-icon {
      width: 12%;
    }
  }
}

.remove-share {
  color: var(--oc-color-swatch-danger-default);
}
</style>
