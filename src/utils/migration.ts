/**
 * Migration Helper - Map existing Android styles to Liquid Glass equivalents
 * Helps transition from Material Design to iOS 26 glassmorphism
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { themeTokens, type GlassElevation, type Spacing, type CornerRadius } from '../theme/tokens';

/**
 * Android/Material Design to Liquid Glass mapping
 */

// Elevation mapping
export const elevationMap: Record<number, GlassElevation> = {
  0: 'surface',
  1: 'surface',
  2: 'surface',
  3: 'elevated',
  4: 'elevated',
  6: 'elevated',
  8: 'elevated',
  12: 'overlay',
  16: 'overlay',
  24: 'overlay',
};

// Spacing mapping (Material 8dp base -> Liquid Glass 4px base)
export const spacingMap: Record<string, Spacing> = {
  'spacing-xs': '1',    // 4px
  'spacing-sm': '2',    // 8px
  'spacing-md': '3',    // 12px
  'spacing-lg': '4',    // 16px
  'spacing-xl': '5',    // 20px
  'spacing-2xl': '6',   // 24px
  'spacing-3xl': '8',   // 32px
  'spacing-4xl': '10',  // 40px
};

// Border radius mapping
export const borderRadiusMap: Record<string, CornerRadius> = {
  'rounded-none': 'xs',
  'rounded-sm': 'sm',
  'rounded': 'md',
  'rounded-md': 'md',
  'rounded-lg': 'lg',
  'rounded-xl': 'xl',
  'rounded-2xl': 'xl',
  'rounded-full': 'full',
};

// Color mapping (Material -> Semantic)
export const colorMap = {
  // Background
  'surface': 'surface',
  'surface-variant': 'surfaceElevated',
  'background': 'background',
  'on-surface': 'onSurface',
  'on-surface-variant': 'onSurfaceVariant',

  // Primary
  'primary': 'primary',
  'primary-variant': 'primaryVariant',
  'on-primary': 'onPrimary',
  'primary-container': 'primary',
  'on-primary-container': 'onPrimary',

  // Secondary
  'secondary': 'secondary',
  'secondary-variant': 'secondaryVariant',
  'on-secondary': 'onSecondary',
  'secondary-container': 'secondary',
  'on-secondary-container': 'onSecondary',

  // Tertiary
  'tertiary': 'accent',
  'tertiary-variant': 'accentVariant',
  'on-tertiary': 'onAccent',
  'tertiary-container': 'accent',
  'on-tertiary-container': 'onAccent',

  // Error
  'error': 'error',
  'on-error': 'onError',
  'error-container': 'error',
  'on-error-container': 'onError',

  // Success (not in Material, custom)
  'success': 'success',
  'on-success': 'onSuccess',

  // Warning (not in Material, custom)
  'warning': 'warning',
  'on-warning': 'onWarning',

  // Outline
  'outline': 'border',
  'outline-variant': 'divider',
};

// Shadow mapping (Material elevation -> iOS 26 shadows)
export const shadowMap: Record<number, { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number }> = {
  0: themeTokens.shadows.level0,
  1: themeTokens.shadows.level1,
  2: themeTokens.shadows.level1,
  3: themeTokens.shadows.level1,
  4: themeTokens.shadows.level2,
  6: themeTokens.shadows.level2,
  8: themeTokens.shadows.level2,
  12: themeTokens.shadows.level3,
  16: themeTokens.shadows.level3,
  24: themeTokens.shadows.level4,
};

