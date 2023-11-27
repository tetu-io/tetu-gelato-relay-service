import { SupportedChainId } from './constants';

export default () => ({
  about: {
    name: 'safe-gelato-relay-service',
  },
  applicationPort: process.env.APPLICATION_PORT || '3000',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
  },
  relay: {
    ttl: process.env.THROTTLE_TTL ? +process.env.THROTTLE_TTL : 60, // 1 minute in seconds
    limit: process.env.THROTTLE_LIMIT ? +process.env.THROTTLE_LIMIT : 15,
    globalLimit: process.env.GLOBAL_THROTTLE_LIMIT ? +process.env.GLOBAL_THROTTLE_LIMIT : 30,
  },
  gelato: {
    apiKey: {
      [SupportedChainId.SEPOLIA]: process.env.GELATO_SEPOLIA_CHAIN_API_KEY,
      [SupportedChainId.MUMBAI]: process.env.GELATO_MUMBAI_CHAIN_API_KEY,
    },
  },
  gatewayUrl: process.env.GATEWAY_URL || 'https://safe-client.safe.global',
});
