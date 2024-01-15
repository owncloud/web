import CodeTabs from '../utils/tabs.js'
import { createApp, h } from 'vue'
import statusLabels from '../utils/statusLabels.js'
import { createGettext } from 'vue3-gettext'
import * as directives from '../../src/directives'
import { EditorView, highlightSpecialChars } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

function format(node, level) {
  const indentBefore = new Array(level++ + 1).join('  ')
  const indentAfter = new Array(level - 1).join('  ')
  let textNode

  for (let i = 0; i < node.children.length; i++) {
    textNode = document.createTextNode('\n' + indentBefore)
    node.insertBefore(textNode, node.children[i])

    format(node.children[i], level)

    if (node.lastElementChild == node.children[i]) {
      textNode = document.createTextNode('\n' + indentAfter)
      node.appendChild(textNode)
    }
  }

  return node
}

function generateObjectId() {
  const timestamp = new Date().getTime().toString(16)
  const randomValue = Math.floor(Math.random() * 1000000).toString(16)
  const objectId = timestamp + randomValue

  return objectId
}

// This is a dirty hack to be able to extend the Vue app since vue-styleguidist does not provide any way to do so
function setupVueApp(element) {
  const app = createApp(h(element))

  // Components are registered globally only for the styleguidist app...
  const componentsContext = require.context('../../src/components/', true, /\.vue$/)

  componentsContext.keys().forEach((key) => {
    const component = componentsContext(key).default

    app.component(component.name, component)
  })

  app.component('RouterLink', {
    props: {
      tag: { type: String, default: 'a' }
    },
    render() {
      return h(this.tag, {}, this.$slots.default)
    }
  })

  for (const name in directives) {
    app.directive(name, directives[name])
  }

  app.mixin(statusLabels)

  // Vue-gettext is bundled only in the docs. The design system itself depends on the consuming app in providing it
  app.use(createGettext({ translations: {} }))

  return app
}

export default (previewComponent) => {
  // https://vuejs.org/v2/guide/render-function.html
  return {
    render() {
      const appId = 'preview-' + generateObjectId()
      const app = setupVueApp(previewComponent)

      const previewContainer = h('div', {
        id: appId,
        onVnodeMounted: () => {
          app.mount('#' + appId)
        }
      })

      return previewContainer
    },
    mounted() {
      CodeTabs.clean()
      const tabs = CodeTabs.create()
      const strDiv = this.$el.innerHTML.replace(/<!---->/g, '').replace(/data-v-\w*=""/g, '')
      const div = document.createElement('div')
      div.innerHTML =
        '<' +
        this.$el.localName +
        " class='" +
        this.$el.className +
        "'>" +
        strDiv.trim() +
        '</' +
        this.$el.localName +
        '>'

      const elemText = format(div, 0).innerHTML.replace(/ class=""/g, '')
      const elem = document.createElement('div')
      const parent = document.querySelector("article div[class^='rsg--tab']")

      if (parent) {
        // Allow some time to pass to make sure codemirror is visible first
        setTimeout(() => {
          parent.appendChild(elem)
          parent.appendChild(tabs)

          const themeNight = EditorView.theme(
            {
              '&': {
                color: 'white',
                backgroundColor: '#041d37',
                fontSize: '13px',
                padding: '24px'
              },
              '.cm-content': {
                caretColor: '#ffffff'
              },
              '&.cm-focused .cm-cursor': {
                borderLeftColor: '#ffffff'
              },
              '&.cm-focused .cm-selectionBackground, ::selection': {
                backgroundColor: 'rgba(68, 68, 119, .99)'
              }
            },
            { dark: true }
          )

          const editorState = EditorState.create({
            doc: elemText.trim(),
            extensions: [
              html(),
              themeNight,
              EditorState.readOnly.of(true),
              highlightSpecialChars(),
              syntaxHighlighting(
                HighlightStyle.define([
                  {
                    tag: [
                      tags.atom,
                      tags.bool,
                      tags.url,
                      tags.contentSeparator,
                      tags.labelName,
                      tags.attributeValue
                    ],
                    color: '#afe74c'
                  },
                  { tag: tags.string, color: '#afe74c' },
                  { tag: [tags.typeName, tags.namespace, tags.bracket], color: '#54a3f2' },
                  { tag: tags.attributeName, color: '#ffcc4d' }
                ]),
                { fallback: false }
              )
            ]
          })

          try {
            // This code is wrapped in try/catch due to sonarcloud reporting this as issue otherwise
            // Sonarcloud marks as issues instantiated classes which are not assigned anywhere but we need it like that here due to sideeffects of the class
            new EditorView({
              state: editorState,
              parent: elem
            })
          } catch (error) {
            console.error(error)
          }

          elem.classList.add('vueds-html')
          elem.classList.add('vueds-hidden')

          CodeTabs.init()
        }, 300)
      }
    }
  }
}