// Component mapping
export const componentMap = {
  // Cards
  'Card': 'GlassCard',
  'CardContent': 'GlassCardSection',
  'CardActions': 'GlassCardSection',
  'CardHeader': 'GlassCardHeader',
  'CardMedia': 'GlassCardSection',

  // Buttons
  'Button': 'GlassButton',
  'IconButton': 'GlassIconButton',
  'Fab': 'GlassButton', // with variant primary, size lg
  'ExtendedFab': 'GlassButton', // with leftIcon

  // Inputs
  'TextField': 'GlassInput',
  'OutlinedTextField': 'GlassInput',
  'FilledTextField': 'GlassInput',
  'TextArea': 'GlassTextArea',
  'Select': 'GlassSelect',
  'Menu': 'GlassSelect',
  'Autocomplete': 'GlassSelect',

  // Navigation
  'AppBar': 'GlassNavigationBar',
  'BottomNavigation': 'GlassTabBar',
  'Drawer': 'GlassSheet',
  'Tabs': 'GlassTabBar',
  'Tab': 'GlassChip',

  // Feedback
  'Snackbar': 'GlassToast',
  'Alert': 'GlassAlert',
  'Dialog': 'GlassModal',
  'BottomSheet': 'GlassBottomSheet',
  'Tooltip': 'GlassTooltip',
  'Backdrop': 'GlassSheet',

  // Data Display
  'Avatar': 'GlassAvatar',
  'Badge': 'GlassBadge',
  'Chip': 'GlassChip',
  'Divider': 'GlassDivider',
  'List': 'GlassCard', // with multiple GlassCard items
  'ListItem': 'GlassCard',
  'Table': 'View', // Custom implementation needed

  // Progress
  'LinearProgress': 'GlassProgress', // variant linear
  'CircularProgress': 'GlassProgress', // variant circular
  'Slider': 'GlassSlider',
  'Switch': 'GlassSwitch',
  'Checkbox': 'GlassSwitch', // Custom implementation needed
  'Radio': 'GlassSwitch', // Custom implementation needed

  // Layout
  'Container': 'GlassView',
  'Box': 'GlassView',
  'Grid': 'View', // Custom implementation needed
  'Stack': 'View', // Custom implementation needed

  // Overlay
  'Modal': 'GlassModal',
  'Popover': 'GlassTooltip',
  'Menu': 'GlassSheet',
};

/**
 * Convert Android/Material style object to Liquid Glass style
 */
export function migrateStyle(
  androidStyle: ViewStyle | TextStyle | ImageStyle,
  options: {
    isDarkMode?: boolean;
    componentType?: string;
  } = {}
): ViewStyle | TextStyle | ImageStyle {
  const { isDarkMode = false, componentType } = options;
  const migrated: any = { ...androidStyle };

  // Map elevation
  if (migrated.elevation !== undefined) {
    const elevation = elevationMap[migrated.elevation] || 'surface';
    delete migrated.elevation;
    // Will be applied via GlassView elevation prop
    migrated._glassElevation = elevation;
  }

  // Map shadow
  if (migrated.shadowColor || migrated.shadowOffset || migrated.shadowOpacity || migrated.shadowRadius) {
    const elevation = migrated.elevation || 0;
    const shadow = shadowMap[elevation];
    if (shadow) {
      Object.assign(migrated, shadow);
    }
    delete migrated.shadowColor;
    delete migrated.shadowOffset;
    delete migrated.shadowOpacity;
    delete migrated.shadowRadius;
  }

  // Map borderRadius
  if (migrated.borderRadius !== undefined) {
    // Convert numeric radius to nearest token
    const radius = migrated.borderRadius;
    if (radius <= 4) migrated.borderRadius = themeTokens.cornerRadii.xs;
    else if (radius <= 8) migrated.borderRadius = themeTokens.cornerRadii.sm;
    else if (radius <= 12) migrated.borderRadius = themeTokens.cornerRadii.md;
    else if (radius <= 16) migrated.borderRadius = themeTokens.cornerRadii.lg;
    else if (radius <= 24) migrated.borderRadius = themeTokens.cornerRadii.xl;
    else migrated.borderRadius = themeTokens.cornerRadii.full;
  }

  // Map colors
  const colorKeys = ['backgroundColor', 'color', 'borderColor', 'tintColor'];
  colorKeys.forEach(key => {
    if (migrated[key]) {
      const value = migrated[key];
      // Check if it's a semantic color reference
      if (typeof value === 'string' && colorMap[value as keyof typeof colorMap]) {
        migrated[key] = colorMap[value as keyof typeof colorMap];
      }
    }
  });

  // Map spacing (margin/padding)
  const spacingKeys = [
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'marginHorizontal', 'marginVertical', 'marginStart', 'marginEnd',
    'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'paddingHorizontal', 'paddingVertical', 'paddingStart', 'paddingEnd',
  ];

  spacingKeys.forEach(key => {
    if (migrated[key] !== undefined && typeof migrated[key] === 'string') {
      const value = migrated[key];
      if (spacingMap[value]) {
        migrated[key] = themeTokens.spacing[spacingMap[value]];
      }
    }
  });

  return migrated;
}

