import { JsonRpcProvider } from 'ethers'
import { HYPEEVM_RPC } from './app.settings.js'
import { Observable } from 'rxjs'

export function createProviderByChainId(chainId: number): JsonRpcProvider | undefined {
  if (chainId === 999) {
    return new JsonRpcProvider(HYPEEVM_RPC)
  }
}

export function extractDataFromObs<T>(obs: Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    obs.subscribe({
      next: (data) => resolve(data),
      error: (err) => reject(new Error(err instanceof Error ? err.message : 'Unknown error'))
    })
  })
}

export function getCallerInfo() {
  const stack = new Error().stack?.split('\n')[3] // caller is usually at [3]
  const match = stack?.match(/\((.*):(\d+):(\d+)\)/)
  if (match) {
    const [, file, line] = match
    const fileName = file.split('/').pop()
    return `${fileName}:${line}`
  }
  return ''
}
