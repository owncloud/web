import { resolveAllConflicts, ResolveConflict } from '../../../../src/helpers/resource'

const resourcesToMove = [
  {
    id: 'a',
    name: 'a',
    webDavPath: '/a'
  },
  {
    id: 'b',
    name: 'b',
    webDavPath: '/b'
  }
]
const targetFolder = {
  id: 'target',
  path: 'target',
  webDavPath: '/target'
}

describe('move', () => {
  it('should not show message if no conflict exists', async () => {
    const client = {
      files: {
        list: async () => {
          return [
            {
              id: 'c',
              path: 'target/c',
              webDavPath: '/target/c',
              name: '/target/c'
            }
          ]
        }
      }
    }
    const resolveFileExistsMethod = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ strategy: 0 } as ResolveConflict))
    await resolveAllConflicts(
      resourcesToMove,
      targetFolder,
      client,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      resolveFileExistsMethod
    )
    expect(resolveFileExistsMethod).not.toHaveBeenCalled()
  })
  it('should show message if conflict exists', async () => {
    const client = {
      files: {
        list: async () => {
          return [
            {
              id: 'a',
              path: 'target/a',
              webDavPath: '/target/a',
              name: '/target/a'
            }
          ]
        }
      }
    }
    const resolveFileExistsMethod = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ strategy: 0 } as ResolveConflict))
    await resolveAllConflicts(
      resourcesToMove,
      targetFolder,
      client,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      resolveFileExistsMethod
    )
    expect(resolveFileExistsMethod).toHaveBeenCalled()
  })
})
