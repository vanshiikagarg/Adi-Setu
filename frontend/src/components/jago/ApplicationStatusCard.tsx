import { Pressable, Text, View } from 'react-native';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { colors, createThemedStyles } from '../../theme';
import { ApplicationProgress } from '../../services/applicationStatus';

export function ApplicationStatusCard({ application, onPress, onDocumentsPress }: {
  application: ApplicationProgress;
  onPress: () => void;
  onDocumentsPress?: () => void;
}) {
  const completion = application.completionPercentage;
  const missingItems = [
    ...(application.missingFields || []),
    ...(application.missingDocuments || []),
  ];

  return <Card style={styles.card}>
    <Text style={styles.name}>{application.scholarshipName}</Text>
    {completion === null
      ? <Text style={styles.meta}>Completion data is not available yet.</Text>
      : <>
        <View style={styles.completionRow}><Text style={styles.meta}>Completion</Text><Text style={styles.percent}>{completion}%</Text></View>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: completion }} accessibilityLabel={`${application.scholarshipName} completion`} style={styles.track}>
          <View style={[styles.fill, { width: `${completion}%` }]}/>
        </View>
      </>}
    <View style={styles.statusRow}><Icon name={application.isSubmitted === null ? 'info' : application.isSubmitted ? 'checkmark-circle' : 'triangle-alert'} size={17} color={application.isSubmitted === null ? colors.textMuted : application.isSubmitted ? colors.accent : colors.warning}/><Text style={styles.status}>{application.statusLabel}</Text></View>
    {application.applicationNumber ? <Text style={styles.meta}>Application number: {application.applicationNumber}</Text> : null}
    {application.submittedAt ? <Text style={styles.meta}>Submitted: {application.submittedAt}</Text> : null}
    {application.verificationStatus ? <Text style={styles.meta}>Verification: {application.verificationStatus}</Text> : null}
    {missingItems.length ? <View style={styles.missing}><Text style={styles.meta}>Still needed</Text>{missingItems.map(item => <View key={item} style={styles.missingRow}><Text style={styles.bullet}>•</Text><Text style={styles.meta}>{item}</Text></View>)}</View> : null}
    {application.nextAction ? <Text style={styles.next}>{application.nextAction}</Text> : null}
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" onPress={onPress}><Text style={styles.actionText}>{application.isSubmitted === true ? 'View application' : application.isSubmitted === false ? 'Continue application' : 'View application status'} →</Text></Pressable>
      {application.missingDocuments?.length && onDocumentsPress ? <Pressable accessibilityRole="button" onPress={onDocumentsPress}><Text style={styles.actionText}>View missing documents →</Text></Pressable> : null}
    </View>
  </Card>;
}

const styles = createThemedStyles(theme => ({
  card: { marginLeft: 36, paddingVertical: 12 },
  name: { color: theme.textPrimary, fontSize: 13, fontWeight: '800' },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 11 },
  percent: { color: theme.textPrimary, fontSize: 12, fontWeight: '800' },
  track: { height: 8, borderRadius: 5, backgroundColor: theme.surfaceStrong, overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', borderRadius: 5, backgroundColor: theme.primary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 11 },
  status: { flex: 1, color: theme.textSecondary, fontSize: 11, fontWeight: '700' },
  meta: { color: theme.textMuted, fontSize: 10, lineHeight: 15, marginTop: 5 },
  missing: { marginTop: 7 },
  missingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 2 },
  bullet: { color: theme.warning, fontSize: 12, lineHeight: 16 },
  next: { color: theme.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 8 },
  actions: { borderTopWidth: 1, borderTopColor: theme.border, marginTop: 10, paddingTop: 9, gap: 7 },
  actionText: { color: theme.accent, fontSize: 11, fontWeight: '700' },
}));
