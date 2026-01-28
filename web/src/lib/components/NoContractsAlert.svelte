<script lang="ts">
import { targetChainId } from "$lib/wagmi/chains";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";

interface Props {
  chainId: number;
}

let { chainId }: Props = $props();
</script>

<div class="alert alert-info">
  <InfoIcon class="shrink-0 w-6 h-6" />
  <span>No contracts deployed on chain {chainId}. {#if chainId === targetChainId}Run `pnpm -C foundry deploy:anvil` to deploy contracts.{/if}</span>
</div>