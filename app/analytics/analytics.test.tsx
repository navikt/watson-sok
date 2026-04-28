import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnalyticsTags } from "./analytics";

describe("AnalyticsTags", () => {
  it("bruker konfigurert host-url", () => {
    const { container } = render(
      <AnalyticsTags
        sporingId="site-id"
        hostUrl="https://reops-event-proxy.nav.no"
      />,
    );

    const scriptTag = container.querySelector("script");

    expect(scriptTag?.getAttribute("data-host-url")).toBe(
      "https://reops-event-proxy.nav.no",
    );
  });
});
