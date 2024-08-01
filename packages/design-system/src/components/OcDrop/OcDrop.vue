<template>
  <div
    :id="dropId"
    ref="drop"
    class="oc-drop oc-box-shadow-medium oc-rounded"
    @click="$_ocDrop_close"
  >
    <div
      v-if="$slots.default"
      :class="['oc-card oc-card-body oc-background-secondary', paddingClass]"
    >
      <slot />
    </div>
    <slot v-else name="special" />
  </div>
</template>

<script lang="ts">
import tippy, { ReferenceElement, hideAll } from 'tippy.js'
import { Modifier } from '@popperjs/core'
import { detectOverflow } from '@popperjs/core'
import { destroy, hideOnEsc } from '../../directives/OcTooltip'
import { AVAILABLE_SIZES } from '../../helpers/constants'
import uniqueId from '../../utils/uniqueId'
import { getSizeClass } from '../../utils/sizeClasses'
import { defineComponent } from 'vue'

/**
 * Position any element in relation to another element.
 */
export default defineComponent({
  name: 'OcDrop',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Id of the drop.
     */
    dropId: {
      type: String,
      required: false,
      default: () => uniqueId('oc-drop-')
    },
    /**
     * Specifies custom Popper options
     */
    popperOptions: {
      type: Object,
      required: false,
      default: () => ({})
    },
    /**
     * CSS selector for the element to be used as toggle. By default, the preceding element is used.
     **/
    toggle: {
      type: String,
      default: ''
    },
    /**
     * The position of the drop: `(top|right|bottom|left|auto)|(top|right|bottom|left|auto)-(start|end)`.
     **/
    position: {
      type: String,
      default: 'bottom-start',
      validator: (value: string) => {
        return !!value.match(
          /((top|right|bottom|left|auto)|(top|right|bottom|left|auto)-(start|end))/
        )
      }
    },
    /**
     * Events that cause the drop to show. Multiple event names are separated by spaces
     *
     * @values click, hover, manual
     **/
    mode: {
      type: String,
      default: 'click',
      validator: (value: string) => {
        return !!value.match(/(click|hover|manual)/)
      }
    },
    /**
     * Defines if the drop should be closed after clicking on it. Needs to have defined dropId to work.
     */
    closeOnClick: {
      type: Boolean,
      required: false
    },
    /**
     * Defines if the drop should be nested drop in another drop.
     */
    isNested: {
      type: Boolean,
      required: false
    },
    /**
     * Element selector used as a target of the drop
     */
    target: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Defines the padding size around the drop content. Defaults to `medium`.
     *
     * @values xsmall, small, medium, large, xlarge, xxlarge, xxxlarge, remove
     */
    paddingSize: {
      type: String,
      required: false,
      default: 'medium',
      validator: (value) => {
        return [...AVAILABLE_SIZES, 'remove'].some((e) => e === value)
      }
    },
    /**
     * Determines the offset of the drop element. The value can work on both axes by using a string in the form "x, y", such as "50, 20".
     */
    offset: {
      type: String,
      required: false,
      default: undefined
    }
  },
  emits: ['hideDrop', 'showDrop'],
  data() {
    return { tippy: null }
  },
  computed: {
    triggerMapping() {
      return (
        {
          hover: 'mouseenter focus'
        }[this.mode] || this.mode
      )
    },
    paddingClass() {
      return `oc-p-${getSizeClass(this.paddingSize)}`
    }
  },
  watch: {
    position() {
      this.tippy.setProps({ placement: this.position })
    },

    mode() {
      this.tippy.setProps({ trigger: this.triggerMapping })
    }
  },
  beforeUnmount() {
    destroy(this.tippy)
  },
  mounted() {
    destroy(this.tippy)
    const to = this.target
      ? document.querySelector(this.target)
      : this.toggle
        ? document.querySelector(this.toggle)
        : this.$el.previousElementSibling
    const content = this.$refs.drop

    if (!to || !content) {
      return
    }
    const config: any = {
      trigger: this.triggerMapping,
      placement: this.position,
      arrow: false,
      hideOnClick: true,
      interactive: true,
      plugins: [hideOnEsc],
      theme: 'none',
      maxWidth: 416,
      offset: this.offset ?? 0,
      ...(!this.isNested && {
        onShow: (instance: ReferenceElement) => {
          this.$emit('showDrop')
          hideAll({ exclude: instance })
        },
        onHide: () => {
          this.$emit('hideDrop')
        }
      }),
      popperOptions: {
        ...this.popperOptions,
        modifiers: [
          ...(this.popperOptions?.modifiers ? this.popperOptions.modifiers : []),
          {
            name: 'fixVerticalPosition',
            enabled: true,
            phase: 'beforeWrite',
            requiresIfExists: ['offset', 'preventOverflow', 'flip'],
            fn({ state }) {
              const overflow = detectOverflow(state)
              const dropHeight =
                state.modifiersData.fullHeight || state.elements.popper.offsetHeight
              const dropYPos = overflow.top * -1 - 10
              const availableHeight = dropYPos + dropHeight + overflow.bottom * -1
              const spaceBelow = availableHeight - dropYPos
              const spaceAbove = availableHeight - spaceBelow

              if (dropHeight > spaceBelow && dropHeight > spaceAbove) {
                // place drop on top of screen because of limited screen estate above and below
                state.styles.popper.top = `-${dropYPos}px`
                state.modifiersData.fullHeight = dropHeight
              }

              if (dropHeight > availableHeight) {
                // drop is bigger than total available height
                state.styles.popper.maxHeight = `${availableHeight - 10}px`
                state.styles.popper.overflowY = `auto`
                state.styles.popper.overflowX = `hidden`
              }
            }
          } as Modifier<'fixVerticalPosition', unknown>
        ]
      },
      content
    }

    if (this.target) {
      config.triggerTarget = this.toggle
        ? document.querySelector(this.toggle)
        : this.$el.previousElementSibling
    }

    this.tippy = tippy(to, config)
  },
  methods: {
    $_ocDrop_close() {
      if (this.closeOnClick) {
        this.tippy.hide()
      }
    },

    /**
     * Programatically show the drop
     *
     * @public
     */
    show(duration?: number) {
      this.tippy.show(duration)
    },

    /**
     * Programatically hide the drop
     *
     * @public
     */
    hide(duration?: number) {
      this.tippy.hide(duration)
    }
  }
})
</script>

