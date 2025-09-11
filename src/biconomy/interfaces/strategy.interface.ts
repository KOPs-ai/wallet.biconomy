export interface IStrategy {
  id: string
  name: string
  description: string
  protocols: string[]
  assets: string[]
  isActive: boolean
  logo?: string
  status?: string
  sessionSignerAddress?: string
  createdAt: Date
  updatedAt: Date
}
