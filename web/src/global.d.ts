/// <reference types="@sveltejs/kit" />

interface Window {
  // biome-ignore lint/suspicious/noExplicitAny: injected provider
  ethereum?: any;
}
