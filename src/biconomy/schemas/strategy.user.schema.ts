import { Schema } from 'mongoose'

export const strategyUserSchema = new Schema(
  {
    strategyId: { type: String, required: true },
    userId: { type: String, required: true },
    walletAddress: { type: String, required: true, lowercase: true },
    coinbaseWalletAddress: { type: String, required: true, lowercase: true, unique: true },
    status: { type: String, required: true, default: 'active' },
    orchestratorAddress: { type: String, required: false, lowercase: true },
    sessionDetail: { type: Object, required: false },
    permissionUsed: { type: Boolean, required: false, default: false }
  },
  {
    collection: 'strategy_users',
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
