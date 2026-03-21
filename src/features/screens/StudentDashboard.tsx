import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Image, ActivityIndicator } from 'react-native';
import { BarChart3, Play, Trophy, Map, Flame, Gift } from 'lucide-react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, StudentTabParamList } from '../routes';

// FIREBASE
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

type DashboardNavProp = CompositeNavigationProp<
  MaterialTopTabNavigationProp<StudentTabParamList, 'StudentDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function StudentDashboard() {
  const navigation = useNavigation<DashboardNavProp>();

  // STANY DANYCH
  const [studentName, setStudentName] = useState<string>('Uczeń');
  const [streak, setStreak] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ANIMACJE
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateX = useRef(new Animated.Value(-20)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Odpalenie animacji bazowych
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(headerTranslateX, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.spring(avatarScale, { toValue: 1, delay: 200, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // POBIERANIE DANYCH Z FIREBASE
    const fetchStudentData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Pobieramy dane z kolekcji 'students'
        const studentDoc = await getDoc(doc(db, 'students', currentUser.uid));

        if (studentDoc.exists()) {
          const data = studentDoc.data();

          // Pobieranie Imienia (wyciągamy pierwsze słowo, by było to miłe powitanie, np. "Cześć, Jakub!")
          if (data.name) {
            const firstName = data.name.split(' ')[0];
            setStudentName(firstName);
          } else {
            setStudentName(currentUser.email?.split('@')[0] || 'Uczeń');
          }

          // Inne dane
          setStreak(data.currentStreak || 0);
          setAvatarUrl(data.avatar || null);

          // Formatowanie ostatnich wyników, jeśli jakieś są wpisane
          if (data.testResults && data.testResults.length > 0) {
            // Zakładamy strukturę: [{date, category, result, trend}] 
            // Ponieważ nie mamy pewności jak wyglądają logi, symulujemy wyświetlanie w oparciu o najnowsze testy
            const formattedTests = data.testResults.slice(0, 3).map((test: any) => {
              // Fallback formatowania dla starego skryptu Seed
              if (test.sprint) {
                return { date: new Date(test.date).toLocaleDateString('pl-PL'), test: 'Bieg', result: `${test.sprint}s`, trend: '+0.2s' };
              }
              return { date: test.date || 'Ostatnio', test: test.category || 'Test sprawnościowy', result: test.result || 'Brak', trend: test.trend || '' };
            });
            setRecentActivity(formattedTests);
          }
        }
      } catch (error) {
        console.error("Błąd pobierania danych ucznia: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const navCards = [
    { icon: BarChart3, label: 'Mój Profil', path: 'StudentProfile' as const, emoji: '📊' },
    { icon: Play, label: 'Nowy Test', path: 'TestForm' as const, emoji: '🏃' },
    { icon: Trophy, label: 'Ranking', path: 'RankingScreen' as const, emoji: '🏆' },
    { icon: Map, label: 'Mapa Talentów', path: 'StreakScreen' as const, emoji: '🗺' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={{ opacity: headerOpacity, transform: [{ translateX: headerTranslateX }] }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.neonGreen} style={{ alignSelf: 'flex-start' }} />
            ) : (
              <Text style={styles.headerTitle}>Cześć, {studentName}! 👋</Text>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.avatar,
              {
                transform: [{ scale: avatarScale }],
                shadowColor: Colors.neonGreen,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 6,
              },
            ]}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
            ) : (
              <Text style={styles.avatarText}>👤</Text>
            )}
          </Animated.View>
        </View>

        {/* Streak Card */}
        <View style={styles.section}>
          <NeonCard glow onClick={() => navigation.navigate('StreakScreen')}>
            <View style={styles.streakRow}>
              <View style={styles.streakLeft}>
                <Animated.View style={{ transform: [{ scale: flameScale }] }}>
                  <NeonIcon Icon={Flame} size={48} color={Colors.orange} glow />
                </Animated.View>
                <View>
                  <Text style={styles.streakNumber}>{streak}</Text>
                  <Text style={styles.streakLabel}>{streak === 1 ? 'dzień z rzędu' : 'dni z rzędu'}</Text>
                  {streak > 0 ? (
                    <Text style={styles.streakSub}>Nie przerywaj! Kolejny trening przed tobą</Text>
                  ) : (
                    <Text style={styles.streakSub}>Czas zacząć dobrą passę!</Text>
                  )}
                </View>
              </View>
            </View>
          </NeonCard>
        </View>

        {/* Navigation Grid */}
        <View style={styles.section}>
          <View style={styles.navGrid}>
            {navCards.map((card) => (
              <View key={card.label} style={styles.navGridItem}>
                <NeonCard onClick={() => navigation.navigate(card.path)}>
                  <View style={styles.navCardContent}>
                    <Text style={styles.navEmoji}>{card.emoji}</Text>
                    <Text style={styles.navLabel}>{card.label}</Text>
                  </View>
                </NeonCard>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ostatnia aktywność</Text>
          <View style={styles.activityList}>
            {recentActivity.length === 0 ? (
              <NeonCard>
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ color: Colors.gray, fontSize: FontSize.sm }}>Jeszcze nie dodałeś żadnego testu.</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('TestForm')}>
                    <Text style={{ color: Colors.neonGreen, fontWeight: 'bold', marginTop: 8 }}>Zrób swój pierwszy test!</Text>
                  </TouchableOpacity>
                </View>
              </NeonCard>
            ) : (
              recentActivity.map((activity, index) => (
                <NeonCard key={index}>
                  <View style={styles.activityRow}>
                    <View>
                      <Text style={styles.activityTest}>{activity.test}</Text>
                      <Text style={styles.activityDate}>{activity.date}</Text>
                    </View>
                    <View style={styles.activityRight}>
                      <Text style={styles.activityResult}>{activity.result}</Text>
                      {activity.trend ? <Text style={styles.activityTrend}>{activity.trend}</Text> : null}
                    </View>
                  </View>
                </NeonCard>
              ))
            )}
          </View>
        </View>

        {/* Lootbox Banner */}
        <View style={styles.section}>
          <NeonCard glow>
            <View style={styles.lootboxRow}>
              <NeonIcon Icon={Gift} size={32} color={Colors.gold} glow />
              <View style={styles.lootboxTextContainer}>
                <Text style={styles.lootboxText}>🎁 Zrób test dziś i zdobądź Lootbox!</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.lootboxButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TestForm')}
            >
              <Text style={styles.lootboxButtonText}>Idę trenować</Text>
            </TouchableOpacity>
          </NeonCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
  },
  avatarText: {
    fontSize: 20,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  streakNumber: {
    fontSize: FontSize['6xl'],
    color: Colors.orange,
    fontWeight: '800',
    marginBottom: 4,
  },
  streakLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  streakSub: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  navGridItem: {
    width: '47%',
  },
  navCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  navEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  navLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  activityList: {
    gap: Spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTest: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  activityDate: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityResult: {
    color: Colors.neonGreen,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  activityTrend: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  lootboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  lootboxTextContainer: {
    flex: 1,
  },
  lootboxText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  lootboxButton: {
    width: '100%',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
  },
  lootboxButtonText: {
    color: Colors.bgDeep,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
});