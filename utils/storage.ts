import AsyncStorage from '@react-native-async-storage/async-storage';
import { Academy, Player } from '../types';

export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error storing data', e);
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error retrieving data', e);
  }
};

export const storeAcademy = async (academy: Academy) => {
  await storeData(`academy_${academy.id}`, academy);
};

export const getAcademy = async (id: number): Promise<Academy | null> => {
  return await getData(`academy_${id}`);
};

export const storePlayer = async (player: Player) => {
  await storeData(`player_${player.id}`, player);
};

export const getPlayer = async (id: number): Promise<Player | null> => {
  return await getData(`player_${id}`);
};

export const getAllPlayers = async (academyId: number): Promise<Player[]> => {
  const keys = await AsyncStorage.getAllKeys();
  const playerKeys = keys.filter(key => key.startsWith('player_'));
  const players = await Promise.all(playerKeys.map(key => getData(key)));
  return players.filter(player => player && player.academyId === academyId) as Player[];
};

