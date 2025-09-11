/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { base } from 'viem/chains'
import { BASE_RPC, getVaultData, HYPEEVM_RPC } from '../app.settings.js'
import { defineChain, http } from 'viem'
import { getMEEVersion, MEEVersion } from '@biconomy/abstractjs'
import { privateKeyToAccount } from 'viem/accounts'
import { RpcException } from '@nestjs/microservices'

export async function getSessionSigner(address: string) {
  try {
    const dataFromVaults = await getVaultData('biconomy/signer')
    const signers = JSON.parse(dataFromVaults['SESSION_SIGNER'].toString())
    const sessionSigner = signers[address]
    return privateKeyToAccount(sessionSigner)
  } catch (err) {
    console.error('Error getting session signer:', err)
    throw new RpcException('Error getting session signer')
  }
}

export function initChainConfig(chainId: number) {
  switch (chainId) {
    case 999: {
      const hypeEvmChain = defineChain({
        id: 999,
        name: 'HypeEVM',
        nativeCurrency: {
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH'
        },
        rpcUrls: {
          default: {
            http: [HYPEEVM_RPC]
          }
        },
        blockExplorers: {
          default: { name: 'Explorer', url: 'https://hyperevmscan.io/' }
        }
      })
      return {
        chain: hypeEvmChain,
        transport: http(),
        version: getMEEVersion(MEEVersion.V2_1_0)
      }
    }
    case 8453:
      return {
        chain: base,
        transport: http(BASE_RPC),
        version: getMEEVersion(MEEVersion.V2_1_0)
      }

    default:
      throw new RpcException('Chain not supported')
  }
}
