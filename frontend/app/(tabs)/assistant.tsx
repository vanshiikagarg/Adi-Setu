import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { colors, createThemedStyles } from '../../src/theme';
import { useApp } from '../../src/context/AppContext';
import { Scholarship } from '../../src/types';
import { AppIconName, Icon } from '../../src/components/Icon';
import { JagoAvatar } from '../../src/components/jago/JagoAvatar';
import { JagoMessageBubble, JagoTypingIndicator } from '../../src/components/jago/JagoMessageBubble';
import { SuggestedQuestion } from '../../src/components/jago/SuggestedQuestion';
import { ApplicationStatusCard } from '../../src/components/jago/ApplicationStatusCard';
import { ApplicationProgress, buildApplicationProgress, summarizeApplicationProgress } from '../../src/services/applicationStatus';
import { answerApplicationQuestion } from '../../src/services/jagoApplicationAnswers';

type Choice = { label: string; value?: string; icon?: AppIconName; iconColor?: string };
type Message = { id: number; from: 'jago' | 'you'; text: string; choices?: Choice[]; applicationCards?: ApplicationProgress[] };
type Answer = { value: string; confirmed: boolean };
type EligibilityResult = {
  status: 'potential-match' | 'more-information-required' | 'does-not-meet-listed-criteria';
  summary: string;
  reasons: string[];
  missingInformation: string[];
};
type FlowQuestion = 'menu' | 'scholarship' | 'educationLevel' | null;

const INTRO = "Hello! I'm JAGO, your AI assistant. I can help you with scholarships, DigiLocker, documents, applications, and ADI SETU.";
const UNAVAILABLE = "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
const suggestions = [
  { question: 'What is ADI SETU?', answer: 'ADI SETU is a digital platform designed to help students manage scholarship-related processes and trusted documents in one place.' },
  { question: 'How can I apply for a scholarship?', answer: 'You can use ADI SETU to access scholarship-related services and submit the required information and documents. The exact application process depends on the scholarship. Please check the relevant scholarship details before submitting your application.' },
  { question: 'How do I connect DigiLocker?', answer: "Open the Documents section, review the requested document list and consent, then continue to the DigiLocker flow if it is configured. A DigiLocker login alone does not verify ST status." },
  { question: 'What documents do I need?', answer: 'The required documents depend on the scholarship or service you are applying for. JAGO can help you understand the available document requirements, but you should verify the final requirements from the relevant official scholarship information.' },
  { question: 'How can I check my application status?', answer: 'Open the application/status section in ADI SETU to view the latest available status of your application. If a status is not available, check whether your application has been successfully submitted.' },
  { question: 'How can I update my documents?', answer: 'Open your document section and select the document you want to update. If the document is connected through DigiLocker, follow the available DigiLocker/document verification flow.' },
];

function educationChoices(scholarships: Scholarship[] = []): Choice[] {
  const available = new Set<string>();
  for (const scholarship of scholarships) {
    const level = scholarship.level.toLowerCase();
    if (/class\s*1\s*[-–]\s*10|school education/.test(level)) available.add('Class 1–10');
    if (/class\s*11\s*[-–]\s*12/.test(level)) available.add('Class 11–12');
    if (/\bug\b/.test(level)) available.add('Undergraduate (UG)');
    if (/\bpg\b/.test(level)) available.add('Postgraduate (PG)');
    if (/\bphd\b|research/.test(level)) available.add('PhD / Research');
    if (/higher education/.test(level)) available.add('Higher Education');
    if (/professional courses/.test(level)) available.add('Professional Courses');
    if (/abroad/.test(level)) available.add('Abroad');
  }
  return [...available, 'Other / none of these'].map(value => ({ label: value, value }));
}

function inferEducation(text: string): string | null {
  const value = text.toLowerCase();
  if (/\b(phd|ph\.d|doctoral|research scholar)\b/.test(value)) return 'PhD / Research';
  if (/\b(pg|post.?graduate|masters?|m\.?[a-z]{1,4}\.?|mba|mtech|m\.tech)\b/.test(value)) return 'Postgraduate (PG)';
  if (/\b(under.?grad|ug|b\.?[a-z]{1,5}\.?|bachelor|college|btech|b\.tech|2nd year|second year|3rd year|third year)\b/.test(value)) return 'Undergraduate (UG)';
  if (/\b(class\s*(11|12)|11th|12th|higher secondary|intermediate|senior secondary)\b/.test(value)) return 'Class 11–12';
  if (/\b(class\s*([1-9]|10)|[1-9]th|10th|school)\b/.test(value)) return 'Class 1–10';
  if (/\b(abroad|overseas)\b/.test(value)) return 'Abroad';
  if (/\bhigher education\b/.test(value)) return 'Higher Education';
  return null;
}

