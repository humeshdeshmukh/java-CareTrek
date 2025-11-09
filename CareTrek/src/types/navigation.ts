// Define parameter types for each screen
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Health: undefined;
  Alerts: undefined;
  Profile: undefined;
};

// Combine all navigation types
export type AppNavigationProps = {
  navigation: any; // We'll replace 'any' with proper navigation type
  route: any; // We'll replace 'any' with proper route type
};
