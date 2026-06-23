import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { colors, spacing, sharedStyles } from '../theme';

type LoginScreenProps = {
  isLoggingIn: boolean;
  error: string;
  onLogin: (email: string, password: string) => void;
};

export function LoginScreen({ isLoggingIn, error, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('member@teamsync.dev');
  const [password, setPassword] = useState('Password123!');

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={sharedStyles.eyebrow}>TEAMSYNC</Text>
            <Text style={sharedStyles.h1}>Mobile login</Text>
            <Text style={sharedStyles.bodyText}>Sign in to view tasks assigned to you.</Text>

            <View style={styles.form}>
              <View>
                <Text style={sharedStyles.label}>Email</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  style={sharedStyles.input}
                  value={email}
                />
              </View>

              <View>
                <Text style={sharedStyles.label}>Password</Text>
                <TextInput
                  onChangeText={setPassword}
                  secureTextEntry
                  style={sharedStyles.input}
                  value={password}
                />
              </View>

              {error ? <Text style={sharedStyles.errorText}>{error}</Text> : null}

              <AppButton
                disabled={isLoggingIn}
                label={isLoggingIn ? 'Signing in...' : 'Sign in'}
                onPress={() => onLogin(email, password)}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    padding: spacing.xl,
    gap: spacing.md,
  },
  form: {
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
});
