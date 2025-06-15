import { celo } from "viem/chains";
import { createConfig, http, injected } from "wagmi";

// Create a custom config with error handling
export const config = createConfig({
  chains: [celo],
  transports: {
    [celo.id]: http(),
  },
  connectors: [injected()],
});
