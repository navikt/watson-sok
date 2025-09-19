type AnalyticsTagProps = {
  sporingId: string;
};

export function AnalyticsTag({ sporingId }: AnalyticsTagProps) {
  return (
    <script
      defer
      src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
      data-host-url="https://umami.nav.no"
      data-website-id={sporingId}
    />
  );
}

/** Spor en hendelse til analyseformål
 *
 * Du kan sende med et objekt med relevante data for hendelsen.
 */
export function sporHendelse(
  hendelse: Hendelse,
  data: Record<string, unknown> = {},
) {
  if (process.env.NODE_ENV === "development") {
    console.info(`📊 [Analytics] ${hendelse}`, data);
    return;
  }
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(hendelse, data);
  }
}

type Hendelse = "søk landingsside";
