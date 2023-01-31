import {
  buildSpaceShare,
  spaceRoleEditor,
  spaceRoleManager,
  spaceRoleViewer
} from '../../../../src/helpers/share'

const getRawShareData = ({ role = spaceRoleManager.name, expirationDate = undefined }) => ({
  role,
  onPremisesSamAccountName: 'einstein',
  displayName: 'Albert Einstein',
  expirationDate
})

describe('buildSpaceShare', () => {
  it.each([spaceRoleManager, spaceRoleEditor, spaceRoleViewer])(
    'properly assigns space roles',
    (role) => {
      const share = buildSpaceShare(getRawShareData({ role: role.name }), 1)
      expect(share.permissions).toEqual(role.bitmask(true))
      expect(share.role).toEqual(role)
    }
  )
  it.each([undefined, '2007-08-31T16:47+00:00'])(
    'properly assigns expirationDate',
    (expirationDate) => {
      const share = buildSpaceShare(getRawShareData({ expirationDate }), 1)
      expect(share.expiration).toEqual(expirationDate)
      expect(share.expires).toEqual(expirationDate ? new Date(expirationDate) : undefined)
    }
  )
})
