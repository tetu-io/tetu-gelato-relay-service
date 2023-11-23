import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import { CacheService, ICacheService } from '../../../datasources/cache/cache.service.interface';

const GLOBAL_LIMIT_CACHE_KEY = '0x0000000000000000000000000000000000000001';

@Injectable()
export class RelayLimitService {


  // Time to limit in seconds
  private readonly ttl: number;

  // Number of relay requests by account per ttl
  private readonly limit: number;
  // Number of relay global requests per ttl
  private readonly globalLimit: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CacheService) private readonly cacheService: ICacheService,
  ) {
    this.ttl = this.configService.getOrThrow<number>('relay.ttl');
    this.limit = this.configService.getOrThrow<number>('relay.limit');
    this.globalLimit = this.configService.getOrThrow<number>('relay.globalLimit');
  }

  /**
   * Generate key for caching number of relays
   */
  private generateKey(chainId: string, address: string) {
    return `${chainId}:${ethers.getAddress(address)}`;
  }

  /**
   * Get the number of cached attempts for an address
   */
  private async getCachedAttempts(
    chainId: string,
    address: string,
  ): Promise<number> {
    const DEFAULT_ATTEMPTS = 0;

    const key = this.generateKey(chainId, address);
    const attempts = await this.cacheService.get(key);

    return typeof attempts === 'string'
      ? // If attempts is not a number, return default
      Number(attempts) || DEFAULT_ATTEMPTS
      : DEFAULT_ATTEMPTS;
  }

  /**
   * Set the number of attempts for an address in cache
   */
  private async setCachedAttempts(
    chainId: string,
    address: string,
    attempts: number,
  ): Promise<void> {
    const key = this.generateKey(chainId, address);
    return this.cacheService.set(key, attempts.toString(), this.ttl);
  }

  /**
   * Get the current relay limit for an address
   */
  public async getRelayLimit(
    chainId: string,
    address: string,
  ): Promise<{
    limit: number;
    remaining: number;
    globalLimit: number;
    globalRemaining: number;
  }> {
    const attempts = await this.getCachedAttempts(chainId, address);
    const attemptsGlobal = await this.getCachedAttempts(chainId, GLOBAL_LIMIT_CACHE_KEY);

    return {
      limit: this.limit,
      remaining: Math.max(0, this.limit - attempts),
      globalLimit: this.globalLimit,
      globalRemaining: Math.max(0, this.globalLimit - attemptsGlobal),
    };
  }

  /**
   * Check if addresses can relay
   */
  public async canRelay(
    chainId: string,
    addresses: Array<string>,
  ): Promise<boolean> {
    const attempts = await Promise.all(
      addresses.map((address) => this.getCachedAttempts(chainId, address)),
    );
    const globalAttempts = await this.getCachedAttempts(chainId, GLOBAL_LIMIT_CACHE_KEY);
    return attempts.every((attempts) => attempts < this.limit) && globalAttempts < this.globalLimit;
  }

  /**
   * Increment the number of relays for addresses
   */
  public async increment(
    chainId: string,
    addresses: Array<string>,
  ): Promise<void> {
    const currentGlobalAttempts = await this.getCachedAttempts(chainId, GLOBAL_LIMIT_CACHE_KEY);
    await this.setCachedAttempts(chainId, GLOBAL_LIMIT_CACHE_KEY, currentGlobalAttempts + 1);

    await Promise.allSettled(
      addresses.map(async(address) => {
        const currentAttempts = await this.getCachedAttempts(chainId, address);
        const incremented = currentAttempts + 1;
        return this.setCachedAttempts(chainId, address, incremented);
      }),
    );
  }
}
