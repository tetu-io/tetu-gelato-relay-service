import { z } from 'zod';

import { AddressSchema } from '../../../common/schema/address.schema';
import { ChainIdSchema } from '../../../common/schema/chain-id.schema';

export const SponsoredCallSchema = z
  .object({
    chainId: ChainIdSchema,
    from: AddressSchema,
    to: AddressSchema,
    userNonce: z.string(),
    userDeadline: z.string(),
    signature: z.string(),
    data: z.string(),
    gasLimit: z.optional(z.string().regex(/^\d+$/)).transform((value) => {
      return value ? BigInt(value) : undefined;
    }),
  })
  .transform(async(values, ctx) => {
    const { chainId, from, to, data } = values;

    const setError = (message: string) => {
      ctx.addIssue({
        message,
        path: ['data'],
        code: z.ZodIssueCode.custom,
      });
    };

    return {
      ...values,
      limitAddresses: [from],
      to: to,
    };

    // `execTransaction`
    // if (isValidExecTransactionCall(to, data)) {
    //   return {
    //     ...values,
    //     limitAddresses: [to],
    //   };
    // }

    // `multiSend`
    // if (isValidMultiSendCall(chainId, to, data)) {
    //   const safeAddress = getSafeAddressFromMultiSend(data);
    //   if (!safeAddress) {
    //     setError('Cannot decode Safe address from `multiSend` transaction');
    //     return z.NEVER;
    //   }
    //
    //   return {
    //     ...values,
    //     limitAddresses: [safeAddress],
    //   };
    // }

    // `createProxyWithNonce`
    // if (isValidCreateProxyWithNonceCall(chainId, to, data)) {
    //   return {
    //     ...values,
    //     limitAddresses: getOwnersFromCreateProxyWithNonce(data),
    //   };
    // }

    // setError(
    //   'Only Tetu transactions not to self can be relayed',
    // );
    // return z.NEVER;
  });
