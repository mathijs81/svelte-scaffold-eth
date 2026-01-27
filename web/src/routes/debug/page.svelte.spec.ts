import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import Page from "./+page.svelte";

describe("/+page.svelte", () => {
  it("should render contract function names", async () => {
    render(Page);

    const contractFunctionNames = ["greeting", "premium", "totalCounter"];
    for (const functionName of contractFunctionNames) {
      await expect
        .element(page.getByText(functionName, { exact: true }))
        .toBeInTheDocument();
    }
  });
});
