/**
 * Glass Shader - Skia-based glassmorphism fallback for iOS, Android, Web
 * Uses @shopify/react-native-skia for cross-platform glass effects
 */

import { Skia, Shader, BlurStyle, BlurMaskFilter, Paint, Path, Rect, Color } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { useTheme } from '../../../theme/themeProvider';
import { themeTokens } from '../../../theme/tokens';

export interface GlassShaderProps {
  width: number;
  height: number;
  borderRadius: number;
  elevation?: 'surface' | 'elevated' | 'overlay';
  blurRadius?: number;
  tintColor?: string;
  opacity?: number;
  interactive?: boolean;
  children?: React.ReactNode;
}

export interface GlassShaderUniforms {
  refractionIndex: number;
  fresnelPower: number;
  specularIntensity: number;
  specularSharpness: number;
  chromaticAberration: number;
  noiseScale: number;
  noiseSpeed: number;
  time: number;
  resolution: [number, number];
  borderRadius: number;
  tintColor: [number, number, number, number];
  blurRadius: number;
}

const glassVertexShader = `
  attribute vec2 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;
  varying vec2 vPosition;

  void main() {
    vTexCoord = aTexCoord;
    vPosition = aPosition;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const glassFragmentShader = `
  precision highp float;

  varying vec2 vTexCoord;
  varying vec2 vPosition;

  uniform float uRefractionIndex;
  uniform float uFresnelPower;
  uniform float uSpecularIntensity;
  uniform float uSpecularSharpness;
  uniform float uChromaticAberration;
  uniform float uNoiseScale;
  uniform float uNoiseSpeed;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uBorderRadius;
  uniform vec4 uTintColor;
  uniform float uBlurRadius;

  // Pseudo-random noise function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  // Rounded rectangle SDF
  float roundedRectSDF(vec2 p, vec2 size, float radius) {
    vec2 q = abs(p) - size + vec2(radius);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
  }

  void main() {
    vec2 center = uResolution * 0.5;
    vec2 size = uResolution * 0.5 - vec2(2.0);

    // Shape mask
    float dist = roundedRectSDF(vPosition - center, size, uBorderRadius);
    float mask = 1.0 - smoothstep(-1.0, 1.0, dist);

    if (mask < 0.01) {
      discard;
    }

    // Base glass color
    vec3 baseColor = uTintColor.rgb * uTintColor.a;

    // Fresnel effect
    vec2 viewDir = normalize(vPosition - center);
    float fresnel = pow(1.0 - abs(viewDir.y), uFresnelPower);
    vec3 fresnelColor = vec3(1.0, 1.0, 1.0) * fresnel * 0.3;

    // Specular highlights
    float specular = pow(max(0.0, dot(viewDir, vec2(0.0, 1.0))), uSpecularSharpness);
    vec3 specularColor = vec3(1.0, 1.0, 1.0) * specular * uSpecularIntensity;

    // Noise for subtle texture
    vec2 noiseCoord = vPosition * uNoiseScale + uTime * uNoiseSpeed;
    float noiseValue = fbm(noiseCoord) * 0.02;

    // Chromatic aberration
    vec2 uvR = vTexCoord + vec2(uChromaticAberration, 0.0);
    vec2 uvB = vTexCoord - vec2(uChromaticAberration, 0.0);

    // Combine effects
    vec3 color = baseColor + fresnelColor + specularColor + vec3(noiseValue);

    // Add subtle edge highlight
    float edgeHighlight = smoothstep(0.0, 2.0, -dist) * 0.15;
    color += vec3(edgeHighlight);

    // Apply mask
    gl_FragColor = vec4(color, mask * uTintColor.a);
  }