function reviewText(answers: Record<string, Answer>) {
  const entries = Object.entries(answers);
  if (!entries.length) return 'There are no confirmed answers to review yet.';
  return `Your confirmed answers for this check:\n${entries.map(([key, answer]) => `${key === 'educationLevel' ? 'Education level' : key}: ${answer.value} — confirmed`).join('\n')}`;
}

function answerFromApp(question: string, data: ReturnType<typeof useApp>['data']) {
  if (!data) return null;
  const q=question.toLowerCase();
  if (/application status|status of (my )?application|track (my )?application/.test(q)) {
    return data.applications.length
      ? data.applications.map(app=>`${app.name}: recorded status ${app.status}; stage ${app.stage}.${app.deficiency?` Information to review: ${app.deficiency}`:''}`).join('\n')
      : 'There is no application status in your current ADI SETU data. No application is recorded yet.';
  }
  if (/pending action|what.*(pending|next step)|deficien|action required|alert|reminder|next step/.test(q)) {
    const actions=data.applications.flatMap(app=>[...(app.pendingActions||[]).map(item=>`${app.name}: ${item.title} — ${item.explanation}`),...(app.deficiency?[`${app.name}: ${app.deficiency}`]:[])]);
    const reviewDocs=data.documents.filter(doc=>doc.manualReviewRequired||doc.verificationState==='manual-review'||doc.verificationState==='mismatch').map(doc=>`${doc.name}: ${doc.status}. Manual verification may be required.`);
    const deadlines=data.scholarships.filter(scheme=>scheme.deadline).map(scheme=>`${scheme.name}: configured deadline ${scheme.deadline}; verify with the official source.`);
    return actions.length||reviewDocs.length||deadlines.length?[...actions,...reviewDocs,...deadlines].join('\n'):'No pending action, deficiency, deadline, or alert is recorded in the available data.';
  }
  if (/payment|disburse|dbt|sanction status/.test(q)) {
    const records=data.applications.filter(app=>app.paymentStatus||app.dbtStatus||app.sanctionStatus);
    return records.length?records.map(app=>`${app.name}: ${app.sanctionStatus?`sanction ${app.sanctionStatus}; `:''}${app.paymentStatus?`payment ${app.paymentStatus}; `:''}${app.dbtStatus?`DBT ${app.dbtStatus}; `:''}${typeof app.paymentAmount==='number'?`configured amount ${app.paymentAmount}; `:''}${app.lastPaymentUpdate?`last updated ${app.lastPaymentUpdate}`:''}`).join('\n'):'No payment, sanction, or DBT status is available. ADI SETU has no DBT source connected, so I cannot report a payment result.';
  }
  if (/required document|which documents|documents do i need|what documents|document.*need|need.*document/.test(q)) {
    const scheme=data.scholarships.find(item=>q.includes(item.name.toLowerCase()));
    return scheme?.requiredDocuments?.length?`${scheme.name} has these documents configured in the current app data: ${scheme.requiredDocuments.join(', ')}. Check the official scheme source for the final list.`:'Scheme-specific document requirements are not configured in the available app data. Please verify the current list with the official scheme source.';
  }
  if (/deadline|last date/.test(q)) {
    const configured=data.scholarships.filter(scheme=>scheme.deadline&&q.includes(scheme.name.toLowerCase()));
    return configured.length?configured.map(scheme=>`${scheme.name}: configured deadline ${scheme.deadline}. Verify dates with the official source.`).join('\n'):'No current scholarship deadline is configured in ADI SETU. Please check the official scheme source.';
  }
  if (/digilocker/.test(q)) return "Review the requested document list and consent in the Documents flow before connecting. This prototype may use a demo flow if partner credentials are unavailable. DigiLocker login alone does not establish ST certificate verification.";
  if (/what is adi setu/.test(q)) return 'ADI SETU is a student platform concept that brings scholarship discovery, reusable information, document handling, application tracking and JAGO guidance together. Some integrations in this prototype are demo or proposed.';
  return null;
}

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, from: 'jago', text: INTRO }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<FlowQuestion>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confirmationState, setConfirmationState] = useState<'idle' | 'awaiting'>('idle');
  const [confirmedAnswers, setConfirmedAnswers] = useState<Record<string, Answer>>({});
  const [correctionMode, setCorrectionMode] = useState(false);
  const [eligibilitySession, setEligibilitySession] = useState<Record<string, Answer>>({});
  const [currentScholarship, setCurrentScholarship] = useState<Scholarship | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<EligibilityResult | null>(null);
  const [activeChoices, setActiveChoices] = useState<number | null>(null);
  const [showSuggestionsArea, setShowSuggestionsArea] = useState(true);
  const [retryEvaluation, setRetryEvaluation] = useState(false);
  const idRef = useRef(1);
  const scrollRef = useRef<ScrollView>(null);
  const { data, loading: appLoading, error: appError, reload } = useApp();
  const router = useRouter();
  const applicationProgress = useMemo(() => buildApplicationProgress(data), [data]);
  const lastStatusSnapshot = useRef<string | null>(null);

  useFocusEffect(useCallback(() => {
    void reload();
  }, [reload]));

  useEffect(() => {
    if (appLoading) return;
    const signature = appError ? `error:${appError}` : JSON.stringify(applicationProgress);
    if (lastStatusSnapshot.current === signature) return;
    lastStatusSnapshot.current = signature;
    const statusText = appError
      ? "Application data is not available yet. I couldn't fetch your latest application status right now. Please try again."
      : applicationProgress.length
        ? (() => {
          const summary = summarizeApplicationProgress(applicationProgress);
          const focus = applicationProgress.find(application => application.isSubmitted === false);
          return `Here's the status recorded in ADI SETU: ${summary.total} application${summary.total === 1 ? '' : 's'}; ${summary.submitted} submitted, ${summary.incomplete} incomplete, and ${summary.drafts} draft${summary.drafts === 1 ? '' : 's'}${summary.readyToSubmit ? `, ${summary.readyToSubmit} ready to review` : ''}${summary.statusUnavailable ? `, ${summary.statusUnavailable} with status unavailable` : ''}.${focus ? ` ${focus.scholarshipName} is ${focus.completionPercentage === null ? 'missing completion data' : `${focus.completionPercentage}% complete`} and ${focus.isSubmitted ? 'submitted' : 'not submitted'}.` : ''}`;
        })()
        : "I couldn't find any scholarship applications yet. Once you start or save an application draft in ADI SETU, I can track its progress here.";
    const cards = appError ? [] : applicationProgress.filter(application => application.isSubmitted === false).slice(0, 1);
    const id = ++idRef.current;
    setMessages(current => [...current, { id, from: 'jago', text: statusText, applicationCards: cards }]);
  }, [appLoading, appError, applicationProgress]);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages, busy, showSuggestionsArea]);

  function addUser(textValue: string) {
    setActiveChoices(null);
    const id = ++idRef.current;
    setMessages(current => [...current, { id, from: 'you', text: textValue }]);
  }

  function addJago(textValue: string, choices?: Choice[], applicationCards?: ApplicationProgress[]) {
    const id = ++idRef.current;
    setMessages(current => [...current, { id, from: 'jago', text: textValue, choices, applicationCards }]);
    setActiveChoices(choices?.length ? id : null);
  }

  function clearEligibility() {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setConfirmationState('idle');
    setConfirmedAnswers({});
    setCorrectionMode(false);
    setEligibilitySession({});
    setCurrentScholarship(null);
    setCompletedQuestions([]);
    setFinalResult(null);
    setRetryEvaluation(false);
  }

  function beginEligibility() {
    clearEligibility();
    setShowSuggestions(false);
    setShowSuggestionsArea(false);
    setCurrentQuestion('menu');
    addJago('What would you like help with?', [
      { label: 'Find scholarships' },
      { label: 'Check eligibility' },
      { label: 'Application status' },
      { label: 'Documents' },
      { label: 'Pending actions' },
      { label: 'Payment / DBT' },
      { label: 'Verification sources' },
      { label: 'Alerts & next steps' },
    ]);
  }

  function askScholarship() {
    const choices = (data?.scholarships || []).map(item => ({ label: item.name, value: item.id }));
    if (!choices.length) {
      setCurrentQuestion(null);
      addJago('I cannot find scholarships in the current catalogue. Please try again later.');
      return;
    }
    setCurrentQuestion('scholarship');
    addJago('Which scholarship would you like to check?', choices);
  }

  function askEducationLevel() {
    setCurrentQuestion('educationLevel');
    setCorrectionMode(false);
    addJago(currentScholarship
      ? `What is your current education level for ${currentScholarship.name}? The available choices reflect education levels shown in ADI SETU's sample scholarship catalogue.`
      : 'What is your current education level?', educationChoices(currentScholarship ? [currentScholarship] : data?.scholarships));
  }

  async function evaluate(answers: Record<string, Answer>, scholarship = currentScholarship) {
    if (!scholarship) return;
    const level = answers.educationLevel;
    if (!level?.confirmed) {
      setCurrentQuestion('educationLevel');
      addJago('Please confirm your education level before I check the available scholarship information.', educationChoices(currentScholarship ? [currentScholarship] : data?.scholarships));
      return;
    }
    setBusy(true);
    setRetryEvaluation(false);
    setFinalResult(null);
    setCurrentQuestion(null);
    setEligibilitySession(answers);
    try {
      const result = await api.post<EligibilityResult>('/eligibility/evaluate', {
        scholarshipId: scholarship.id,
        currentQuestion: 'educationLevel',
        selectedAnswer: level.value,
        confirmedAnswers: answers,
        conversationContext: messages.slice(-8).map(item => ({ role: item.from === 'you' ? 'user' : 'assistant', content: item.text })),
      });
      setFinalResult(result);
      setRetryEvaluation(false);
      const resultChoices = [
        { label: 'Review My Answers' },
        { label: 'Check Another Scholarship' },
        { label: 'Start Again' },
      ];
      const detail = result.reasons.length ? `\n\nReason: ${result.reasons.join(' ')}` : '';
      const missing = result.missingInformation.length ? `\n\nStill needed: ${result.missingInformation.join(', ')}.` : '';
      addJago(`${result.summary}${detail}${missing}`, resultChoices);
    } catch {
      setRetryEvaluation(true);
      addJago(UNAVAILABLE, [{ label: 'Retry eligibility check' }, { label: 'Review My Answers' }, { label: 'Start Again' }]);
    } finally {
      setBusy(false);
    }
  }

  function confirmSelectedAnswer() {
    if (!selectedAnswer || !currentQuestion) return;
    const updated = { ...confirmedAnswers, [currentQuestion]: { value: selectedAnswer, confirmed: true } };
    setConfirmedAnswers(updated);
    setEligibilitySession(updated);
    setCompletedQuestions(current => current.includes(currentQuestion) ? current : [...current, currentQuestion]);
    setConfirmationState('idle');
    setCorrectionMode(false);
    if (currentQuestion === 'educationLevel') {
      addJago(`Got it. I'll use ${selectedAnswer} as your education level. I'll compare it only with the scholarship's listed study level; other eligibility rules may not be configured here.`);
      void evaluate(updated);
    }
  }

  function chooseEducation(value: string) {
    setSelectedAnswer(value);
    setEligibilitySession(current => ({ ...current, educationLevel: { value, confirmed: false } }));
    setCorrectionMode(false);
    setConfirmationState('awaiting');
    addUser(value);
    addJago(`You selected: ${value}.\n\nIs this information correct for you?`, [
      { label: "Yes, that's correct", icon: 'badge-check', iconColor: colors.verified },
      { label: 'No, I want to correct it', icon: 'pencil', iconColor: colors.warning },
    ]);
  }

  function chooseScholarship(value: string) {
    const scholarship = data?.scholarships.find(item => item.id === value || item.name === value);
    if (!scholarship) return;
    setCurrentScholarship(scholarship);
    setFinalResult(null);
    addUser(scholarship.name);
    const existingEducation = confirmedAnswers.educationLevel;
    if (existingEducation?.confirmed) {
      addJago(`I'll reuse your confirmed education level, ${existingEducation.value}, for this scholarship check.`);
      void evaluate(confirmedAnswers, scholarship);
    } else {
      askEducationLevel();
    }
  }

  function handleFlowChoice(label: string, value?: string) {
    if (busy) return;
    if (label === 'Review My Answers') {
      setCurrentQuestion('educationLevel');
      addUser(label);
      const editOptions = Object.entries(confirmedAnswers).map(([key]) => ({ label: key === 'educationLevel' ? 'Edit Education Level' : `Edit ${key}` }));
      addJago(reviewText(confirmedAnswers), [...editOptions, { label: 'Check Another Scholarship' }, { label: 'Start Again' }]);
      return;
    }
    if (label.startsWith('Edit ')) {
      const answer = confirmedAnswers.educationLevel;
      setCurrentQuestion('educationLevel');
      setSelectedAnswer(answer?.value || null);
      setConfirmedAnswers(current => ({ ...current, educationLevel: { value: answer?.value || '', confirmed: false } }));
      setEligibilitySession(current => ({ ...current, educationLevel: { value: answer?.value || '', confirmed: false } }));
      setCompletedQuestions(current => current.filter(item => item !== 'educationLevel'));
      setFinalResult(null);
      setCorrectionMode(true);
      addUser(label);
      addJago('Choose your corrected education level. I will ask you to confirm it before reevaluating.', educationChoices(currentScholarship ? [currentScholarship] : data?.scholarships));
      return;
    }
    if (label === 'Check Another Scholarship') {
      addUser(label);
      askScholarship();
      return;
    }
    if (label === 'Start Again') {
      addUser(label);
      clearEligibility();
      setShowSuggestionsArea(false);
      setCurrentQuestion('menu');
      addJago("Let's start again. What would you like help with?", [
        { label: 'Find scholarships' }, { label: 'Check eligibility' }, { label: 'Application status' }, { label: 'Documents' }, { label: 'Pending actions' }, { label: 'Payment / DBT' }, { label: 'Verification sources' }, { label: 'Alerts & next steps' },
      ]);
      return;
    }
    if (label === 'Retry eligibility check') {
      addUser(label);
      void evaluate(eligibilitySession);
      return;
    }
    if (currentQuestion === 'menu') {
      addUser(label);
      if (label === 'Check eligibility') { askScholarship(); return; }
      if (label === 'Find scholarships') { setCurrentQuestion(null); router.push('/(tabs)/scholarships'); return; }
      if (label === 'Payment / DBT') { setCurrentQuestion(null); router.push('/payments'); return; }
      if (label === 'Verification sources') { setCurrentQuestion(null); router.push('/integrations'); return; }
      if (label === 'Application status') {
        setCurrentQuestion(null);
        const rows = data?.applications || [];
        addJago(rows.length ? rows.map(item => `${item.name}: recorded status ${item.status} (${item.stage})`).join('\n') : 'There is no application status in the available data. No application is recorded yet.');
        return;
      }
      if (label === 'Documents') {
        setCurrentQuestion(null);
        const rows = data?.documents || [];
        addJago(rows.length ? rows.map(item => `${item.name}: ${item.status} · source ${item.issuer}`).join('\n') : 'No documents are currently saved in your wallet.');
        return;
      }
      setCurrentQuestion(null);
      addJago(answerFromApp('pending action',data)||'No pending action information is available.');
      return;
    }

    if (currentQuestion === 'scholarship') {
      if (label === 'Check Another Scholarship') { addUser(label); askScholarship(); return; }
      chooseScholarship(value || label);
      return;
    }

    if (confirmationState === 'awaiting') {
      addUser(label);
      if (label.startsWith('Yes')) { confirmSelectedAnswer(); return; }
      if (label.startsWith('No')) {
        setConfirmationState('idle');
        setCorrectionMode(true);
        addJago(`No problem. Please tell me your correct education level, or choose one of these options. You can also type a correction below.`, educationChoices(currentScholarship ? [currentScholarship] : data?.scholarships));
        return;
      }
    }

    if (currentQuestion === 'educationLevel' && confirmationState === 'idle') {
      chooseEducation(value || label);
      return;
    }
  }

  function chooseSuggestion(question: string, answer: string) {
    if (busy) return;
    setShowSuggestions(false);
    setShowSuggestionsArea(false);
    addUser(question);
    addJago(answer);
  }

  async function send() {
    const question = text.trim();
    if (!question || busy) return;
    setText('');
    setShowSuggestions(false);
    setShowSuggestionsArea(false);
    if (correctionMode && currentQuestion === 'educationLevel') {
      addUser(question);
      const interpreted = inferEducation(question);
      if (!interpreted) {
        addJago("I couldn't confidently map that to an education level. Please choose one of the listed options, or describe your course (for example, ‘2nd year B.Tech’).", educationChoices(currentScholarship ? [currentScholarship] : data?.scholarships));
        return;
      }
      setSelectedAnswer(interpreted);
      setCorrectionMode(false);
      setConfirmationState('awaiting');
      addJago(`Got it. I'll use ${interpreted} as your education level. Is that correct?`, [
        { label: "Yes, that's correct", icon: 'badge-check', iconColor: colors.verified },
        { label: 'No, correct again', icon: 'pencil', iconColor: colors.warning },
      ]);
      return;
    }
    if (/check (my )?eligibility|eligibility check|am i eligible|qualify for/i.test(question)) {
      addUser(question);
      clearEligibility();
      askScholarship();
      return;
    }
    addUser(question);
    const applicationAnswer = answerApplicationQuestion(question, applicationProgress, Boolean(appError));
    if (applicationAnswer) {
      addJago(applicationAnswer.text, undefined, applicationAnswer.cards);
      return;
    }
    const appAnswer=answerFromApp(question,data);
    if(appAnswer){addJago(appAnswer);return;}
    setBusy(true);
    try {
      const history = [...messages.slice(-8), { id: -1, from: 'you' as const, text: question }];
      const result = await api.post<{ reply?: string }>('/chat', {
        message: question,
        history: history.map(item => ({ role: item.from === 'you' ? 'user' : 'assistant', content: item.text })),
        context: {
          assistantIdentity: 'JAGO, the AI assistant for ADI SETU',
          responseLanguagePreference: data?.settings.language || 'English',
          scholarshipCatalogue: data?.scholarships.map(({ id, name, level, deadline, requiredDocuments, status }) => ({ id, name, level, deadline: deadline || null, requiredDocuments: requiredDocuments || [], status })),
          documents: data?.documents.map(({ name, issuer, status, verificationState, manualReviewRequired }) => ({ name, issuer, status, verificationState: verificationState || 'not configured', manualReviewRequired: Boolean(manualReviewRequired) })),
          applicationProgress,
          savedDraftCount: Object.keys(data?.drafts || {}).length,
          integrationStates: { digilockerConfigured: Boolean(data?.digilocker.configured), digilockerConnected: Boolean(data?.digilocker.connected), dbtSource: 'not connected', scholarshipPortal: 'not connected' },
          eligibilitySession,
        },
      });
      if (!result.reply?.trim()) throw new Error('Jago returned an empty reply.');
      addJago(result.reply.trim());
    } catch {
      addJago(UNAVAILABLE);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.page}>
          <View style={styles.heading}>
            <View style={styles.headline}>
              <JagoAvatar size={26} />
              <View>
                <Text style={styles.headTitle}>JAGO</Text>
                <Text style={styles.eyebrow}>AI ASSISTANT · ADI SETU</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Change reply language, current preference ${data?.settings.language||'English'}`} onPress={()=>router.push('/language')} style={styles.languageButton}><Icon name="language-outline" size={15} color={colors.accent}/><Text style={styles.languageText}>{data?.settings.language||'English'}</Text></Pressable>
          </View>

          <ScrollView ref={scrollRef} style={styles.thread} contentContainerStyle={styles.threadContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            {messages.map(message => (
              <View key={message.id} style={styles.messageGroup}>
                <JagoMessageBubble from={message.from} text={message.text} />
                {message.applicationCards?.map(application => (
                  <ApplicationStatusCard
                    key={`${message.id}-${application.id}`}
                    application={application}
                    onPress={() => application.isSubmitted === false && application.scholarshipId
                      ? router.push({ pathname: '/apply/[id]', params: { id: application.scholarshipId } })
                      : router.push('/applications')}
                    onDocumentsPress={() => router.push('/(tabs)/documents')}
                  />
                ))}
                {activeChoices === message.id && message.choices?.length ? (
                  <View style={styles.optionList}>
                    {message.choices.map(choice => (
                      <Pressable key={`${message.id}-${choice.label}`} accessibilityRole="button" accessibilityLabel={choice.label} onPress={() => handleFlowChoice(choice.label, choice.value)} disabled={busy} style={({ pressed }) => [styles.flowOption, pressed && styles.flowOptionPressed, busy && styles.flowOptionDisabled]}>
                        {choice.icon ? <Icon name={choice.icon} size={18} color={choice.iconColor || colors.accent} /> : null}
                        <Text style={styles.flowOptionText}>{choice.label}</Text>
                        <Icon name="chevron-forward" size={17} color={colors.accent} />
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
            {appLoading ? <View style={styles.messageGroup}><JagoMessageBubble from="jago" text="Checking your application status..."/></View> : null}
            {showSuggestionsArea && showSuggestions && !busy ? (
              <View style={styles.suggestions}>
                <View style={styles.suggestionTitle}><Icon name="sparkles" size={16} color={colors.accent}/><Text style={styles.suggestionHeading}>You can ask me</Text></View>
                <View style={styles.suggestionGrid}>
                  <SuggestedQuestion question="Check scholarship eligibility" onPress={() => { addUser('Check scholarship eligibility'); beginEligibility(); }} />
                  {suggestions.map(item => <SuggestedQuestion key={item.question} question={item.question} onPress={() => chooseSuggestion(item.question, item.answer)} />)}
                </View>
              </View>
            ) : null}
            {busy ? <JagoTypingIndicator /> : null}
          </ScrollView>

          <View style={styles.compose}>
            <TextInput value={text} onChangeText={setText} placeholder={correctionMode ? 'Describe your correct education level...' : 'Ask JAGO anything...'} placeholderTextColor={colors.textMuted} style={styles.input} returnKeyType="send" onSubmitEditing={() => void send()} onFocus={() => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))} multiline maxLength={2000} editable={!busy && !appLoading} accessibilityLabel={correctionMode ? 'Describe your correct education level' : 'Ask JAGO anything'} />
            <Pressable accessibilityRole="button" accessibilityLabel="Send message to JAGO" accessibilityState={{ disabled: !text.trim() || busy || appLoading }} style={({ pressed }) => [styles.send, (!text.trim() || busy || appLoading) && styles.sendDisabled, pressed && styles.sendPressed]} onPress={() => void send()} disabled={!text.trim() || busy || appLoading}>
              <Icon name="send" size={18} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.disclaimer}>JAGO is an AI assistant. Eligibility guidance uses available catalogue rules only; confirm official requirements with the relevant source.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = createThemedStyles((theme) => ({
  safe: { flex: 1 },
  screen: { flex: 1, backgroundColor: theme.background },
  page: { flex: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 7 },
  heading: { marginHorizontal: -16, marginTop: -10, marginBottom: 10, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.primaryPressed },
  headline: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  languageButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.surface },
  languageText: { color: theme.textSecondary, fontSize: 10, fontWeight: '600' },
  headTitle: { color: '#FFFFFF', fontSize: 21, lineHeight: 24, fontWeight: '800' },
  eyebrow: { fontSize: 9, color: '#C7D7E8', fontWeight: '800', letterSpacing: 0.8, marginTop: 2 },
  thread: { flex: 1 },
  threadContent: { flexGrow: 1, gap: 12, paddingVertical: 8 },
  messageGroup: { gap: 7 },
  optionList: { marginLeft: 37, gap: 7, width: '86%' },
  flowOption: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  flowOptionPressed: { backgroundColor: theme.surfaceStrong, borderColor: theme.primary },
  flowOptionDisabled: { opacity: 0.55 },
  flowOptionText: { flex: 1, color: theme.textSecondary, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  suggestions: { marginLeft: 37, marginTop: 2, marginBottom: 4 },
  suggestionTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  suggestionHeading: { fontSize: 12, fontWeight: '700', color: theme.textSecondary },
  suggestionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  compose: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', paddingTop: 8 },
  input: { minHeight: 48, maxHeight: 116, flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 15, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 11, backgroundColor: theme.input, fontSize: 14, lineHeight: 20, color: theme.textPrimary },
  send: { width: 48, height: 48, borderRadius: 15, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: theme.disabled },
  sendPressed: { backgroundColor: theme.primaryPressed },
  disclaimer: { fontSize: 10, color: theme.textMuted, marginTop: 6, textAlign: 'center' },
}));
