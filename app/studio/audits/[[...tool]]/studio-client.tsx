'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.audits.config';

export function AuditsStudioClient() {
  return <NextStudio config={config} />;
}
