/**
 * Tomato Animes - Profile Edit Screen
 * Edit user profile information
 */

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GlassButton, GlassInput, GlassAvatar } from '@components/glass';
import { useColors } from '@theme/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@store/authStore';
import { api } from '@services/api';
import { ImagePicker } from 'expo-image-picker';

export default function ProfileEditScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [showEmail, setShowEmail] = useState(user?.showEmail ?? false);
  const [showWatchHistory, setShowWatchHistory] = useState(user?.showWatchHistory ?? true);
  const [showFavorites, setShowFavorites] = useState(user?.showFavorites ?? true);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite seu nome');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Erro', 'E-mail inválido');
      return;
    }

    try {
      await updateProfile({
        name,
        email,
        bio,
        avatar,
        showEmail,
        showWatchHistory,
        showFavorites,
      });
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    }
  };

  const handleAvatarPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
      // Upload avatar to server
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <GlassButton variant="ghost" size="sm" onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </GlassButton>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <GlassButton variant="ghost" size="sm" onPress={handleSave} disabled={isLoading}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>Salvar</Text>
          </GlassButton>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <GlassAvatar
            size="xxl"
            source={avatar ? { uri: avatar } : user?.avatar ? { uri: user.avatar } : require('@assets/images/avatar-placeholder.png')}
            name={name || user?.name}
            onPress={handleAvatarPress}
            editable
          />
          <GlassButton variant="ghost" size="sm" onPress={handleAvatarPress} style={{ marginTop: 12 }}>
            <Ionicons name="camera-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            Alterar Foto
          </GlassButton>
        </View>

        {/* Form */}
        <GlassCard variant="surface" style={styles.formCard}>
          <GlassInput
            label="Nome"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            leftIcon={<Ionicons name="person-outline" size={22} color={colors.onSurfaceVariant} />}
            style={{ marginBottom: 16 }}
          />
          <GlassInput
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={<Ionicons name="mail-outline" size={22} color={colors.onSurfaceVariant} />}
            style={{ marginBottom: 16 }}
          />
          <GlassInput
            label="Bio"
            placeholder="Conte algo sobre você..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            maxLength={160}
            leftIcon={<Ionicons name="chatbox-outline" size={22} color={colors.onSurfaceVariant} />}
            helperText={`${bio.length}/160`}
          />
        </GlassCard>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade do Perfil</Text>
          <GlassCard variant="surface">
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail-outline" size={22} color={colors.onSurfaceVariant} style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.settingLabel}>Mostrar E-mail</Text>
                  <Text style={styles.settingDescription}>Permitir que outros usuários vejam seu e-mail</Text>
                </View>
              </View>
              <GlassButton
                variant="ghost"
                size="sm"
                onPress={() => setShowEmail(!showEmail)}
                style={showEmail ? styles.toggleOn : styles.toggleOff}
              >
                <Ionicons name={showEmail ? 'checkmark' : 'close'} size={16} color={showEmail ? colors.success : colors.onSurfaceVariant} />
              </GlassButton>
            </View>
            <GlassDivider />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="play-circle-outline" size={22} color={colors.onSurfaceVariant} style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.settingLabel}>Histórico de Visualização</Text>
                  <Text style={styles.settingDescription}>Mostrar o que você está assistindo</Text>
                </View>
              </View>
              <GlassButton
                variant="ghost"
                size="sm"
                onPress={() => setShowWatchHistory(!showWatchHistory)}
                style={showWatchHistory ? styles.toggleOn : styles.toggleOff}
              >
                <Ionicons name={showWatchHistory ? 'checkmark' : 'close'} size={16} color={showWatchHistory ? colors.success : colors.onSurfaceVariant} />
              </GlassButton>
            </View>
            <GlassDivider />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="heart-outline" size={22} color={colors.onSurfaceVariant} style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.settingLabel}>Favoritos</Text>
                  <Text style={styles.settingDescription}>Mostrar seus animes favoritos</Text>
                </View>
              </View>
              <GlassButton
                variant="ghost"
                size="sm"
                onPress={() => setShowFavorites(!showFavorites)}
                style={showFavorites ? styles.toggleOn : styles.toggleOff}
              >
                <Ionicons name={showFavorites ? 'checkmark' : 'close'} size={16} color={showFavorites ? colors.success : colors.onSurfaceVariant} />
              </GlassButton>
            </View>
          </GlassCard>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <GlassCard variant="surface">
            <GlassButton
              variant="outline"
              fullWidth
              leftIcon={<Ionicons name="key-outline" size={22} color={colors.primary} />}
              onPress={() => router.push('/settings?section=change-password')}
            >
              Alterar Senha
            </GlassButton>
            <GlassDivider />
            <GlassButton
              variant="outline"
              fullWidth
              leftIcon={<Ionicons name="devices-outline" size={22} color={colors.primary} />}
              onPress={() => router.push('/settings?section=devices')}
            >
              Dispositivos Conectados
            </GlassButton>
            <GlassDivider />
            <GlassButton
              variant="danger"
              fullWidth
              leftIcon={<Ionicons name="log-out-outline" size={22} color={colors.error} />}
              onPress={() => {
                Alert.alert(
                  'Sair da Conta',
                  'Tem certeza que deseja sair?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Sair', style: 'destructive', onPress: () => { /* Handle logout */ } },
                  ]
                );
              }}
            >
              Sair de Todos os Dispositivos
            </GlassButton>
          </GlassCard>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona de Perigo</Text>
          <GlassCard variant="surface">
            <GlassButton
              variant="danger"
              fullWidth
              leftIcon={<Ionicons name="trash-outline" size={22} color={colors.error} />}
              onPress={() => {
                Alert.alert(
                  'Excluir Conta',
                  'Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Excluir', style: 'destructive', onPress: () => { /* Delete account */ } },
                  ]
                );
              }}
            >
              Excluir Minha Conta
            </GlassButton>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  formCard: {
    padding: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  toggleOn: {
    width: 44,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOff: {
    width: 44,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Add missing imports
import { Text } from 'react-native';