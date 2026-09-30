import type { AppData, Application } from '../types';

export type ApplicationState = 'DRAFT' | 'INCOMPLETE' | 'READY_TO_SUBMIT' | 'SUBMITTED' | 'UNDER_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED' | 'VERIFIED' | 'UNKNOWN';
export type ApplicationProgress = {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  applicationNumber: string | null;
  state: ApplicationState;
  statusLabel: string;
  isSubmitted: boolean | null;
  completionPercentage: number | null;
  missingFields: string[] | null;
  missingDocuments: string[] | null;
  verificationStatus: string | null;
  submittedAt: string | null;
  lastUpdated: string | null;
  nextAction: string | null;
};

const requiredFormFields = [
  { key: 'studentName', label: 'Name' },
  { key: 'dob', label: 'Date of birth' },
  { key: 'address', label: 'Address' },
  { key: 'email', label: 'Email' },
  { key: 'education', label: 'Education level' },
  { key: 'institution', label: 'Institution' },
] as const;

function normalizedState(application: Application): ApplicationState {
  const status = String(application.status || '').toLowerCase().replace(/[_-]+/g, ' ');
  if (/submitted \(prototype\)|saved in this prototype/.test(status)) return 'DRAFT';
  if (application.isSubmitted === false) {
    if (/incomplete/.test(status)) return 'INCOMPLETE';
    if (/ready to submit/.test(status)) return 'READY_TO_SUBMIT';
    return 'DRAFT';
  }
  if (application.isSubmitted === true && /draft|incomplete|ready to submit|not started/.test(status)) return 'SUBMITTED';
  if (/approved|sanctioned/.test(status)) return 'APPROVED';
  if (/rejected|declined/.test(status)) return 'REJECTED';
  if (/under verification|under review|in review/.test(status)) return 'UNDER_VERIFICATION';
  if (/action required|deficien|correction required/.test(status)) return 'ACTION_REQUIRED';
  if (/^verified$/.test(status)) return 'VERIFIED';
  if (/disburs|payment processing/.test(status)) return 'SUBMITTED';
  if (/ready to submit/.test(status)) return 'READY_TO_SUBMIT';
  if (/incomplete/.test(status)) return 'INCOMPLETE';
  if (/draft|not started/.test(status)) return 'DRAFT';
  if (/submit/.test(status) || application.isSubmitted === true || Boolean(application.submittedAt || application.submitted)) return 'SUBMITTED';
  return 'UNKNOWN';
}

function prettyState(state: ApplicationState, recordStatus: string) {
  if (state === 'UNKNOWN') return recordStatus || 'Status not available';
  return ({ DRAFT: 'Draft · not submitted', INCOMPLETE: 'Incomplete · not submitted', READY_TO_SUBMIT: 'Ready to review · not submitted', SUBMITTED: 'Submitted', UNDER_VERIFICATION: 'Under verification', APPROVED: 'Approved', REJECTED: 'Rejected', ACTION_REQUIRED: 'Action required', VERIFIED: 'Verified' })[state];
}

function dateOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

