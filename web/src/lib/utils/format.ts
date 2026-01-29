// Returns "0x1234...5678" format
export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBytes32StringHtml(
  byteString: `0x${string}` | null,
): string {
  if (!byteString) {
    return "<span class='font-mono'>(undefined)</span>";
  }

  // Just to be absolutely sure, escape characters to prevent injection attacks
  const escapedContent = byteString
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  if (byteString.length > 16) {
    return `<span class="font-mono" title="${escapedContent}">${escapedContent.slice(0, 16)}...</span>`;
  }
  return `<span class="font-mono" title="${escapedContent}">${escapedContent}</span>`;
}
