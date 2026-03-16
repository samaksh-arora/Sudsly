import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const JOB_STEPS = [
  {
    status: 'accepted',
    label: 'Navigate to Customer',
    action: 'Confirm Pickup',
    nextStatus: 'picked_up',
  },
  {
    status: 'picked_up',
    label: 'Head to Laundromat',
    action: 'Start Washing',
    nextStatus: 'washing',
  },
  {
    status: 'washing',
    label: 'Washing & Drying',
    action: 'Done — Deliver Now',
    nextStatus: 'delivering',
  },
  {
    status: 'delivering',
    label: 'Delivering to Customer',
    action: 'Confirm Delivery',
    nextStatus: 'delivered',
  },
];

export default function ActiveJobScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    setOrder(data);

    if (data?.customer_id) {
      const { data: customerData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', data.customer_id)
        .single();
      setCustomer(customerData);
    }
  }

  async function advanceStatus(nextStatus) {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (nextStatus === 'delivered') {
      Alert.alert('Job Complete!', 'Great work! Payment will be added to your earnings.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      fetchOrder();
    }
  }

  function openMaps() {
    if (!order?.pickup_address) return;
    const encoded = encodeURIComponent(order.pickup_address);
    Linking.openURL(`https://maps.apple.com/?daddr=${encoded}`);
  }

  function callCustomer() {
    if (!customer?.phone) return;
    Linking.openURL(`tel:${customer.phone}`);
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const currentStep = JOB_STEPS.find((s) => s.status === order.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Active Job</Text>

        <View style={styles.stepCard}>
          <Text style={styles.stepLabel}>{currentStep?.label}</Text>
          <View style={styles.progressBar}>
            {JOB_STEPS.map((step, index) => {
              const currentIndex = JOB_STEPS.findIndex(
                (s) => s.status === order.status
              );
              return (
                <View
                  key={step.status}
                  style={[
                    styles.progressSegment,
                    index <= currentIndex && styles.progressSegmentActive,
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.detailTitle}>Order Details</Text>
          <Text style={styles.detailText}>
            {order.bag_count} bag(s) - ${order.total_price}
          </Text>
          <Text style={styles.detailAddress}>{order.pickup_address}</Text>
          {order.special_instructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsLabel}>Special Instructions</Text>
              <Text style={styles.instructionsText}>
                {order.special_instructions}
              </Text>
            </View>
          )}
        </View>

        {customer && (
          <View style={styles.customerCard}>
            <View>
              <Text style={styles.customerLabel}>Customer</Text>
              <Text style={styles.customerName}>{customer.full_name}</Text>
            </View>
            <View style={styles.customerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={callCustomer}>
                <Text style={styles.iconButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={openMaps}>
                <Text style={styles.iconButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.spacer} />

        {currentStep && (
          <TouchableOpacity
            style={[styles.actionButton, loading && styles.actionButtonDisabled]}
            onPress={() => advanceStatus(currentStep.nextStatus)}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Updating...' : currentStep.action}
            </Text>
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
  stepCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  stepLabel: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.grayLight,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.secondary,
  },
  orderDetails: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  detailTitle: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.regular,
    color: COLORS.black,
  },
  detailAddress: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  instructionsBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  instructionsLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 2,
  },
  instructionsText: {
    fontSize: FONTS.small,
    color: COLORS.black,
    fontStyle: 'italic',
  },
  customerCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerLabel: {
    fontSize: FONTS.small,
    color: COLORS.gray,
  },
  customerName: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 2,
  },
  customerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  iconButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.small,
  },
  spacer: {
    flex: 1,
  },
  actionButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.white,
  },
});
