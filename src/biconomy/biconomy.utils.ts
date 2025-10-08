/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { base } from 'viem/chains'
import { BASE_RPC, getVaultData, HYPEEVM_RPC } from '../app.settings.js'
import { defineChain, http } from 'viem'
import { getMEEVersion, MEEVersion } from '@biconomy/abstractjs'
import { privateKeyToAccount } from 'viem/accounts'
import { RpcException } from '@nestjs/microservices'
import { KeyManagementServiceClient } from '@google-cloud/kms'
import { GoogleAuth } from 'google-auth-library'

const wallets: { address: string; secret: string }[] = []
export async function getSessionSigner(address: string) {
  try {
    const existingWallet = wallets.find(
      (item) => item.address.toLowerCase() === address.toLowerCase()
    )
    if (existingWallet) {
      return privateKeyToAccount(existingWallet.secret as `0x${string}`)
    }
    const dataFromVaults = await getVaultData('biconomy/signer')
    const signers = JSON.parse(dataFromVaults['SESSION_SIGNER'].toString())
    const sessionSigner = signers[address]

    const kmsFromVaults = await getVaultData('kms')
    console.log({ kmsFromVaults })

    const email = kmsFromVaults['email']
    const privateKey = kmsFromVaults['privateKey']
    const projectId = kmsFromVaults['projectId']
    const location = kmsFromVaults['location']
    const keyRing = kmsFromVaults['keyRing']
    const cryptoKey = kmsFromVaults['cryptoKey']
    // get from kms

    const auth = new GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    })
    const kmsClient = new KeyManagementServiceClient({
      auth
    })
    const kmsKeyName = kmsClient.cryptoKeyPath(projectId, location, keyRing, cryptoKey)
    const [response] = await kmsClient.decrypt({
      name: kmsKeyName,
      ciphertext: sessionSigner
    })
    const secret = Buffer.from(response?.plaintext || '').toString()
    wallets.push({ address, secret })
    return privateKeyToAccount(secret as `0x${string}`)
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
