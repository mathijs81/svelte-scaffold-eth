import { toast as sonnerToast } from "svelte-sonner";
import Toast from "$lib/components/Toast.svelte";
import { getNetworkName, getTransactionUrl } from "$lib/web3/utils";

export function toastSuccess(message: string) {
  sonnerToast.custom(Toast, {
    componentProps: {
      message,
      type: "success",
    },
  });
}

export function toastError(message: string) {
  sonnerToast.custom(Toast, {
    componentProps: {
      message,
      type: "error",
    },
  });
}

export function toastInfo(message: string) {
  sonnerToast.custom(Toast, {
    componentProps: {
      message,
      type: "info",
    },
  });
}

export function toastWarning(message: string) {
  sonnerToast.custom(Toast, {
    componentProps: {
      message,
      type: "warning",
    },
  });
}

export function toastTransaction(hash: string, chainId?: number) {
  if (!hash || hash.length < 10) {
    toastInfo("Transaction submitted");
    return;
  }

  const shortHash = `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  const network = getNetworkName(chainId);
  const explorerUrl = getTransactionUrl(hash, chainId);

  const message = explorerUrl
    ? `Transaction submitted${network ? ` on ${network}` : ""}: ${shortHash}`
    : `Transaction submitted${network ? ` on ${network}` : ""}: ${shortHash}`;

  toastInfo(message);
}

export function toastTransactionSuccess(hash: string, chainId?: number) {
  if (!hash || hash.length < 10) {
    toastSuccess("Transaction confirmed");
    return;
  }

  const shortHash = `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  const network = getNetworkName(chainId);
  const explorerUrl = getTransactionUrl(hash, chainId);

  const message = explorerUrl
    ? `Transaction confirmed${network ? ` on ${network}` : ""}: ${shortHash}`
    : `Transaction confirmed${network ? ` on ${network}` : ""}: ${shortHash}`;

  toastSuccess(message);
}

export function toastTransactionError(error: Error) {
  const message = error.message || "Transaction failed";

  let userMessage: string;
  if (message.includes("User rejected")) {
    userMessage = "Transaction rejected by user";
  } else if (message.includes("insufficient funds")) {
    userMessage = "Insufficient funds for transaction";
  } else {
    userMessage = truncateErrorMessage(message);
  }

  toastError(userMessage);
}

/**
 * Truncate error message at word boundaries for better readability
 */
function truncateErrorMessage(message: string, maxLength = 100): string {
  if (message.length <= maxLength) {
    return `Transaction failed: ${message}`;
  }

  const truncated = message.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  const result =
    lastSpace > maxLength * 0.7 ? truncated.slice(0, lastSpace) : truncated;

  return `Transaction failed: ${result}...`;
}
