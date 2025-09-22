export interface IUserPermission {
  id?: string
  strategyId: string
  walletAddress: string
  orchestratorAddress?: string
  sessionDetail?: any
  status?: string
  actionTargetSelector?: string
  actionTarget?: string
  usedCount?: number
  createdAt?: Date
  updatedAt?: Date
}
