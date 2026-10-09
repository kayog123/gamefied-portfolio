import type { CaseStudy } from './case-study.types';

export const mapboxFarePaymentSystem: CaseStudy = {
  slug: 'mapbox-fare-payment-system',
  lead: 'A fare-quoting and payment system built on Mapbox, so riders see a real price before they book and pay without leaving the app.',
  meta: { role: 'Full-stack engineering', stack: 'Next.js · Mapbox · Payments', timeline: '[x weeks]', type: 'Client project' },
  problem:
    'Riders were quoted a rough estimate, then found out the real fare only after the trip — sometimes a very different number. Drivers had no reliable way to charge for the distance actually driven, and refunds for disputed fares were handled by hand.',
  architecture: [
    { name: 'Pickup + destination', tech: 'rider app' },
    { name: 'Search Box API', tech: 'address search' },
    { name: 'Directions API', tech: 'route · distance · time' },
    { name: 'Fare engine', tech: 'distance-based pricing', accent: true },
    { name: 'Payments', tech: 'charge on completion' },
  ],
  decisions: [
    {
      title: 'Price from a route, not a flat zone fare',
      why: 'Directions API returns real distance and time for the exact route, so the quote matches what the trip will actually cost.',
      cost: 'Every quote needs a live Mapbox call, so fare pages depend on that uptime.',
    },
    {
      title: 'Quote the fare before the ride, lock it after',
      why: "Riders see a firm price before they book instead of a range, and the price locks once the trip starts so a reroute doesn't surprise them.",
      cost: 'Needs a clear policy — and UI — for what happens if the actual route differs a lot from the quoted one.',
    },
    {
      title: 'Charge in-app on completion, not after an invoice',
      why: "Payment captures the moment the trip ends, so there's no separate billing step and no unpaid trips to chase.",
      cost: 'Failed payments have to be handled in real time, right as a driver is waiting to be paid.',
    },
  ],
  stack: [
    { name: 'Search Box API', role: 'Address autocomplete' },
    { name: 'Directions API', role: 'Route, distance & time' },
    { name: 'Payments', role: 'In-app charge on completion' },
    { name: 'PostgreSQL', role: 'Trips, fares & receipts' },
  ],
  results: [
    { metric: '[metric]', description: 'Fare estimate accuracy vs final charge.' },
    { metric: '[metric]', description: 'Riders completing booking after seeing a quote.' },
    { metric: '[metric]', description: 'Disputed-fare tickets per week.' },
  ],
};
