<script lang="ts">
interface Props {
  value?: string;
  onInput?: (value: string) => void;
  placeholder?: string;
}

let { value = "", onInput, placeholder }: Props = $props();
</script>

<input
  type="text"
  class="input input-bordered w-full"
  value={value}
  oninput={(e) => onInput?.(e.currentTarget.value)}
  {placeholder}
/>
