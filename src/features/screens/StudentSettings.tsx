import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { User, Bell, Shield, Database, Settings, LogOut } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { supabase } from '../config/supabase';

export default function StudentSettings() {
  // --- STANY ---
  // Profil
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // Placeholder for future use

  // Powiadomienia
  const [notifyScores, setNotifyScores] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);

  // Prywatność
  const [isPublicProfile, setIsPublicProfile] = useState(false);

  // Integracje (Status Supabase)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setIsSupabaseConnected(!!data.session);
    } catch (e) {
      console.error("Błąd połączenia z Supabase:", e);
      setIsSupabaseConnected(false);
    }
  };

  const loadMockSettings = () => {
    // Tutaj normalnie pobralibyśmy dane profilu po ID z Supabase
    setFirstName('Jan');
    setLastName('Kowalski');
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await checkSupabaseConnection();
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkSupabaseConnection();
    loadMockSettings();
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <NeonIcon Icon={Settings} size={28} color={Colors.neonGreen} glow />
        <Text style={styles.headerTitle}>Ustawienia Ucznia</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.neonGreen} />
        }
      >
        {/* SEKCJA: PROFIL */}
        <NeonCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.neonGreen} />
            <Text style={styles.sectionTitle}>Profil</Text>
          </View>
          
          <View style={styles.contentPadded}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Imię</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Imię"
                  placeholderTextColor={Colors.gray}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nazwisko</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nazwisko"
                  placeholderTextColor={Colors.gray}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Avatar (URL)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Link do avatara..."
                  placeholderTextColor={Colors.gray}
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                />
              </View>
            </View>
          </View>
        </NeonCard>

        {/* SEKCJA: POWIADOMIENIA */}
        <NeonCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={Colors.orange} />
            <Text style={styles.sectionTitle}>Powiadomienia</Text>
          </View>
          
          <View style={styles.contentPadded}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Powiadomienia o nowych wynikach</Text>
              <Switch
                trackColor={{ false: '#3A4A5A', true: 'rgba(0, 230, 118, 0.5)' }}
                thumbColor={notifyScores ? Colors.neonGreen : Colors.gray}
                onValueChange={setNotifyScores}
                value={notifyScores}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Wiadomości od trenerów</Text>
              <Switch
                trackColor={{ false: '#3A4A5A', true: 'rgba(0, 230, 118, 0.5)' }}
                thumbColor={notifyMessages ? Colors.neonGreen : Colors.gray}
                onValueChange={setNotifyMessages}
                value={notifyMessages}
              />
            </View>
          </View>
        </NeonCard>

        {/* SEKCJA: PRYWATNOŚĆ */}
        <NeonCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Prywatność</Text>
          </View>

          <View style={styles.contentPadded}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Profil publiczny (widoczny w rankingu)</Text>
              <Switch
                trackColor={{ false: '#3A4A5A', true: 'rgba(0, 230, 118, 0.5)' }}
                thumbColor={isPublicProfile ? Colors.neonGreen : Colors.gray}
                onValueChange={setIsPublicProfile}
                value={isPublicProfile}
              />
            </View>
          </View>
        </NeonCard>

        {/* SEKCJA: INTEGRACJE (SUPABASE) */}
        <NeonCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Database size={20} color={Colors.neonGreenDark} />
            <Text style={styles.sectionTitle}>Integracje (Supabase)</Text>
          </View>

          <View style={styles.contentPadded}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Baza Danych:</Text>
              {isSupabaseConnected === null ? (
                <Text style={[styles.statusValue, { color: Colors.gray }]}>Sprawdzanie...</Text>
              ) : isSupabaseConnected ? (
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedText}>POŁĄCZONO</Text>
                </View>
              ) : (
                <View style={[styles.connectedBadge, { backgroundColor: 'rgba(255, 23, 68, 0.15)', borderColor: Colors.red }]}>
                  <Text style={[styles.connectedText, { color: Colors.red }]}>BŁĄD POŁĄCZENIA</Text>
                </View>
              )}
            </View>
          </View>
        </NeonCard>

        {/* LOGOUT PLACEHOLDER (Opcjonalnie) */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>SportRecrut Wersja 1.0.0</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bgDeep,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
    gap: Spacing.lg,
  },
  card: {
    padding: 0, 
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.md,
    marginLeft: Spacing.sm,
  },
  contentPadded: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  
  // Inputs stylizowane tak jak w LoginScreen
  inputWrapper: {
    gap: 4,
  },
  inputLabel: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginLeft: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.base,
    paddingVertical: 12,
  },
  
  // Switches
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    flex: 1,
    paddingRight: Spacing.md,
  },
  
  // Status (Supabase)
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
  },
  statusValue: {
    fontWeight: '600',
    fontSize: FontSize.sm,
  },
  connectedBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  connectedText: {
    color: Colors.neonGreen,
    fontWeight: '800',
    fontSize: FontSize.xs,
  },
  
  // Footer
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  versionText: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  }
});
