import { defineConfig } from "@wagmi/cli";
import { foundry, actions } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/lib/contracts/generated.ts",
  contracts: [],
  plugins: [
    foundry({
      project: "../foundry",
      exclude: [
        // Default excludes:
        "Common.sol/**",
        "Components.sol/**",
        "Script.sol/**",
        "StdAssertions.sol/**",
        "StdInvariant.sol/**",
        "StdError.sol/**",
        "StdCheats.sol/**",
        "StdMath.sol/**",
        "StdJson.sol/**",
        "StdStorage.sol/**",
        "StdUtils.sol/**",
        "Vm.sol/**",
        "console.sol/**",
        "console2.sol/**",
        "test.sol/**",
        "**.s.sol/*.json",
        "**.t.sol/*.json",

        // Our excludes:
        "Test.sol/**",
        "IMulticall3.sol/**",
      ],
      includeBroadcasts: true, // Auto-detect from broadcast files
    }),
    actions(),
  ],
});