export function buildApplicationProgress(data: AppData | null | undefined): ApplicationProgress[] {
  if (!data) return [];
  const result: ApplicationProgress[] = [];
  const processedDrafts = new Set<string>();
  const scholarships = new Map(data.scholarships.map(scholarship => [scholarship.id, scholarship]));

  for (const application of data.applications || []) {
    const scholarship = scholarships.get(application.scholarshipId);
    const draft = data.drafts?.[application.scholarshipId] || {};
    processedDrafts.add(application.scholarshipId);
    const state = normalizedState(application);
    const fieldSource: Record<string, unknown> = {
      studentName: draft.studentName ?? data.profile.name,
      dob: draft.dob ?? data.profile.dob,
      address: draft.address ?? data.profile.address,
      email: draft.email ?? data.profile.email,
      education: draft.education ?? data.profile.education,
      institution: draft.institution ?? data.profile.institution,
    };
    const hasExplicitRequiredFields = Array.isArray(application.requiredFields);
    const trackedFields = hasExplicitRequiredFields
      ? (application.requiredFields || []).map(key => ({ key, label: requiredFormFields.find(field => field.key === key)?.label || key }))
      : requiredFormFields;
    const hasLocalDraft = Boolean(data.drafts?.[application.scholarshipId]);
    const hasBackendFieldState = hasExplicitRequiredFields || Boolean(application.missingFields?.length);
    const completedKeys = new Set((application.completedFields || []).map(value => value.toLowerCase()));
    const missingFields = application.missingFields
      ? application.missingFields
      : Array.isArray(application.completedFields) && hasExplicitRequiredFields
        ? trackedFields.filter(field => !completedKeys.has(field.key.toLowerCase()) && !completedKeys.has(field.label.toLowerCase())).map(field => field.label)
        : hasLocalDraft || hasBackendFieldState
          ? trackedFields.filter(field => !String(fieldSource[field.key] ?? '').trim()).map(field => field.label)
          : null;
    const configuredDocuments = application.requiredDocuments || scholarship?.requiredDocuments || [];
    const documentNames = new Set(application.uploadedDocuments
      ? application.uploadedDocuments.map(name => name.toLowerCase())
      : (data.documents || []).filter(document => document.sourceType !== 'prototype').map(document => document.name.toLowerCase()));
    const missingDocuments = application.missingDocuments || configuredDocuments.filter(name => !documentNames.has(name.toLowerCase()));
    const hasStructuredBackendCompletion = Number.isFinite(application.completionPercentage);
    const knownRequiredFields = hasExplicitRequiredFields ? trackedFields : hasLocalDraft ? requiredFormFields : [];
    const denominator = knownRequiredFields.length + configuredDocuments.length;
    const completionPercentage = hasStructuredBackendCompletion
      ? Math.max(0, Math.min(100, Math.round(application.completionPercentage!)))
      : hasLocalDraft || hasBackendFieldState
        ? denominator ? Math.round(((knownRequiredFields.length - (missingFields?.length || 0) + configuredDocuments.length - missingDocuments.length) / denominator) * 100) : null
        : null;
    let effectiveState = state;
    if (state === 'DRAFT' || state === 'INCOMPLETE' || state === 'READY_TO_SUBMIT') {
      const filledCount = knownRequiredFields.length - (missingFields?.length || 0);
      effectiveState = missingFields === null ? state : filledCount === 0 ? 'DRAFT' : missingFields.length || missingDocuments.length ? 'INCOMPLETE' : 'READY_TO_SUBMIT';
    }
    const isSubmitted = effectiveState === 'UNKNOWN' ? null : ['SUBMITTED', 'UNDER_VERIFICATION', 'APPROVED', 'REJECTED', 'ACTION_REQUIRED', 'VERIFIED'].includes(effectiveState);
    const recordedNextAction = dateOrNull(application.nextAction)
      || application.pendingActions?.map(action => action.title).join('; ')
      || dateOrNull(application.deficiency);
    const nextAction = recordedNextAction || (isSubmitted === true ? null : isSubmitted === false && missingFields !== null ? missingFields.length || missingDocuments.length ? 'Complete the missing application details or required documents, then review the draft.' : 'Review the completed details before proceeding.' : null);

    result.push({
      id: application.id,
      scholarshipId: application.scholarshipId,
      scholarshipName: scholarship?.name || application.name || 'Scholarship application',
      applicationNumber: application.applicationNumber || null,
      state: effectiveState,
      statusLabel: prettyState(effectiveState, application.status),
      isSubmitted,
      completionPercentage,
      missingFields,
      missingDocuments: completionPercentage === null && !application.missingDocuments ? null : missingDocuments,
      verificationStatus: application.verificationStatus || null,
      submittedAt: dateOrNull(application.submittedAt) || (isSubmitted ? dateOrNull(application.submitted) : null),
      lastUpdated: dateOrNull(application.updated),
      nextAction,
    });
  }

  for (const [scholarshipId, draft] of Object.entries(data.drafts || {})) {
    if (processedDrafts.has(scholarshipId)) continue;
    const scholarship = scholarships.get(scholarshipId);
    if (!scholarship) continue;
    const fieldSource: Record<string, unknown> = {
      studentName: draft.studentName ?? data.profile.name,
      dob: draft.dob ?? data.profile.dob,
      address: draft.address ?? data.profile.address,
      email: draft.email ?? data.profile.email,
      education: draft.education ?? data.profile.education,
      institution: draft.institution ?? data.profile.institution,
    };
    const missingFields = requiredFormFields.filter(field => !String(fieldSource[field.key] ?? '').trim()).map(field => field.label);
    const requiredDocuments = scholarship.requiredDocuments || [];
    const documentNames = new Set((data.documents || []).filter(document => document.sourceType !== 'prototype').map(document => document.name.toLowerCase()));
    const missingDocuments = requiredDocuments.filter(name => !documentNames.has(name.toLowerCase()));
    const total = requiredFormFields.length + requiredDocuments.length;
    const completionPercentage = Math.round(((requiredFormFields.length - missingFields.length + requiredDocuments.length - missingDocuments.length) / total) * 100);
    const state: ApplicationState = requiredFormFields.length === missingFields.length ? 'DRAFT' : missingFields.length || missingDocuments.length ? 'INCOMPLETE' : 'READY_TO_SUBMIT';
    result.push({
      id: `draft:${scholarshipId}`,
      scholarshipId,
      scholarshipName: scholarship.name,
      applicationNumber: null,
      state,
      statusLabel: prettyState(state, ''),
      isSubmitted: false,
      completionPercentage,
      missingFields,
      missingDocuments,
      verificationStatus: null,
      submittedAt: null,
      lastUpdated: dateOrNull(draft.updatedAt),
      nextAction: missingFields.length || missingDocuments.length ? 'Complete the missing application details or required documents, then review the draft.' : 'Review the completed details before proceeding.',
    });
  }

  return result;
}

export function summarizeApplicationProgress(progress: ApplicationProgress[]) {
  const submitted = progress.filter(application => application.isSubmitted === true).length;
  const incomplete = progress.filter(application => application.state === 'INCOMPLETE').length;
  const drafts = progress.filter(application => application.state === 'DRAFT').length;
  const readyToSubmit = progress.filter(application => application.state === 'READY_TO_SUBMIT').length;
  const statusUnavailable = progress.filter(application => application.state === 'UNKNOWN').length;
  return { total: progress.length, submitted, incomplete, drafts, readyToSubmit, statusUnavailable };
}
