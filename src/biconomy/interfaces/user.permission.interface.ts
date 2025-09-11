export interface IUserPermission {
  id?: string
  strategyId: string
  walletAddress: string
  orchestratorAddress?: string
  sessionDetail?: any
  status?: string
  usedCount?: number
  createdAt?: Date
  updatedAt?: Date
}
