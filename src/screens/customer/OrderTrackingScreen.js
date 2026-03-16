import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const STATUSES = [
  { key: 'pending', label: 'Finding Washer', description: 'Looking for an available Washer near you' },
  { key: 'accepted', label: 'Washer Assigned', description: 'Your Washer is on the way to pick up' },
  { key: 'picked_up', label: 'Picked Up', description: 'Your laundry has been picked up' },
  { key: 'washing', label: 'Washing', description: 'Your laundry is being washed and dried' },
  { key: 'delivering', label: 'Out for Delivery', description: 'Your clean laundry is on the way back' },
  { key: 'delivered', label: 'Delivered', description: 'Your laundry has been delivered' },
];

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [washer, setWasher] = useState(null);

  useEffect(() => {
    fetchOrder();

    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => setOrder(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orderId]);

  async function fetchOrder() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    setOrder(data);

    if (data?.washer_id) {
      const { data: washerData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', data.washer_id)
        .single();
      setWasher(washerData);
    }
  }

  async function cancelOrder() {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel?', [
      { text: 'No' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const currentIndex = STATUSES.findIndex((s) => s.key === order.status);
  const isComplete = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Order Tracking</Text>

        {isCancelled ? (
          <View style={styles.cancelledBox}>
            <Text style={styles.cancelledText}>Order Cancelled</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {STATUSES.map((status, index) => {
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              return (
                <View key={status.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.dot,
                        isActive && styles.dotActive,
                        isCurrent && styles.dotCurrent,
                      ]}
                    />
                    {index < STATUSES.length - 1 && (
                      <View
                        style={[styles.line, isActive && styles.lineActive]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text
                      style={[
                        styles.statusLabel,
                        isActive && styles.statusLabelActive,
                      ]}
                    >
                      {status.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.statusDescription}>
                        {status.description}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {washer && !isCancelled && (
          <View style={styles.washerCard}>
            <Text style={styles.washerLabel}>Your Washer</Text>
            <Text style={styles.washerName}>{washer.full_name}</Text>
          </View>
        )}

        <View style={styles.orderInfo}>
          <Text style={styles.infoLabel}>
            {order.bag_count} bag(s) - ${order.total_price}
          </Text>
          {order.special_instructions && (
            <Text style={styles.instructions}>
              "{order.special_instructions}"
            </Text>
          )}
        </View>

        {order.status === 'pending' && (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelOrder}>
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        {isComplete && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() =>
              navigation.navigate('RateOrder', { orderId: order.id })
            }
          >
            <Text style={styles.rateButtonText}>Rate & Tip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  loading: {
    textAlign: 'center',
    marginTop: SPACING.xl,
    color: COLORS.gray,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  timeline: {
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.grayLight,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dotCurrent: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.grayLight,
  },
  lineActive: {
    backgroundColor: COLORS.primary,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  statusLabel: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
  },
  statusLabelActive: {
    color: COLORS.black,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  cancelledBox: {
    backgroundColor: COLORS.danger + '15',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  cancelledText: {
    color: COLORS.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
  washerCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  washerLabel: {
    fontSize: FONTS.small,
    color: COLORS.gray,
  },
  washerName: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 2,
  },
  orderInfo: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  infoLabel: {
    fontSize: FONTS.regular,
    fontWeight: '500',
    color: COLORS.black,
  },
  instructions: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  cancelButtonText: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.danger,
  },
  rateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.white,
  },
});
