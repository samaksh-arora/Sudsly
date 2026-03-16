import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.logo}>Sudsly</Text>
          <Text style={styles.tagline}>
            Laundry pickup & delivery{'\n'}at your doorstep
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? Sign In
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
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  tagline: {
    fontSize: FONTS.large,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
  },
  buttons: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.primary,
  },
  secondaryButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: FONTS.regular,
    color: COLORS.white,
    opacity: 0.9,
  },
});
