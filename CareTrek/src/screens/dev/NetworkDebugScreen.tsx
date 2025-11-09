import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Text, useTheme, Card } from 'react-native-paper';
import Constants from 'expo-constants';
import { SUPABASE_URL as ENV_SUPABASE_URL } from '@env';

const NetworkDebugScreen: React.FC = () => {
  const theme = useTheme();
  const [logs, setLogs] = useState<string[]>([]);
  const add = (s: string) => setLogs((l) => [s, ...l]);

  const runTests = async () => {
    setLogs([]);
    add('Running network checks...');

    // 1) Basic internet test
    try {
      add('Fetching https://httpbin.org/get ...');
      const res = await fetch('https://httpbin.org/get');
      add(`httpbin status: ${res.status}`);
      const json = await res.json();
      add(`httpbin origin: ${json.origin || 'n/a'}`);
    } catch (err: any) {
      add(`httpbin fetch failed: ${String(err.message || err)}`);
    }

    // 2) Try Supabase URL from multiple sources
    const supabaseUrl = (ENV_SUPABASE_URL && ENV_SUPABASE_URL.length > 0)
      ? ENV_SUPABASE_URL
      : Constants.expoConfig?.extra?.supabaseUrl || (global as any).SUPABASE_URL || '';

    add(`Detected SUPABASE_URL: ${supabaseUrl ? supabaseUrl : '(none)'}`);

    if (supabaseUrl) {
      try {
        add(`Fetching ${supabaseUrl} ...`);
        const r2 = await fetch(supabaseUrl, { method: 'GET' });
        add(`supabase root status: ${r2.status}`);
        const text = await r2.text();
        add(`supabase root response (first 200 chars): ${text.slice(0,200).replace(/\n/g,' ')}...`);
      } catch (err: any) {
        add(`supabase fetch failed: ${String(err.message || err)}`);
      }
    } else {
      add('No SUPABASE_URL found in @env or Expo config extras.');
    }

    // 3) Test DNS by resolving example.com via fetch
    try {
      add('Fetching https://example.com/ ...');
      const r3 = await fetch('https://example.com/');
      add(`example.com status: ${r3.status}`);
    } catch (err: any) {
      add(`example.com fetch failed: ${String(err.message || err)}`);
    }

    add('Network checks complete.');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Card style={{ marginBottom: 12 }}>
        <Card.Title title="Network Debug" subtitle="Quick connectivity checks" />
        <Card.Content>
          <Button mode="contained" onPress={runTests}>Run network tests</Button>
        </Card.Content>
      </Card>

      {logs.map((l, i) => (
        <Card key={i} style={{ marginBottom: 8 }}>
          <Card.Content>
            <Text>{l}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

export default NetworkDebugScreen;
