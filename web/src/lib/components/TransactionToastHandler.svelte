<script lang="ts">
import { onMount } from "svelte";
import { txWatcher } from "$lib/web3";
import type { TxState } from "$lib/web3";
import {
  toastTransaction,
  toastTransactionSuccess,
  toastTransactionError,
} from "$lib/utils/toast";

onMount(() => {
  const handleTxChange = (tx: TxState) => {
    switch (tx.status) {
      case "confirming":
        toastTransaction(tx.hash, tx.chainId);
        break;
      case "confirmed":
        toastTransactionSuccess(tx.hash, tx.chainId);
        break;
      case "failed":
        if (tx.error) {
          toastTransactionError(tx.error);
        } else {
          toastTransactionError(new Error("Transaction failed"));
        }
        break;
    }
  };

  txWatcher.on(handleTxChange);

  return () => {
    txWatcher.off(handleTxChange);
  };
});
</script>
