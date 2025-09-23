import * as dotenv from 'dotenv'
dotenv.config()
import * as vault from 'node-vault'

const vaultClient = vault.default({
  apiVersion: 'v1',
  endpoint: `${process.env.KEY_STORE_HOST}:${process.env.KEY_STORE_PORT}`,
  requestOptions: {
    strictSSL: false // Disable TLS verification (development only)
  }
})

export const HYPEEVM_RPC = process.env.HYPEEVM_RPC || 'https://hyperliquid.drpc.org'
export const BASE_RPC = process.env.BASE_RPC || ''
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const SERVICE_NAME = process.env.SERVICE_NAME || 'balance.balance'
export const APM_ENABLE = true
export const KAFKA_LOG_ENABLE = true
export const BICONOMY_API_KEY = process.env.BICONOMY_API_KEY || ''
export const VERIFICATION_GAS_BASE = process.env.VERIFICATION_GAS_BASE || '1000000'
export const SPONSORSHIP = process.env.SPONSORSHIP || 'false'

export let PRICE_SERVICE_URL = 'price.stg-pricing:30000'
export let DB_CONNECTION = {}
export let APM_CONNECTION = {}
export let GRPC_CONNECTION = {}
export let KAFKA_CONNECTION = {}
export let REDIS_CONNECTION = {}
export let DB_CONNECTION_STRING = ''
/* eslint-disable */
export async function loadEnvFile() {
  try {
    APM_CONNECTION = await getVaultData('common/apm')
    DB_CONNECTION = await getVaultData('common/db/mongo')
    GRPC_CONNECTION = await getVaultData('common/grpc')
    KAFKA_CONNECTION = await getVaultData('common/kafka')
    REDIS_CONNECTION = await getVaultData('common/redis')
    if (DB_CONNECTION) {
      const dbPrefix = DB_CONNECTION['HOST'].split('//')[0]
      const dbHost = DB_CONNECTION['HOST'].split('//')[1]
      DB_CONNECTION_STRING = `${dbPrefix}//${DB_CONNECTION['USERNAME']}:${DB_CONNECTION['PASSWORD']}@${dbHost}:${DB_CONNECTION['PORT']}/strategies?authSource=admin`
    }
  } catch (error) {
    console.error('Error loading settings from Vault:', error)
  }
  if (NODE_ENV == 'development') {
    PRICE_SERVICE_URL = 'localhost:3001'
    GRPC_CONNECTION['SERVICE_PORT'] = 3001
    DB_CONNECTION_STRING = process.env.DB_DEV || ''
  } else {
  }
}

export async function getVaultData(key: string) {
  try {
    const loginResult = await vaultClient.userpassLogin({
      username: process.env.KEY_STORE_USER || 'my-app-user',
      password: process.env.KEY_STORE_PASSWORD || 'securepassword'
    })
    vaultClient.token = loginResult.auth.client_token
    // Fetch secrets from Vault
    const rootFolder = `${process.env.KEY_STORE_DIR}/${key}`
    const result = await vaultClient.read(rootFolder)
    const settings = result.data
    return settings
  } catch (error) {
    console.error('Error loading settings from Vault:', error)
    throw error
  }
}
