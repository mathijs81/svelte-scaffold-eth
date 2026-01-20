<script lang="ts">
interface Props {
  value?: string;
  onInput?: (value: string) => void;
}

let { value = "", onInput }: Props = $props();
</script>

<input
  type="text"
  class="input input-bordered w-full font-mono"
  value={value}
  oninput={(e) => onInput?.(e.currentTarget.value)}
  placeholder="0x..."
/>
