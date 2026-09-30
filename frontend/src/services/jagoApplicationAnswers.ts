import { summarizeApplicationProgress } from './applicationStatus';
import type { ApplicationProgress } from './applicationStatus';

export function answerApplicationQuestion(question: string, applications: ApplicationProgress[], dataUnavailable = false) {
  const q = question.toLowerCase();
  const appTopic = /application|applications|scholarship|meri application|meri scholarship/.test(q) || /missing.*documents?|documents?.*missing/.test(q);
  const statusTopic = /status|submit|submitted|pending|incomplete|complete|completion|percent|percentage|missing|kitni|kitne|konsi|kaunsi|how many|which|progress|document|application data/.test(q);
  if (!appTopic || !statusTopic) return null;
  if (dataUnavailable) return { text: "Application data is not available yet. I couldn't fetch your latest application status right now. Please try again.", cards: [] as ApplicationProgress[] };
  if (!applications.length) return { text: "I couldn't find any scholarship applications yet. Once you start or save an application draft in ADI SETU, I can track its progress here.", cards: [] as ApplicationProgress[] };

  const summary = summarizeApplicationProgress(applications);
  const asksCount = /how many|count|number of|kitni applications?|kitne applications?/.test(q);
  const asksSubmittedCount = asksCount && /submit|submitted|hui|ho gayi/.test(q);
  const asksMissing = /missing|document|documents|kya.*(chahiye|kami)|what.*(need|required)/.test(q);
  const asksNotSubmitted = /not submitted|hasn.t submitted|submit nahi|submit nahin|pending|incomplete|pending hai/.test(q);
  const cards = asksMissing
    ? applications.filter(application => Boolean(application.missingDocuments?.length || application.missingFields?.length))
    : asksNotSubmitted
      ? applications.filter(application => application.isSubmitted !== true)
      : applications;
  const countsText = `${summary.submitted} submitted, ${summary.incomplete} incomplete, ${summary.drafts} draft${summary.drafts === 1 ? '' : 's'}, ${summary.readyToSubmit} ready to review${summary.statusUnavailable ? `, ${summary.statusUnavailable} with status unavailable` : ''}`;

  if (asksSubmittedCount) return { text: `The saved ADI SETU application records show ${countsText} out of ${summary.total} application${summary.total === 1 ? '' : 's'}.`, cards };
  if (asksCount) return { text: `I found ${summary.total} scholarship application${summary.total === 1 ? '' : 's'} in ADI SETU: ${countsText}.`, cards };

  if (asksMissing) {
    const withMissing = cards.filter(application => application.missingDocuments?.length || application.missingFields?.length);
    if (!withMissing.length && applications.some(application => application.missingFields === null || application.missingDocuments === null)) return { text: "The required-field or missing-document details aren't available in the current application data, so I can't confirm that nothing is missing.", cards };
    if (!withMissing.length) return { text: 'I could not find any missing required fields or documents in the available application data. Some applications may not include a configured requirements list.', cards };
    return { text: withMissing.map(application => `${application.scholarshipName}: ${[...(application.missingFields || []), ...(application.missingDocuments || [])].join(', ') || 'Missing-item details are not available'}.`).join('\n'), cards: withMissing };
  }

  if (asksNotSubmitted) {
    const notSubmitted = applications.filter(application => application.isSubmitted === false);
    const statusUnknown = applications.filter(application => application.isSubmitted === null);
    if (!notSubmitted.length && statusUnknown.length) return { text: "I don't have the submission status for the following application records yet: " + statusUnknown.map(application => application.scholarshipName).join(', ') + '.', cards: statusUnknown };
    if (!notSubmitted.length) return { text: 'The available application records show all listed applications as submitted. I do not have a current official portal confirmation unless one is included in the record.', cards };
    return { text: [...notSubmitted.map(application => `${application.scholarshipName}: ${application.completionPercentage === null ? 'Completion data is not available yet' : `${application.completionPercentage}% complete`}; ${application.statusLabel}.${application.nextAction ? ` Next step: ${application.nextAction}` : ''}`), ...statusUnknown.map(application => `${application.scholarshipName}: I don't have the submission status for this application yet.`)].join('\n'), cards: [...notSubmitted, ...statusUnknown] };
  }

  return { text: applications.map(application => {
    const completion = application.completionPercentage === null ? 'Completion data is not available yet' : `${application.completionPercentage}% complete`;
    const submittedDate = application.submittedAt ? ` Submitted ${application.submittedAt}.` : '';
    const action = application.nextAction ? ` Next step: ${application.nextAction}` : '';
    return `${application.scholarshipName}: ${completion}; ${application.statusLabel}.${submittedDate}${action}`;
  }).join('\n'), cards };
}
