import { Module } from '@nestjs/common'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { KafkaModule } from './kafka/kafka.module.js'
import { BiconomyModule } from './biconomy/biconomy.module.js'
import { MongooseModule } from '@nestjs/mongoose'
import { DB_CONNECTION_STRING } from './app.settings.js'

@Module({
  imports: [MongooseModule.forRoot(DB_CONNECTION_STRING), KafkaModule, BiconomyModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
