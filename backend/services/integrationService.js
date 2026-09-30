const integrationCatalog = [
  { id: 'digilocker', label: 'DigiLocker', envKeys: ['DIGILOCKER_CLIENT_ID', 'DIGILOCKER_CLIENT_SECRET', 'DIGILOCKER_REDIRECT_URI', 'DIGILOCKER_SCOPE'], description: 'Consent-based issued-document retrieval.' },
  { id: 'certificate-verification', label: 'Authorized certificate verification', envKeys: [], description: 'Issuer verification; login or OCR alone cannot verify certificate authenticity.' },
  { id: 'scholarship-portal', label: 'Scholarship portals', envKeys: [], description: 'Application status from an authorized scheme portal.' },
  { id: 'dbt', label: 'DBT / payment source', envKeys: [], description: 'Payment status from an authorized DBT source.' },
  { id: 'education-source', label: 'Education data source', envKeys: [], description: 'Education records from an authorized source.' },
];

function getStatuses(env = process.env) {
  return integrationCatalog.map(item => {
    const configured = item.envKeys.length > 0 && item.envKeys.every(key => Boolean(env[key]));
    return {
      id: item.id,
      label: item.label,
      state: item.id === 'digilocker' ? (configured ? 'available' : 'demo') : 'proposed',
      configured,
      description: item.description,
    };
  });
}

module.exports = { getStatuses };
