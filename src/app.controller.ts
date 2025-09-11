import { Controller } from '@nestjs/common'
import { AppService } from './app.service.js'
import { GrpcMethod } from '@nestjs/microservices'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('AppService', 'getHello')
  getHello(): string {
    return this.appService.getHello()
  }
}
