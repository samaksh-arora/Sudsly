import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const STATUS_LABELS = {
  pending: 'Finding Washer...',
  accepted: 'Washer Assigned',
  picked_up: 'Picked Up',
  washing: 'Washing',
  delivering: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function HomeScreen({ navigation }) {
  const { profile } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    const { data: active } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', profile.id)
      .not('status', 'in', '("delivered","cancelled")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: past } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', profile.id)
      .in('status', ['delivered', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(10);

    setActiveOrder(active);
    setPastOrders(past || []);
  }, [profile?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hi, {profile?.full_name?.split(' ')[0] || 'there'}
        </Text>
        <Text style={styles.address}>{profile?.address || 'Set your address'}</Text>
      </View>

      <TouchableOpacity
        style={styles.orderButton}
        onPress={() => navigation.navigate('NewOrder')}
      >
        <Text style={styles.orderButtonText}>Schedule Pickup</Text>
      </TouchableOpacity>

      {activeOrder && (
        <TouchableOpacity
          style={styles.activeOrder}
          onPress={() =>
            navigation.navigate('OrderTracking', { orderId: activeOrder.id })
          }
        >
          <Text style={styles.activeLabel}>Active Order</Text>
          <Text style={styles.activeStatus}>
            {STATUS_LABELS[activeOrder.status] || activeOrder.status}
          </Text>
          <Text style={styles.activeTap}>Tap to track</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Past Orders</Text>
      <FlatList
        data={pastOrders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View>
              <Text style={styles.orderBags}>{item.bag_count} bag(s)</Text>
              <Text style={styles.orderDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.orderPrice}>${item.total_price}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No past orders yet</Text>
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
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  greeting: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  address: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderButtonText: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.white,
  },
  activeOrder: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  activeLabel: {
    fontSize: FONTS.small,
    color: COLORS.gray,
  },
  activeStatus: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
    marginVertical: SPACING.xs,
  },
  activeTap: {
    fontSize: FONTS.small,
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderBags: {
    fontSize: FONTS.regular,
    fontWeight: '500',
    color: COLORS.black,
  },
  orderDate: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  orderPrice: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: SPACING.xl,
  },
});
