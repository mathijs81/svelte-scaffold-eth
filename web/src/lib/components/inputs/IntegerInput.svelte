<script lang="ts">
interface Props {
  value?: string;
  onInput?: (value: string) => void;
  min?: number;
  max?: number;
}

let { value = "", onInput, min, max }: Props = $props();
</script>

<input
  type="number"
  class="input input-bordered w-full"
  value={value}
  oninput={(e) => onInput?.(e.currentTarget.value)}
  {min}
  {max}
/>
