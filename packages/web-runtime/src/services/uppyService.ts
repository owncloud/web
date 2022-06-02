import Uppy from '@uppy/core'
import StatusBar from '@uppy/status-bar'
import { TusOptions } from '@uppy/tus'
import XHRUpload, { XHRUploadOptions } from '@uppy/xhr-upload'
import { bus } from 'web-pkg/src/instance'
import { UppyResource } from '../composables/upload'
import { CustomDropTarget } from '../composables/upload/uppyPlugins/customDropTarget'
import { CustomTus } from '../composables/upload/uppyPlugins/customTus'

type UppyServiceTopics =
  | 'uploadStarted'
  | 'uploadCancelled'
  | 'uploadCompleted'
  | 'uploadRemoved'
  | 'uploadSuccess'
  | 'uploadError'
  | 'fileAdded'
  | 'filesSelected'

export class UppyService {
  uppy: Uppy
  uploadInputs: HTMLInputElement[] = []

  constructor() {
    this.uppy = new Uppy({
      autoProceed: true
    })
    this.setUpEvents()
  }

  useTus({
    tusMaxChunkSize,
    uploadChunkSize,
    tusHttpMethodOverride,
    headers
  }: {
    tusMaxChunkSize: number
    uploadChunkSize: number
    tusHttpMethodOverride: boolean
    headers: { [key: string]: string }
  }) {
    const chunkSize =
      tusMaxChunkSize > 0 && uploadChunkSize !== Infinity
        ? Math.max(tusMaxChunkSize, uploadChunkSize)
        : uploadChunkSize

    const tusPluginOptions = {
      headers: headers,
      chunkSize: chunkSize,
      removeFingerprintOnSuccess: true,
      overridePatchMethod: !!tusHttpMethodOverride,
      retryDelays: [0, 500, 1000]
    }

    const xhrPlugin = this.uppy.getPlugin('XHRUpload')
    if (xhrPlugin) {
      this.uppy.removePlugin(xhrPlugin)
    }

    const tusPlugin = this.uppy.getPlugin('Tus')
    if (tusPlugin) {
      tusPlugin.setOptions(tusPluginOptions)
      return
    }

    this.uppy.use(CustomTus, tusPluginOptions as TusOptions)
  }

  useXhr({ headers }: { headers: { [key: string]: string } }) {
    const xhrPluginOptions: XHRUploadOptions = {
      endpoint: '',
      method: 'put',
      headers,
      formData: false,
      getResponseData() {
        return {}
      }
    }

    const tusPlugin = this.uppy.getPlugin('Tus')
    if (tusPlugin) {
      this.uppy.removePlugin(tusPlugin)
    }

    const xhrPlugin = this.uppy.getPlugin('XHRUpload')
    if (xhrPlugin) {
      xhrPlugin.setOptions(xhrPluginOptions)
      return
    }

    this.uppy.use(XHRUpload, xhrPluginOptions)
  }

  useDropTarget({
    targetSelector,
    uppyService
  }: {
    targetSelector: string
    uppyService: UppyService
  }) {
    if (this.uppy.getPlugin('DropTarget')) {
      return
    }
    this.uppy.use(CustomDropTarget, {
      target: targetSelector,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      uppyService
    })
  }

  removeDropTarget() {
    const dropTargetPlugin = this.uppy.getPlugin('DropTarget')
    if (dropTargetPlugin) {
      this.uppy.removePlugin(dropTargetPlugin)
    }
  }

  useStatusBar({
    targetSelector,
    getText
  }: {
    targetSelector: string
    getText: (msgid: string) => string
  }) {
    if (this.uppy.getPlugin('StatusBar')) {
      return
    }

    this.uppy.use(StatusBar, {
      id: 'StatusBar',
      target: targetSelector,
      hideAfterFinish: true,
      showProgressDetails: true,
      hideUploadButton: false,
      hideRetryButton: false,
      hidePauseResumeButton: false,
      hideCancelButton: false,
      doneButtonHandler: null,
      locale: {
        strings: {
          uploading: getText('Uploading'),
          complete: getText('Complete'),
          uploadFailed: getText('Upload failed'),
          paused: getText('Paused'),
          retry: getText('Retry'),
          cancel: getText('Cancel'),
          pause: getText('Pause'),
          resume: getText('Resume'),
          done: getText('Done'),
          filesUploadedOfTotal: {
            0: getText('%{complete} of %{smart_count} file uploaded'),
            1: getText('%{complete} of %{smart_count} files uploaded')
          },
          dataUploadedOfTotal: getText('%{complete} of %{total}'),
          xTimeLeft: getText('%{time} left'),
          uploadXFiles: {
            0: getText('Upload %{smart_count} file'),
            1: getText('Upload %{smart_count} files')
          },
          uploadXNewFiles: {
            0: getText('Upload +%{smart_count} file'),
            1: getText('Upload +%{smart_count} files')
          },
          upload: getText('Upload'),
          retryUpload: getText('Retry upload'),
          xMoreFilesAdded: {
            0: getText('%{smart_count} more file added'),
            1: getText('%{smart_count} more files added')
          },
          showErrorDetails: getText('Show error details')
        }
      }
    })
  }

  subscribe(topic: UppyServiceTopics, callback: (data?: unknown) => void): string {
    return bus.subscribe(topic, callback)
  }

  unsubscribe(topic: UppyServiceTopics, token: string): void {
    bus.unsubscribe(topic, token)
  }

  publish(topic: UppyServiceTopics, data?: unknown): void {
    bus.publish(topic, data)
  }

  private setUpEvents() {
    this.uppy.on('upload', () => {
      this.publish('uploadStarted')
    })
    this.uppy.on('cancel-all', () => {
      this.publish('uploadCancelled')
    })
    this.uppy.on('complete', (result) => {
      this.publish('uploadCompleted')
      result.successful.forEach((file) => {
        this.uppy.removeFile(file.id)
        this.publish('uploadSuccess', file)
      })
      result.failed.forEach((file) => {
        this.publish('uploadError', file)
      })
      this.clearInputs()
    })
    this.uppy.on('file-removed', () => {
      this.publish('uploadRemoved')
      this.clearInputs()
    })
    this.uppy.on('file-added', (file) => {
      this.publish('fileAdded')
      const addedFile = file as unknown as UppyResource
      if (this.uppy.getPlugin('XHRUpload')) {
        const escapedName = encodeURIComponent(addedFile.name)
        this.uppy.setFileState(addedFile.id, {
          xhrUpload: {
            endpoint: `${addedFile.meta.tusEndpoint.replace(/\/+$/, '')}/${escapedName}`
          }
        })
      }
    })
  }

  registerUploadInput(el: HTMLInputElement) {
    const listenerRegistered = el.getAttribute('listener')
    if (listenerRegistered !== 'true') {
      el.setAttribute('listener', 'true')
      el.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement
        const files = Array.from(target.files)
        this.publish('filesSelected', files)
      })
      this.uploadInputs.push(el)
    }
  }

  removeUploadInput(el: HTMLInputElement) {
    this.uploadInputs = this.uploadInputs.filter((input) => input !== el)
  }

  uploadFiles(files: UppyResource[]) {
    files.forEach((file) => {
      try {
        this.uppy.addFile(file)
      } catch (err) {
        console.error('error upload file:', file)
        if (err.isRestriction) {
          // handle restrictions
          console.error('Restriction error:', err)
        } else {
          // handle other errors
          console.error(err)
        }
      }
    })
  }

  clearInputs() {
    this.uploadInputs.forEach((item) => {
      item.value = null
    })
  }
}
