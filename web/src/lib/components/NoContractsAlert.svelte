<script lang="ts">
import InfoIcon from "phosphor-svelte/lib/Info";

interface Props {
  chainId: number;
}

let { chainId }: Props = $props();
</script>

<div class="alert alert-info">
  <InfoIcon class="shrink-0 w-6 h-6" />
  <span>No contracts deployed on chain {chainId}. Run `pnpm -C foundry deploy:anvil` to deploy contracts.</span>
</div>