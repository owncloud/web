<template>
  <div ref="inputPasswordWrapper" class="oc-text-input-password-wrapper">
    <input v-bind="$attrs" :type="showPassword ? 'text' : 'password'" @input="onInput" />
    <oc-button
      class="oc-text-input-show-password-toggle oc-px-s oc-background-default"
      appearance="raw"
      size="small"
      @click="showPassword = !showPassword"
    >
      <oc-icon size="small" :name="showPassword ? 'eye-off' : 'eye'" />
    </oc-button>
  </div>
  <portal v-if="showPasswordPolicyInformation" to="app.design-system.password-policy">
    <div class="oc-text-small oc-flex oc-flex-column">
      <span v-text="$gettext('Please enter a password that meets the following criteria:')" />
      <div v-for="(rule, index) in passwordPolicy" :key="index" class="oc-flex oc-flex-middle">
        <oc-icon
          size="small"
          :name="isPolicyRuleFulfilled(rule) ? 'check' : 'close'"
          :variation="isPolicyRuleFulfilled(rule) ? 'success' : 'danger'"
        />
        <span :class="getPolicyMessageClass(rule)" v-text="getPolicyRuleMessage(rule)"></span>
      </div>
    </div>
  </portal>
</template>

<script lang="ts">
import { computed, defineComponent, ref, unref, watch } from 'vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcButton from '../OcButton/OcButton.vue'
import { useGettext } from 'vue3-gettext'
export default defineComponent({
  name: 'OCTextInputPassword',
  components: { OcButton, OcIcon },
  status: 'ready',
  release: '1.0.0',
  inheritAttrs: true,
  props: {
    passwordPolicy: {
      type: Array,
      default: () => []
    }
  },
  emits: ['passwordChallengeCompleted', 'passwordChallengeFailed'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const showPassword = ref(false)
    const passwordEntered = ref(false)
    const password = ref('')
    const showPasswordPolicyInformation = computed(() => {
      return !!(props.passwordPolicy.length && unref(passwordEntered))
    })

    const onInput = (event) => {
      passwordEntered.value = true
      password.value = event.target.value
    }

    const getPolicyRuleMessage = (policyRule) => {
      const explained = policyRule.explain()[0]
      const paramObj = {}

      for (var formatKey = 0; formatKey < explained.format.length; formatKey++) {
        paramObj[`param${formatKey + 1}`] = explained.format[formatKey]
      }

      return $gettext(explained.message, paramObj, true)
    }

    const isPolicyRuleFulfilled = (policyRule) => {
      return policyRule.check(password.value)
    }

    const getPolicyMessageClass = (policyRule) => {
      return policyRule.check(password.value) ? 'oc-text-input-success' : 'oc-text-input-danger'
    }

    watch(password, (value) => {
      for (const passwordPolicyRule of props.passwordPolicy) {
        if (!passwordPolicyRule.check(value)) {
          return emit('passwordChallengeFailed')
        }
      }
      emit('passwordChallengeCompleted')
    })

    return {
      $gettext,
      onInput,
      showPassword,
      showPasswordPolicyInformation,
      isPolicyRuleFulfilled,
      getPolicyRuleMessage,
      getPolicyMessageClass
    }
  }
})
</script>
<style lang="scss">
.oc-text-input-password-wrapper {
  display: flex;
  flex-direction: row;
  padding: 0;
  border-radius: 5px;
  border: 1px solid var(--oc-color-input-border);
  background-color: var(--oc-color-background-highlight);

  input {
    flex-grow: 2;
    border: none;
  }

  input:focus {
    outline: none;
  }

  button {
    background-color: var(--oc-color-background-highlight) !important;
  }
}
.oc-text-input-password-wrapper:focus-within {
  border-color: var(--oc-color-swatch-passive-default);
}
</style>
