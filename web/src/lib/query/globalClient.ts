import type { Accessor, QueryClient } from "@tanstack/svelte-query";

let globalClient: QueryClient | undefined;

export function setGlobalClient(client: QueryClient | undefined) {
  globalClient = client;
}

export function getGlobalClient(): Accessor<QueryClient> | undefined {
  const currentClient = globalClient;
  if (currentClient) {
    return () => currentClient;
  } else {
    return undefined;
  }
}
