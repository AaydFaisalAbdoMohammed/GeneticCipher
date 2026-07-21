import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaderboardScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadLeaderboard();
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
  }, []);

  const loadLeaderboard = async () => {
    // Load current player
    const playerData = await AsyncStorage.getItem('genetic_player');
    const current = playerData ? JSON.parse(playerData) : null;
    setCurrentPlayer(current);

    // Generate mock leaderboard data + current player
    const mockPlayers = [
      { id: '1', name: 'GeneticMaster', level: 45, xp: 42000, tasks: 340, country: '🇸🇦' },
      { id: '2', name: 'DNALegend', level: 38, xp: 35000, tasks: 280, country: '🇦🇪' },
      { id: '3', name: 'CipherKing', level: 32, xp: 29000, tasks: 220, country: '🇰🇼' },
      { id: '4', name: 'MutationPro', level: 28, xp: 24000, tasks: 180, country: '🇶🇦' },
      { id: '5', name: 'EvolutionX', level: 25, xp: 21000, tasks: 150, country: '🇧🇭' },
      { id: '6', name: 'SequenceMaster', level: 22, xp: 18000, tasks: 130, country: '🇴🇲' },
      { id: '7', name: 'SynthesisGuru', level: 19, xp: 15000, tasks: 110, country: '🇪🇬' },
      { id: '8', name: 'DecodeNinja', level: 16, xp: 12000, tasks: 90, country: '🇯🇴' },
    ];

    if (current) {
      mockPlayers.push({
        id: 'you', name: 'أنت', level: current.level, xp: current.xp,
        tasks: current.tasksCompleted, country: '🏠', isYou: true,
      });
    }

    // Sort by XP
    mockPlayers.sort((a, b) => b.xp - a.xp);
    setPlayers(mockPlayers);
  };

  const getRankColor = (index) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#fff';
  };

  const getRankIcon = (index) => {
    if (index === 0) return '👑';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#1a0a2e', '#0a1a3e']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏆 المتصدرون</Text>
          <View style={{ width: 28 }} />
        </Animated.View>

        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
          {players.slice(0, 3).map((player, index) => (
            <Animated.View
              key={player.id}
              style={[
                styles.podiumItem,
                index === 0 && styles.podiumFirst,
                index === 1 && styles.podiumSecond,
                index === 2 && styles.podiumThird,
                { opacity: fadeAnim },
              ]}
            >
              <Text style={styles.podiumRank}>{getRankIcon(index)}</Text>
              <View style={[styles.podiumAvatar, { borderColor: getRankColor(index) }]}>
                <Text style={styles.podiumAvatarText}>{player.country}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{player.name}</Text>
              <Text style={[styles.podiumLevel, { color: getRankColor(index) }]}>
                Lv.{player.level}
              </Text>
              <Text style={styles.podiumXP}>{player.xp.toLocaleString()} XP</Text>
            </Animated.View>
          ))}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'week', label: 'هذا الأسبوع' },
            { id: 'month', label: 'هذا الشهر' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setTimeFilter(filter.id)}
              style={[styles.filterButton, timeFilter === filter.id && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, timeFilter === filter.id && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leaderboard List */}
        <View style={styles.listContainer}>
          {players.map((player, index) => (
            <Animated.View
              key={player.id}
              style={[
                styles.playerRow,
                player.isYou && styles.playerRowYou,
                { opacity: fadeAnim },
              ]}
            >
              <Text style={[styles.rankText, { color: getRankColor(index) }]}>
                {getRankIcon(index)}
              </Text>
              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, player.isYou && styles.playerNameYou]}>
                  {player.country} {player.name}
                </Text>
                <Text style={styles.playerMeta}>Lv.{player.level} • {player.tasks} مهمة</Text>
              </View>
              <View style={styles.playerXP}>
                <Text style={styles.xpValue}>{player.xp.toLocaleString()}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  podiumContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    paddingHorizontal: 20, marginBottom: 25, height: 200,
  },
  podiumItem: {
    alignItems: 'center', marginHorizontal: 8,
  },
  podiumFirst: {
    transform: [{ translateY: -20 }],
  },
  podiumSecond: {
    transform: [{ translateY: 10 }],
  },
  podiumThird: {
    transform: [{ translateY: 20 }],
  },
  podiumRank: { fontSize: 30, marginBottom: 5 },
  podiumAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, marginBottom: 8,
  },
  podiumAvatarText: { fontSize: 28 },
  podiumName: { color: '#fff', fontSize: 13, fontWeight: 'bold', maxWidth: 80, textAlign: 'center' },
  podiumLevel: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  podiumXP: { color: '#888', fontSize: 11, marginTop: 2 },
  filterContainer: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    paddingHorizontal: 20, marginBottom: 15,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(0,212,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)',
  },
  filterText: { color: '#888', fontSize: 13 },
  filterTextActive: { color: '#00d4ff', fontWeight: '600' },
  listContainer: { paddingHorizontal: 20 },
  playerRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14,
    padding: 14, marginBottom: 8,
  },
  playerRowYou: {
    backgroundColor: 'rgba(0,212,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
  },
  rankText: { fontSize: 18, fontWeight: 'bold', width: 40, textAlign: 'center' },
  playerInfo: { flex: 1, marginLeft: 10 },
  playerName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  playerNameYou: { color: '#00d4ff' },
  playerMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  playerXP: { alignItems: 'flex-end' },
  xpValue: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  xpLabel: { color: '#888', fontSize: 10 },
});

export default LeaderboardScreen;
