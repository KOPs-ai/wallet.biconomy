import { Test, TestingModule } from '@nestjs/testing'
import { BiconomyService } from './biconomy.service.js'

describe('BiconomyService', () => {
  let service: BiconomyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BiconomyService]
    }).compile()

    service = module.get<BiconomyService>(BiconomyService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
