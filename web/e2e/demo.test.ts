import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";
import basicSetup from "../test/wallet-setup/basic.setup";

const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test("connect wallet and read greeting from contract", async ({
  context,
  page,
  metamaskPage,
  extensionId
}) => {
  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);
  //console.log("mm:", metamask);

  // open /debug
  await page.goto("/debug");

  await expect(page.locator('button:has-text("Connect Wallet")')).toBeVisible();

  await page.locator('button:has-text("Connect Wallet")').click();

  await metamask.connectToDapp();

  await expect(page.locator("text=Connected Address")).toBeVisible();

  const greetingCollapse = page
    .locator(".collapse")
    .filter({ hasText: "greeting" })
    .first();

  await greetingCollapse.locator('input[type="checkbox"]').check();

  await greetingCollapse.locator('button:has-text("Read")').click();

  const resultCode = page.locator(".mockup-code code");
  await expect(resultCode).toBeVisible();
  await expect(resultCode).toContainText("Building Unstoppable Apps!!!");
});
