## Open issues

[x] App should reconnect automatically when you reload the page.
[x] Chain switch should be requested when chain is not the right one.
[x] Renamed util/ to web3/ for better organization
[x] Split createAccount.svelte.ts - separated network info into createNetworkInfo.svelte.ts
[x] Renamed createChainStats → createNetworkInfo for clarity
[x] Renamed ChainSwitchWarning → NetworkMismatchAlert for better semantics
[x] When doing a transaction, not only the txID should be shown but should also track the status and report success/failure

[ ] No tests yet
[ ] Reactive utilities need to be improved for unregistering (do ref counting?)
