import { Global, Module } from '@nestjs/common';

import {
  ISafeInfoService,
  SafeInfoService,
} from '../safe-info.service.interface';

const safeInfoService: ISafeInfoService = {
  isValidContract: jest.fn(),
};

export const mockSafeInfoService = jest.mocked(safeInfoService);

@Global()
@Module({
  providers: [{ provide: SafeInfoService, useValue: mockSafeInfoService }],
  exports: [SafeInfoService],
})
export class TestSafeInfoModule {}
