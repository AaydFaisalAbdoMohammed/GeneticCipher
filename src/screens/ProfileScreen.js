import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [playerData, setPlayerData] = useState({
    level: 1, xp: 0, coins: 100, dna: '', streak: 0,
    tasksCompleted: 0, tasksFailed: 0, joinedAt: '',
  });
  const [achievements, setAchievements] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    const data = await AsyncStorage.getItem('genetic_player');
    if (data) setPlayerData(JSON.parse(data));

    const ach = await AsyncStorage.getItem('genetic_achievements');
    if (ach) setAchievements(JSON.parse(ach));
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: '🧬 متدرب وراثي', 5: '🔬 مساعد مختبر', 10: '⚗️ كيميائي جيني',
      15: '🧪 عالم أبحاث', 20: '🧬 مهندس وراثي', 25: '⚡ سيد الجينات',
      30: '🌟 أسطورة الوراثة', 40: '👑 إله الجينات', 50: '🔮 الكائن الأبدي',
    };
    const levels = Object.keys(titles).map(Number).sort((a, b) => b - a);
    for (const l of levels) if (level >= l) return titles[l];
    return titles[1];
  };

  const xpNeeded = playerData.level * 1000;
  const xpProgress = Math.min(100, (playerData.xp / xpNeeded) * 100);

  const allAchievements = [
    { id: 1, icon: '🔥', title: 'سلسلة 7 أيام', desc: 'العب 7 أيام متتالية', condition: (p) => p.streak >= 7 },
    { id: 2, icon: '🧬', title: 'أول طفرة', desc: 'أكمل 10 مهام', condition: (p) => p.tasksCompleted >= 10 },
    { id: 3, icon: '⚡', title: 'سريع البرق', desc: 'أكمل مهمة في أقل من دقيقة', condition: () => false },
    { id: 4, icon: '🏆', title: 'العبقري', desc: 'أكمل 50 مهمة', condition: (p) => p.tasksCompleted >= 50 },
    { id: 5, icon: '🌟', title: 'الأسطورة', desc: 'وصل للمستوى 30', condition: (p) => p.level >= 30 },
    { id: 6, icon: '💎', title: 'جامع الكنوز', desc: 'اجمع 10,000 عملة', condition: (p) => p.coins >= 10000 },
    { id: 7, icon: '🎯', title: 'القناص', desc: 'أكمل 100 مهمة بدون فشل', condition: (p) => p.tasksCompleted >= 100 && p.tasksFailed === 0 },
    { id: 8, icon: '👑', title: 'إله الجينات', desc: 'وصل للمستوى 50', condition: (p) => p.level >= 50 },
  ];

  return (
    <LinearGradient colors={['#0a0a0a', '#1a0a2e', '#0a1a3e']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الملف الوراثي</Text>
          <TouchableOpacity onPress={() => {
            Alert.alert('إعادة تعيين', 'هل تريد مسح جميع البيانات؟', [
              { text: 'إلغاء', style: 'cancel' },
              { text: 'مسح', style: 'destructive', onPress: async () => {
                await AsyncStorage.clear();
                navigation.replace('Splash');
              }}
            ]);
          }}>
            <Ionicons name="refresh" size={24} color="#ff4444" />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim }]}>
          <LinearGradient colors={['rgba(0,212,255,0.15)', 'rgba(123,44,191,0.05)']} style={styles.profileGradient}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={['#00d4ff', '#7b2cbf']} style={styles.avatarGradient}>
                <Ionicons name="person" size={40} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.playerTitle}>{getLevelTitle(playerData.level)}</Text>
            <Text style={styles.playerLevel}>المستوى {playerData.level}</Text>
            <View style={styles.xpContainer}>
              <View style={styles.xpBar}>
                <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
              </View>
              <Text style={styles.xpText}>{playerData.xp} / {xpNeeded} XP</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { icon: 'checkmark-circle', label: 'منجزة', value: playerData.tasksCompleted, color: '#00ff88' },
            { icon: 'close-circle', label: 'فاشلة', value: playerData.tasksFailed || 0, color: '#ff4444' },
            { icon: 'flame', label: 'السلسلة', value: playerData.streak, color: '#ff6b6b' },
            { icon: 'diamond', label: 'العملات', value: playerData.coins, color: '#FFD700' },
          ].map((stat, i) => (
            <View key={i} style={styles.statBox}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* DNA Info */}
        <View style={styles.dnaCard}>
          <View style={styles.dnaHeader}>
            <MaterialCommunityIcons name="fingerprint" size={22} color="#00d4ff" />
            <Text style={styles.dnaTitle}>بصمتك الوراثية</Text>
          </View>
          <Text style={styles.dnaValue}>{playerData.dna || 'غير متوفر'}</Text>
          <Text style={styles.dnaNote}>هذه البصمة فريدة لجهازك ولا يمكن نقلها أو تقليدها</Text>
        </View>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>🏆 الإنجازات</Text>
        <View style={styles.achievementsList}>
          {allAchievements.map((ach) => {
            const unlocked = ach.condition(playerData);
            return (
              <View key={ach.id} style={[styles.achievementCard, unlocked && styles.achievementUnlocked]}>
                <Text style={styles.achievementIcon}>{ach.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, unlocked && styles.achievementTitleUnlocked]}>{ach.title}</Text>
                  <Text style={styles.achievementDesc}>{ach.desc}</Text>
                </View>
                {unlocked && <Ionicons name="checkmark-circle" size={22} color="#00ff88" />}
              </View>
            );
          })}
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
  profileCard: {
    marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 15,
  },
  profileGradient: { padding: 25, alignItems: 'center' },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45, overflow: 'hidden', marginBottom: 15,
  },
  avatarGradient: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  playerTitle: { color: '#00d4ff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  playerLevel: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  xpContainer: { width: '100%' },
  xpBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#00d4ff', borderRadius: 3 },
  xpText: { color: '#666', fontSize: 11, textAlign: 'center', marginTop: 6 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginBottom: 15, gap: 10,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14,
    alignItems: 'center', flex: 1, minWidth: 70,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  statLabel: { color: '#888', fontSize: 11, marginTop: 4 },
  dnaCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18,
    marginHorizontal: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)',
  },
  dnaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dnaTitle: { color: '#00d4ff', fontSize: 15, fontWeight: 'bold', marginLeft: 10 },
  dnaValue: { color: '#888', fontSize: 12, fontFamily: 'monospace', marginBottom: 8 },
  dnaNote: { color: '#555', fontSize: 10, textAlign: 'center' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 12 },
  achievementsList: { paddingHorizontal: 20, paddingBottom: 20 },
  achievementCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14, padding: 14, marginBottom: 10, opacity: 0.5,
  },
  achievementUnlocked: {
    backgroundColor: 'rgba(0,255,136,0.08)', borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.2)', opacity: 1,
  },
  achievementIcon: { fontSize: 26, marginRight: 14 },
  achievementInfo: { flex: 1 },
  achievementTitle: { color: '#888', fontSize: 15, fontWeight: 'bold' },
  achievementTitleUnlocked: { color: '#00ff88' },
  achievementDesc: { color: '#666', fontSize: 12, marginTop: 3 },
});

export default ProfileScreen;
