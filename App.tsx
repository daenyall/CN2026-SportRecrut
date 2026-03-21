import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './src/features/routes';

import LoginScreen from './src/features/screens/LoginScreen';
import StudentDashboard from './src/features/screens/StudentDashboard';
import StudentProfile from './src/features/screens/StudentProfile';
import TestForm from './src/features/screens/TestForm';
import StreakScreen from './src/features/screens/StreakScreen';
import RankingScreen from './src/features/screens/RankingScreen';
import TeacherDashboard from './src/features/screens/TeacherDashboard';
import StudentList from './src/features/screens/StudentList';
import TeamRecruitment from './src/features/screens/TeamRecruitment';
import ReportExport from './src/features/screens/ReportExport';
import HeatMapScreen from './src/features/screens/HeatMapScreen';
import { seedStudentsToFirestore } from './src/features/utils/seedFirestore';

/**
 * SportRecrut - Aplikacja do rekrutacji sportowej
 *
 * Startuje na ekranie logowania (LoginScreen)
 * - Wybierz "Jestem Nauczycielem" -> Teacher Dashboard
 * - Wybierz "Jestem Uczniem" -> Student Dashboard
 *
 * Tryb Ucznia: Dashboard -> Profile (wykres radarowy) -> Test -> Streak -> Ranking
 * Tryb Nauczyciela: Dashboard -> Students -> Team -> Reports
 */

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const seeded = useRef(false);

  // Jednorazowy seed Firestore — odpal raz, potem zakomentuj lub usuń
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedStudentsToFirestore()
        .then(() => console.log('🏁 Seed zakończony pomyślnie'))
        .catch((err) => console.error('❌ Seed error:', err));
    }
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0E1A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
        <Stack.Screen name="StudentProfile" component={StudentProfile} />
        <Stack.Screen name="TestForm" component={TestForm} />
        <Stack.Screen name="StreakScreen" component={StreakScreen} />
        <Stack.Screen name="RankingScreen" component={RankingScreen} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
        <Stack.Screen name="StudentList" component={StudentList} />
        <Stack.Screen name="TeamRecruitment" component={TeamRecruitment} />
        <Stack.Screen name="ReportExport" component={ReportExport} />
        <Stack.Screen name="HeatMapScreen" component={HeatMapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

