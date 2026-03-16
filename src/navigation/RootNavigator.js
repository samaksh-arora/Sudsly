import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import WasherNavigator from './WasherNavigator';
import { COLORS } from '../constants/theme';

export default function RootNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Not logged in
  if (!user) {
    return <AuthNavigator />;
  }

  // Logged in but no role selected yet
  if (!profile?.role) {
    return <AuthNavigator />;
  }

  // Route based on role
  if (profile.role === 'washer') {
    return <WasherNavigator />;
  }

  return <CustomerNavigator />;
}
