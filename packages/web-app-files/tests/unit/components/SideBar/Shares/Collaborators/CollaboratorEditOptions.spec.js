import EditOptions from '@files/src/components/SideBar/Shares/Collaborators/CollaboratorsEditOptions.vue'

describe('CollaboratorsEditOptions component', () => {
  it('enforces maximum expiration date', () => {
    const expectedDate = new Date()
    expectedDate.setDate(new Date().getDate() + 2)
    const localThis = {
      expirationDateEnforced: true,
      defaultExpirationDate: expectedDate
    }

    expect(EditOptions.computed.maxExpirationDate.call(localThis)).toEqual(expectedDate)
  })

  it('enforces next day as the minimal expiration date', () => {
    const expectedDate = new Date()
    expectedDate.setDate(new Date().getDate() + 1)

    expect(EditOptions.computed.minExpirationDate.call()).toEqual(expectedDate)
  })

  it('enforces correct maximum expiration date when editing user', () => {
    const localThis = {
      defaultExpirationDateSet: true,
      editingUser: true,
      userExpirationDate: { days: '2' },
      groupExpirationDate: { days: '4' }
    }
    const expectedDate = new Date()
    expectedDate.setDate(new Date().getDate() + 2)

    expect(EditOptions.computed.defaultExpirationDate.call(localThis)).toEqual(expectedDate)
  })

  it('enforces correct maximum expiration date when editing group', () => {
    const localThis = {
      defaultExpirationDateSet: true,
      editingGroup: true,
      userExpirationDate: { days: '2' },
      groupExpirationDate: { days: '4' }
    }
    const expectedDate = new Date()
    expectedDate.setDate(new Date().getDate() + 4)

    expect(EditOptions.computed.defaultExpirationDate.call(localThis)).toEqual(expectedDate)
  })
})
