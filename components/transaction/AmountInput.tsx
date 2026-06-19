import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AmountInput({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#C8A000"
          maxLength={8}
        />
        <Text style={styles.unit}>円</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#A07800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 40,
    fontWeight: '800',
    color: '#3E2700',
    textAlign: 'right',
    paddingVertical: 0,
  },
  unit: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5D3A00',
    marginLeft: 8,
  },
});
