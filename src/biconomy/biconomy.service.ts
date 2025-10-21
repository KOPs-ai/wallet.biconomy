import { Injectable, Logger } from '@nestjs/common'
import { createMeeClient, meeSessionActions, toMultichainNexusAccount } from '@biconomy/abstractjs'

import { type Hex } from 'viem'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { type IStrategyUser } from './interfaces/strategyUser.interface.js'
import { type IStrategy } from './interfaces/strategy.interface.js'
import { getSessionSigner, initChainConfig } from './biconomy.utils.js'
import type { GrantPermissionResponse } from '@biconomy/abstractjs/dist/_types/modules/validators/smartSessions/decorators/grantPermission'
import { RpcException } from '@nestjs/microservices'
import { Instruction } from '@donleeit/protos/pb/typescript/biconomy/models/usePermission.js'
import {
  BICONOMY_API_KEY,
  HYPEEVM_RPC,
  SPONSORSHIP,
  VERIFICATION_GAS_BASE
} from '../app.settings.js'
import { IUserPermission } from './interfaces/user.permission.interface.js'
import { UseMeePermissionParams } from '@biconomy/abstractjs/dist/_types/modules/validators/smartSessions/decorators/mee/useMeePermission.js'
import { JsonRpcProvider, ZeroAddress } from 'ethers'

@Injectable()
export class BiconomyService {
  logger = new Logger()
  hyperEvmProvider: JsonRpcProvider
  constructor(
    @InjectModel('StrategyUser') private strategyUserModel: Model<IStrategyUser>,
    @InjectModel('Strategy') private strategyModel: Model<IStrategy>,
    @InjectModel('UserPermission') private userPermissionModel: Model<IUserPermission>
  ) {
    this.hyperEvmProvider = new JsonRpcProvider(HYPEEVM_RPC)
  }

