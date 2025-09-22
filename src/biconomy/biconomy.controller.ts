import { Controller } from '@nestjs/common'
import { BiconomyService } from './biconomy.service.js'
import { BiconomyServiceController } from '@donleeit/protos/pb/typescript/biconomy/service.js'
import type {
  UsePermissionRequest,
  UsePermissionResponse
} from '@donleeit/protos/pb/typescript/biconomy/models/usePermission.js'
import { GrpcMethod } from '@nestjs/microservices'

@Controller('biconomy')
export class BiconomyController implements BiconomyServiceController {
  constructor(private readonly biconomyService: BiconomyService) {}

  @GrpcMethod('BiconomyService', 'UsePermission')
  async usePermission(request: UsePermissionRequest): Promise<UsePermissionResponse> {
    const receipt = await this.biconomyService.usePermision({
      ...request,
      feeChainId: Number(request.feeChainId)
    })
    return {
      txHash: receipt.txHash,
      chainId: Number(request.feeChainId),
      superTxHash: receipt.meeHash
    }
  }
}
