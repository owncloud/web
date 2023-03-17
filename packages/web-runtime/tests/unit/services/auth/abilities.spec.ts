import { getAbilities } from 'web-runtime/src/services/auth/abilities'

describe('getAbilities', () => {
  it('gets no abilities if empty permissions given', () => {
    const abilities = getAbilities([])
    expect(abilities.length).toBe(0)
  })
  it('gets correct abilities for subject "Account"', function () {
    const abilities = getAbilities(['account-management.all'])
    const expectedActions = ['create-all', 'delete-all', 'read-all', 'update-all']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Account' })))
  })
  it('gets correct abilities for subject "Group"', function () {
    const abilities = getAbilities(['group-management.all'])
    const expectedActions = ['create-all', 'delete-all', 'read-all', 'update-all']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Group' })))
  })
  it('gets correct abilities for subject "Language"', function () {
    const abilities = getAbilities(['language-readwrite.all'])
    const expectedActions = ['read-all', 'update-all']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Language' })))
  })
  it('gets correct abilities for subject "Logo"', function () {
    const abilities = getAbilities(['change-logo.all'])
    const expectedActions = ['update-all']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Logo' })))
  })
  it('gets correct abilities for subject "Role"', function () {
    const abilities = getAbilities(['role-management.all'])
    const expectedActions = ['create-all', 'delete-all', 'read-all', 'update-all']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Role' })))
  })
  it('gets correct abilities for subject "PublicLink"', function () {
    const abilities = getAbilities(['PublicLink.Write.all'])
    const expectedActions = ['create-all']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'PublicLink' })))
  })
  it('gets correct abilities for subject "Setting"', function () {
    const abilities = getAbilities(['settings-management.all'])
    const expectedActions = ['read-all', 'update-all']
    expect(abilities).toEqual(expectedActions.map((action) => ({ action, subject: 'Setting' })))
  })
  it.each([
    { permissions: [''], expectedActions: [] },
    { permissions: ['create-space.all'], expectedActions: ['create-all'] },
    { permissions: ['list-all-spaces.all'], expectedActions: ['read-all'] },
    { permissions: ['Drive.ReadWriteEnabled.all'], expectedActions: ['delete-all', 'update-all'] },
    { permissions: ['Drive.ReadWriteQuota.Project.all'], expectedActions: ['set-quota-all'] }
  ])('gets correct abilities for subject "Space"', function (data) {
    const abilities = getAbilities(data.permissions)
    const expectedResult = data.expectedActions.map((action) => ({ action, subject: 'Space' }))
    expect(abilities).toEqual(expectedResult)
  })
})
