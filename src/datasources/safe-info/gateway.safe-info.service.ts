import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { INetworkService, NetworkService } from '../network/network.service.interface';
import { ISafeInfoService } from './safe-info.service.interface';
import { SupportedChainId } from '../../config/constants';

const WHITELISTED = new Map<string, Set<string>>([
  [
    SupportedChainId.SEPOLIA, new Set<string>([
    '0x4c7bb402755e8cDaEd13f1C4d95baD7d93FA36f9', // controller
    '0xbE3c35a0abaA1707308480224D71D94F75b458D1', // gameToken
    // '0xE4909d02F810d474B2ed40E89c963dd3DdAC027c', // minter
    // '0xEf50fde1Db5c2D7F3Ce8235d4AB87E629f8106B8', // chamberController
    '0xA56Fa7b79D7B16599C4E40f484cf759EECCBf957', // reinforcementController
    '0x3E405a75b8A57540C9A9B3A12F524679C05C685F', // dungeonFactory
    // '0x2069747f79c5aA726BeE8ffc295D138b12Bb1941', // fightCalculator
    // '0x68fEE9b254f226344c897D68F20C749f8A663588', // itemCalculator
    // '0x0D7F4b1462CD0c00c0D5Cf10D3B58b1B9B007D12', // oracle
    // '0x56e03cF4918d1514237604a6d6c5f4bA0BAcEaeF', // statController
    // '0xe0dc2BddF7dD52e8541ed82390698C56a603f35D', // storyController
    // '0xe6490390e044c852eB0F6725Dd9514eDFC3495ab', // treasury
    // '0x86668213001bEcd8d2775a6A83B5f3755B74dC37', // statReader
    // '0x1679d789E7c6Cf11D08c84e5fCB6e19DB048d0a3', // multicall
    '0xc6EF48b51F06459752B93F87298a62e6Ba7dE500', // magicToken
    '0xAC6c515F2D6197799fDA231736210BF8D4F4b061', // strengthToken
    '0x5256B9276974B12501e3caE24f877357ceBddDD2', // dexterityToken
  ]),
  ],
]);


const SUBGRAPHS = new Map<string, string>([
  [SupportedChainId.SEPOLIA, 'https://api.thegraph.com/subgraphs/name/tetu-io/tetu-game-sepolia'],
]);

type SUBGRAPH_RESULT = {
  data: {
    itemMetaEntities: { id: string }[];
    dungeonEntities: { id: string }[];
    heroMetaEntities: { id: string }[];
  }
};

@Injectable()
export class GatewaySafeInfoService implements ISafeInfoService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(NetworkService) private readonly networkService: INetworkService,
  ) {
  }

  async isSafeContract(chainId: string, address: string): Promise<boolean> {
    const isSimpleAdr = WHITELISTED.get(chainId)?.has(address) ?? false;
    if (isSimpleAdr) {
      return true;
    }

    const SUBGRAPH_QUERY = `
query ValidContract {
  itemMetaEntities(where: {id: "${address.toLowerCase()}"}) {
    id
  }
  dungeonEntities(where: {id: "${address.toLowerCase()}"}) {
    id
  }
  heroMetaEntities(where: {id: "${address.toLowerCase()}"}) {
    id
  }
}
`;

    const url = SUBGRAPHS.get(chainId);
    if (!url) {
      throw new Error(`No subgraph for chainId ${chainId}`);
    }
    try {
      const result = await this.networkService.post<SUBGRAPH_RESULT>(url, { query: SUBGRAPH_QUERY });

      const itemMetaEntitiesLength = result?.data?.data?.itemMetaEntities?.length ?? 0;
      const dungeonEntitiesLength = result?.data?.data?.dungeonEntities?.length ?? 0;
      const heroMetaEntitiesLength = result?.data?.data?.heroMetaEntities?.length ?? 0;


      return itemMetaEntitiesLength > 0
        || dungeonEntitiesLength > 0
        || heroMetaEntitiesLength > 0;
    } catch (e) {
      return false;
    }
  }
}
