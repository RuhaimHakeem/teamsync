import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>TEAMSYNC</Text>
      <Text style={styles.title}>Your team, in sync.</Text>
      <Text style={styles.description}>
        The mobile app is ready for the assessment features.
      </Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f5f7fb',
  },
  eyebrow: {
    marginBottom: 12,
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: '#172033',
    fontSize: 42,
    fontWeight: '700',
  },
  description: {
    marginTop: 16,
    color: '#5d6678',
    fontSize: 18,
    lineHeight: 28,
  },
});
