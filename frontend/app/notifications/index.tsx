import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Icon, AppIconName } from '../../src/components/Icon';
import { useNotifications } from '../../src/context/NotificationContext';
import { AppNotification, NotificationType } from '../../src/types/notifications';
import { colors, createThemedStyles } from '../../src/theme';

type Filter = 'All' | 'Unread' | 'Scholarships' | 'Documents' | 'JAGO';
const filters: Filter[] = ['All', 'Unread', 'Scholarships', 'Documents', 'JAGO'];

const notificationIcons: Record<NotificationType, AppIconName> = {
  deadline: 'calendar-days',
  application: 'clipboard-check',
  pending: 'clock-3',
  document: 'document-text-outline',
  verification: 'badge-check',
  scholarship: 'graduation-cap',
  dbt: 'landmark',
  jago: 'bot-outline',
  system: 'information-circle-outline',
  warning: 'triangle-alert',
  error: 'circle-alert',
};

function matchesFilter(item: AppNotification, filter: Filter) {
  if (filter === 'All') return true;
  if (filter === 'Unread') return item.unread;
  if (filter === 'Scholarships') return ['deadline', 'application', 'scholarship', 'dbt'].includes(item.type);
  if (filter === 'Documents') return ['document', 'verification', 'pending'].includes(item.type);
  return item.type === 'jago';
}

function NotificationItem({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.unread ? 'Unread. ' : 'Read. '}${item.title}. ${item.message}`} onPress={onPress}>
      <Card style={{ ...styles.notificationCard, ...(item.unread ? styles.unreadCard : {}) }}>
        <View style={styles.notificationRow}>
          <View style={styles.iconContainer}><Icon name={notificationIcons[item.type]} size={21} color={colors.accent}/></View>
          <View style={styles.notificationContent}>
            <View style={styles.titleLine}>
              <Text style={[styles.notificationTitle, !item.unread && styles.readTitle]}>{item.title}</Text>
              {item.unread ? <View style={styles.unreadLabel}><View style={styles.unreadDot}/><Text style={styles.unreadText}>Unread</Text></View> : null}
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <View style={styles.metaLine}><Text style={styles.time}>{item.time}</Text>{item.destination ? <Text style={styles.actionHint}>Tap to view</Text> : null}</View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { notifications, unreadCount, loading, error, reload, markRead, markAllRead } = useNotifications();
  const [selectedFilter, setSelectedFilter] = useState<Filter>('All');
  const filteredNotifications = useMemo(() => notifications.filter(item => matchesFilter(item, selectedFilter)), [notifications, selectedFilter]);

  const openNotification = (item: AppNotification) => {
    markRead(item.id);
    if (item.destination) router.push(item.destination as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.textSecondary}/>
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer}/>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <View><Text style={styles.summaryTitle}>Your updates</Text><Text style={styles.summarySubtitle}>{unreadCount} unread · Demo notifications</Text></View>
          {unreadCount > 0 ? <Pressable accessibilityRole="button" accessibilityLabel="Mark all notifications as read" onPress={markAllRead} hitSlop={8}><Text style={styles.markAll}>Mark all as read</Text></Pressable> : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map(filter => {
            const active = filter === selectedFilter;
            return <Pressable key={filter} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setSelectedFilter(filter)} style={[styles.filterChip, active ? styles.activeFilter : styles.inactiveFilter]}><Text style={[styles.filterText, active ? styles.activeFilterText : styles.inactiveFilterText]}>{filter}</Text></Pressable>;
          })}
        </ScrollView>

        {loading ? <View style={styles.stateBox}><ActivityIndicator color={colors.accent}/><Text style={styles.stateDescription}>Loading notifications…</Text></View> : null}
        {!loading && error ? <View style={styles.stateBox}><Icon name="circle-alert" size={34} color={colors.error}/><Text style={styles.stateTitle}>Unable to load notifications</Text><Text style={styles.stateDescription}>Please try again.</Text><Pressable accessibilityRole="button" onPress={() => void reload()} style={styles.retryButton}><Text style={styles.retryText}>Retry</Text></Pressable></View> : null}
        {!loading && !error && filteredNotifications.length > 0 ? filteredNotifications.map(item => <NotificationItem key={item.id} item={item} onPress={() => openNotification(item)}/>) : null}
        {!loading && !error && notifications.length === 0 ? <View style={styles.stateBox}><View style={styles.emptyIcon}><Icon name="notifications-outline" size={30} color={colors.accent}/></View><Text style={styles.stateTitle}>No notifications yet</Text><Text style={styles.stateDescription}>Important scholarship, document, application and JAGO updates will appear here.</Text></View> : null}
        {!loading && !error && notifications.length > 0 && filteredNotifications.length === 0 ? <View style={styles.stateBox}><View style={styles.emptyIcon}><Icon name="notifications-outline" size={30} color={colors.accent}/></View><Text style={styles.stateTitle}>No notifications in this filter</Text><Text style={styles.stateDescription}>Choose another filter to see more updates.</Text></View> : null}
        {!loading && !error && notifications.length > 0 ? <Text style={styles.demoNote}>Sample content for this prototype. Updates are not connected to government services.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = createThemedStyles((theme) => ({
  safeArea: { flex: 1, backgroundColor: theme.background },
  header: { minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: theme.border },
  backButton: { width: 38, height: 42, justifyContent: 'center' },
  headerTitle: { flex: 1, color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginLeft: 7 },
  headerSpacer: { width: 38 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 19, paddingBottom: 30 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '700' },
  summarySubtitle: { color: theme.textMuted, fontSize: 12, marginTop: 4 },
  markAll: { color: theme.accent, fontSize: 12, fontWeight: '700' },
  filters: { gap: 8, paddingBottom: 16 },
  filterChip: { minHeight: 34, paddingHorizontal: 14, borderRadius: 18, justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  activeFilter: { backgroundColor: theme.primary, borderColor: theme.primary },
  inactiveFilter: { backgroundColor: theme.surfaceStrong },
  filterText: { fontSize: 12, fontWeight: '600' },
  activeFilterText: { color: theme.textPrimary },
  inactiveFilterText: { color: theme.textSecondary },
  notificationCard: { padding: 13, marginBottom: 10 },
  unreadCard: { backgroundColor: theme.surfaceStrong },
  notificationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconContainer: { width: 42, height: 42, borderRadius: 12, backgroundColor: theme.surfaceStrong, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
  notificationContent: { flex: 1, minWidth: 0 },
  titleLine: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  notificationTitle: { flex: 1, color: theme.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  readTitle: { color: theme.textSecondary },
  unreadLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.primary },
  unreadText: { color: theme.accent, fontSize: 10, fontWeight: '600' },
  message: { color: theme.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5 },
  metaLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 },
  time: { color: theme.textMuted, fontSize: 11 },
  actionHint: { color: theme.accent, fontSize: 11, fontWeight: '600' },
  stateBox: { alignItems: 'center', paddingHorizontal: 18, paddingVertical: 42 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: theme.surfaceStrong, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  stateTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  stateDescription: { color: theme.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  retryButton: { backgroundColor: theme.primary, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12, marginTop: 16 },
  retryText: { color: theme.textPrimary, fontWeight: '700', fontSize: 13 },
  demoNote: { color: theme.textMuted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 6 },
}));
