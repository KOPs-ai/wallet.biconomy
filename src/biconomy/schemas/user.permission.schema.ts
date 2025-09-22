import { Schema } from 'mongoose'

export const userPermissionSchema = new Schema(
  {
    strategyId: { type: String, required: true },
    walletAddress: { type: String, required: true, lowercase: true },
    status: { type: String, required: true, default: 'active' },
    orchestratorAddress: { type: String, required: false, lowercase: true },
    actionTargetSelector: { type: String, required: false },
    actionTarget: { type: String, required: false },
    sessionDetail: { type: Object, required: false },
    usedCount: { type: Number, required: false, default: 0 }
  },
  {
    collection: 'user_permissions',
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
userPermissionSchema.index({ strategyId: 1, walletAddress: 1 })
