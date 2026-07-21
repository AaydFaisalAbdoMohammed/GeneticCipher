import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Vibration, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const GameplayScreen = ({ route, navigation }) => {
  const { task, playerData: initialPlayerData } = route.params;

  const [timeLeft, setTimeLeft] = useState(task.timeLimit);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost, paused
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Game-specific state
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [codeFragments, setCodeFragments] = useState([]);
  const [selectedFragments, setSelectedFragments] = useState([]);
  const [mutationSequence, setMutationSequence] = useState([]);
  const [userMutation, setUserMutation] = useState([]);
  const [synthesisElements, setSynthesisElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [showSequence, setShowSequence] = useState(true);

  const timerRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeGame();
    startTimer();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initializeGame = () => {
    switch (task.type) {
      case 'DECODE':
        initDecodeGame();
        break;
      case 'SEQUENCE':
        initSequenceGame();
        break;
      case 'MUTATION':
        initMutationGame();
        break;
      case 'SYNTHESIS':
        initSynthesisGame();
        break;
      case 'EVOLUTION':
        initEvolutionGame();
        break;
      default:
        initDecodeGame();
    }
  };

  const initDecodeGame = () => {
    const bases = ['A', 'T', 'C', 'G'];
    const targetLength = 6 + Math.floor(task.difficulty / 15);
    const fragments = [];

    for (let i = 0; i < targetLength; i++) {
      fragments.push({
        id: i,
        value: bases[Math.floor(Math.random() * 4)],
        isSelected: false,
        position: i,
      });
    }

    // Shuffle for display
    const shuffled = [...fragments].sort(() => Math.random() - 0.5);
    setCodeFragments(shuffled);
    setSelectedFragments([]);
  };

  const initSequenceGame = () => {
    const seq = [];
    const length = 4 + Math.floor(task.difficulty / 20);

    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * 9) + 1);
    }

    setSequence(seq);
    setUserSequence([]);
    setShowSequence(true);

    // Hide sequence after delay based on difficulty
    const delay = Math.max(1500, 4000 - task.difficulty * 20);
    setTimeout(() => setShowSequence(false), delay);
  };

  const initMutationGame = () => {
    const bases = ['A', 'T', 'C', 'G'];
    const original = [];
    const mutated = [];
    const length = 5 + Math.floor(task.difficulty / 18);

    for (let i = 0; i < length; i++) {
      const base = bases[Math.floor(Math.random() * 4)];
      original.push(base);

      if (Math.random() < 0.35) {
        const otherBases = bases.filter(b => b !== base);
        mutated.push(otherBases[Math.floor(Math.random() * otherBases.length)]);
      } else {
        mutated.push(base);
      }
    }

    setMutationSequence(original);
    setUserMutation(mutated);
  };

  const initSynthesisGame = () => {
    const elements = ['🧬', '⚗️', '🔬', '💊', '🧪', '⚡', '🌟', '💎'];
    const targetLength = 5 + Math.floor(task.difficulty / 20);
    const items = [];

    for (let i = 0; i < targetLength; i++) {
      items.push({
        id: i,
        value: elements[Math.floor(Math.random() * elements.length)],
        isSelected: false,
      });
    }

    setSynthesisElements(items);
    setSelectedElements([]);
  };

  const initEvolutionGame = () => {
    // Evolution is similar to sequence but with patterns
    initSequenceGame();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleGameOver(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const ratio = timeLeft / task.timeLimit;
    if (ratio > 0.5) return '#00ff88';
    if (ratio > 0.25) return '#FFD700';
    return '#ff4444';
  };

  const handleShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    Vibration.vibrate(200);
  };

  const handleSuccess = () => {
    setGameState('won');
    if (timerRef.current) clearInterval(timerRef.current);

    Animated.timing(successAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Vibration.vibrate([0, 100, 50, 100, 50, 100]);
    saveResult(true);
  };

  const handleGameOver = (won) => {
    if (!won) {
      setGameState('lost');
      if (timerRef.current) clearInterval(timerRef.current);
      Vibration.vibrate([0, 300, 100, 300]);
      saveResult(false);
    }
  };

  const saveResult = async (won) => {
    try {
      const data = await AsyncStorage.getItem('genetic_player');
      const player = data ? JSON.parse(data) : initialPlayerData;

      if (won) {
        player.xp += task.xpReward;
        player.coins += task.coinReward;
        player.tasksCompleted += 1;
        player.tasksToday += 1;

        // Level up check
        while (player.xp >= player.level * 1000) {
          player.xp -= player.level * 1000;
          player.level += 1;
        }
      }

      player.lastPlayed = new Date().toISOString();
      await AsyncStorage.setItem('genetic_player', JSON.stringify(player));
    } catch (e) {
      console.error('Error saving result:', e);
    }
  };

  const useHint = () => {
    if (hintsUsed >= 3) {
      Alert.alert('نفذت التلميحات', 'لقد استخدمت جميع التلميحات المتاحة');
      return;
    }
    if (playerData.coins < 10) {
      Alert.alert('عملات غير كافية', 'تحتاج 10 عملات لكل تلميح');
      return;
    }

    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
  };

  // Game Handlers
  const handleFragmentPress = (fragment) => {
    if (gameState !== 'playing') return;

    const updated = codeFragments.map(f => 
      f.id === fragment.id ? { ...f, isSelected: !f.isSelected } : f
    );

    const selected = updated.filter(f => f.isSelected);
    setCodeFragments(updated);
    setSelectedFragments(selected);

    // Check if all selected in correct order
    if (selected.length === codeFragments.length) {
      // Check order - for decode, we just need all selected
      handleSuccess();
    }
  };

  const handleSequencePress = (number) => {
    if (gameState !== 'playing' || showSequence) return;

    const newSeq = [...userSequence, number];
    setUserSequence(newSeq);
    setAttempts(prev => prev + 1);

    if (newSeq.length === sequence.length) {
      const isCorrect = newSeq.every((num, i) => num === sequence[i]);
      if (isCorrect) {
        handleSuccess();
      } else {
        handleShake();
        setTimeout(() => {
          setUserSequence([]);
        }, 500);
      }
    }
  };

  const handleMutationPress = (index) => {
    if (gameState !== 'playing') return;

    const bases = ['A', 'T', 'C', 'G'];
    const currentBase = userMutation[index];
    const currentIndex = bases.indexOf(currentBase);
    const newBase = bases[(currentIndex + 1) % 4];

    const updated = [...userMutation];
    updated[index] = newBase;
    setUserMutation(updated);

    // Check if fixed
    if (updated.every((b, i) => b === mutationSequence[i])) {
      handleSuccess();
    }
  };

  const handleElementPress = (element) => {
    if (gameState !== 'playing') return;

    const updated = synthesisElements.map(e => 
      e.id === element.id ? { ...e, isSelected: !e.isSelected } : e
    );

    const selected = updated.filter(e => e.isSelected);
    setSynthesisElements(updated);
    setSelectedElements(selected);

    // For synthesis, select all to win
    if (selected.length === synthesisElements.length) {
      handleSuccess();
    }
  };

  const renderGameContent = () => {
    switch (task.type) {
      case 'DECODE':
        return renderDecodeGame();
      case 'SEQUENCE':
      case 'EVOLUTION':
        return renderSequenceGame();
      case 'MUTATION':
        return renderMutationGame();
      case 'SYNTHESIS':
        return renderSynthesisGame();
      default:
        return renderDecodeGame();
    }
  };

  const renderDecodeGame = () => (
    <View style={styles.gameArea}>
      <Text style={styles.gameInstruction}>
        اضغط على القواعد النيتروجينية بالترتيب الصحيح
      </Text>
      <Text style={styles.gameSubInstruction}>
        اختر جميع القواعد لإكمال الشفرة
      </Text>

      <View style={styles.fragmentsGrid}>
        {codeFragments.map((fragment) => (
          <TouchableOpacity
            key={fragment.id}
            onPress={() => handleFragmentPress(fragment)}
            style={[
              styles.fragmentCard,
              fragment.isSelected && styles.fragmentSelected,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.fragmentText,
              fragment.isSelected && styles.fragmentTextSelected,
            ]}>
              {fragment.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressArea}>
        <Text style={styles.progressText}>
          {selectedFragments.length} / {codeFragments.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${(selectedFragments.length / codeFragments.length) * 100}%` }
          ]} />
        </View>
      </View>
    </View>
  );

  const renderSequenceGame = () => (
    <View style={styles.gameArea}>
      <Text style={styles.gameInstruction}>
        {showSequence ? 'احفظ التسلسل!' : 'أعد كتابة التسلسل من الذاكرة'}
      </Text>

      {showSequence && (
        <View style={styles.sequenceDisplay}>
          {sequence.map((num, i) => (
            <View key={i} style={styles.sequenceNumber}>
              <Text style={styles.sequenceNumberText}>{num}</Text>
            </View>
          ))}
        </View>
      )}

      {!showSequence && (
        <>
          <View style={styles.sequenceInput}>
            {userSequence.map((num, i) => (
              <View key={i} style={styles.inputNumber}>
                <Text style={styles.inputNumberText}>{num}</Text>
              </View>
            ))}
            {Array.from({ length: sequence.length - userSequence.length }).map((_, i) => (
              <View key={`empty_${i}`} style={styles.inputNumberEmpty}>
                <Text style={styles.inputNumberEmptyText}>?</Text>
              </View>
            ))}
          </View>

          <View style={styles.numberPad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <TouchableOpacity
                key={num}
                onPress={() => handleSequencePress(num)}
                style={styles.numberButton}
                activeOpacity={0.7}
              >
                <Text style={styles.numberButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderMutationGame = () => (
    <View style={styles.gameArea}>
      <Text style={styles.gameInstruction}>
        اضغط على القواعد المُطَفَّرة لتصحيحها
      </Text>

      <View style={styles.mutationContainer}>
        <View style={styles.sequenceRow}>
          <Text style={styles.sequenceLabel}>الأصلي:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mutationSequence.map((base, i) => (
              <View key={i} style={styles.baseCellOriginal}>
                <Text style={styles.baseTextOriginal}>{base}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sequenceRow}>
          <Text style={styles.sequenceLabel}>التصحيح:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {userMutation.map((base, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleMutationPress(i)}
                style={[
                  styles.baseCell,
                  base !== mutationSequence[i] && styles.baseCellMutated,
                  base === mutationSequence[i] && styles.baseCellCorrect,
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.baseText,
                  base !== mutationSequence[i] && styles.baseTextMutated,
                  base === mutationSequence[i] && styles.baseTextCorrect,
                ]}>{base}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <Text style={styles.mutationHint}>
        القواعد الحمراء تحتاج تصحيح. اضغط عليها للتبديل.
      </Text>
    </View>
  );

  const renderSynthesisGame = () => (
    <View style={styles.gameArea}>
      <Text style={styles.gameInstruction}>
        اختر جميع العناصر للتوليف
      </Text>

      <View style={styles.elementsGrid}>
        {synthesisElements.map((element) => (
          <TouchableOpacity
            key={element.id}
            onPress={() => handleElementPress(element)}
            style={[
              styles.elementCard,
              element.isSelected && styles.elementSelected,
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.elementText}>{element.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressArea}>
        <Text style={styles.progressText}>
          {selectedElements.length} / {synthesisElements.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${(selectedElements.length / synthesisElements.length) * 100}%` }
          ]} />
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0a0a0a', '#1a0a2e', '#0a1a3e']} style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            navigation.goBack();
          }}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.timerBox}>
            <Ionicons name="time" size={18} color={getTimerColor()} />
            <Text style={[styles.timerText, { color: getTimerColor() }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          <TouchableOpacity onPress={useHint}>
            <View style={styles.hintButton}>
              <Ionicons name="bulb" size={20} color="#FFD700" />
              <Text style={styles.hintText}>{3 - hintsUsed}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.taskInfo}>
          <FontAwesome5 name={task.icon} size={24} color={task.color} />
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={[styles.difficultyBadge, { backgroundColor: task.color + '30' }]}>
            <Text style={[styles.difficultyText, { color: task.color }]}>{task.difficulty}%</Text>
          </View>
        </View>
      </Animated.View>

      {/* Hint Overlay */}
      {showHint && (
        <View style={styles.hintOverlay}>
          <LinearGradient colors={['rgba(255,215,0,0.9)', 'rgba(255,165,0,0.9)']} style={styles.hintBox}>
            <Ionicons name="bulb" size={30} color="#fff" />
            <Text style={styles.hintTitle}>تلميح!</Text>
            <Text style={styles.hintMessage}>
              {task.type === 'DECODE' ? 'اختر جميع القواعد بأي ترتيب' :
               task.type === 'SEQUENCE' ? 'ركز على الأرقام وحاول تذكر التسلسل' :
               task.type === 'MUTATION' ? 'اضغط على القواعد الحمراء حتى تصبح خضراء' :
               task.type === 'SYNTHESIS' ? 'اضغط على جميع العناصر' :
               'استخدم حدسك الوراثي!'}
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Game Area */}
      <Animated.View 
        style={[
          styles.gameContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateX: shakeAnim }]
          }
        ]}
      >
        {renderGameContent()}
      </Animated.View>

      {/* Game Over Overlay */}
      {gameState !== 'playing' && (
        <Animated.View style={[styles.overlay, { opacity: successAnim }]}>
          <LinearGradient
            colors={gameState === 'won' 
              ? ['rgba(0,255,136,0.95)', 'rgba(0,153,82,0.95)'] 
              : ['rgba(255,68,68,0.95)', 'rgba(153,41,41,0.95)']}
            style={styles.overlayContent}
          >
            <Ionicons 
              name={gameState === 'won' ? 'trophy' : 'skull'} 
              size={80} 
              color="#fff" 
            />
            <Text style={styles.overlayTitle}>
              {gameState === 'won' ? '🎉 نجاح وراثي!' : '💀 فشلت التجربة'}
            </Text>

            {gameState === 'won' && (
              <View style={styles.rewardsContainer}>
                <View style={styles.rewardItem}>
                  <Ionicons name="star" size={24} color="#FFD700" />
                  <Text style={styles.rewardValue}>+{task.xpReward} XP</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Ionicons name="diamond" size={24} color="#00d4ff" />
                  <Text style={styles.rewardValue}>+{task.coinReward}</Text>
                </View>
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>المحاولات</Text>
                <Text style={styles.statValue}>{attempts}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>التلميحات</Text>
                <Text style={styles.statValue}>{hintsUsed}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>الوقت المتبقي</Text>
                <Text style={styles.statValue}>{formatTime(timeLeft)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.homeButton}
              onPress={() => navigation.navigate('Home')}
            >
              <LinearGradient colors={['#fff', '#ddd']} style={styles.homeButtonGradient}>
                <Text style={styles.homeButtonText}>
                  {gameState === 'won' ? 'العودة للمختبر 🧬' : 'حاول مرة أخرى 💀'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
  },
  hintText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  difficultyBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  hintOverlay: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  hintBox: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  hintTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  hintMessage: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
  },
  gameInstruction: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameSubInstruction: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 25,
  },

  // Decode Game
  fragmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  fragmentCard: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fragmentSelected: {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(0,212,255,0.2)',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  fragmentText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  fragmentTextSelected: {
    color: '#00d4ff',
  },

  // Sequence Game
  sequenceDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  sequenceNumber: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(0,212,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  sequenceNumberText: {
    color: '#00d4ff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sequenceInput: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 25,
    flexWrap: 'wrap',
    minHeight: 60,
  },
  inputNumber: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: 'rgba(0,212,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  inputNumberText: {
    color: '#00d4ff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputNumberEmpty: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  inputNumberEmptyText: {
    color: '#555',
    fontSize: 20,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 320,
  },
  numberButton: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },

  // Mutation Game
  mutationContainer: {
    width: '100%',
    gap: 20,
  },
  sequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sequenceLabel: {
    color: '#888',
    fontSize: 13,
    width: 60,
  },
  baseCellOriginal: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: 'rgba(0,255,136,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  baseTextOriginal: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: 'bold',
  },
  baseCell: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  baseCellMutated: {
    backgroundColor: 'rgba(255,68,68,0.2)',
    borderColor: '#ff4444',
  },
  baseCellCorrect: {
    backgroundColor: 'rgba(0,255,136,0.2)',
    borderColor: '#00ff88',
  },
  baseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  baseTextMutated: {
    color: '#ff4444',
  },
  baseTextCorrect: {
    color: '#00ff88',
  },
  mutationHint: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },

  // Synthesis Game
  elementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  elementCard: {
    width: 85,
    height: 85,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  elementSelected: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0,255,136,0.2)',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  elementText: {
    fontSize: 40,
  },

  // Progress
  progressArea: {
    marginTop: 30,
    width: '80%',
    alignItems: 'center',
  },
  progressText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 4,
  },

  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    width: width * 0.85,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    gap: 8,
  },
  rewardValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 15,
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  homeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  homeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameplayScreen;
