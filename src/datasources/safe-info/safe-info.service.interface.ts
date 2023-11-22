export const SafeInfoService = Symbol('ISafeInfoService');

export interface ISafeInfoService {
  isValidContract(chainId: string, address: string): Promise<boolean>;
}
