# 1. Bundled SRD Dataset Over Live GraphQL API

## Status
Accepted

## Context
The project was originally envisioned to fetch rules and cards on the fly via the `daggerheart-srd-api` GraphQL endpoint (`https://daggerheart-srd-api.vercel.app/graphql`). However, inspection revealed that Apollo introspection is disabled in production, domain cards are completely unpopulated (`"cards": []`), and 8 out of 9 classes lack subclass data in that repository. Relying on this API would leave the tracker unable to present domain cards or subclass features.

## Decision
We bundle a comprehensive, pre-validated local JSON dataset derived from the Daggerheart SRD containing all 9 classes, 18 subclasses, 18 ancestries, 9 communities, and all 189+ domain cards (levels 1–10).

## Consequences
- Character creation, leveling up, and domain card filtering work 100% offline with zero latency and zero dependency on third-party uptime.
- In-memory querying and card filtering are instantaneous.
- If the upstream GraphQL API is ever populated in the future, an optional sync/fetch adapter can be layered in without breaking offline gameplay.
