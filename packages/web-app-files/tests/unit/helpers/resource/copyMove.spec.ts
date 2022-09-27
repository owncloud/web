import { ClipboardActions } from '../../../../src/helpers/clipboardActions'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src/services'
import { buildSpace, Resource } from 'web-client/src/helpers'
import {
  copyMoveResource,
  resolveAllConflicts,
  ResolveConflict,
  resolveFileNameDuplicate,
  ResolveStrategy
} from '../../../../src/helpers/resource'

const clientServiceMock = mockDeep<ClientService>()
let resourcesToMove
let sourceSpace
let targetSpace
let targetFolder

describe('copyMove', () => {
  beforeEach(() => {
    mockReset(clientServiceMock)
    resourcesToMove = [
      {
        id: 'a',
        name: 'a',
        path: '/a'
      },
      {
        id: 'b',
        name: 'b',
        path: '/b'
      }
    ]
    const spaceOptions = {
      id: 'c42c9504-2c19-44fd-87cc-b4fc20ecbb54'
    }
    sourceSpace = buildSpace(spaceOptions)
    targetSpace = buildSpace(spaceOptions)
    targetFolder = {
      id: 'target',
      path: '/target',
      webDavPath: '/some/prefix/target'
    }
  })

  describe('resolveFileNameDuplicate', () => {
    it.each([
      { name: 'a', extension: '', expectName: 'a (1)' },
      { name: 'a', extension: '', expectName: 'a (2)', existing: [{ name: 'a (1)' }] },
      { name: 'a (1)', extension: '', expectName: 'a (1) (1)' },
      { name: 'b.png', extension: 'png', expectName: 'b (1).png' },
      {
        name: 'b.png',
        extension: 'png',
        expectName: 'b (2).png',
        existing: [{ name: 'b (1).png' }]
      }
    ])('should name duplicate file correctly', (dataSet) => {
      const existing = dataSet.existing
        ? [...resourcesToMove, ...dataSet.existing]
        : resourcesToMove
      const result = resolveFileNameDuplicate(dataSet.name, dataSet.extension, existing)
      expect(result).toEqual(dataSet.expectName)
    })
  })

  describe('copyMoveResource without conflicts', () => {
    it.each([{ action: ClipboardActions.Copy }, { action: ClipboardActions.Cut }])(
      'should copy / move files without renaming them if no conflicts exist',
      async ({ action }: { action: 'cut' | 'copy' }) => {
        clientServiceMock.webdav.listFiles.mockReturnValueOnce(
          new Promise((resolve) => resolve([] as Resource[]))
        )

        const movedResources = await copyMoveResource(
          sourceSpace,
          resourcesToMove,
          targetSpace,
          targetFolder,
          clientServiceMock,
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          action
        )

        const fn =
          action === ClipboardActions.Copy
            ? clientServiceMock.webdav.copyFiles
            : clientServiceMock.webdav.moveFiles
        expect(fn).toHaveBeenCalledTimes(resourcesToMove.length)
        expect(movedResources.length).toBe(resourcesToMove.length)

        for (let i = 0; i < resourcesToMove.length; i++) {
          const input = resourcesToMove[i]
          const output = movedResources[i]
          expect(input.name).toBe(output.name)
        }
      }
    )

    it('should prevent recursive paste', async () => {
      const movedResources = await copyMoveResource(
        sourceSpace,
        resourcesToMove,
        targetSpace,
        resourcesToMove[0],
        clientServiceMock,
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        ClipboardActions.Copy
      )
      expect(clientServiceMock.webdav.copyFiles).not.toBeCalled()
      expect(movedResources.length).toBe(0)
    })
  })

  describe('resolveAllConflicts', () => {
    it('should not show message if no conflict exists', async () => {
      const targetFolderResources = [
        {
          id: 'c',
          path: 'target/c',
          name: '/target/c'
        }
      ]
      const resolveFileExistsMethod = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ strategy: ResolveStrategy.SKIP } as ResolveConflict)
        )
      await resolveAllConflicts(
        resourcesToMove,
        targetSpace,
        targetFolder,
        targetFolderResources,
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        resolveFileExistsMethod
      )
      expect(resolveFileExistsMethod).not.toHaveBeenCalled()
    })

    it('should show message if conflict exists', async () => {
      const targetFolderResources = [
        {
          id: 'a',
          path: '/target/a'
        }
      ]
      const resolveFileExistsMethod = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ strategy: ResolveStrategy.SKIP } as ResolveConflict)
        )
      await resolveAllConflicts(
        resourcesToMove,
        targetSpace,
        targetFolder,
        targetFolderResources,
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        resolveFileExistsMethod
      )
      expect(resolveFileExistsMethod).toHaveBeenCalled()
    })
  })
})
