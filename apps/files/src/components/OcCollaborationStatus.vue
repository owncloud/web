<template>
  <div class="oc-collaboration-status">
    <oc-accordion uk-accordion="collapsible: false; multiple: true">
      <oc-accordion-item class="uk-open" title="Owner(s)">
        <template slot="content">
          <oc-user
            :avatar="owner.avatar"
            :user-name="owner.name"
            :display-name="owner.displayName"
            :email="owner.email"
          >
            <template slot="properties">
              <span>Owner</span>
            </template>
            <template slot="actions">
              <oc-icon name="delete" />
              <oc-icon name="edit" />
            </template>
          </oc-user>
        </template>
      </oc-accordion-item>
      <oc-accordion-item class="uk-open" title="Collaborators">
        <template slot="content">
          <oc-text-input placeholder="Add name(s), email(s) or federation ID's" />
          <ul class="uk-list">
            <li v-for="(c, k) in collaborators" :key="k">
              <oc-user
                :avatar="c.avatar"
                :user-name="c.name"
                :display-name="c.displayName"
                :email="c.email"
              >
                <template slot="properties">
                  <span v-if="c">
                    <span
                      v-if="c.role && roles[c.role] && roles[c.role].name"
                      v-text="roles[c.role].name"
                      :uk-tooltip="roles[c.role].description"
                    />
                    <span v-if="c.role && c.expires">|</span>
                    <span v-if="c.expires">Expires: {{ c.expires }}</span>
                  </span>
                </template>
                <template slot="actions">
                  <oc-icon name="delete" @click="onDelete(c)" />
                  <oc-icon v-if="editing != c" name="edit" @click="edit(c)" />
                </template>
              </oc-user>

              <div v-if="editing == c" class="uk-margin-small-top">
                <div v-for="(role, r) in roles" :key="r" @click="c.role = r">
                  <div class="uk-inline">
                    <oc-radio :model="c.role" :value="r" />
                  </div>
                  <div class="uk-inline">
                    <div>
                      <strong v-text="role.name" />
                    </div>
                    <div v-text="role.description" />
                  </div>
                </div>
                <div class="uk-container uk-padding-remove uk-margin-small-top">
                  <oc-button icon="save" class="uk-align-right" text="Save" @click="save(c)" />
                </div>
              </div>
            </li>
          </ul>
        </template>
      </oc-accordion-item>
    </oc-accordion>
  </div>
</template>

<script>
/**
 * The collaboration status shows
 *
 * * the current owner,
 * * an input field to search for new collaboratores,
 * * the list of current collaborators and their role
 *
 * It needs to be filled with an owner and an array of collaborators.
 * The roles can be overwritten as well.
 *
 * ##TODO:
 * - [ ] add search for users autocomplete component
 * - [ ] use mixin to format mtime, would add dependency to moment, can be done in phoenix
 */
export default {
  name: 'oc-collaboration-status',
  status: 'review',
  release: '1.0.0',
  // passed in
  props: {
    /**
     * Owner, a user object
     **/
    owner: {
      type: Object,
      required: true
    },
    /**
     * Roles
     **/
    roles: {
      type: Object,
      required: true
    },
    /**
     * user objects with a `role` and `expires` property
     **/
    collaborators: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      editing: null
    }
  },
  methods: {
    edit (share) {
      this.editing = share
    },
    save (collaborator) {
      /**
       * Save event
       * @event save
       * @type {collaborator}
       */
      this.$emit('save', collaborator)
      this.editing = null
    },
    onDelete (collaborator) {
      /**
       * delete cellaborator event
       * @event delete
       * @type {collaborator}
       */
      this.$emit('delete', collaborator)
      /** TODO would mutate property
      this.shares = this.shares.filter(function (s){
        return s != share
      })
      */
    }
  }
}
</script>

<docs>
```jsx
  <template>
    <oc-collaboration-status :owner="owner" :collaborators="collaborators" :roles="roles" />
  </template>
  <script>
    export default {
      data() {
        return {
          owner: {
            avatar: "https://picsum.photos/64/64?image=1074",
            name: "simba1",
            displayName: "Simba",
            email: "simba@djungle.com",
          },
          collaborators: [
            {
              avatar: "https://picsum.photos/64/64?image=1075",
              name: "foo",
              displayName: "Foo",
              email: "foo@djungle.com",
              role: "editor",
              expires: 1554391618281,
            },{
              avatar: "https://picsum.photos/64/64?image=1076",
              name: "bar",
              displayName: "Bar",
              email: "bar@djungle.com",
              role: "viewer",
              expires: 1554491618281,
            },
          ],
          roles: {
            viewer: { name: "Viewer", description: "Download and preview" },
            editor: { name: "Editor", description: "Upload, edit, delete, download and preview" },
            coowner: {
              name: "Co-owner",
              description: "Share, upload, edit, delete, download and preview",
            },
            hammer: { name: "MC Hammer", description: "U Can't touch this" },
            //public: { name: "Link", description: "Public link" }, // TODO public like this maybe?
          }
        }
      },
    }
  </script>
  ```
</docs>
