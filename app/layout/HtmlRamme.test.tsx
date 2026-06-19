import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { HtmlRamme } from "./HtmlRamme";

vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    Links: () => null,
    Meta: () => null,
    Scripts: () => null,
    ScrollRestoration: () => null,
  };
});

describe("HtmlRamme", () => {
  it("rendrer ikke analytics-script når sporingHostUrl mangler", () => {
    const html = renderToStaticMarkup(
      <HtmlRamme umamiSiteId="site-id">
        <div>Innhold</div>
      </HtmlRamme>,
    );

    expect(html).not.toContain("team-researchops/sporing/sporing");
  });
});
