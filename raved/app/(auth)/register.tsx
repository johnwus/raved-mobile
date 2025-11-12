import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { RegistrationSheet } from '../../components/sheets/RegistrationSheet';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <RegistrationSheet
        visible={true}
        onClose={() => router.replace('/(auth)/login')}
        asScreen
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});