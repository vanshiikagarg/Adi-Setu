import { Application, Scholarship } from '../types';

export type ConflictCheck =
  | { state: 'clear'; message: string }
  | { state: 'review' | 'blocked'; message: string; activeApplications: Application[]; applicableRule: string | null };

/** Deterministic check: only a scheme's explicitly configured conflict rules can block or flag it. */
export function checkScholarshipConflict(target: Scholarship, applications: Application[], schemes: Scholarship[]): ConflictCheck {
  const existing = applications.filter(application => application.scholarshipId !== target.id && !['Closed', 'Not Started'].includes(application.status));
  if (!existing.length) return { state: 'clear', message: 'No other scholarship application record is present to compare. No combination rule is assumed.' };

  const configured = existing.filter(application => {
    const activeScheme = schemes.find(scheme => scheme.id === application.scholarshipId);
    return target.conflictRules?.conflictsWith?.includes(application.scholarshipId)
      || activeScheme?.conflictRules?.conflictsWith?.includes(target.id);
  });
  if (!configured.length) {
    return { state: 'review', activeApplications: existing, applicableRule: null, message: 'Another application record is present. This prototype has no configured rule for combining these schemes, and an application record does not establish an active benefit. Check the official scheme rules before proceeding.' };
  }
  const targetRule = target.conflictRules?.conflictsWith?.includes(configured[0].scholarshipId) ? target.conflictRules : undefined;
  const activeRule = schemes.find(scheme => scheme.id === configured[0].scholarshipId)?.conflictRules;
  const rule = targetRule?.explanation || activeRule?.explanation || null;
  const action = targetRule?.action || activeRule?.action || 'review';
  return { state: action === 'block' ? 'blocked' : 'review', activeApplications: configured, applicableRule: rule, message: rule || 'A configured scheme rule requires you to review this combination with the official scheme source before continuing.' };
}

export function getConfiguredRequiredDocuments(scholarship: Scholarship): string[] {
  return scholarship.requiredDocuments || [];
}
