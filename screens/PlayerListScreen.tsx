import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllPlayers, getData } from '../utils/storage';
import { Player, Academy } from '../types';

export default function PlayerListScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentAcademy, setCurrentAcademy] = useState<Academy | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const academy = await getData('currentAcademy');
      setCurrentAcademy(academy);

      if (academy) {
        const academyPlayers = await getAllPlayers(academy.id);
        setPlayers(academyPlayers);
      }
    };
    fetchData();
  }, []);

  const renderItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('PlayerDetails', { playerId: item.id })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.details}>{item.sport} - {item.subscription}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentAcademy ? currentAcademy.name : 'قائمة اللاعبين'}</Text>
      <FlatList
        data={players}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
});

