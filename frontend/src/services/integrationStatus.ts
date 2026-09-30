import { IntegrationStatus } from '../types';
import { API_BASE_URL } from './api';

/** Honest frontend capability map; real partner access must be provisioned per integration. */
export function getIntegrationStatuses(digilockerConfigured: boolean): IntegrationStatus[] {
  return [
    { id: 'digilocker', label: 'DigiLocker', state: digilockerConfigured ? 'available' : 'demo', description: digilockerConfigured ? 'Backend configuration is present. Student authorization and issuer access are still consent-based.' : 'Demo flow only. No live DigiLocker credentials are configured.' },
    { id: 'certificate-verification', label: 'Authorized certificate verification', state: 'proposed', description: 'Requires an authorized issuer verification source; login or OCR alone is not verification.' },
    { id: 'scholarship-portal', label: 'Scholarship portals', state: 'proposed', description: 'No scholarship portal status API is connected in this prototype.' },
    { id: 'dbt', label: 'DBT / payment source', state: 'proposed', description: 'No DBT or bank payment status source is connected.' },
    { id: 'education-source', label: 'Education data source', state: 'proposed', description: 'No education system data source is connected.' },
  ];
}

export async function loadIntegrationStatuses(): Promise<IntegrationStatus[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/integrations/status`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Integration status is unavailable');
    const payload = await response.json() as { integrations?: IntegrationStatus[] };
    if (!Array.isArray(payload.integrations)) throw new Error('Integration status is unavailable');
    return payload.integrations;
  } catch {
    return getIntegrationStatuses(false);
  }
}