/**
 * Create GlassView props from Android View props
 */
export function createGlassViewProps(androidProps: any): any {
  const glassProps: any = {
    style: migrateStyle(androidProps.style),
  };

  // Elevation
  if (androidProps.elevation !== undefined) {
    glassProps.elevation = elevationMap[androidProps.elevation] || 'surface';
  }

  // Border radius
  if (androidProps.borderRadius !== undefined) {
    const radius = androidProps.borderRadius;
    if (radius <= 4) glassProps.cornerRadius = 'xs';
    else if (radius <= 8) glassProps.cornerRadius = 'sm';
    else if (radius <= 12) glassProps.cornerRadius = 'md';
    else if (radius <= 16) glassProps.cornerRadius = 'lg';
    else if (radius <= 24) glassProps.cornerRadius = 'xl';
    else glassProps.cornerRadius = 'full';
  }

  // Background color -> tintColor
  if (androidProps.backgroundColor) {
    glassProps.tintColor = androidProps.backgroundColor;
  }

  // Opacity
  if (androidProps.opacity !== undefined) {
    glassProps.opacity = androidProps.opacity;
  }

  return glassProps;
}

/**
 * Migration guide for common patterns
 */
export const migrationGuide = {
  // Card with elevation
  card: {
    before: `
      <Card elevation={4} style={styles.card}>
        <CardContent>Content</CardContent>
      </Card>
    `,
    after: `
      <GlassCard variant="elevated" style={styles.card}>
        <GlassCardSection>Content</GlassCardSection>
      </GlassCard>
    `,
  },

  // FAB
  fab: {
    before: `
      <Fab icon={<Icon />} onPress={handlePress} />
    `,
    after: `
      <GlassIconButton variant="primary" size="lg" icon={<Icon />} onPress={handlePress} />
    `,
  },

  // Text Field
  textField: {
    before: `
      <TextField
        label="Email"
        value={value}
        onChangeText={setValue}
        error={error}
      />
    `,
    after: `
      <GlassInput
        label="Email"
        placeholder="Digite seu email"
        value={value}
        onChangeText={setValue}
        error={error}
      />
    `,
  },

  // Bottom Navigation
  bottomNav: {
    before: `
      <BottomNavigation
        value={value}
        onChange={setValue}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Search" icon={<SearchIcon />} />
      </BottomNavigation>
    `,
    after: `
      <GlassTabBar
        activeIndex={value}
        onChange={setValue}
        items={[
          { label: 'Home', icon: <HomeIcon /> },
          { label: 'Search', icon: <SearchIcon /> },
        ]}
      />
    `,
  },

  // Dialog
  dialog: {
    before: `
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Title</DialogTitle>
        <DialogContent>Content</DialogContent>
        <DialogActions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button onPress={handleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
    `,
    after: `
      <GlassModal visible={open} onClose={handleClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Title</Text>
          <Text style={styles.modalMessage}>Content</Text>
          <View style={styles.modalActions}>
            <GlassButton variant="ghost" onPress={handleClose}>Cancel</GlassButton>
            <GlassButton variant="primary" onPress={handleConfirm}>Confirm</GlassButton>
          </View>
        </View>
      </GlassModal>
    `,
  },

  // Snackbar
  snackbar: {
    before: `
      <Snackbar
        open={open}
        onClose={handleClose}
        message="Message"
        action="Action"
        onActionPress={handleAction}
      />
    `,
    after: `
      <GlassToast
        message="Message"
        type="default"
        action={{ label: 'Action', onPress: handleAction }}
        onClose={handleClose}
      />
    `,
  },
};

