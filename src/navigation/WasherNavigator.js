import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WasherHomeScreen from '../screens/washer/WasherHomeScreen';
import ActiveJobScreen from '../screens/washer/ActiveJobScreen';
import EarningsScreen from '../screens/washer/EarningsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function WasherHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WasherHome" component={WasherHomeScreen} />
      <Stack.Screen name="ActiveJob" component={ActiveJobScreen} />
    </Stack.Navigator>
  );
}

export default function WasherNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { paddingBottom: 4, height: 56 },
      }}
    >
      <Tab.Screen
        name="Jobs"
        component={WasherHomeStack}
        options={{ tabBarLabel: 'Jobs' }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ tabBarLabel: 'Earnings' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
