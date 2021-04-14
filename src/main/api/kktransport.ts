import { ipcRenderer } from 'electron'

import { ApiKKTransport } from '../../shared/api/types'

export const apiKKTransport: ApiKKTransport = {
  connect: (serialNumber?: string): Promise<string> => ipcRenderer.invoke('apiKKTransport:connect', serialNumber),
  disconnect: (): Promise<void> => ipcRenderer.invoke('apiKKTransport:disconnect'),
  readChunk: (debugLink?: boolean): Promise<Uint8Array> => ipcRenderer.invoke('apiKKTransport:readChunk', debugLink),
  writeChunk: (buf: Uint8Array, debugLink?: boolean): Promise<void> =>
    ipcRenderer.invoke('apiKKTransport:writeChunk', buf, debugLink)
}
