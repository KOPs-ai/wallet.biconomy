import { Schema } from 'mongoose'

export const strategySchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: false },
    description: { type: String, required: true },
    protocols: { type: [String], required: false },
    assets: { type: [String], required: false },
    isActive: { type: Boolean, required: true },
    status: { type: String, required: false, default: 'active' },
    logo: { type: String, required: false },
    sessionSignerAddress: { type: String, required: false }
  },
  {
    collection: 'strategies',
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
