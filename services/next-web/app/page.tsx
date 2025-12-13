"use client";

import { AstroEvents } from "@/components/dashboard/AstroEvents";
import { JwstGallery } from "@/components/dashboard/JwstGallery";
import { MetricCards } from "@/components/dashboard/MetricCards";
import {
  useAstroEvents,
  useIssTelemetry,
  useJwstGallery,
} from "@/components/dashboard/hooks";

export default function Home() {
  const iss = useIssTelemetry();
  const jwst = useJwstGallery();
  const astro = useAstroEvents();

  const velocity = iss.metrics.velocity;
  const altitude = iss.metrics.altitude;

  return (
    <div className="space-y-6 md:space-y-8">
      <MetricCards
        velocity={velocity}
        altitude={altitude}
        jwstLoading={jwst.loading}
        jwstError={jwst.error}
        jwstCount={jwst.items.length}
      />
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <JwstGallery jwst={jwst} />
        <AstroEvents astro={astro} />
      </section>
    </div>
  );
}
