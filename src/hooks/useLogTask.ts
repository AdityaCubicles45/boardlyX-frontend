import { useCallback } from 'react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, TASK_REGISTRY_ABI } from '../config/contract';
import * as api from '../services/api';

export function useLogTask() {
  const { writeContractAsync, isPending, error: writeError, reset } = useWriteContract();
  const publicClient = usePublicClient();

  const logTaskAndStore = useCallback(
    async (taskId: string, taskHash: string) => {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TASK_REGISTRY_ABI,
        functionName: 'logTask',
        args: [taskHash],
      });
      if (!hash || !publicClient) throw new Error('Transaction submitted but receipt unavailable');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
      const blockTimestamp = Number(block.timestamp);
      await api.storeOnChain(taskId, hash, blockTimestamp);
      return { hash, blockTimestamp };
    },
    [writeContractAsync, publicClient]
  );

  return {
    logTaskAndStore,
    isPending,
    error: writeError?.message ?? null,
    reset,
  };
}
