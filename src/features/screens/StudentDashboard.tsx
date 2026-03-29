import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Image, ActivityIndicator, RefreshControl, Easing } from 'react-native';
import { BarChart3, Play, Trophy, Map, Flame, Gift, LogOut, ClipboardList, User, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, CompositeNavigationProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, StudentTabParamList } from '../routes';

// SUPABASE
import { supabase } from '../config/supabase';

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
  const [refreshing, setRefreshing] = useState(false);

  // ANIMACJE
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateX = useRef(new Animated.Value(-20)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(1)).current;

  // STREAK GRADIENT ANIMATION
  const gradientShift = useRef(new Animated.Value(0)).current;

  // LOOTBOX SHAKE ANIMATION
  const lootboxShake = useRef(new Animated.Value(0)).current;

  // NAV ICON SHINE SWEEP ANIMATION
  const navShine = useRef(new Animated.Value(0)).current;

  // FUNKCJA POBIERANIA DANYCH
  const fetchStudentData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data } = await supabase.from('students').select('*').eq('id', currentUser.id).single();

      if (data) {
        // Imię
        if (data.name) {
          setStudentName(data.name.split(' ')[0]);
        } else {
          setStudentName(currentUser.email?.split('@')[0] || 'Uczeń');
        }

        setStreak(data.currentStreak || 0);
        setAvatarUrl(data.avatar || null);

        // Ostatnia aktywność (mapowanie wyników)
        if (data.testResults && data.testResults.length > 0) {
          const sortedTests = [...data.testResults]
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);

          const formattedTests = sortedTests.map((test: any) => ({
            date: test.date ? new Date(test.date).toLocaleDateString('pl-PL') : 'Ostatnio',
            test: test.category || 'Test sprawnościowy',
            result: test.result || (test.sprint ? `${test.sprint}s` : 'Brak'),
            trend: test.trend || ''
          }));
          setRecentActivity(formattedTests);
        }
      }
    } catch (error) {
      console.error("Błąd pobierania danych ucznia: ", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStudentData();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
      );
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  useEffect(() => {
    // Start animacji
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(headerTranslateX, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.spring(avatarScale, { toValue: 1, delay: 200, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Animated gradient shift for streak card
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientShift, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(gradientShift, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();

    // Lootbox gift icon shake animation – fast, subtle, aesthetic
    Animated.loop(
      Animated.sequence([
        Animated.timing(lootboxShake, { toValue: 1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lootboxShake, { toValue: -1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lootboxShake, { toValue: 1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lootboxShake, { toValue: -1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lootboxShake, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(2400),
      ])
    ).start();

    // Nav icon white shine sweep – fires every ~5s, fast sweep
    Animated.loop(
      Animated.sequence([
        Animated.delay(4500),
        Animated.timing(navShine, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(navShine, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    fetchStudentData();
  }, []);

  // Nav cards with lucide icons instead of emojis
  const navCards = [
    { icon: ClipboardList, iconColor: '#4FC3F7', label: 'Nowy Test', path: 'TestForm' as const },
    { icon: User, iconColor: '#AB47BC', label: 'Profil', path: 'StudentProfile' as const },
    { icon: Trophy, iconColor: '#FFD740', label: 'Ranking', path: 'RankingScreen' as const },
    { icon: MapPin, iconColor: '#66BB6A', label: 'Mapa', path: 'HeatMapScreen' as const },
  ];

  // Interpolate gradient shift for animated start/end positions
  const gradientStartX = gradientShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });
  const gradientEndX = gradientShift.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

  // Lootbox shake interpolation
  const lootboxRotate = lootboxShake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-4deg', '0deg', '4deg'],
  });

  // Nav icon shine sweep translateX: -80 (off-left) → +80 (off-right)
  const navShineTranslateX = navShine.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 80],
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.neonGreen} colors={[Colors.neonGreen]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={{ opacity: headerOpacity, transform: [{ translateX: headerTranslateX }] }}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.neonGreen} />
            ) : (
              <Text style={styles.headerTitle}>Cześć, {studentName}! 👋</Text>
            )}
          </Animated.View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Animated.View style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              ) : (
                <Text style={styles.avatarText}>👤</Text>
              )}
            </Animated.View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} color={Colors.red} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak Card — animated gradient background */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('StreakScreen')}>
            <LinearGradient
              colors={['#FF8C00', '#FFB300', '#FF6D00', '#FFCA28']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.streakGradientCard}
            >
              {/* Animated shimmer overlay */}
              <Animated.View
                style={[
                  styles.streakShimmer,
                  {
                    opacity: gradientShift.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.08, 0.25, 0.08],
                    }),
                  },
                ]}
              />
              <View style={styles.streakRow}>
                <View style={styles.streakLeft}>
                  <Animated.View style={[styles.flameContainer, { transform: [{ scale: flameScale }] }]}>
                    <Flame size={52} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFFBB" />
                  </Animated.View>
                  <View>
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakLabel}>{streak === 1 ? 'dzień z rzędu' : 'dni z rzędu'}</Text>
                    <Text style={styles.streakSub}>
                      {streak > 0 ? 'Nie przerywaj! Kolejny trening przed Tobą' : 'Zacznij swoją pierwszą passę!'}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Nav Grid — icons instead of emojis */}
        <View style={styles.section}>
          <View style={styles.navGrid}>
            {navCards.map((card, idx) => (
              <View key={card.label} style={styles.navGridItem}>
                <NeonCard onClick={() => navigation.navigate(card.path)}>
                  <View style={styles.navCardContent}>
                    <View style={[styles.navIconWrapper, { backgroundColor: `${card.iconColor}18` }]}>
                      <card.icon size={28} color={card.iconColor} strokeWidth={2} />
                      {/* White shine sweep overlay */}
                      <Animated.View
                        style={[
                          styles.shineSweep,
                          {
                            transform: [
                              {
                                translateX: navShine.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-80, 80],
                                }),
                              },
                            ],
                          },
                        ]}
                        pointerEvents="none"
                      >
                        <LinearGradient
                          colors={['transparent', 'rgba(255,255,255,0.45)', 'transparent']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.shineGradient}
                        />
                      </Animated.View>
                    </View>
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
                  <Text style={{ color: Colors.gray, fontSize: FontSize.sm }}>Brak testów w bazie.</Text>
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

        {/* Lootbox Banner — no emoji, icon with shake animation */}
        <View style={styles.section}>
          <NeonCard glow>
            <View style={styles.lootboxRow}>
              <Animated.View style={{ transform: [{ rotate: lootboxRotate }] }}>
                <NeonIcon Icon={Gift} size={34} color={Colors.gold} glow />
              </Animated.View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lootboxText}>Zdobądź Lootbox za dzisiejszy test!</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.lootboxButton} onPress={() => navigation.navigate('TestForm')}>
              <Text style={styles.lootboxButtonText}>Idę trenować</Text>
            </TouchableOpacity>
          </NeonCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: FontSize['2xl'], color: Colors.white, fontWeight: '700' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.neonGreen, overflow: 'hidden' },
  avatarText: { fontSize: 20 },
  logoutButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 71, 87, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 71, 87, 0.3)', alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },

  // Streak section — gradient card
  streakGradientCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg + 4,
    overflow: 'hidden',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  streakShimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  flameContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: { fontSize: FontSize['6xl'], color: '#FFFFFF', fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  streakLabel: { color: '#FFFFFFEE', fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.4 },
  streakSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 4 },

  // Nav Grid
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  navGridItem: { width: '47%' },
  navCardContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg },
  navIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm + 2,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  shineSweep: {
    position: 'absolute' as const,
    top: -4,
    bottom: -4,
    width: 28,
  },
  shineGradient: {
    flex: 1,
    width: '100%',
  },
  navLabel: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },

  // Section title
  sectionTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },

  // Activity
  activityList: { gap: Spacing.md },
  activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityTest: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  activityDate: { color: Colors.gray, fontSize: FontSize.xs },
  activityRight: { alignItems: 'flex-end' },
  activityResult: { color: Colors.neonGreen, fontSize: FontSize.lg, fontWeight: '700' },
  activityTrend: { color: Colors.gray, fontSize: FontSize.xs },

  // Lootbox
  lootboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  lootboxText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  lootboxButton: { width: '100%', marginTop: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.neonGreen, alignItems: 'center' },
  lootboxButtonText: { color: Colors.bgDeep, fontWeight: '700', fontSize: FontSize.base },
});