"use client"

import { useState } from "react"
import { useToolboxStore, useViemChainStore } from "../../stores/toolboxStore";
import { useWalletStore } from "../../stores/walletStore";
import { Container } from "../../components/Container"
import { cn } from "../../lib/utils"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import validatorManagerAbi from "../../../contracts/icm-contracts/compiled/ValidatorManager.json"
import { custom, fromBytes, createPublicClient, bytesToHex } from "viem";
import { pvm, utils, Context } from "@avalabs/avalanchejs";
import { AvaCloudSDK } from "@avalabs/avacloud-sdk";


const parseNodeID = (nodeID: string) => {
  const nodeIDWithoutPrefix = nodeID.replace("NodeID-", "");
  const decodedID = utils.base58.decode(nodeIDWithoutPrefix)
  const nodeIDHex = fromBytes(decodedID, 'hex')
  const nodeIDHexTrimmed = nodeIDHex.slice(0, -8)
  return nodeIDHexTrimmed
}

export default function RemoveValidator() {
  const [nodeID, setNodeID] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { proxyAddress } = useToolboxStore()
  const { coreWalletClient, pChainAddress } = useWalletStore()
  const viemChain = useViemChainStore()


  const publicClient = createPublicClient({
    transport: custom(window.avalanche!),
  })

  const getValidationID = async (nodeID: string) => {
    try {
      // Convert NodeID to bytes format
      const nodeIDBytes = parseNodeID(nodeID)

      // Call the registeredValidators function
      const validationID = await publicClient.readContract({
        address: proxyAddress as `0x${string}`,
        abi: validatorManagerAbi.abi,
        functionName: "registeredValidators",
        args: [nodeIDBytes]
      })

      return validationID
    } catch (error: any) {
      throw new Error(`Failed to get validation ID: ${error.message}`)
    }

  }

  const handleRemove = async () => {
    if (!nodeID) {
      setError("Node ID is required")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const validationIDHex = await getValidationID(nodeID)
      console.log(validationIDHex)

      const removeValidatorTx = await coreWalletClient.writeContract({
        address: proxyAddress as `0x${string}`,
        abi: validatorManagerAbi.abi,
        functionName: "initiateValidatorRemoval",
        args: [validationIDHex],
        chain: viemChain
      })
      console.log(removeValidatorTx)
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: removeValidatorTx
      })
      console.log(receipt)

      const changeWeightWarpUnsignedWarpMessage = receipt.logs[0].data || ""
      const { signedMessage } = await new AvaCloudSDK().data.signatureAggregator.aggregateSignatures({
        network: "fuji",
        signatureAggregatorRequest: {
          message: changeWeightWarpUnsignedWarpMessage,
          signingSubnetId: "",
          quorumPercentage: 67,
        },
      })
      console.log(signedMessage)

      const platformEndpoint = "https://api.avax-test.network"
      const context = await Context.getContextFromURI(platformEndpoint)
      const pvmApi = new pvm.PVMApi(platformEndpoint)
      const feeState = await pvmApi.getFeeState();
      const { utxos } = await pvmApi.getUTXOs({ addresses: [pChainAddress] });
      const pChainAddressBytes = utils.bech32ToBytes(pChainAddress)
      const changeValidatorWeightTx = pvm.e.newSetL1ValidatorWeightTx(
        {
          message: new Uint8Array(Buffer.from(signedMessage, 'hex')),
          feeState,
          fromAddressesBytes: [pChainAddressBytes],
          utxos,
        },
        context,
      )
      const changeValidatorWeightTxBytes = changeValidatorWeightTx.toBytes()
      const changeValidatorWeightTxHex = bytesToHex(changeValidatorWeightTxBytes)
      console.log(changeValidatorWeightTxHex)

      const coreTx = await window.avalanche?.request({
        method: "avalanche_sendTransaction",
        params: {
          transactionHex: changeValidatorWeightTxHex,
          chainAlias: "P"  
        }
      })
      
      console.log(coreTx)
      setSuccess(`Validator ${nodeID} successfully removed.`)
    } catch (err: any) {
      setError(`Failed to remove validator: ${err.message}`)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container
      title="Remove Validator"
      description="Remove a validator from an Avalanche L1"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            id="nodeID"
            type="text"
            value={nodeID}
            onChange={(e) => setNodeID(e)}
            placeholder="Enter validator Node ID"
            className={cn(
              "w-full px-3 py-2 border rounded-md",
              "text-zinc-900 dark:text-zinc-100",
              "bg-white dark:bg-zinc-800",
              "border-zinc-300 dark:border-zinc-700",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            )}
            label="Node ID"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Enter the Node ID of the validator you want to remove
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        <Button
          onClick={handleRemove}
          disabled={isLoading}
        >
          {isLoading ? "Removing..." : "Remove Validator"}
        </Button>
      </div>
    </Container>
  )
}
