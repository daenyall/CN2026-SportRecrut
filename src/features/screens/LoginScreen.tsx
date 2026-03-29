import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Trophy, Mail, Lock, School, MapPin, ChevronDown, Check, ArrowLeft, User, GraduationCap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NeonIcon } from '../components/NeonIcon';
import { NeonAlert, NeonAlertButton } from '../components/NeonAlert';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList } from '../routes';

// --- SUPABASE IMPORTS ---
import { supabase } from '../config/supabase';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- KOMPONENT ANIMACJI TŁA ---
function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(y)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay * 1000),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ]),
          Animated.timing(translateY, {
            toValue: Math.random() * SCREEN_HEIGHT,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.particle, { left: x, opacity, transform: [{ translateY }] }]}
    />
  );
}

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // --- STANY UI (Role / Formularz) ---
  const [step, setStep] = useState<'role_selection' | 'auth_form'>('role_selection');
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  // Konfiguracja własnego alertu
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as NeonAlertButton[]
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', buttons: NeonAlertButton[] = []) => {
    setAlertConfig({ visible: true, title, message, type, buttons });
  };
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  // --- STANY FORMULARZA (Firebase) ---
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullName, setFullName] = useState('');

  const [schoolsList, setSchoolsList] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [isSchoolDropdownOpen, setSchoolDropdownOpen] = useState(false);

  const [isAddingNewSchool, setIsAddingNewSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');

  // --- ANIMACJE BAZOWE ---
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(-30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const trophyBounce = useRef(new Animated.Value(0)).current;

  // --- ANIMACJE PRZYCISKÓW ROLI ---
  const btn1Opacity = useRef(new Animated.Value(0)).current;
  const btn1TranslateX = useRef(new Animated.Value(-50)).current;
  const btn2Opacity = useRef(new Animated.Value(0)).current;
  const btn2TranslateX = useRef(new Animated.Value(50)).current;
  const schoolOpacity = useRef(new Animated.Value(0)).current;

  // --- ANIMACJE FORMULARZA ---
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;

  // INICJALIZACJA: Pobieranie bazy i start głównych animacji
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(contentTranslateY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(btn1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn1TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btn2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn2TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(schoolOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyBounce, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(trophyBounce, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase.from('schools').select('name');
        if (error) throw error;
        const schools = data?.map(doc => doc.name) || [];
        if (schools.length > 0) setSchoolsList(schools);
        else setSchoolsList(['Szkoła Podstawowa nr 1', 'I Liceum Ogólnokształcące']);
      } catch (error) {
        console.log("Błąd pobierania szkół:", error);
      }
    };
    fetchSchools();
  }, []);

  const particles = Array.from({ length: 15 }, (_, i) => ({
    key: i, x: Math.random() * SCREEN_WIDTH, y: Math.random() * SCREEN_HEIGHT, delay: Math.random() * 2,
  }));

  // PRZEJŚCIE DO FORMULARZA
  const handleSelectRole = (selectedRole: 'student' | 'teacher') => {
    Animated.parallel([
      Animated.timing(btn1Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(btn2Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(schoolOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setRole(selectedRole);
      setStep('auth_form');
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    });
  };

  // POWRÓT DO WYBORU ROLI
  const handleBackToRoles = () => {
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 30, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setStep('role_selection');
      Animated.parallel([
        Animated.timing(btn1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(schoolOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    });
  };

  // LOGIKA AUTORYZACJI FIREBASE
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleAuth = async () => {
    if (!email || !password) { showAlert('Błąd', 'Wypełnij email i hasło.', 'error'); return; }
    if (!validateEmail(email)) { showAlert('Błąd', 'Podaj poprawny adres e-mail.', 'error'); return; }

    if (!isLogin) {
      if (!fullName.trim()) { showAlert('Błąd', 'Podaj imię i nazwisko.', 'error'); return; }
      if (password !== confirmPassword) { showAlert('Błąd', 'Hasła nie są identyczne.', 'error'); return; }
      if (password.length < 6) { showAlert('Błąd', 'Hasło musi mieć minimum 6 znaków.', 'error'); return; }
      if (!isAddingNewSchool && !selectedSchool) { showAlert('Błąd', 'Wybierz szkołę z listy.', 'error'); return; }
      if (isAddingNewSchool && (!newSchoolName || !newSchoolAddress)) { showAlert('Błąd', 'Podaj nazwę i adres nowej szkoły.', 'error'); return; }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // ZALOGUJ
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        const uid = authData.user?.id;
        if (!uid) throw new Error("Brak UID po zalogowaniu");

        // 1. Sprawdzamy, czy jest w tabeli nauczycieli (users)
        const { data: teacherDoc } = await supabase.from('users').select('role').eq('id', uid).single();
        if (teacherDoc?.role === 'teacher') {
          navigation.replace('TeacherTabs', { screen: 'TeacherDashboard' } as any);
        } else {
          // 2. Jeśli nie, sprawdzamy czy jest w tabeli uczniów (students)
          const { data: studentDoc } = await supabase.from('students').select('id').eq('id', uid).single();
          if (studentDoc) {
            navigation.replace('StudentTabs', { screen: 'StudentDashboard' } as any);
          } else {
            // Fallback
            if (role === 'student') navigation.replace('StudentTabs', { screen: 'StudentDashboard' } as any);
            else navigation.replace('TeacherTabs', { screen: 'TeacherDashboard' } as any);
          }
        }

      } else {
        // ZAREJESTRUJ
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (!authData.user) throw new Error("Nie udało się utworzyć konta");
        const uid = authData.user.id;
        let finalSchool = selectedSchool;

        // Jeśli nauczyciel dodaje szkołę
        if (role === 'teacher' && isAddingNewSchool) {
          finalSchool = newSchoolName;
          const schoolId = newSchoolName.replace(/\s+/g, '_').toLowerCase();
          await supabase.from('schools').insert({
            id: schoolId,
            name: newSchoolName,
            address: newSchoolAddress,
            createdAt: new Date().toISOString()
          });
        }

        const safeFullName = fullName.trim();

        if (role === 'teacher') {
          // ZAPIS NAUCZYCIELA DO KOLEKCJI 'users'
          await supabase.from('users').insert({
            id: uid,
            email: email,
            name: safeFullName,
            role: 'teacher',
            school: finalSchool,
            createdAt: new Date().toISOString()
          });
          navigation.replace('TeacherTabs', { screen: 'TeacherDashboard' } as any);

        } else {
          // ZAPIS UCZNIA DO KOLEKCJI 'students'
          await supabase.from('students').insert({
            id: uid,
            name: safeFullName,
            school: finalSchool,
            age: 12,
            class: '6A',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(safeFullName)}&background=00E676&color=fff`,
            overall: 60,
            stats: {
              agility: 60,
              jump: 60,
              speed: 60,
              stamina: 60,
              strength: 60
            },
            testResults: [],
            registeredAt: new Date().toISOString()
          });
          navigation.replace('StudentTabs', { screen: 'StudentDashboard' } as any);
        }
      }
    } catch (error: any) {
      if (error.message?.includes('already registered')) showAlert('Błąd', 'Ten email jest już zarejestrowany.', 'error');
      else if (error.message?.includes('Invalid login credentials')) showAlert('Błąd', 'Błędny email lub hasło.', 'error');
      else showAlert('Błąd autoryzacji', error.message || 'Wystąpił nieznany błąd', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* TŁO CZĄSTECZEK */}
      {particles.map((p) => (
        <FloatingParticle key={p.key} delay={p.delay} x={p.x} y={p.y} />
      ))}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
          ]}
        >
          {/* HEADER Z PUCHAREM */}
          <Animated.View style={[styles.trophyContainer, { transform: [{ translateY: trophyBounce }] }]}>
            <View style={styles.trophyGlow}>
              <NeonIcon Icon={Trophy} size={80} color={Colors.neonGreen} glow />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: titleOpacity }}>
            <Text style={styles.title}>SportRecrut</Text>
          </Animated.View>

          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text style={styles.subtitle}>Platforma talentów sportowych</Text>
          </Animated.View>

          {/* KROK 1: WYBÓR ROLI */}
          {step === 'role_selection' && (
            <View style={styles.buttonsContainer}>
              <Animated.View style={{ opacity: btn1Opacity, transform: [{ translateX: btn1TranslateX }] }}>
                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => handleSelectRole('teacher')}>
                  <Text style={styles.primaryButtonText}>Jestem Nauczycielem</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ opacity: btn2Opacity, transform: [{ translateX: btn2TranslateX }] }}>
                <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8} onPress={() => handleSelectRole('student')}>
                  <Text style={styles.outlineButtonText}>Jestem Uczniem</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ opacity: schoolOpacity }}>
                <Text style={styles.schoolInfo}>Zasilane przez Firestore 🔥</Text>
              </Animated.View>
            </View>
          )}

          {/* KROK 2: FORMULARZ LOGOWANIA/REJESTRACJI */}
          {step === 'auth_form' && (
            <Animated.View style={[styles.formSection, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>

              <TouchableOpacity style={styles.backButton} onPress={handleBackToRoles}>
                <ArrowLeft size={20} color={Colors.gray} />
                <Text style={styles.backButtonText}>Zmień rolę ({role === 'teacher' ? 'Nauczyciel' : 'Uczeń'})</Text>
              </TouchableOpacity>

              <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => { setIsLogin(true); setIsAddingNewSchool(false); }}>
                  <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Logowanie</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
                  <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Rejestracja</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Adres e-mail"
                  placeholderTextColor={Colors.gray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Hasło"
                  placeholderTextColor={Colors.gray}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* POLA TYLKO DLA REJESTRACJI */}
              {!isLogin && (
                <>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color={Colors.gray} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Powtórz hasło"
                      placeholderTextColor={Colors.gray}
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>

                  {/* POLE: Imię i Nazwisko */}
                  <View style={styles.inputWrapper}>
                    <User size={20} color={Colors.gray} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Imię i nazwisko"
                      placeholderTextColor={Colors.gray}
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Wybór lub dodanie Szkoły */}
                  {!isAddingNewSchool && (
                    <View style={[styles.inputWrapper, { zIndex: 10 }]}>
                      <School size={20} color={Colors.gray} style={styles.inputIcon} />
                      <TouchableOpacity style={styles.dropdownSelector} onPress={() => setSchoolDropdownOpen(!isSchoolDropdownOpen)}>
                        <Text style={[styles.dropdownText, !selectedSchool && { color: Colors.gray }]}>
                          {selectedSchool || 'Wybierz swoją szkołę...'}
                        </Text>
                        <ChevronDown size={20} color={Colors.gray} />
                      </TouchableOpacity>

                      {isSchoolDropdownOpen && (
                        <View style={styles.dropdownListInline}>
                          {schoolsList.map((school, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.dropdownItem}
                              onPress={() => { setSelectedSchool(school); setSchoolDropdownOpen(false); }}
                            >
                              <Text style={styles.dropdownItemText}>{school}</Text>
                              {selectedSchool === school && <Check size={16} color={Colors.neonGreen} />}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {role === 'teacher' && (
                    <TouchableOpacity style={styles.addSchoolToggle} onPress={() => { setIsAddingNewSchool(!isAddingNewSchool); setSchoolDropdownOpen(false); setSelectedSchool(''); }}>
                      <Text style={styles.addSchoolToggleText}>
                        {isAddingNewSchool ? '← Wróć do wyboru z listy' : '+ Nie ma Twojej szkoły? Dodaj nową'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isAddingNewSchool && (
                    <View style={styles.newSchoolContainer}>
                      <View style={styles.inputWrapper}>
                        <School size={20} color={Colors.gray} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Pełna nazwa szkoły" placeholderTextColor={Colors.gray} value={newSchoolName} onChangeText={setNewSchoolName} />
                      </View>
                      <View style={styles.inputWrapper}>
                        <MapPin size={20} color={Colors.gray} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Miasto, Ulica" placeholderTextColor={Colors.gray} value={newSchoolAddress} onChangeText={setNewSchoolAddress} />
                      </View>
                    </View>
                  )}
                </>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleAuth}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color={Colors.bgDeep} /> : <Text style={styles.primaryButtonText}>{isLogin ? 'ZALOGUJ SIĘ' : 'UTWÓRZ KONTO'}</Text>}
              </TouchableOpacity>



            </Animated.View>
          )}

        </Animated.View>
      </ScrollView>

      <NeonAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={closeAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: 40 },
  particle: { position: 'absolute', width: 4, height: 4, backgroundColor: Colors.neonGreen, borderRadius: 2, shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },
  content: { alignItems: 'center', zIndex: 10, width: '100%' },
  trophyContainer: { marginBottom: Spacing.xl },
  trophyGlow: { shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 10 },
  title: { fontSize: FontSize['5xl'], color: Colors.white, fontWeight: '800', letterSpacing: -0.5, marginBottom: Spacing.sm, textAlign: 'center' },
  subtitle: { color: Colors.gray, fontSize: FontSize.base, marginBottom: 48, textAlign: 'center' },

  // Stary widok (przyciski startowe)
  buttonsContainer: { width: 280, gap: Spacing.lg },
  schoolInfo: { color: Colors.gray, fontSize: FontSize.sm, marginTop: 48, textAlign: 'center' },

  // Nowy widok (Formularz)
  formSection: { width: '100%', maxWidth: 400, gap: Spacing.md },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md, alignSelf: 'flex-start' },
  backButtonText: { color: Colors.gray, fontSize: FontSize.sm, fontWeight: '600' },

  tabContainer: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.full, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.full },
  tabActive: { backgroundColor: 'rgba(0, 230, 118, 0.2)' },
  tabText: { color: Colors.gray, fontWeight: '600', fontSize: FontSize.sm },
  tabTextActive: { color: Colors.neonGreen, fontWeight: '800' },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: Spacing.md },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, color: Colors.white, fontSize: FontSize.base, paddingVertical: 14 },

  dropdownContainer: { width: '100%' },
  dropdownSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  dropdownText: { color: Colors.white, fontSize: FontSize.sm },
  dropdownListInline: { marginTop: 4, backgroundColor: '#1E2335', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)', overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  dropdownItemText: { color: Colors.white, fontSize: FontSize.sm },

  addSchoolToggle: { alignSelf: 'flex-start', paddingVertical: 4 },
  addSchoolToggleText: { color: Colors.orange, fontSize: FontSize.sm, fontWeight: '700' },
  newSchoolContainer: { gap: Spacing.md, marginTop: 4, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },

  primaryButton: { width: '100%', paddingVertical: Spacing.lg, borderRadius: BorderRadius.full, backgroundColor: Colors.neonGreen, alignItems: 'center', marginTop: Spacing.sm, shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  primaryButtonText: { color: Colors.bgDeep, fontWeight: '800', fontSize: FontSize.md, letterSpacing: 1 },

  outlineButton: { width: '100%', paddingVertical: Spacing.lg, borderRadius: BorderRadius.full, borderWidth: 2, borderColor: Colors.neonGreen, backgroundColor: 'transparent', alignItems: 'center' },
  outlineButtonText: { color: Colors.neonGreen, fontWeight: '700', fontSize: FontSize.md },
});