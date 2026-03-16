import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const PRICE_PER_BAG = 25;

export default function NewOrderScreen({ navigation }) {
  const { profile } = useAuth();
  const [bagCount, setBagCount] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPrice = bagCount * PRICE_PER_BAG;

  async function handleSubmit() {
    if (!profile?.address) {
      Alert.alert('Error', 'Please set your address in your profile first');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: profile.id,
        bag_count: bagCount,
        special_instructions: instructions || null,
        total_price: totalPrice,
        pickup_address: profile.address,
        status: 'pending',
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.replace('OrderTracking', { orderId: data.id });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>New Order</Text>

        <Text style={styles.label}>How many bags?</Text>
        <View style={styles.counter}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setBagCount(Math.max(1, bagCount - 1))}
          >
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{bagCount}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setBagCount(bagCount + 1)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Special Instructions</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., No bleach, separate darks, gentle cycle..."
          placeholderTextColor={COLORS.gray}
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Pickup Address</Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>
            {profile?.address || 'No address set'}
          </Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {bagCount} bag(s) x ${PRICE_PER_BAG}
            </Text>
            <Text style={styles.summaryValue}>${totalPrice}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Placing Order...' : `Confirm - $${totalPrice}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    alignSelf: 'center',
    marginVertical: SPACING.sm,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.black,
    minWidth: 40,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONTS.regular,
    color: COLORS.black,
    minHeight: 100,
  },
  addressBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 12,
    padding: SPACING.md,
  },
  addressText: {
    fontSize: FONTS.regular,
    color: COLORS.black,
  },
  summary: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: FONTS.regular,
    color: COLORS.black,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
  },
  totalValue: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.white,
  },
});
