/** Adapter-driven verification boundary. OCR/extraction results are never authenticity decisions. */
async function verifyDocument({ document, adapters = {} }) {
  if (!document || typeof document !== 'object') {
    return { status: 'unavailable', outcome: 'unavailable', manualReviewRequired: true, message: 'Verification could not be completed through the available source.' };
  }
  const adapter = adapters[document.sourceType];
  if (!adapter || typeof adapter.verify !== 'function' || adapter.authorized !== true) {
    return { status: 'manual-review', outcome: 'unavailable', manualReviewRequired: true, message: 'Verification could not be completed through the available source. Manual official verification may be required.' };
  }
  const result = await adapter.verify(document);
  if (result?.outcome === 'mismatch') return { status: 'mismatch', outcome: 'mismatch', manualReviewRequired: true, field: result.field || null, message: 'Information mismatch detected. Review the indicated field with the authorized source.' };
  if (result?.outcome === 'verified' && result.authorized === true) return { status: 'verified', outcome: 'match', manualReviewRequired: false, source: document.sourceType };
  return { status: 'manual-review', outcome: 'unavailable', manualReviewRequired: true, message: 'Verification could not be completed through the available source. Manual official verification may be required.' };
}

module.exports = { verifyDocument };
