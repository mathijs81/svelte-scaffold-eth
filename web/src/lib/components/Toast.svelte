<script lang="ts">
interface Props {
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

const { message, type = "info" }: Props = $props();

const alertClass = $derived.by(() => {
  switch (type) {
    case "success":
      return "alert-success";
    case "error":
      return "alert-error";
    case "info":
      return "alert-info";
    case "warning":
      return "alert-warning";
    default:
      return "alert-info";
  }
});
</script>

<div class="alert {alertClass} shadow-lg" role="alert" aria-live="polite">
  <span>{message}</span>
</div>
