import Uppy from '@uppy/core'
import { TusOptions } from '@uppy/tus'
import XHRUpload, { XHRUploadOptions } from '@uppy/xhr-upload'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { UppyResource } from '../composables/upload'
import { CustomDropTarget } from '../composables/upload/uppyPlugins/customDropTarget'
import { CustomTus } from '../composables/upload/uppyPlugins/customTus'
import { urlJoin } from 'web-client/src/utils'

type UppyServiceTopics =
  | 'uploadStarted'
  | 'uploadCancelled'
  | 'uploadCompleted'
  | 'uploadRemoved'
  | 'uploadSuccess'
  | 'uploadError'
  | 'filesSelected'
  | 'progress'
  | 'addedForUpload'
  | 'upload-progress'
  | 'drag-over'
  | 'drag-out'
  | 'drop'

export type uppyHeaders = {
  [name: string]: string | number
}

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
    tusHttpMethodOverride,
    tusExtension,
    onBeforeRequest
  }: {
    tusMaxChunkSize: number
    tusHttpMethodOverride: boolean
    tusExtension: string
    onBeforeRequest: () => void
  }) {
    const chunkSize = tusMaxChunkSize || Infinity
    const uploadDataDuringCreation = tusExtension.includes('creation-with-upload')

    const tusPluginOptions = {
      chunkSize: chunkSize,
      removeFingerprintOnSuccess: true,
      overridePatchMethod: !!tusHttpMethodOverride,
      retryDelays: [0, 500, 1000],
      uploadDataDuringCreation,
      onBeforeRequest
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

    this.uppy.use(CustomTus, tusPluginOptions as unknown as TusOptions)
  }

  useXhr({ headers }: { headers: () => uppyHeaders }) {
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

  tusActive() {
    return !!this.uppy.getPlugin('Tus')
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
      uppyService,
      onDragOver: (event) => {
        this.publish('drag-over', event)
      },
      onDragLeave: (event) => {
        this.publish('drag-out', event)
      },
      onDrop: (event) => {
        this.publish('drop', event)
      }
    })
  }

  removeDropTarget() {
    const dropTargetPlugin = this.uppy.getPlugin('DropTarget')
    if (dropTargetPlugin) {
      this.uppy.removePlugin(dropTargetPlugin)
    }
  }

  subscribe(topic: UppyServiceTopics, callback: (data?: unknown) => void): string {
    return eventBus.subscribe(topic, callback)
  }

  unsubscribe(topic: UppyServiceTopics, token: string): void {
    eventBus.unsubscribe(topic, token)
  }

  publish(topic: UppyServiceTopics, data?: unknown): void {
    eventBus.publish(topic, data)
  }

  private setUpEvents() {
    this.uppy.on('progress', (value) => {
      this.publish('progress', value)
    })
    this.uppy.on('upload-progress', (file, progress) => {
      this.publish('upload-progress', { file, progress })
    })
    this.uppy.on('cancel-all', () => {
      this.publish('uploadCancelled')
    })
    this.uppy.on('complete', (result) => {
      this.publish('uploadCompleted', result)
      result.successful.forEach((file) => {
        this.uppy.removeFile(file.id)
      })
      this.clearInputs()
    })
    this.uppy.on('upload-success', (file) => {
      this.publish('uploadSuccess', file)
    })
    this.uppy.on('upload-error', (file, error) => {
      this.publish('uploadError', { file, error })
    })
    this.uppy.on('file-removed', () => {
      this.publish('uploadRemoved')
      this.clearInputs()
    })
    this.uppy.on('file-added', (file) => {
      const addedFile = file as unknown as UppyResource
      if (this.uppy.getPlugin('Tus')) {
        this.uppy.setFileMeta(addedFile.id, {
          mtime: (addedFile.data as any).lastModified / 1000
        })
      }
      if (this.uppy.getPlugin('XHRUpload')) {
        const escapedName = encodeURIComponent(addedFile.name)
        this.uppy.setFileState(addedFile.id, {
          xhrUpload: {
            endpoint: urlJoin(addedFile.meta.tusEndpoint, escapedName)
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
    this.uppy.addFiles(files)
  }

  retryAllUploads() {
    return this.uppy.retryAll()
  }

  pauseAllUploads() {
    return this.uppy.pauseAll()
  }

  resumeAllUploads() {
    return this.uppy.resumeAll()
  }

  cancelAllUploads() {
    return this.uppy.cancelAll()
  }

  clearInputs() {
    this.uploadInputs.forEach((item) => {
      item.value = null
    })
  }
}
