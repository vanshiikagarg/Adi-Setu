import { AppData } from '../types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Prototype screens use local data; Jago free-text messages call the backend chat API below.
type PrototypeData = AppData & { drafts: Record<string, unknown>; themeVersion: number };
const STORAGE_KEY = 'saksham-prototype-v1';
const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const browserHost = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.hostname : undefined;
const defaultHost = browserHost || expoHost || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:3002/api`).replace(/\/$/, '');

function initialData(): PrototypeData {
  return {
    profile: { connected: false, name: 'Asha', email: 'asha.sample@example.com', dob: '01/01/2005', address: 'Sample Address, Bhopal, Madhya Pradesh', education: 'Undergraduate (UG)', familyIncome: '120000', guardianName: null, domicile: 'Madhya Pradesh', institution: 'Sample Government College, Bhopal', course: null, academicInfo: null, completion: 100, stVerified: null, stVerificationMessage: null },
    documents: [],
    scholarships: [
      { id: 'pre-matric', name: 'Pre-Matric Scholarship', level: 'Class 1–10 | School Education', status: 'More Information Required', eligible: null },
      { id: 'post-matric', name: 'Post-Matric Scholarship', level: 'Class 11–12 | Higher Education', status: 'More Information Required', eligible: null },
      { id: 'top-class', name: 'Top Class Scholarship', level: 'UG, PG | Professional Courses', status: 'More Information Required', eligible: null },
      { id: 'national-fellowship', name: 'National Fellowship for ST Students (NFST)', level: 'PhD | Research', status: 'More Information Required', eligible: null },
      { id: 'overseas', name: 'National Overseas Scholarship (NOS)', level: 'Higher Education | Abroad', status: 'More Information Required', eligible: null },
    ],
    applications: [],
    settings: { theme: 'Light', language: 'English', notifications: true, biometric: false },
    digilocker: { configured: false, connected: false, demoMode: true },
    drafts: {},
    themeVersion: 2,
  };
}

let memory: PrototypeData | null = null;
function getData(): PrototypeData {
  if (memory) return memory;
  const fresh = initialData();
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PrototypeData>;
        const legacySampleStatuses = ['Potential Match', 'Does Not Meet Criteria', 'Not Eligible'];
        const legacySampleRanges = ['₹12,000 – ₹48,000', '₹3,000 – ₹10,000', 'Up to ₹2,50,000', 'As per scheme guidelines'];
        const savedById = new Map((parsed.scholarships || []).map(scheme => [scheme.id, scheme]));
        const savedSchemes = fresh.scholarships.map(base => {
          const saved = savedById.get(base.id);
          if (!saved) return base;
          return { ...base, ...saved, name: base.name, level: base.level,
            status: legacySampleStatuses.includes(saved.status || '') ? 'More Information Required' : saved.status,
            eligible: legacySampleStatuses.includes(saved.status || '') ? null : saved.eligible,
            range: legacySampleRanges.includes(saved.range || '') ? undefined : saved.range };
        });
        const savedTheme: string = parsed.themeVersion === 2 && ['Light', 'Dark', 'System'].includes(parsed.settings?.theme || '') ? String(parsed.settings?.theme) : 'Light';
        const savedApplications = (parsed.applications || []).map(application => application.status === 'Submitted (Prototype)' ? { ...application, status: 'Draft', stage: 'Saved locally · not submitted', isSubmitted: false, submitted: undefined } : application);
        memory = { ...fresh, ...parsed, applications: savedApplications, themeVersion: 2, scholarships: savedSchemes, profile: { ...fresh.profile, ...parsed.profile, name: parsed.profile?.name || 'Asha', email: parsed.profile?.email || fresh.profile.email, dob: parsed.profile?.dob || fresh.profile.dob, address: parsed.profile?.address || fresh.profile.address, education: parsed.profile?.education || fresh.profile.education, familyIncome: parsed.profile?.familyIncome || fresh.profile.familyIncome, domicile: parsed.profile?.domicile || fresh.profile.domicile, institution: parsed.profile?.institution || fresh.profile.institution, completion: fresh.profile.completion }, settings: { ...fresh.settings, ...parsed.settings, theme: savedTheme }, digilocker: { ...fresh.digilocker, ...parsed.digilocker, configured: false, demoMode: true } };
      }
    }
  } catch { /* Start a clean prototype session if local storage is unavailable. */ }
  return memory ||= fresh;
}
function save() {
  try { if (typeof localStorage !== 'undefined' && memory) localStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); }
  catch { /* Native prototype state remains available in memory for this app session. */ }
}
function snapshot<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

async function get<T>(path: string): Promise<T> {
  const data = getData();
  const route = path.replace(/^\/api/, '');
  if (route === '/bootstrap') return snapshot(data) as T;
  if (route === '/health') return { ok: true, service: 'Adi Setu frontend prototype' } as T;
  if (route === '/profile') return snapshot(data.profile) as T;
  if (route === '/documents') return snapshot(data.documents) as T;
  if (route === '/scholarships') return snapshot(data.scholarships) as T;
  if (route === '/applications') return snapshot(data.applications) as T;
  if (route === '/digilocker/status') return { configured: false, connected: data.profile.connected, demoMode: true } as T;
  throw new Error(`Prototype screen requested an unknown data route: ${path}`);
}

async function post<T>(path: string, body: any): Promise<T> {
  const data = getData();
  const route = path.replace(/^\/api/, '');
  if (route === '/digilocker/demo-connect') {
    const selected = [...new Set(Array.isArray(body?.documents) ? body.documents : [])].filter((key: unknown) => typeof key === 'string');
    if (!selected.includes('stCertificate')) throw new Error('Select the ST Caste Certificate to continue in the prototype.');
    const labels: Record<string, string> = { stCertificate: 'ST Caste Certificate', identity: 'Identity Document', incomeCertificate: 'Income Certificate', academicCertificate: 'Academic Certificate' };
    const sampleName = String(body?.name || '').trim().slice(0, 60) || 'Asha';
    data.profile = { ...data.profile, connected: true, name: sampleName, completion: [sampleName,data.profile.dob,data.profile.email,data.profile.education].filter(Boolean).length * 10, stVerified: null, stVerificationMessage: 'Prototype only. No DigiLocker account or ST certificate was verified.' };
    data.documents = selected.filter((key: string) => labels[key]).map((key: string) => ({ id: key, category: key, name: labels[key], issuer: 'Prototype sample', sourceType: 'prototype', verificationState: 'unavailable', manualReviewRequired: true, status: 'Prototype only — not verified', updated: '' }));
    data.digilocker = { configured: false, connected: true, demoMode: true };
    save();
    return { connected: true, demoMode: true } as T;
  }
  if (route === '/application-draft') {
    if (!data.scholarships.some(item => item.id === body?.scholarshipId)) throw new Error('Scholarship not found.');
    data.drafts[body.scholarshipId] = { ...body, updatedAt: new Date().toISOString() };
    save();
    return { saved: true, draft: snapshot(data.drafts[body.scholarshipId]) } as T;
  }
  if (route === '/applications') {
    const scholarship = data.scholarships.find(item => item.id === body?.scholarshipId);
    if (!scholarship) throw new Error('Scholarship not found.');
    const existing = data.applications.find(item => item.scholarshipId === scholarship.id);
    if (existing) return snapshot(existing) as T;
    const date = new Date().toISOString().slice(0, 10);
    const application = { id: `DEMO-${Date.now()}`, scholarshipId: scholarship.id, name: scholarship.name, status: 'Draft', stage: 'Saved locally · not submitted', isSubmitted: false, updated: date };
    data.applications.unshift(application);
    save();
    return snapshot(application) as T;
  }
  if (route === '/chat') {
    const raw = String(body?.message || '').trim();
    const message = raw.toLowerCase();
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const matches = data.scholarships.filter(item => normalize(raw).includes(normalize(item.name)));
    const askedScholarship = matches[0];
    const scholarshipApplication = askedScholarship && data.applications.find(item => item.scholarshipId === askedScholarship.id);
    let reply = `I can help with “${raw}”. This prototype has sample scholarship, document, and application information. Tell me the scholarship name or the detail you want to check.`;
    if (/^(hi|hello|hey|namaste)\b/.test(message)) reply = `Hi${data.profile.name ? ` ${data.profile.name}` : ''}! What would you like to know about scholarships, documents, or applications?`;
    else if (askedScholarship && /amount|how much|award|range|rupee|₹/.test(message)) reply = `${askedScholarship.name} shows an illustrative award range of ${askedScholarship.range}. Check the official scheme for current amounts.`;
    else if (askedScholarship && /deadline|last date|due date/.test(message)) reply = `This prototype does not have a current deadline for ${askedScholarship.name}. Please check the official scholarship portal for dates.`;
    else if (askedScholarship && /application|track|submitted|draft/.test(message)) reply = scholarshipApplication ? `Your prototype ${askedScholarship.name} application is ${scholarshipApplication.status}; its current sample stage is “${scholarshipApplication.stage}”.` : `There is no saved prototype application for ${askedScholarship.name} yet.`;
    else if (askedScholarship && /eligible|eligibility|apply|qualify|criteria/.test(message)) reply = `${askedScholarship.name} is marked “${askedScholarship.status}” in this sample catalogue. That is only illustrative; I need your class/course, institution, and family income to discuss the listed criteria, and the official scheme makes the final decision.`;
    else if (askedScholarship && /what|about|detail|explain|for whom|class|level|course/.test(message)) reply = `${askedScholarship.name} is listed for ${askedScholarship.level}, with an illustrative range of ${askedScholarship.range}. This is sample catalogue information; check the official scheme for current requirements.`;
    else if (/eligible|eligibility|qualify|criteria/.test(message)) reply = 'I can help you review the sample criteria. Tell me your class or course, institution type, and family income. The catalogue is illustrative and cannot make an official eligibility decision.';
    else if (/scholarship|which scheme|which schemes|available scheme|catalogue/.test(message)) {
      const appliedIds = new Set(data.applications.map(item => item.scholarshipId));
      const names = data.scholarships.filter(item => !appliedIds.has(item.id)).map(item => item.name);
      reply = names.length ? `The sample catalogue includes: ${names.join('; ')}. Which one do you want details about?` : 'You have reviewed every sample scholarship in this catalogue.';
    }
    else if (/amount|how much|award|₹|rupee/.test(message)) reply = askedScholarship ? `${askedScholarship.name}: ${askedScholarship.range} (sample amount; check the current official scheme).` : 'Which scholarship amount do you mean? Tell me its name and I’ll check the sample catalogue.';
    else if (/document|certificate|upload|share|st certificate|caste/.test(message)) {
      const docs = data.documents.map(item => item.name);
      reply = docs.length ? `Your prototype has these sample document choices: ${docs.join(', ')}. They are not real uploads and none is verified.` : 'No sample documents are selected yet. Open Profile, then Scholarship Passport, then the consent preview to choose some. This prototype does not upload or verify real documents.';
    }
    else if (/application|track|status|submitted|draft/.test(message)) {
      reply = data.applications.length ? `You have ${data.applications.length} sample application${data.applications.length===1?'':'s'}: ${data.applications.map(item => `${item.name} — ${item.status} (${item.stage})`).join('; ')}.` : 'There are no sample applications yet. Open Scholarships, choose a scheme, and complete the prototype application form to add one.';
    }
    else if (/name|profile|personal detail|date of birth|email/.test(message)) reply = data.profile.name ? `The sample profile name is ${data.profile.name}. Other personal details are blank; the prototype does not fetch them from DigiLocker.` : 'The sample profile has no name yet. Enter one in the consent preview if you want to display a sample name. Other personal details stay blank.';
    else if (/help|what can you|what do you/.test(message)) reply = 'Ask me about a scholarship by name, its sample amount or eligibility, the document types you selected, or the status of an application saved in this prototype.';
    return { reply } as T;
  }
  throw new Error(`Prototype screen requested an unknown action: ${path}`);
}

async function patch<T>(path: string, body: any): Promise<T> {
  const data = getData();
  const route = path.replace(/^\/api/, '');
  if (route === '/profile') {
    const updatedProfile = { ...data.profile, ...Object.fromEntries(['name','email','dob','address','education','familyIncome','guardianName','domicile','institution','course','academicInfo'].filter(key => typeof body?.[key] === 'string').map(key => [key, String(body[key]).slice(0, 120)])) };
    updatedProfile.completion = Math.round(['name','dob','education','familyIncome','domicile'].filter(key => Boolean((updatedProfile as any)[key])).length / 5 * 100);
    data.profile = updatedProfile;
    save();
    return snapshot(data.profile) as T;
  }
  if (route === '/settings') {
    const theme = ['Light', 'Dark', 'System'].includes(body?.theme) ? body.theme : data.settings.theme;
    data.settings = { ...data.settings, ...body, theme };
    data.themeVersion = 2;
    save();
    return snapshot(data.settings) as T;
  }
  throw new Error(`Prototype screen requested an unknown update: ${path}`);
}

async function askJago<T>(body: any): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('JAGO_SERVICE_UNAVAILABLE');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('JAGO_REQUEST_FAILED');
  return result as T;
}

async function evaluateJagoEligibility<T>(body: any): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/eligibility/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('JAGO_SERVICE_UNAVAILABLE');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('JAGO_ELIGIBILITY_REQUEST_FAILED');
  return result as T;
}

async function checkVerificationSource<T>(body: any): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}/verification/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document: body }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Verification unavailable');
    return result as T;
  } catch {
    return { status: 'manual-review', outcome: 'unavailable', manualReviewRequired: true, message: 'Verification could not be completed through the available source. Manual official verification may be required.' } as T;
  }
}

export const api = {
  get,
  post: <T,>(path: string, body: any) => path === '/chat' ? askJago<T>(body) : path === '/eligibility/evaluate' ? evaluateJagoEligibility<T>(body) : path === '/verification/check' ? checkVerificationSource<T>(body) : post<T>(path, body),
  patch: <T,>(path: string, body: unknown) => patch<T>(path, body),
};
