<script lang="ts">
import "./layout.css";
import favicon from "$lib/assets/favicon.svg";
import Header from "$lib/components/Header.svelte";
import TransactionToastHandler from "$lib/components/TransactionToastHandler.svelte";
import { Toaster } from "svelte-sonner";

let { children } = $props();
</script>

<div class="min-h-screen bg-base-200">
  <Header />
  {@render children()}
</div>

<!-- Global transaction toast notifications -->
<TransactionToastHandler />

<Toaster position="top-right" richColors />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
