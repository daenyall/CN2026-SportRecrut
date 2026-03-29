import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

export type NeonAlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

interface NeonAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: NeonAlertButton[];
  onClose: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export function NeonAlert({ visible, title, message, buttons = [], onClose, type = 'info' }: NeonAlertProps) {
  if (!visible) return null;

  const defaultButtons: NeonAlertButton[] = [
    { text: 'OK', onPress: onClose }
  ];

  const activeButtons = buttons.length > 0 ? buttons : defaultButtons;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={32} color={Colors.neonGreen} />;
      case 'error':
      case 'warning': return <AlertCircle size={32} color={Colors.red} />;
      default: return <Info size={32} color={Colors.orange} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return Colors.neonGreen;
      case 'error':
      case 'warning': return Colors.red;
      default: return Colors.orange;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { borderColor: getColor() }]}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {activeButtons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel,
                    !isDestructive && !isCancel && { backgroundColor: Colors.neonGreen }
                  ]}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    onClose();
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    isDestructive && styles.textDestructive,
                    isCancel && styles.textCancel,
                    !isDestructive && !isCancel && { color: Colors.bgDeep }
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  alertBox: {
    backgroundColor: Colors.cardBg,
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingTop: 45,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    position: 'absolute',
    top: -24,
    backgroundColor: Colors.bgDeep,
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: Colors.gray,
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonDestructive: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    borderWidth: 1,
    borderColor: Colors.red,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: FontSize.base,
  },
  textCancel: {
    color: Colors.white,
  },
  textDestructive: {
    color: Colors.red,
  }
});
