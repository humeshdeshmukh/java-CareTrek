import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

interface State {
  hasError: boolean;
  error: Error | null;
  info: any;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error: Error, info: any) {
    this.setState({ hasError: true, error, info });
    try {
      console.error('ErrorBoundary caught error:', error, info);
    } catch (e) {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong.</Text>
          <Text style={styles.message}>{String(this.state.error)}</Text>
          <Button title="Reload JS" onPress={() => {
            // In dev, reload the app
            try {
              // @ts-ignore
              if (global && global.__DEV__ && typeof (global as any).reload === 'function') {
                // no-op
              }
            } catch (e) {}
          }} />
        </View>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  message: { marginBottom: 12 }
});
