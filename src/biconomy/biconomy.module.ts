import { Module } from '@nestjs/common'
import { BiconomyService } from './biconomy.service.js'
import { BiconomyController } from './biconomy.controller.js'
import { strategyUserSchema } from './schemas/strategy.user.schema.js'
import { MongooseModule } from '@nestjs/mongoose'
import { strategySchema } from './schemas/strategy.schema.js'
import { userPermissionSchema } from './schemas/user.permission.schema.js'
import { KafkaModule } from '../kafka/kafka.module.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StrategyUser', schema: strategyUserSchema },
      { name: 'Strategy', schema: strategySchema },
      { name: 'UserPermission', schema: userPermissionSchema }
    ]),
    KafkaModule
  ],
  providers: [BiconomyService],
  controllers: [BiconomyController]
})
export class BiconomyModule {}