/**
 * Automated migration helper for StyleSheet
 */
export function migrateStyleSheet(styleSheet: any): any {
  const migrated: any = {};

  Object.keys(styleSheet).forEach(key => {
    const style = styleSheet[key];
    migrated[key] = migrateStyle(style);
  });

  return StyleSheet.create(migrated);
}

/**
 * Component name mapping for automated codemod
 */
export const componentNameMap: Record<string, string> = {
  // Material UI / React Native Paper
  'Card': 'GlassCard',
  'CardContent': 'GlassCardSection',
  'CardActions': 'GlassCardSection',
  'CardCover': 'GlassCardSection',
  'CardTitle': 'Text', // Use GlassTextStyle
  'CardSubtitle': 'Text',
  'CardDescription': 'Text',

  'Button': 'GlassButton',
  'IconButton': 'GlassIconButton',
  'FAB': 'GlassButton',
  'FAB.Extend': 'GlassButton',

  'TextInput': 'GlassInput',
  'TextArea': 'GlassTextArea',
  'Select': 'GlassSelect',
  'Menu': 'GlassSelect',
  'Autocomplete': 'GlassSelect',

  'Appbar': 'GlassNavigationBar',
  'Appbar.Header': 'GlassNavigationBar',
  'Appbar.Action': 'GlassIconButton',
  'Appbar.BackAction': 'GlassNavigationBarBack',

  'BottomNavigation': 'GlassTabBar',
  'BottomNavigation.Action': 'GlassChip',

  'Dialog': 'GlassModal',
  'Dialog.Title': 'Text',
  'Dialog.Content': 'View',
  'Dialog.Actions': 'View',
  'Dialog.ScrollArea': 'ScrollView',

  'BottomSheet': 'GlassBottomSheet',
  'BottomSheet.Handle': 'View',
  'BottomSheet.Content': 'View',

  'Snackbar': 'GlassToast',
  'Alert': 'GlassAlert',
  'Tooltip': 'GlassTooltip',
  'Backdrop': 'GlassSheet',

  'Avatar': 'GlassAvatar',
  'Avatar.Icon': 'GlassAvatar',
  'Avatar.Image': 'GlassAvatar',

  'Badge': 'GlassBadge',
  'Chip': 'GlassChip',
  'Divider': 'GlassDivider',
  'List': 'View', // Map to ScrollView + GlassCard items
  'List.Item': 'GlassCard',
  'List.Title': 'Text',
  'List.Description': 'Text',
  'List.Icon': 'View',
  'List.Accordion': 'GlassCard',
  'List.AccordionSummary': 'GlassCardSection',
  'List.AccordionDetails': 'GlassCardSection',

  'ProgressBar': 'GlassProgress',
  'CircularProgress': 'GlassProgress',
  'Slider': 'GlassSlider',
  'Switch': 'GlassSwitch',
  'Checkbox': 'GlassSwitch', // Custom
  'RadioButton': 'GlassSwitch', // Custom
  'RadioButtonGroup': 'View', // Custom

  'Surface': 'GlassView',
  'Elevation': 'GlassView',

  'Modal': 'GlassModal',
  'Popover': 'GlassTooltip',
  'Drawer': 'GlassSheet',
  'Drawer.Content': 'View',

  'TabView': 'GlassTabBar',
  'TabView.Item': 'GlassChip',
  'TabView.TabBar': 'GlassTabBar',

  'Portal': 'View',
  'Portal.Host': 'View',

  'HelperText': 'Text',
  'Caption': 'Text',
  'Paragraph': 'Text',
  'Headline': 'Text',
  'Title': 'Text',
  'Subheading': 'Text',
  'Body1': 'Text',
  'Body2': 'Text',
  'Button': 'Text',
  'Overline': 'Text',
};

export default {
  migrateStyle,
  createGlassViewProps,
  migrateStyleSheet,
  elevationMap,
  spacingMap,
  borderRadiusMap,
  colorMap,
  shadowMap,
  componentMap,
  migrationGuide,
  componentNameMap,
};