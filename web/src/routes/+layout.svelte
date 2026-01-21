<script lang="ts">
import "./layout.css";
import favicon from "$lib/assets/favicon.svg";
import Header from "$lib/components/Header.svelte";

let { children } = $props();
</script>

<div class="min-h-screen bg-base-200">
  <Header />
  {@render children()}
</div>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
