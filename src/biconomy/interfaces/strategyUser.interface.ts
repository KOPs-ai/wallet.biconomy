export interface IStrategyUser {
  id: string
  strategyId: string
  userId: string
  walletAddress: string
  coinbaseWalletAddress: string
  createdAt: Date
  updatedAt: Date
  orchestratorAddress?: string
  sessionDetail?: object
  permissionUsed?: boolean
}
