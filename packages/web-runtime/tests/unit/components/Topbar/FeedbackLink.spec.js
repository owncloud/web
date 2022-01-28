import FeedbackLink from '../../../../src/components/Topbar/FeedbackLink'
import { createLocalVue, mount } from '@vue/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import DesignSystem from 'owncloud-design-system'
const localVue = createLocalVue()
localVue.use(DesignSystem)
const OcTooltip = jest.fn()
expect.extend(toHaveNoViolations)

describe('FeedbackLink component', () => {
  it('has no accessibility violations', async () => {
    const wrapper = mount(FeedbackLink, {
      localVue,
      directives: {
        OcTooltip
      }
    })

    expect(
      await axe(wrapper.html(), {
        rules: {
          region: { enabled: false }
        }
      })
    ).toHaveNoViolations()
    expect(wrapper).toMatchSnapshot()
  })
})
