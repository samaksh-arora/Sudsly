import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/AuthContext';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function RoleSelectScreen({ route }) {
  const { updateProfile } = useAuth();
  const { fullName, phone } = route.params || {};

  async function selectRole(role) {
    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      role,
    });

    if (error) {
      Alert.alert('Error', error.message);
    }
    // Navigation happens automatically when profile updates
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How will you use Sudsly?</Text>
        <Text style={styles.subtitle}>You can always change this later</Text>

        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => selectRole('customer')}
          >
            <Text style={styles.cardEmoji}>👕</Text>
            <Text style={styles.cardTitle}>I need laundry done</Text>
            <Text style={styles.cardDescription}>
              Get your laundry picked up, washed, and delivered back to you
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => selectRole('washer')}
          >
            <Text style={styles.cardEmoji}>🧺</Text>
            <Text style={styles.cardTitle}>I want to wash laundry</Text>
            <Text style={styles.cardDescription}>
              Pick up, wash, and deliver laundry to earn money on your schedule
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  cards: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    lineHeight: 20,
  },
});
