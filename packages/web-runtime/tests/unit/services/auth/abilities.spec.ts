import { getAbilities } from 'web-runtime/src/services/auth/abilities'

describe('getAbilities', () => {
  it('gets no abilities if empty permissions given', () => {
    const abilities = getAbilities([])
    expect(abilities.length).toBe(0)
  })
  it('gets correct abilities for subject "Account"', function () {
    const abilities = getAbilities(['account-management'])
    const expectedActions = ['create', 'delete', 'read', 'update']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Account' })))
  })
  it('gets correct abilities for subject "Group"', function () {
    const abilities = getAbilities(['group-management'])
    const expectedActions = ['create', 'delete', 'read', 'update']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Group' })))
  })
  it('gets correct abilities for subject "Language"', function () {
    const abilities = getAbilities(['language-readwrite'])
    const expectedActions = ['read', 'update']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Language' })))
  })
  it('gets correct abilities for subject "Logo"', function () {
    const abilities = getAbilities(['change-logo'])
    const expectedActions = ['update']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Logo' })))
  })
  it('gets correct abilities for subject "Role"', function () {
    const abilities = getAbilities(['role-management'])
    const expectedActions = ['create', 'delete', 'read', 'update']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Role' })))
  })
  it('gets correct abilities for subject "Setting"', function () {
    const abilities = getAbilities(['settings-management'])
    const expectedActions = ['read', 'update']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Setting' })))
  })
  it.each([
    { permissions: [''], expectedActions: [] },
    { permissions: ['create-space'], expectedActions: ['create'] },
    { permissions: ['delete-all-spaces'], expectedActions: ['delete'] },
    { permissions: ['list-all-spaces'], expectedActions: ['read'] },
    { permissions: ['set-space-quota'], expectedActions: ['set-quota'] }
  ])('gets correct abilities for subject "Space"', function (data) {
    const abilities = getAbilities(data.permissions)
    const expectedResult = data.expectedActions.map((action) => ({ action, subject: 'Space' }))
    expect(abilities).toEqual(expectedResult)
  })
})
