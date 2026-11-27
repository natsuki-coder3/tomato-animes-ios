/**
 * Tomato Animes - Settings Screen
 * App settings with sections for notifications, downloads, appearance, etc.
 */

import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView, Switch, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard, GlassCardSection, GlassButton, GlassDivider, GlassSwitch, GlassSelect, GlassInput } from '@components/glass';
import { useColors, useTheme } from '@theme/themeProvider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api } from '@services/api';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@store/authStore';
import { useSettingsStore } from '@store/settingsStore';
import { SectionHeader } from '@components/SectionHeader';

const SECTIONS = [
  { key: 'general', title: 'Geral', icon: 'settings-outline' },
  { key: 'notifications', title: 'Notificações', icon: 'notifications-outline' },
  { key: 'downloads', title: 'Downloads', icon: 'download-outline' },
  { key: 'appearance', title: 'Aparência', icon: 'moon-outline' },
  { key: 'player', title: 'Player', icon: 'videocam-outline' },
  { key: 'privacy', title: 'Privacidade', icon: 'shield-outline' },
  { key: 'data', title: 'Dados e Armazenamento', icon: 'hardware-chip-outline' },
  { key: 'about', title: 'Sobre', icon: 'information-outline' },
];

export default function SettingsScreen() {
  const colors = useColors();
  const { toggleColorScheme, colorScheme, resolvedColorScheme } = useTheme();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { settings, updateSettings } = useSettingsStore();

  const [activeSection, setActiveSection] = useState(params.section as string || 'general');

  const handleSettingChange = async (key: string, value: any) => {
    await updateSettings(key, value);
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'downloads':
        return renderDownloadsSection();
      case 'appearance':
        return renderAppearanceSection();
      case 'player':
        return renderPlayerSection();
      case 'privacy':
        return renderPrivacySection();
      case 'data':
        return renderDataSection();
      case 'about':
        return renderAboutSection();
      default:
        return renderGeneralSection();
    }
  };

  const renderGeneralSection = () => (
    <View style={{ gap: 16 }}>
      <GlassCard variant="surface">
        <SettingsItem
          icon="language-outline"
          label="Idioma"
          trailing={
            <GlassSelect
              value={settings.language || 'pt-BR'}
              options={[
                { value: 'pt-BR', label: 'Português (Brasil)' },
                { value: 'en-US', label: 'English (US)' },
                { value: 'es-ES', label: 'Español' },
                { value: 'ja-JP', label: '日本語' },
              ]}
              onValueChange={(value) => handleSettingChange('language', value)}
              style={{ width: 180 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="cash-outline"
          label="Região de Conteúdo"
          trailing={
            <GlassSelect
              value={settings.contentRegion || 'BR'}
              options={[
                { value: 'BR', label: 'Brasil' },
                { value: 'US', label: 'Estados Unidos' },
                { value: 'JP', label: 'Japão' },
                { value: 'GLOBAL', label: 'Global' },
              ]}
              onValueChange={(value) => handleSettingChange('contentRegion', value)}
              style={{ width: 180 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="wifi-outline"
          label="Qualidade Padrão (Wi-Fi)"
          trailing={
            <GlassSelect
              value={settings.defaultQualityWifi || '1080p'}
              options={[
                { value: 'Auto', label: 'Automático' },
                { value: '1080p', label: '1080p' },
                { value: '720p', label: '720p' },
                { value: '480p', label: '480p' },
              ]}
              onValueChange={(value) => handleSettingChange('defaultQualityWifi', value)}
              style={{ width: 150 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="signal-cellular-outline"
          label="Qualidade Padrão (Dados Móveis)"
          trailing={
            <GlassSelect
              value={settings.defaultQualityMobile || '720p'}
              options={[
                { value: 'Auto', label: 'Automático' },
                { value: '720p', label: '720p' },
                { value: '480p', label: '480p' },
                { value: '360p', label: '360p' },
              ]}
              onValueChange={(value) => handleSettingChange('defaultQualityMobile', value)}
              style={{ width: 150 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="play-circle-outline"
          label="Auto-play Próximo Episódio"
          trailing={
            <GlassSwitch
              value={settings.autoPlayNext ?? true}
              onValueChange={(value) => handleSettingChange('autoPlayNext', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="skip-forward-outline"
          label="Pular Opening/Ending"
          trailing={
            <GlassSwitch
              value={settings.skipIntroOutro ?? false}
              onValueChange={(value) => handleSettingChange('skipIntroOutro', value)}
            />
          }
        />
      </GlassCard>

      <GlassCard variant="surface">
        <SettingsItem
          icon="sync-outline"
          label="Sincronizar Histórico"
          trailing={
            <GlassSwitch
              value={settings.syncHistory ?? true}
              onValueChange={(value) => handleSettingChange('syncHistory', value)}
              disabled={!isAuthenticated}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="cloud-outline"
          label="Backup na Nuvem"
          trailing={
            <GlassSwitch
              value={settings.cloudBackup ?? false}
              onValueChange={(value) => handleSettingChange('cloudBackup', value)}
              disabled={!isAuthenticated}
            />
          }
        />
      </GlassCard>
    </View>
  );

  const renderNotificationsSection = () => (
    <View style={{ gap: 16 }}>
      <GlassCard variant="surface">
        <SettingsItem
          icon="notifications-outline"
          label="Notificações Push"
          trailing={
            <GlassSwitch
              value={settings.pushEnabled ?? true}
              onValueChange={async (value) => {
                await handleSettingChange('pushEnabled', value);
                if (value) {
                  // Request permission
                }
              }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="bell-outline"
          label="Novos Episódios"
          trailing={
            <GlassSwitch
              value={settings.notifyNewEpisodes ?? true}
              onValueChange={(value) => handleSettingChange('notifyNewEpisodes', value)}
              disabled={!settings.pushEnabled}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="star-outline"
          label="Animes Favoritos"
          trailing={
            <GlassSwitch
              value={settings.notifyFavorites ?? true}
              onValueChange={(value) => handleSettingChange('notifyFavorites', value)}
              disabled={!settings.pushEnabled}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="download-outline"
          label="Downloads Concluídos"
          trailing={
            <GlassSwitch
              value={settings.notifyDownloads ?? true}
              onValueChange={(value) => handleSettingChange('notifyDownloads', value)}
              disabled={!settings.pushEnabled}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="chatbox-outline"
          label="Comentários e Respostas"
          trailing={
            <GlassSwitch
              value={settings.notifyComments ?? false}
              onValueChange={(value) => handleSettingChange('notifyComments', value)}
              disabled={!settings.pushEnabled}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="time-outline"
          label="Horário Silencioso"
          trailing={
            <GlassInput
              placeholder="22:00 - 08:00"
              value={settings.quietHours || '22:00 - 08:00'}
              onChangeText={(value) => handleSettingChange('quietHours', value)}
              style={{ width: 150 }}
              disabled={!settings.pushEnabled}
            />
          }
        />
      </GlassCard>
    </View>
  );

  const renderDownloadsSection = () => (
    <View style={{ gap: 16 }}>
      <GlassCard variant="surface">
        <SettingsItem
          icon="wifi-outline"
          label="Apenas Wi-Fi"
          trailing={
            <GlassSwitch
              value={settings.downloadWifiOnly ?? true}
              onValueChange={(value) => handleSettingChange('downloadWifiOnly', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="hardware-chip-outline"
          label="Limite de Armazenamento"
          trailing={
            <GlassSelect
              value={settings.downloadStorageLimit || '10GB'}
              options={[
                { value: '5GB', label: '5 GB' },
                { value: '10GB', label: '10 GB' },
                { value: '20GB', label: '20 GB' },
                { value: '50GB', label: '50 GB' },
                { value: 'unlimited', label: 'Ilimitado' },
              ]}
              onValueChange={(value) => handleSettingChange('downloadStorageLimit', value)}
              style={{ width: 150 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="videocam-outline"
          label="Qualidade de Download"
          trailing={
            <GlassSelect
              value={settings.downloadQuality || '1080p'}
              options={[
                { value: '1080p', label: '1080p' },
                { value: '720p', label: '720p' },
                { value: '480p', label: '480p' },
              ]}
              onValueChange={(value) => handleSettingChange('downloadQuality', value)}
              style={{ width: 150 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="subtitles-outline"
          label="Incluir Legendas"
          trailing={
            <GlassSwitch
              value={settings.downloadSubtitles ?? true}
              onValueChange={(value) => handleSettingChange('downloadSubtitles', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="delete-outline"
          label="Auto-excluir Assistidos"
          trailing={
            <GlassSwitch
              value={settings.autoDeleteWatched ?? false}
              onValueChange={(value) => handleSettingChange('autoDeleteWatched', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="refresh-outline"
          label="Downloads Simultâneos"
          trailing={
            <GlassSelect
              value={settings.maxConcurrentDownloads || '3'}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
              ]}
              onValueChange={(value) => handleSettingChange('maxConcurrentDownloads', value)}
              style={{ width: 100 }}
            />
          }
        />
      </GlassCard>
    </View>
  );

  const renderAppearanceSection = () => (
    <View style={{ gap: 16 }}>
      <GlassCard variant="surface">
        <SettingsItem
          icon="moon-outline"
          label="Tema"
          trailing={
            <GlassSelect
              value={colorScheme}
              options={[
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Escuro' },
                { value: 'system', label: 'Sistema' },
              ]}
              onValueChange={(value) => {
                toggleColorScheme();
                handleSettingChange('theme', value);
              }}
              style={{ width: 150 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="contrast-outline"
          label="Reduzir Transparência"
          trailing={
            <GlassSwitch
              value={settings.reduceTransparency ?? false}
              onValueChange={(value) => handleSettingChange('reduceTransparency', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="move-outline"
          label="Reduzir Animações"
          trailing={
            <GlassSwitch
              value={settings.reduceMotion ?? false}
              onValueChange={(value) => handleSettingChange('reduceMotion', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="text-size-outline"
          label="Tamanho do Texto"
          trailing={
            <GlassSelect
              value={settings.textSize || 'medium'}
              options={[
                { value: 'small', label: 'Pequeno' },
                { value: 'medium', label: 'Médio' },
                { value: 'large', label: 'Grande' },
                { value: 'extra-large', label: 'Extra Grande' },
              ]}
              onValueChange={(value) => handleSettingChange('textSize', value)}
              style={{ width: 150 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="brush-outline"
          label="Cor de Destaque"
          trailing={
            <GlassSelect
              value={settings.accentColor || 'blue'}
              options={[
                { value: 'blue', label: 'Azul' },
                { value: 'purple', label: 'Roxo' },
                { value: 'red', label: 'Vermelho' },
                { value: 'green', label: 'Verde' },
                { value: 'orange', label: 'Laranja' },
                { value: 'pink', label: 'Rosa' },
              ]}
              onValueChange={(value) => handleSettingChange('accentColor', value)}
              style={{ width: 150 }}
            />
          }
        />
      </GlassCard>
    </View>
  );

  const renderPlayerSection = () => (
    <View style={{ gap: 16 }}>
      <GlassCard variant="surface">
        <SettingsItem
          icon="play-circle-outline"
          label="Velocidade Padrão"
          trailing={
            <GlassSelect
              value={settings.defaultPlaybackRate || '1.0'}
              options={[
                { value: '0.5', label: '0.5x' },
                { value: '0.75', label: '0.75x' },
                { value: '1.0', label: '1.0x' },
                { value: '1.25', label: '1.25x' },
                { value: '1.5', label: '1.5x' },
                { value: '2.0', label: '2.0x' },
              ]}
              onValueChange={(value) => handleSettingChange('defaultPlaybackRate', value)}
              style={{ width: 120 }}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="gesture-outline"
          label="Gestos de Controle"
          trailing={
            <GlassSwitch
              value={settings.gestureControls ?? true}
              onValueChange={(value) => handleSettingChange('gestureControls', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="volume-high-outline"
          label="Controle de Volume por Gestos"
          trailing={
            <GlassSwitch
              value={settings.gestureVolume ?? true}
              onValueChange={(value) => handleSettingChange('gestureVolume', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="brightness-high-outline"
          label="Controle de Brilho por Gestos"
          trailing={
            <GlassSwitch
              value={settings.gestureBrightness ?? true}
              onValueChange={(value) => handleSettingChange('gestureBrightness', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="skip-forward-outline"
          label="Pular Opening/Ending Automático"
          trailing={
            <GlassSwitch
              value={settings.autoSkipIntroOutro ?? false}
              onValueChange={(value) => handleSettingChange('autoSkipIntroOutro', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="pip-outline"
          label="Picture-in-Picture"
          trailing={
            <GlassSwitch
              value={settings.pipEnabled ?? true}
              onValueChange={(value) => handleSettingChange('pipEnabled', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="cast-outline"
          label="AirPlay / Chromecast"
          trailing={
            <GlassSwitch
              value={settings.castEnabled ?? true}
              onValueChange={(value) => handleSettingChange('castEnabled', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="subtitles-outline"
          label="Legendas por Padrão"
          trailing={
            <GlassSwitch
              value={settings.subtitlesDefault ?? true}
              onValueChange={(value) => handleSettingChange('subtitlesDefault', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="language-outline"
          label="Idioma de Legenda Padrão"
          trailing={
            <GlassSelect
              value={settings.defaultSubtitleLanguage || 'pt-BR'}
              options={[
                { value: 'pt-BR', label: 'Português (Brasil)' },
                { value: 'en-US', label: 'English' },
                { value: 'es-ES', label: 'Español' },
                { value: 'ja-JP', label: '日本語' },
              ]}
              onValueChange={(value) => handleSettingChange('defaultSubtitleLanguage', value)}
              style={{ width: 180 }}
            />
          }
        />
      </GlassCard>
    </View>
  );

  const renderPrivacySection = () => (
    <View style={{ gap: 16 }}>
      <GlassCard variant="surface">
        <SettingsItem
          icon="shield-outline"
          label="Analytics"
          trailing={
            <GlassSwitch
              value={settings.analyticsEnabled ?? true}
              onValueChange={(value) => handleSettingChange('analyticsEnabled', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="bug-outline"
          label="Relatórios de Erro"
          trailing={
            <GlassSwitch
              value={settings.crashReporting ?? true}
              onValueChange={(value) => handleSettingChange('crashReporting', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="ad-outline"
          label="Anúncios Personalizados"
          trailing={
            <GlassSwitch
              value={settings.personalizedAds ?? true}
              onValueChange={(value) => handleSettingChange('personalizedAds', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="share-outline"
          label="Compartilhar Dados de Uso"
          trailing={
            <GlassSwitch
              value={settings.shareUsageData ?? false}
              onValueChange={(value) => handleSettingChange('shareUsageData', value)}
            />
          }
        />
      </GlassCard>

      <GlassCard variant="surface">
        <SettingsItem
          icon="lock-outline"
          label="Bloqueio por Biometria"
          trailing={
            <GlassSwitch
              value={settings.biometricLock ?? false}
              onValueChange={(value) => handleSettingChange('biometricLock', value)}
            />
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="key-outline"
          label="Alterar Senha"
          onPress={() => navigation.navigate('settings', { section: 'change-password' })}
        />
        <GlassDivider />
        <SettingsItem
          icon="devices-outline"
          label="Dispositivos Conectados"
          onPress={() => navigation.navigate('settings', { section: 'devices' })}
        />
      </GlassCard>
    </View>
  );

  const renderDataSection = () => (
    <View style={{ gap: 16 }}>
      <GlassCard variant="surface">
        <SettingsItem
          icon="cloud-download-outline"
          label="Exportar Meus Dados"
          onPress={() => {
            // Export data
            Alert.alert('Exportar Dados', 'Seus dados serão preparados para download.');
          }}
        />
        <GlassDivider />
        <SettingsItem
          icon="trash-outline"
          label="Limpar Cache"
          trailing={
            <GlassButton variant="ghost" size="sm" onPress={() => {
              Alert.alert('Limpar Cache', 'Isso removerá arquivos temporários. Continuar?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Limpar', style: 'destructive', onPress: () => { /* Clear cache */ } },
              ]);
            }}>
              Limpar
            </GlassButton>
          }
        />
        <GlassDivider />
        <SettingsItem
          icon="download-outline"
          label="Gerenciar Downloads"
          onPress={() => navigation.navigate('downloads')}
        />
      </GlassCard>

      <GlassCard variant="surface">
        <SettingsItem
          icon="warning-outline"
          label="Excluir Conta"
          destructive
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
        />
      </GlassCard>
    </View>
  );

  const renderAboutSection = () => (
    <View style={{ gap: 16 }}>
      <GlassCard variant="surface">
        <View style={{ alignItems: 'center', padding: 24, gap: 16 }}>
          <GlassAvatar size="xl" source={require('@assets/images/app-icon.png')} />
          <Text style={{ color: colors.onSurface, fontSize: 24, fontWeight: '700' }}>
            Tomato Animes
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 16 }}>
            Versão 1.6.1 (Build 105)
          </Text>
          <GlassDivider style={{ width: '100%' }} />
          <View style={{ gap: 8, width: '100%' }}>
            <Text style={{ color: colors.onSurface, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
              A melhor experiência de anime no iOS
            </Text>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, textAlign: 'center' }}>
              Desenvolvido com ❤️ usando React Native + Expo
            </Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard variant="surface">
        <SettingsItem
          icon="globe-outline"
          label="Site Oficial"
          onPress={() => { /* Open website */ }}
        />
        <GlassDivider />
        <SettingsItem
          icon="chatbox-outline"
          label="Comunidade / Discord"
          onPress={() => { /* Open Discord */ }}
        />
        <GlassDivider />
        <SettingsItem
          icon="github-outline"
          label="Código Fonte (GitHub)"
          onPress={() => { /* Open GitHub */ }}
        />
        <GlassDivider />
        <SettingsItem
          icon="document-outline"
          label="Termos de Uso"
          onPress={() => { /* Open terms */ }}
        />
        <GlassDivider />
        <SettingsItem
          icon="shield-outline"
          label="Política de Privacidade"
          onPress={() => { /* Open privacy */ }}
        />
        <GlassDivider />
        <SettingsItem
          icon="license-outline"
          label="Licenças de Código Aberto"
          onPress={() => { /* Open licenses */ }}
        />
      </GlassCard>

      <GlassCard variant="surface">
        <SettingsItem
          icon="bug-outline"
          label="Reportar Bug"
          onPress={() => { /* Open bug report */ }}
        />
        <GlassDivider />
        <SettingsItem
          icon="lightbulb-outline"
          label="Sugerir Funcionalidade"
          onPress={() => { /* Open feature request */ }}
        />
        <GlassDivider />
        <SettingsItem
          icon="star-outline"
          label="Avaliar na App Store"
          onPress={() => { /* Open App Store */ }}
        />
      </GlassCard>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Navigation */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {SECTIONS.map(section => (
              <GlassChip
                key={section.key}
                label={section.title}
                leadingIcon={<Ionicons name={section.icon} size={18} color={activeSection === section.key ? colors.onPrimary : colors.onSurfaceVariant} />}
                variant={activeSection === section.key ? 'primary' : 'outline'}
                onPress={() => setActiveSection(section.key)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Section Content */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {renderSection()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingsItem = ({ icon, label, trailing, onPress, destructive }: any) => {
  const { colors } = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        backgroundColor: 'transparent',
      }}
    >
      <Ionicons
        name={icon}
        size={24}
        color={destructive ? colors.error : colors.onSurfaceVariant}
        style={{ width: 28 }}
      />
      <Text style={{ color: destructive ? colors.error : colors.onSurface, fontSize: 16, flex: 1 }}>
        {label}
      </Text>
      {trailing}
    </TouchableOpacity>
  );
};

// Add missing imports
import { Text, TouchableOpacity, Image } from 'react-native';