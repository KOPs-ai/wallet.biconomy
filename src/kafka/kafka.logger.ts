import { LoggerService } from '@nestjs/common'
import { KafkaService } from './kafka.service.js'
import os from 'os'
import { NODE_ENV, SERVICE_NAME } from '../app.settings.js'

const TOPIC_DEFAULT = 'sys_service_log'

export class KafkaLogger implements LoggerService {
  constructor(private readonly kafkaService: KafkaService) {}

  hostInfo = {
    hostname: os.hostname(), // machine name
    platform: os.platform(), // 'linux', 'darwin', 'win32'
    arch: os.arch(), // 'x64', 'arm64'
    release: os.release(), // OS version
    pid: process.pid // current process ID
  }

  baseInfo = {
    host: this.hostInfo.hostname,
    service: SERVICE_NAME,
    env: NODE_ENV
  }

  log(
    message: string,
    params: {
      context?: string
      key?: string
      data?: any
      topic?: string
    }
  ) {
    const { context, key, data, topic } = params
    try {
      this.kafkaService.sendLog(topic || TOPIC_DEFAULT, key || '', {
        level: 'log',
        ts: new Date().toISOString(),
        caller: context || '',
        message,
        ...this.baseInfo,
        key,
        data
      })
      console.log('log send', {
        topic: topic || TOPIC_DEFAULT,
        key: key || '',
        message: {
          level: 'log',
          ts: new Date().toISOString(),
          caller: context || '',
          message,
          ...this.baseInfo,
          key,
          data
        }
      })
    } catch (error) {
      console.log({ message, error })
    }
  }

  async error(message: any, trace?: string, context?: string, key?: string) {
    await this.kafkaService.sendLog(TOPIC_DEFAULT, key || '', {
      level: 'error',
      ts: new Date().toISOString(),
      caller: context,
      message,
      ...this.baseInfo,
      trace
    })
  }

  async warn(
    message: string,
    params: {
      context?: string
      key?: string
      data?: Record<string, any>
      topic?: string
    }
  ) {
    const { context, key, data, topic } = params
    await this.kafkaService.sendLog(topic || TOPIC_DEFAULT, key || '', {
      level: 'warn',
      ts: new Date().toISOString(),
      caller: context,
      message,
      ...this.baseInfo,
      key,
      data
    })
  }

  async debug(
    message: string,
    params: {
      context?: string
      key?: string
      data?: Record<string, any>
      topic?: string
    }
  ) {
    const { context, key, data, topic } = params
    await this.kafkaService.sendLog(topic || TOPIC_DEFAULT, key || '', {
      level: 'debug',
      ts: new Date().toISOString(),
      caller: context,
      message,
      ...this.baseInfo,
      key,
      data
    })
  }

  async verbose(
    message: string,
    params: {
      context?: string
      key?: string
      data?: Record<string, any>
      topic?: string
    }
  ) {
    const { context, key, data, topic } = params
    await this.kafkaService.sendLog(topic || TOPIC_DEFAULT, key || '', {
      level: 'verbose',
      ts: new Date().toISOString(),
      caller: context,
      message,
      ...this.baseInfo,
      key,
      data
    })
  }
}