`;

// Skia Runtime Effect for glass shader
const glassRuntimeEffect = Skia.RuntimeEffect.Make(glassFragmentShader);

export const useGlassShader = (props: GlassShaderProps) => {
  const { colors, animatedColors } = useTheme();
  const { elevation = 'surface', blurRadius = 40, tintColor, opacity = 0.72, borderRadius = 12 } = props;

  const elevationConfig = themeTokens.glassElevations[elevation];
  const effectiveBlurRadius = blurRadius ?? elevationConfig.blurRadius;
  const effectiveTintColor = tintColor ?? elevationConfig.tintColor;
  const effectiveOpacity = opacity ?? elevationConfig.opacity;

  // Parse tint color
  const parseColor = (color: string): [number, number, number, number] => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return [
        parseInt(match[1]) / 255,
        parseInt(match[2]) / 255,
        parseInt(match[3]) / 255,
        match[4] ? parseFloat(match[4]) : 1,
      ];
    }
    // Default white with opacity
    return [1, 1, 1, effectiveOpacity];
  };

  const tintColorNormalized = useMemo(() => parseColor(effectiveTintColor), [effectiveTintColor, effectiveOpacity]);

  const uniforms = useMemo<GlassShaderUniforms>(() => ({
    refractionIndex: themeTokens.glassShaderUniforms.refractionIndex,
    fresnelPower: themeTokens.glassShaderUniforms.fresnelPower,
    specularIntensity: themeTokens.glassShaderUniforms.specularIntensity,
    specularSharpness: themeTokens.glassShaderUniforms.specularSharpness,
    chromaticAberration: themeTokens.glassShaderUniforms.chromaticAberration,
    noiseScale: themeTokens.glassShaderUniforms.noiseScale,
    noiseSpeed: themeTokens.glassShaderUniforms.noiseSpeed,
    time: Date.now() / 1000,
    resolution: [props.width, props.height],
    borderRadius,
    tintColor: tintColorNormalized,
    blurRadius: effectiveBlurRadius,
  }), [
    props.width,
    props.height,
    borderRadius,
    tintColorNormalized,
    effectiveBlurRadius,
  ]);

  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setAntiAlias(true);
    return p;
  }, []);

  const shader = useMemo(() => {
    if (!glassRuntimeEffect) return null;
    return glassRuntimeEffect.makeShader(uniforms as any);
  }, [uniforms]);

  const path = useMemo(() => {
    const p = Skia.Path();
    const rect = Skia.XYWHRect(0, 0, props.width, props.height);
    p.addRRect(Skia.RRect(rect, borderRadius));
    return p;
  }, [props.width, props.height, borderRadius]);

  const blurFilter = useMemo(() => {
    return Skia.MaskFilter.MakeBlur(BlurStyle.Normal, effectiveBlurRadius / 2, false);
  }, [effectiveBlurRadius]);

  return {
    shader,
    paint,
    path,
    blurFilter,
    uniforms,
  };
};

// High-level GlassShader component
import { Canvas, Group, useValue, useComputedValue, useClockValue } from '@shopify/react-native-skia';
import React, { forwardRef } from 'react';

export interface GlassShaderViewProps {
  style?: any;
  children?: React.ReactNode;
  elevation?: 'surface' | 'elevated' | 'overlay';
  blurRadius?: number;
  tintColor?: string;
  opacity?: number;
  borderRadius?: number;
  animated?: boolean;
  testID?: string;
}

export const GlassShaderView = forwardRef<React.ComponentRef<typeof Canvas>, GlassShaderViewProps>(
  (
    {
      style,
      children,
      elevation = 'surface',
      blurRadius,
      tintColor,
      opacity,
      borderRadius = 12,
      animated = true,
      testID,
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const clock = useClockValue();

    const elevationConfig = themeTokens.glassElevations[elevation];
    const effectiveBlurRadius = blurRadius ?? elevationConfig.blurRadius;
    const effectiveTintColor = tintColor ?? elevationConfig.tintColor;
    const effectiveOpacity = isReducedTransparency ? 1 : (opacity ?? elevationConfig.opacity);

    const width = useValue(style?.width ?? 300);
    const height = useValue(style?.height ?? 200);

    const time = useComputedValue(() => clock.current / 1000, [clock]);

    const uniforms = useComputedValue(() => ({
      uRefractionIndex: themeTokens.glassShaderUniforms.refractionIndex,
      uFresnelPower: themeTokens.glassShaderUniforms.fresnelPower,
      uSpecularIntensity: themeTokens.glassShaderUniforms.specularIntensity,
      uSpecularSharpness: themeTokens.glassShaderUniforms.specularSharpness,
      uChromaticAberration: themeTokens.glassShaderUniforms.chromaticAberration,
      uNoiseScale: themeTokens.glassShaderUniforms.noiseScale,
      uNoiseSpeed: themeTokens.glassShaderUniforms.noiseSpeed,
      uTime: animated ? time.current : 0,
      uResolution: [width.current, height.current],
      uBorderRadius: borderRadius,
      uTintColor: parseTintColor(effectiveTintColor, effectiveOpacity),
      uBlurRadius: effectiveBlurRadius,
    }), [
      width,
      height,
      borderRadius,
      effectiveTintColor,
      effectiveOpacity,
      effectiveBlurRadius,
      animated,
      time,
    ]);

    const shader = useComputedValue(() => {
      if (!glassRuntimeEffect) return null;
      return glassRuntimeEffect.makeShader(uniforms.current as any);
    }, [uniforms]);

    const path = useComputedValue(() => {
      const p = Skia.Path();
      const rect = Skia.XYWHRect(0, 0, width.current, height.current);
      p.addRRect(Skia.RRect(rect, borderRadius));
      return p;
    }, [width, height, borderRadius]);

    const paint = useMemo(() => {
      const p = Skia.Paint();
      p.setAntiAlias(true);
      return p;
    }, []);

    const blurPaint = useMemo(() => {
      const p = Skia.Paint();
      p.setAntiAlias(true);
      p.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, effectiveBlurRadius / 2, false));
      return p;
    }, [effectiveBlurRadius]);

    return (
      <Canvas style={style} ref={ref as any} testID={testID}>
        {shader.current && (
          <Group>
            <Path path={path.current} paint={paint} shader={shader.current} />
          </Group>
        )}
        {children && (
          <Group>
            {children}
          </Group>
        )}
      </Canvas>
    );
  }
);

function parseTintColor(color: string, opacity: number): [number, number, number, number] {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return [
      parseInt(match[1]) / 255,
      parseInt(match[2]) / 255,
      parseInt(match[3]) / 255,
      match[4] ? parseFloat(match[4]) * opacity : opacity,
    ];
  }
  return [1, 1, 1, opacity];
}

// Simplified glass container using Skia for fallback
export interface GlassContainerProps {
  style?: any;
  children: React.ReactNode;
  elevation?: 'surface' | 'elevated' | 'overlay';
  blurRadius?: number;
  tintColor?: string;
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  testID?: string;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  style,
  children,
  elevation = 'surface',
  blurRadius,
  tintColor,
  opacity,
  borderRadius = 12,
  borderWidth = 0,
  borderColor,
  testID,
}) => {
  const { colors, isReducedTransparency } = useTheme();

  const elevationConfig = themeTokens.glassElevations[elevation];
  const effectiveBlurRadius = blurRadius ?? elevationConfig.blurRadius;
  const effectiveTintColor = tintColor ?? elevationConfig.tintColor;
  const effectiveOpacity = isReducedTransparency ? 1 : (opacity ?? elevationConfig.opacity);

  return (
    <Canvas
      style={[
        style,
        {
          width: style?.width ?? '100%',
          height: style?.height ?? '100%',
        },
      ]}
      testID={testID}
    >
      <GlassShaderView
        style={{ flex: 1 }}
        elevation={elevation}
        blurRadius={effectiveBlurRadius}
        tintColor={effectiveTintColor}
        opacity={effectiveOpacity}
        borderRadius={borderRadius}
        animated={true}
      >
        {children}
      </GlassShaderView>
    </Canvas>
  );
};

export default {
  useGlassShader,
  GlassShaderView,
  GlassContainer,
  glassRuntimeEffect,
  glassFragmentShader,
  glassVertexShader,
};