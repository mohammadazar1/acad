import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Player } from '../types'; // Assuming this type is defined elsewhere
import { exportPlayerReport } from '../utils/playerReport';

interface Props {
  player: Player;
}

const PlayerScreen: React.FC<Props> = ({ player }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>معلومات اللاعب</Text>
      {/* Display player information here */}
      <Text>اسم اللاعب: {player.name}</Text>
      <Text>رقم اللاعب: {player.number}</Text>
      {/* ... other player details ... */}

      <TouchableOpacity style={styles.button} onPress={() => exportPlayerReport(player)}>
        <Text style={styles.buttonText}>تصدير تقرير اللاعب</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default PlayerScreen;

