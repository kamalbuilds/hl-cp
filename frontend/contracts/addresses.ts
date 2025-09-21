// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Local Hardhat Network
  31337: {
    CopyTrading: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
  // HyperEVM Testnet
  998: {
    CopyTrading: '', // To be deployed
  },
  // HyperEVM Mainnet
  999: {
    CopyTrading: '', // To be deployed
  },
} as const;

export function getContractAddress(chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES[31337]) {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`No contracts deployed on chain ${chainId}`);
  }

  const address = addresses[contractName];
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on chain ${chainId}`);
  }

  return address;
}