<style lang="scss">
.tippy-box[data-theme~='none'] {
  background-color: transparent;
  font-size: inherit;
  line-height: inherit;

  .tippy-content {
    // note: needed so that the box shadow from `oc-box-shadow-medium` doesn't get suppressed
    padding: 8px;
  }
  li.oc-menu-item-hover {
    a,
    .item-has-switch,
    button:not([role='switch']) {
      box-sizing: border-box;
      padding: var(--oc-space-small);
      color: var(--oc-color-swatch-passive-default);
      &:focus,
      &:hover {
        background-color: var(--oc-color-background-hover);

        text-decoration: none !important;
        border-radius: 5px;
      }
      &:hover span {
        color: var(--oc-color-swatch-brand-hover) !important;
      }
      span {
        text-decoration: none !important;
      }
    }
  }
}

.oc-drop {
  max-width: 100%;
  width: 300px;

  li a:focus {
    outline: auto 1px !important;
  }
  .oc-card {
    border-radius: var(--oc-space-small) !important;
  }
}
</style>

<docs>
```js
<template>
  <div class="oc-button-group oc-mt-s">
    <oc-button id="my_menu" class="oc-mr-s">Menu</oc-button>
    <oc-drop toggle="#my_menu" mode="click">
      <ul>
        <li icon="create_new_folder" autofocus>Item with icon</li>
        <li>Item without icon</li>
        <li>Active item</li>
      </ul>
    </oc-drop>

    <oc-button id="my_filter" class="oc-mr-s">Filter</oc-button>
    <oc-drop toggle="#my_filter" mode="hover">
      <p>
        Lets filter:
      </p>
      <ul class="oc-list">
        <li>
          <oc-checkbox label="" />
          <span class="oc-text-muted">Show Files</span>
        </li>
        <li>
          <oc-checkbox label="" />
          <span class="oc-text-muted">Show Folders</span>
        </li>
        <li>
          <oc-search-bar small placeholder="Filter by name" :button="false" label="" />
        </li>
      </ul>
    </oc-drop>

    <oc-button id="my_advanced" class="oc-mr-s">Advanced</oc-button>
    <oc-drop dropId="oc-drop" toggle="#my_advanced" mode="click" closeOnClick>
      <div slot="special" class="oc-card">
        <div class="oc-card-header">
          <h3 class="oc-card-title">
            Advanced
          </h3>
        </div>
        <div class="oc-card-body">
          <p>
            I'm a slightly more advanced drop down and I'll be closed as soon as you click on me.
          </p>
        </div>
      </div>
    </oc-drop>

    <oc-button id="my_submenu_parent"> With submenu</oc-button>
    <oc-drop
      id="drop"
      ref="submenu_parent"
      drop-id="oc-drop"
      toggle="#my_submenu_parent"
      mode="click"
      style="max-width: 200px"
    >
      <oc-list class="user-menu-list">
        <li>
          <oc-button appearance="raw"> Menu item 1</oc-button>
        </li>
        <li>
          <oc-button id="menu_with_submenu" appearance="raw">
            Menu item 2<oc-icon
              name="arrow-drop-right"
              fill-type="line"
              class="oc-p-xs"
            />
          </oc-button>
          <oc-drop
            id="submenu"
            toggle="#menu_with_submenu"
            mode="hover"
            position="right-start"
            isNested
            closeOnClick
            style="max-width: 200px"
          >
            <oc-list class="user-menu-list">
              <li>
                <oc-button appearance="raw"> Submenu item 1 </oc-button>
              </li>
              <li>
                <oc-button appearance="raw"> Submenu item 2 </oc-button>
              </li>
            </oc-list>
          </oc-drop>
        </li>
        <li>
          <oc-button appearance="raw"> Menu item 3</oc-button>
        </li>
      </oc-list>
    </oc-drop>
  </div>
</template>
```

### Custom target
```js
<div>
  <div>
    <p id="target">This is the target of the drop</p>
  </div>
  <oc-button id="custom-target-toggle">Trigger drop</oc-button>
  <oc-drop dropId="oc-drop-custom-target" toggle="#custom-target-toggle" target="#target" mode="click" closeOnClick>
    I am attached to a custom element
  </oc-drop>
</div>
```

### Open drop programatically
```js
<template>
<div>
  <oc-button id="manual-target" @click="open">Open</oc-button>
  <oc-drop ref="drop" mode="manual" target="#manual-target">
    I am triggered manually
  </oc-drop>
</div>
</template>
<script>
export default {
  methods: {
    open() {
      this.$refs.drop.show()
    }
  }
}
</script>
```
</docs>
