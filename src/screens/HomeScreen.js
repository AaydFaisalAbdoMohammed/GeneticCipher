import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, RefreshControl, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const TASK_TYPES = [
  { id: 'DECODE', icon: 'key', label: 'فك الشفرة', color: '#FF6B6B', desc: 'فك الشفرات الوراثية المعقدة' },
  { id: 'SEQUENCE', icon: 'dna', label: 'التسلسل', color: '#4ECDC4', desc: 'رتب الجينات بالترتيب الصحيح' },
  { id: 'MUTATION', icon: 'radiation', label: 'الطفرة', color: '#FFE66D', desc: 'اكتشف وإصلح الطفرات' },
  { id: 'SYNTHESIS', icon: 'flask', label: 'التوليف', color: '#A8E6CF', desc: 'ولد مركبات وراثية جديدة' },
  { id: 'EVOLUTION', icon: 'chart-line', label: 'التطور', color: '#FF8B94', desc: 'وجه تطور الأنواع' },
];

const HomeScreen = ({ navigation }) => {
  const [playerData, setPlayerData] = useState({
    level: 1,
    xp: 0,
    coins: 100,
    dna: '',
    streak: 0,
    tasksCompleted: 0,
    tasksToday: 0,
  });
  const [dailyTasks, setDailyTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tasks');

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    loadPlayerData();
    generateDailyTasks();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadPlayerData = async () => {
    try {
      const data = await AsyncStorage.getItem('genetic_player');
      if (data) {
        setPlayerData(JSON.parse(data));
      } else {
        // Initialize new player
        const newPlayer = {
          level: 1,
          xp: 0,
          coins: 100,
          dna: generateDNA(),
          streak: 1,
          tasksCompleted: 0,
          tasksToday: 0,
          lastPlayed: new Date().toISOString(),
        };
        await AsyncStorage.setItem('genetic_player', JSON.stringify(newPlayer));
        setPlayerData(newPlayer);
      }
    } catch (e) {
      console.error('Error loading player data:', e);
    }
  };

  const generateDNA = () => {
    const chars = 'ATCG0123456789ABCDEF';
    let dna = '';
    for (let i = 0; i < 32; i++) {
      dna += chars[Math.floor(Math.random() * chars.length)];
    }
    return dna;
  };

  const generateDailyTasks = () => {
    const tasks = [];
    const now = new Date();
    const seed = now.getDate() + now.getMonth() * 31 + now.getFullYear() * 365;

    for (let i = 0; i < 5; i++) {
      const typeIndex = (seed + i * 7) % TASK_TYPES.length;
      const difficulty = Math.min(100, 20 + (playerData.level * 5) + Math.floor(Math.random() * 30));

      tasks.push({
        id: `task_${seed}_${i}`,
        type: TASK_TYPES[typeIndex].id,
        title: `${TASK_TYPES[typeIndex].label} #${i + 1}`,
        description: TASK_TYPES[typeIndex].desc,
        color: TASK_TYPES[typeIndex].color,
        icon: TASK_TYPES[typeIndex].icon,
        difficulty,
        xpReward: Math.floor(difficulty * 1.5),
        coinReward: Math.floor(difficulty * 0.3),
        timeLimit: 180 + Math.floor(Math.random() * 300),
        completed: false,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    setDailyTasks(tasks);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPlayerData();
    generateDailyTasks();
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleTaskPress = (task) => {
    if (task.completed) {
      Alert.alert('تم الإنجاز', 'لقد أكملت هذه المهمة بالفعل!');
      return;
    }
    navigation.navigate('Gameplay', { task, playerData });
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: 'متدرب وراثي', 5: 'مساعد مختبر', 10: 'كيميائي جيني',
      15: 'عالم أبحاث', 20: 'مهندس وراثي', 25: 'سيد الجينات',
      30: 'أسطورة الوراثة', 40: 'إله الجينات', 50: 'الكائن الأبدي',
    };
    const levels = Object.keys(titles).map(Number).sort((a, b) => b - a);
    for (const l of levels) {
      if (level >= l) return titles[l];
    }
    return 'متدرب وراثي';
  };

  const xpNeeded = playerData.level * 1000;
  const xpProgress = Math.min(100, (playerData.xp / xpNeeded) * 100);

  return (
    <LinearGradient colors={['#0a0a0a', '#1a0a2e', '#0a1a3e']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={styles.avatarContainer}>
                <LinearGradient colors={['#00d4ff', '#7b2cbf']} style={styles.avatarGradient}>
                  <Ionicons name="person" size={24} color="#fff" />
                </LinearGradient>
              </View>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.levelTitle}>{getLevelTitle(playerData.level)}</Text>
              <Text style={styles.levelText}>المستوى {playerData.level}</Text>
            </View>

            <View style={styles.coinsContainer}>
              <Ionicons name="diamond" size={20} color="#FFD700" />
              <Text style={styles.coinsText}>{playerData.coins}</Text>
            </View>
          </View>

          {/* XP Bar */}
          <View style={styles.xpContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.xpText}>{playerData.xp} / {xpNeeded} XP</Text>
          </View>
        </Animated.View>

        {/* DNA Card */}
        <Animated.View style={[styles.dnaCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={['rgba(0,212,255,0.15)', 'rgba(123,44,191,0.05)']} style={styles.dnaGradient}>
            <View style={styles.dnaHeader}>
              <MaterialCommunityIcons name="fingerprint" size={24} color="#00d4ff" />
              <Text style={styles.dnaTitle}>بصمتك الوراثية</Text>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color="#ff6b6b" />
                <Text style={styles.streakText}>{playerData.streak}</Text>
              </View>
            </View>
            <Text style={styles.dnaValue}>{playerData.dna || 'جاري التوليد...'}</Text>
            <Text style={styles.dnaNote}>هذه البصمة فريدة لجهازك ولا يمكن نقلها</Text>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {[
            { icon: 'checkmark-circle', label: 'منجزة', value: playerData.tasksCompleted, color: '#00ff88' },
            { icon: 'calendar', label: 'اليوم', value: playerData.tasksToday, color: '#00d4ff' },
            { icon: 'trophy', label: 'السلسلة', value: playerData.streak, color: '#FFD700' },
          ].map((stat, index) => (
            <View key={index} style={styles.statBox}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {[
            { id: 'tasks', label: 'المهام اليومية', icon: 'list' },
            { id: 'leaderboard', label: 'المتصدرون', icon: 'trophy' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                setSelectedTab(tab.id);
                if (tab.id === 'leaderboard') navigation.navigate('Leaderboard');
              }}
              style={[styles.tabButton, selectedTab === tab.id && styles.tabButtonActive]}
            >
              <Ionicons name={tab.icon} size={16} color={selectedTab === tab.id ? '#00d4ff' : '#666'} />
              <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks List */}
        <Text style={styles.sectionTitle}>مهامك الوراثية اليوم</Text>

        {dailyTasks.map((task, index) => (
          <Animated.View
            key={task.id}
            style={[
              styles.taskCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 30],
                    outputRange: [0, 30 + index * 10],
                  })
                }],
              },
            ]}
          >
            <TouchableOpacity onPress={() => handleTaskPress(task)} activeOpacity={0.8}>
              <LinearGradient
                colors={[task.color + '30', task.color + '10']}
                style={[styles.taskGradient, task.completed && styles.taskCompleted]}
              >
                <View style={styles.taskHeader}>
                  <View style={[styles.taskIconContainer, { backgroundColor: task.color + '40' }]}>
                    <FontAwesome5 name={task.icon} size={22} color={task.color} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text>
                  </View>
                  {task.completed ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark" size={18} color="#00ff88" />
                    </View>
                  ) : (
                    <View style={[styles.difficultyBadge, { backgroundColor: task.color + '30' }]}>
                      <Text style={[styles.difficultyText, { color: task.color }]}>{task.difficulty}%</Text>
                    </View>
                  )}
                </View>

                <View style={styles.taskFooter}>
                  <View style={styles.rewardTag}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rewardText}>+{task.xpReward} XP</Text>
                  </View>
                  <View style={styles.rewardTag}>
                    <Ionicons name="diamond" size={14} color="#00d4ff" />
                    <Text style={styles.rewardText}>+{task.coinReward}</Text>
                  </View>
                  <View style={styles.rewardTag}>
                    <Ionicons name="time" size={14} color="#888" />
                    <Text style={styles.rewardText}>{Math.floor(task.timeLimit / 60)}د</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Bottom Spacer */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  levelTitle: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '600',
  },
  levelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  xpContainer: {
    width: '100%',
  },
  xpBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 3,
  },
  xpText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
  dnaCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  dnaGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
  },
  dnaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dnaTitle: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  streakText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dnaValue: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  dnaNote: {
    color: '#555',
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: width * 0.28,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0,212,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  tabText: {
    color: '#666',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 12,
    textAlign: 'right',
  },
  taskCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskGradient: {
    padding: 16,
    borderRadius: 16,
  },
  taskCompleted: {
    opacity: 0.5,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskDesc: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  difficultyBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,136,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  rewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rewardText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 4,
  },
});

export default HomeScreen;
