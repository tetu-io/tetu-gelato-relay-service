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
    '0x5A81e1Ed2b857c67907f07823599AD21a4946f08'.toLowerCase(), // sacra faucet
    '0xa56e71478E23a60EE6f3202ebe5bAdb9850045d4'.toLowerCase(), // pawnshop
  ]),
  ],
  [
    SupportedChainId.OP_SEPOLIA, new Set<string>([
    '0xCF66857b468740d6dbF9cE11929A9c03DDA12988'.toLowerCase(), // controller
    '0xb8bA82F19A9Be6CbF6DAF9BF4FBCC5bDfCF8bEe6'.toLowerCase(), // gameToken
    // '0x7E59478Abb9DF4682D4c4De6140104EeD83243ad'.toLowerCase(), // minter
    // '0xC423D7e3e1B7caF1AA5ce58EA0f3A91427Fd47ae'.toLowerCase(), // chamberController
    '0xA60205802E1B5C6EC1CAFA3cAcd49dFeECe05AC9'.toLowerCase(), // reinforcementController
    '0xd0C1378c177E961D96c06b0E8F6E7841476C81Ef'.toLowerCase(), // dungeonFactory
    // '0xFE700D523094Cc6C673d78F1446AE0743C89586E'.toLowerCase(), // fightCalculator
    // '0xC3B5d80E4c094B17603Ea8Bb15d2D31ff5954aAE'.toLowerCase(), // itemCalculator
    // '0x6d85966b5280Bfbb479E0EBA00Ac5ceDfe8760D3'.toLowerCase(), // oracle
    // '0x00aE29E31748898B8B404b4DcF076738F68439d4'.toLowerCase(), // statController
    // '0x3bDbd2Ed1A214Ca4ba4421ddD7236ccA3EF088b6'.toLowerCase(), // storyController
    // '0xd1fD04d17BEb5D06a1af9D08fb3a8857B252e56C'.toLowerCase(), // treasury
    // '0x08d7607b2FD46ae255040014a39CDC2094e55901'.toLowerCase(), // statReader
    // '0x75e1e98650c119c4E3dCE3070CE6A5397Ed70c6a'.toLowerCase(), // multicall
    '0x6678814c273d5088114B6E40cC49C8DB04F9bC29'.toLowerCase(), // magicToken
    '0x286c02C93f3CF48BB759A93756779A1C78bCF833'.toLowerCase(), // strengthToken
    '0x6B2e0fACD2F2A8f407aC591067Ac06b5d29247E4'.toLowerCase(), // dexterityToken
    '0xbDFb56526F11ebf358177466Dbb4264209f917a4'.toLowerCase(), // pawnshop
    '0xD6015a8a3C4d065e9dC54ca53e6A2F7f96556ea7'.toLowerCase(), // sacra faucet
    '0xdF837f0327Bbf85b066c400f17b2B2727F94cb2f'.toLowerCase(), // OP_SEPOLIA_TEST_FAUCET_MAGIC
    '0x35B0329118790B8c8FC36262812D92a4923C6795'.toLowerCase(), // OP_SEPOLIA_TEST_FAUCET_STRENGTH
    '0x0A0846c978a56D6ea9D2602eeb8f977B21F3207F'.toLowerCase(), // OP_SEPOLIA_TEST_FAUCET_DEXTERITY
  ]),
  ],
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

    const url = this.configService.getOrThrow<string>(`subgraph.${chainId}`)
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
