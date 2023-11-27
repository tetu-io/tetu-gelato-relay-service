import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { INetworkService, NetworkService } from '../network/network.service.interface';
import { ISafeInfoService } from './safe-info.service.interface';
import { SupportedChainId } from '../../config/constants';

const WHITELISTED = new Map<string, Set<string>>([
  [
    SupportedChainId.SEPOLIA, new Set<string>([
    '0x4c7bb402755e8cDaEd13f1C4d95baD7d93FA36f9'.toLowerCase(), // controller
    '0xbE3c35a0abaA1707308480224D71D94F75b458D1'.toLowerCase(), // gameToken
    // '0xE4909d02F810d474B2ed40E89c963dd3DdAC027c'.toLowerCase(), // minter
    // '0xEf50fde1Db5c2D7F3Ce8235d4AB87E629f8106B8'.toLowerCase(), // chamberController
    '0xA56Fa7b79D7B16599C4E40f484cf759EECCBf957'.toLowerCase(), // reinforcementController
    '0x3E405a75b8A57540C9A9B3A12F524679C05C685F'.toLowerCase(), // dungeonFactory
    // '0x2069747f79c5aA726BeE8ffc295D138b12Bb1941'.toLowerCase(), // fightCalculator
    // '0x68fEE9b254f226344c897D68F20C749f8A663588'.toLowerCase(), // itemCalculator
    // '0x0D7F4b1462CD0c00c0D5Cf10D3B58b1B9B007D12'.toLowerCase(), // oracle
    // '0x56e03cF4918d1514237604a6d6c5f4bA0BAcEaeF'.toLowerCase(), // statController
    // '0xe0dc2BddF7dD52e8541ed82390698C56a603f35D'.toLowerCase(), // storyController
    // '0xe6490390e044c852eB0F6725Dd9514eDFC3495ab'.toLowerCase(), // treasury
    // '0x86668213001bEcd8d2775a6A83B5f3755B74dC37'.toLowerCase(), // statReader
    // '0x1679d789E7c6Cf11D08c84e5fCB6e19DB048d0a3'.toLowerCase(), // multicall
    '0xc6EF48b51F06459752B93F87298a62e6Ba7dE500'.toLowerCase(), // magicToken
    '0xAC6c515F2D6197799fDA231736210BF8D4F4b061'.toLowerCase(), // strengthToken
    '0x5256B9276974B12501e3caE24f877357ceBddDD2'.toLowerCase(), // dexterityToken
  ]),
  ],
  [
    SupportedChainId.MUMBAI, new Set<string>([
    '0x34733FE4015D93eF3bf33E9bEdd19ABF461B046B'.toLowerCase(), // controller
    '0x1c78d146c4cE728184eFcBd24b6958C40eD019a6'.toLowerCase(), // gameToken
    // '0x0c929007B4808C26cc22Ffea8e2a3CC3628f4230'.toLowerCase(), // minter
    // '0xB7224fd8aE7d4cfd8d061B0e6C8478B613c623c6'.toLowerCase(), // chamberController
    '0x8425C888ec69fBeB7D60bBfDaBDc21075c8328E1'.toLowerCase(), // reinforcementController
    '0x665c5dD62D4550071102E75c1b393Ed10B849Dc1'.toLowerCase(), // dungeonFactory
    // '0xBCD8a872C034C66D05804737f17e805f1469167b'.toLowerCase(), // fightCalculator
    // '0xF0C3DE6938F0B3CA9BCf38FebFD61c61b1513F41'.toLowerCase(), // itemCalculator
    // '0x2740494b2e3bd3DD2A0C7E5774D40cF3675Fc287'.toLowerCase(), // oracle
    // '0x72e98e4F7e6ae763D380861F5743e4Cd0Cab1064'.toLowerCase(), // statController
    // '0x438aD6D0c2557D22A6b1e802a4363F338fa05D47'.toLowerCase(), // storyController
    // '0x9C0C9D0151E32678c8Ba805D3953feE1EAebDe8f'.toLowerCase(), // treasury
    // '0xb1D0f4e4DCadc6032E305a2e5FFd46a12a20ab56'.toLowerCase(), // statReader
    // '0x85258DD38e9a36c2DCc91C5Ecc66F2F24d5b128f'.toLowerCase(), // multicall
    '0x1c78d146c4cE728184eFcBd24b6958C40eD019a6'.toLowerCase(), // magicToken
    '0x1c78d146c4cE728184eFcBd24b6958C40eD019a6'.toLowerCase(), // strengthToken
    '0x1c78d146c4cE728184eFcBd24b6958C40eD019a6'.toLowerCase(), // dexterityToken
  ]),
  ],
]);


const SUBGRAPHS = new Map<string, string>([
  [SupportedChainId.SEPOLIA, 'https://api.thegraph.com/subgraphs/name/tetu-io/tetu-game-sepolia'],
  // [SupportedChainId.MUMBAI, 'https://graph.tetu.io/subgraphs/name/tetu-io/sacra-mumbai-test'], // todo move back after creating
  [SupportedChainId.MUMBAI, 'https://api.thegraph.com/subgraphs/name/tetu-io/tetu-game-mumbai'],
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

  async isValidContract(chainId: string, address: string): Promise<boolean> {
    const isSimpleAdr = WHITELISTED.get(chainId)?.has(address.toLowerCase()) ?? false;
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
