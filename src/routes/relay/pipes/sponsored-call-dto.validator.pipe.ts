import { Inject, Injectable, PipeTransform } from '@nestjs/common';

import { ISafeInfoService, SafeInfoService } from '../../../datasources/safe-info/safe-info.service.interface';
import { SponsoredCallSchema } from '../entities/schema/sponsored-call.schema';
import { isCreateProxyWithNonceCalldata } from '../entities/schema/transactions/create-proxy-with-nonce';
import { SponsoredCallDto } from '../entities/sponsored-call.entity';

export class SponsoredCallValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

@Injectable()
export class SponsoredCallDtoValidatorPipe implements PipeTransform {
  private readonly schema = SponsoredCallSchema;

  constructor(
    @Inject(SafeInfoService) private safeInfoService: ISafeInfoService,
  ) {
  }

  async transform<T>(value: T): Promise<SponsoredCallDto> {
    const result = await this.schema.safeParseAsync(value);

    if (!result.success) {
      throw new SponsoredCallValidationError(`Validation failed ${result.error.message}`);
    }

    if (!isCreateProxyWithNonceCalldata(result.data.data)) {
      const isCallValidContract = await this.safeInfoService.isValidContract(
        result.data.chainId,
        result.data.to.toLowerCase(),
      );

      if (!isCallValidContract) {
        throw new SponsoredCallValidationError(
          'This contract does not support sponsored transactions.',
        );
      }
    }

    return result.data;
  }
}
