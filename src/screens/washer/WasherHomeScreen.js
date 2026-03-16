import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function WasherHomeScreen({ navigation }) {
  const { profile, updateProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(profile?.is_online || false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(0);

  const fetchData = useCallback(async () => {
    // Fetch active job
    const { data: active } = await supabase
      .from('orders')
      .select('*')
      .eq('washer_id', profile.id)
      .not('status', 'in', '("delivered","cancelled")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveJob(active);

    // Fetch available jobs (pending orders with no washer)
    if (!active) {
      const { data: jobs } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .is('washer_id', null)
        .order('created_at', { ascending: true });

      setAvailableJobs(jobs || []);
    }

    // Fetch today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: earnings } = await supabase
      .from('orders')
      .select('total_price, tip_amount')
      .eq('washer_id', profile.id)
      .eq('status', 'delivered')
      .gte('created_at', today.toISOString());

    const total = (earnings || []).reduce(
      (sum, order) => sum + (order.total_price * 0.6) + (order.tip_amount || 0),
      0
    );
    setTodayEarnings(total);
  }, [profile?.id]);

  useEffect(() => {
    fetchData();

    // Subscribe to new pending orders
    const subscription = supabase
      .channel('pending-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: 'status=eq.pending' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchData]);

  async function toggleOnline(value) {
    setIsOnline(value);
    await updateProfile({ is_online: value });
  }

  async function acceptJob(orderId) {
    const { error } = await supabase
      .from('orders')
      .update({ washer_id: profile.id, status: 'accepted' })
      .eq('id', orderId)
      .eq('status', 'pending');

    if (error) {
      Alert.alert('Error', 'This job may have been taken by another Washer');
    }
    fetchData();
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hi, {profile?.full_name?.split(' ')[0] || 'Washer'}
          </Text>
          <Text style={styles.earnings}>Today: ${todayEarnings.toFixed(2)}</Text>
        </View>
        <View style={styles.onlineToggle}>
          <Text style={[styles.onlineText, isOnline && styles.onlineTextActive]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ false: COLORS.grayLight, true: COLORS.secondary }}
          />
        </View>
      </View>

      {activeJob ? (
        <TouchableOpacity
          style={styles.activeJob}
          onPress={() =>
            navigation.navigate('ActiveJob', { orderId: activeJob.id })
          }
        >
          <Text style={styles.activeLabel}>Active Job</Text>
          <Text style={styles.activeAddress}>{activeJob.pickup_address}</Text>
          <Text style={styles.activeBags}>
            {activeJob.bag_count} bag(s) - ${activeJob.total_price}
          </Text>
          <Text style={styles.activeTap}>Tap to continue</Text>
        </TouchableOpacity>
      ) : isOnline ? (
        <>
          <Text style={styles.sectionTitle}>Available Jobs</Text>
          <FlatList
            data={availableJobs}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.jobCard}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobAddress}>{item.pickup_address}</Text>
                  <Text style={styles.jobDetails}>
                    {item.bag_count} bag(s) - ${item.total_price}
                  </Text>
                  {item.special_instructions && (
                    <Text style={styles.jobInstructions}>
                      "{item.special_instructions}"
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => acceptJob(item.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No jobs available right now</Text>
            }
          />
        </>
      ) : (
        <View style={styles.offlineMessage}>
          <Text style={styles.offlineText}>
            Go online to see available jobs
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  greeting: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  earnings: {
    fontSize: FONTS.regular,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  onlineText: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
    fontWeight: '500',
  },
  onlineTextActive: {
    color: COLORS.secondary,
  },
  activeJob: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  activeLabel: {
    fontSize: FONTS.small,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  activeAddress: {
    fontSize: FONTS.regular,
    fontWeight: '500',
    color: COLORS.black,
    marginTop: SPACING.xs,
  },
  activeBags: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  activeTap: {
    fontSize: FONTS.small,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  jobCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  jobInfo: {
    flex: 1,
  },
  jobAddress: {
    fontSize: FONTS.regular,
    fontWeight: '500',
    color: COLORS.black,
  },
  jobDetails: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  jobInstructions: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: 4,
  },
  acceptButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.small,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: SPACING.xl,
  },
  offlineMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineText: {
    fontSize: FONTS.large,
    color: COLORS.gray,
  },
});
