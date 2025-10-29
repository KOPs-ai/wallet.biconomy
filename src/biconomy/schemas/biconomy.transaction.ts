import { Schema } from 'mongoose'

export const biconomyTransactionSchema = new Schema(
  {
    itxHash: { type: String, required: true, unique: true },
    node: { type: String, required: false },
    commitment: { type: String, required: true },
    recieptHashes: { type: [String], required: false },
    transactionStatus: { type: String, required: false },
    paymentInfo: { type: Object, required: false },
    referenceId: { type: String, required: false }
  },
  {
    collection: 'biconomy_transactions',
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      }
    }
  }
)
