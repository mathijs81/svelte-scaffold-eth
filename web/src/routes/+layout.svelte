<script lang="ts">
import "./layout.css";
import favicon from "$lib/assets/favicon.svg";
import Header from "$lib/components/Header.svelte";
import TransactionToastHandler from "$lib/components/TransactionToastHandler.svelte";
import { Toaster } from "svelte-sonner";
import { QueryClientProvider } from "@tanstack/svelte-query";
import { createBlockchainQueryClient } from "$lib/query/config";
import { onDestroy, type Component } from "svelte";
import { dev } from "$app/environment";
import { setGlobalClient } from "$lib/query/globalClient";

let { children } = $props();

const queryClient = createBlockchainQueryClient();
setGlobalClient(queryClient);

// Lazy load devtools in development
let SvelteQueryDevtools = $state<Component | undefined>(undefined);
if (dev) {
  import("@tanstack/svelte-query-devtools").then((mod) => {
    SvelteQueryDevtools = mod.SvelteQueryDevtools;
  });
}
</script>

<QueryClientProvider client={queryClient}>
  <div class="min-h-screen bg-base-200">
    <Header />
    {@render children()}
  </div>
  <TransactionToastHandler />
  <Toaster position="top-right" richColors />

  {#if dev && SvelteQueryDevtools}
    <SvelteQueryDevtools />
  {/if}
</QueryClientProvider>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
