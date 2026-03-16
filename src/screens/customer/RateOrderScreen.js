import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const TIP_OPTIONS = [0, 3, 5, 10];

export default function RateOrderScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [rating, setRating] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [loading, setLoading] = useState(false);

  const finalTip = customTip ? parseFloat(customTip) || 0 : tipAmount;

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({
        rating,
        tip_amount: finalTip,
      })
      .eq('id', orderId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Thanks!', 'Your rating has been submitted.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rate Your Washer</Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={[styles.star, star <= rating && styles.starActive]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Add a Tip</Text>
        <View style={styles.tipOptions}>
          {TIP_OPTIONS.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.tipButton,
                tipAmount === amount && !customTip && styles.tipButtonActive,
              ]}
              onPress={() => {
                setTipAmount(amount);
                setCustomTip('');
              }}
            >
              <Text
                style={[
                  styles.tipButtonText,
                  tipAmount === amount && !customTip && styles.tipButtonTextActive,
                ]}
              >
                {amount === 0 ? 'No Tip' : `$${amount}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.customTip}
          placeholder="Custom amount"
          placeholderTextColor={COLORS.gray}
          value={customTip}
          onChangeText={(text) => {
            setCustomTip(text);
            setTipAmount(0);
          }}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? 'Submitting...'
              : finalTip > 0
                ? `Submit with $${finalTip} Tip`
                : 'Submit Rating'}
          </Text>
        </TouchableOpacity>
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
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  star: {
    fontSize: 44,
    color: COLORS.grayLight,
  },
  starActive: {
    color: COLORS.warning,
  },
  label: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  tipOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tipButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    alignItems: 'center',
  },
  tipButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  tipButtonText: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    fontWeight: '500',
  },
  tipButtonTextActive: {
    color: COLORS.primary,
  },
  customTip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONTS.regular,
    color: COLORS.black,
    marginBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
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
