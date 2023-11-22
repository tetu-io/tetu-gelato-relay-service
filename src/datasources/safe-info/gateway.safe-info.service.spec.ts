import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';

import { mockNetworkService } from '../network/__tests__/test.network.module';
import { GatewaySafeInfoService } from './gateway.safe-info.service';
import { AxiosNetworkService } from '../network/axios.network.service';
import axios from 'axios';

describe('GatewaySafeInfoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockConfigService = new ConfigService({
    gatewayUrl: faker.internet.url({ appendSlash: false }),
  });

  const safeInfoService = new GatewaySafeInfoService(
    mockConfigService,
    mockNetworkService,
  );

  describe('isSafeContract', () => {

    it.skip('should return true for E2E test', async () => {
      const netService = new AxiosNetworkService(axios.create());
      const safeInfoService = new GatewaySafeInfoService(
        mockConfigService,
        netService,
      );

      const chainId = '11155111';
      const address = '0xd203cC5AfDD6197f8c81FEA2a315416Df344478d';

      const result = await safeInfoService.isValidContract(chainId, address);

      expect(result).toBe(true);
    });

    it('should return true if the safe exists', async () => {
      const chainId = '11155111';
      const address = faker.finance.ethereumAddress();

      mockNetworkService.post.mockImplementation(() => Promise.resolve(JSON.parse(`{"data": {"data":{"itemMetaEntities":[{"id":"${address}"}]}}}`)));

      const result = await safeInfoService.isValidContract(chainId, address);

      expect(result).toBe(true);
    });

    it('should return false if the safe does not exist', async () => {
      mockNetworkService.post.mockImplementation(() => Promise.reject());

      const chainId = '11155111';
      const address = faker.finance.ethereumAddress();

      const result = await safeInfoService.isValidContract(chainId, address);

      expect(result).toBe(false);
    });
  });
});
