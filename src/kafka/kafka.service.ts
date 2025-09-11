// kafka.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Kafka, Producer } from 'kafkajs'
import { KAFKA_CONNECTION } from '../app.settings.js'

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka
  private producer: Producer

  constructor() {
    const brokers = KAFKA_CONNECTION['BROKERS'].toString().split(',')
    this.kafka = new Kafka({
      clientId: 'nestjs-logging-app',
      brokers,
      sasl: {
        mechanism: 'plain', // can be 'plain', 'scram-sha-256', 'scram-sha-512'
        username: KAFKA_CONNECTION['USERNAME'],
        password: KAFKA_CONNECTION['PASSWORD']
      }
    })
  }

  async onModuleInit() {
    this.producer = this.kafka.producer({})
    await this.producer.connect()
  }

  async sendLog(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          }
        ]
      })
    } catch (error) {
      console.log({ error })
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect()
  }
}
