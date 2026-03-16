import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function EarningsScreen() {
  const { profile } = useAuth();
  const [completedOrders, setCompletedOrders] = useState([]);
  const [totals, setTotals] = useState({ today: 0, week: 0, allTime: 0 });

  useEffect(() => {
    fetchEarnings();
  }, []);

  async function fetchEarnings() {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('washer_id', profile.id)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });

    setCompletedOrders(orders || []);

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    let today = 0;
    let week = 0;
    let allTime = 0;

    (orders || []).forEach((order) => {
      // Washer gets 60% of order price + full tips
      const earning = order.total_price * 0.6 + (order.tip_amount || 0);
      const orderDate = new Date(order.created_at);

      allTime += earning;
      if (orderDate >= weekStart) week += earning;
      if (orderDate >= todayStart) today += earning;
    });

    setTotals({ today, week, allTime });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today</Text>
          <Text style={styles.summaryAmount}>${totals.today.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Week</Text>
          <Text style={styles.summaryAmount}>${totals.week.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>All Time</Text>
          <Text style={styles.summaryAmount}>${totals.allTime.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Completed Jobs</Text>
      <FlatList
        data={completedOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const earning = item.total_price * 0.6 + (item.tip_amount || 0);
          return (
            <View style={styles.jobCard}>
              <View>
                <Text style={styles.jobBags}>{item.bag_count} bag(s)</Text>
                <Text style={styles.jobDate}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.jobEarnings}>
                <Text style={styles.jobAmount}>${earning.toFixed(2)}</Text>
                {item.tip_amount > 0 && (
                  <Text style={styles.jobTip}>
                    +${item.tip_amount} tip
                  </Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No completed jobs yet</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.black,
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.secondary,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  jobBags: {
    fontSize: FONTS.regular,
    fontWeight: '500',
    color: COLORS.black,
  },
  jobDate: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  jobEarnings: {
    alignItems: 'flex-end',
  },
  jobAmount: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  jobTip: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: SPACING.xl,
  },
});
