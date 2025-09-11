import './apm.js'

import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvFile, GRPC_CONNECTION, KAFKA_LOG_ENABLE, SERVICE_NAME } from './app.settings.js'
import { KafkaService } from './kafka/kafka.service.js'
import { KafkaLogger } from './kafka/kafka.logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function bootstrap() {
  await loadEnvFile()
  const { AppModule } = await import('./app.module.js')
  const url = `${GRPC_CONNECTION['SERVICE_HOST']}:${GRPC_CONNECTION['SERVICE_PORT']}`
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: ['biconomy'],
      protoPath: [join(__dirname, '../node_modules/@donleeit/protos/proto/biconomy/service.proto')],
      url,
      loader: {
        includeDirs: [join(__dirname, '../node_modules/@donleeit/protos/proto')] // Base directory for resolving imports at runtime
      }
    }
  })
  if (KAFKA_LOG_ENABLE) {
    // using kafka logger
    const kafkaService = app.get(KafkaService)
    app.useLogger(new KafkaLogger(kafkaService))
  }
  await app.listen()
  console.log(`${SERVICE_NAME} service is running on port ${url}`)
}
bootstrap().catch((error) => console.log(error))
