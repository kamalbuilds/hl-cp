// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Local Hardhat Network
  31337: {
    CopyTrading: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
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