  async usePermision(params: {
    orchestratorAddress: string
    strategyId: string
    txData: Instruction[]
    feeToken: string
    feeChainId: number
  }) {
    try {
      const { orchestratorAddress, strategyId, txData, feeToken, feeChainId } = params
      const strategyUser = await this.strategyUserModel.findOne({
        strategyId,
        orchestratorAddress: orchestratorAddress.toLowerCase()
      })

      if (!strategyUser) {
        throw new RpcException('Strategy user not found')
      }
      const strategy = await this.strategyModel.findById(strategyId)
      if (!strategy) {
        throw new RpcException('Strategy not found')
      }
      if (!strategy.sessionSignerAddress) {
        throw new RpcException('Session signer address not found')
      }
      const sessionSignerAddress = strategy.sessionSignerAddress
      const sessionSigner = await getSessionSigner(sessionSignerAddress)
      const userOwnedOrchestratorWithSessionSigner = await toMultichainNexusAccount({
        chainConfigurations: txData.map((item) => {
          const chainId = Number(item.chainId)
          return initChainConfig(chainId)
        }),
        accountAddress: orchestratorAddress as Hex,
        signer: sessionSigner
      })

      // Use the original orchestrator account that was already set up
      const sessionSignerMeeClient = await createMeeClient({
        account: userOwnedOrchestratorWithSessionSigner,
        apiKey: BICONOMY_API_KEY
      })

      const userPermissions = await this.userPermissionModel.find({
        orchestratorAddress: orchestratorAddress.toLowerCase(),
        strategyId
      })
      // if (!strategyUser.sessionDetail) {
      //   throw new RpcException('Session detail not found')
      // }
      if (userPermissions.length === 0) {
        throw new RpcException('User permission not found')
      }
      const sesionInDB = userPermissions.map((item) => item.sessionDetail)
      const sessionDetails: GrantPermissionResponse = sesionInDB.map((item) => {
        return {
          ...item,
          enableSessionData: {
            ...item.enableSessionData,
            enableSession: {
              ...item.enableSessionData.enableSession,
              hashesAndChainIds: item.enableSessionData.enableSession.hashesAndChainIds.map((m) => {
                return {
                  ...m,
                  chainId: BigInt(m.chainId as string)
                }
              }),
              sessionToEnable: {
                ...item.enableSessionData.enableSession.sessionToEnable,
                chainId: BigInt(
                  item.enableSessionData.enableSession.sessionToEnable.chainId as string
                )
              }
            }
          }
        }
      })

      const sessionDetailByActions: GrantPermissionResponse = []
      for (const item of txData) {
        // const chainIdNumber = Number(item.chainId)
        const calls = item.calls
        for (let index = 0; index < calls.length; index++) {
          const call = calls[index]
          // const action = sessionDetails.find(
          //   (session) =>
          //     session.enableSessionData.enableSession.sessionToEnable.chainId ===
          //       BigInt(chainIdNumber) &&
          //     session.enableSessionData.enableSession.sessionToEnable.actions.some(
          //       (s) =>
          //         s.actionTarget.toLowerCase() === call.to.toLowerCase() &&
          //         s.actionTargetSelector === call.functionSelector
          //     )
          // )
          const userPermission = userPermissions.find(
            (f) =>
              f.actionTargetSelector === call.functionSelector &&
              f.actionTarget?.toLowerCase() === call.to.toLowerCase() &&
              f.permissionId === call.permissionId
          )
          const action = sessionDetails.find(
            (s) => s.permissionId === userPermission?.sessionDetail?.permissionId
          )
          if (!action) {
            throw new RpcException('Action not found')
          }

          // push if not existed
          if (!sessionDetailByActions.some((s) => s.permissionId === action.permissionId)) {
            sessionDetailByActions.push(action)
          }
        }
      }
      const sessionSignerSessionMeeClient = sessionSignerMeeClient.extend(meeSessionActions)
      const instructions = await Promise.all(
        txData.map(async (item) => {
          const chainIdNumber = Number(item.chainId)
          return {
            chainId: chainIdNumber,
            calls: await Promise.all(
              item.calls.map(async (call) => {
                const estimateGas = await this.hyperEvmProvider.estimateGas({
                  from: orchestratorAddress as Hex,
                  to: call.to as Hex,
                  data: call.data as Hex
                })
                return {
                  to: call.to as Hex,
                  data: call.data as Hex,
                  value: BigInt(call.value || '0'),
                  gasLimit: estimateGas
                }
              })
            )
          }
        })
      )
      const permissionUse = userPermissions.find(
        (f) => f.sessionDetail?.permissionId === sessionDetailByActions[0].permissionId
      )
      const mode = (permissionUse?.usedCount || 0) > 0 ? 'USE' : 'ENABLE_AND_USE'

      const verificationGas = BigInt(VERIFICATION_GAS_BASE)

      const totalCallGasLimit = instructions.reduce((acc, item) => {
        return (
          acc +
          item.calls.reduce((acc, call) => {
            return acc + Number(call.gasLimit)
          }, 0)
        )
      }, 0)
      const verificationGasLimit = verificationGas - BigInt(Math.floor(totalCallGasLimit))
      console.log({ totalCallGasLimit, verificationGasLimit })

      let permissionToUse: UseMeePermissionParams = {
        verificationGasLimit: verificationGasLimit,
        sessionDetails: sessionDetailByActions,
        mode: mode,
        instructions: instructions,
        feeToken: {
          address: (feeToken as Hex) || ZeroAddress,
          chainId: feeChainId
        }
      }
      if (SPONSORSHIP === 'true') {
        permissionToUse = {
          verificationGasLimit: verificationGasLimit,
          sessionDetails: sessionDetailByActions,
          mode: mode,
          instructions: instructions,
          sponsorship: true
        }
      }
      console.log({ permissionToUse, sponsorship: SPONSORSHIP, mode })

      const executionPayload = await sessionSignerSessionMeeClient.usePermission(permissionToUse)
      console.log({ hash: executionPayload.hash })
      const receipt = await sessionSignerMeeClient.waitForSupertransactionReceipt({
        hash: executionPayload.hash
      })
      this.logger.log('send tx success', { key: 'userPermission', data: receipt })
      // update usedCount
      await this.userPermissionModel.updateMany(
        {
          orchestratorAddress: orchestratorAddress.toLowerCase(),
          strategyId,
          'sessionDetail.permissionId': sessionDetailByActions[0].permissionId
        },
        { $inc: { usedCount: 1 } }
      )

      return { txHash: receipt.receipts[0].transactionHash, meeHash: executionPayload.hash }
    } catch (error) {
      this.logger.error('send tx failed', { key: 'userPermission', data: error })
      console.log(error)
      throw new RpcException(error as object)
    }
  }
}
