export interface IBiconomyTransaction {
  id?: string
  itxHash: string
  node: string
  commitment: string
  recieptHashes: string[]
  transactionStatus: string
  createdAt?: Date
  updatedAt?: Date
  referenceId?: string
}
