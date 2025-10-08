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
  permissionId?: string
  createdAt?: Date
  updatedAt?: Date
}
