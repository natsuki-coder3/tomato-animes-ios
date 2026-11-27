//
//  GlassEffectViewManager.m
//  LiquidGlass
//
//  React Native bridge for GlassEffectView
//

#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTLog.h>
#import "GlassEffectView.h"

@interface GlassEffectViewManager : RCTViewManager
@end

@implementation GlassEffectViewManager

RCT_EXPORT_MODULE(GlassEffectView)

- (UIView *)view
{
  GlassEffectView *view = [[GlassEffectView alloc] init];
  view.clipsToBounds = YES;
  return view;
}

RCT_EXPORT_VIEW_PROPERTY(blurStyle, NSString)
RCT_EXPORT_VIEW_PROPERTY(tintColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(cornerRadius, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(interactive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(vibrancyEnabled, BOOL)

RCT_CUSTOM_VIEW_PROPERTY(blurRadius, NSNumber, GlassEffectView)
{
  if (json) {
    CGFloat radius = [json floatValue];
    // Map radius to blur style
    UIBlurEffectStyle style;
    if (radius <= 10) style = UIBlurEffectStyleSystemUltraThinMaterial;
    else if (radius <= 20) style = UIBlurEffectStyleSystemThinMaterial;
    else if (radius <= 40) style = UIBlurEffectStyleSystemMaterial;
    else if (radius <= 60) style = UIBlurEffectStyleSystemThickMaterial;
    else style = UIBlurEffectStyleSystemChromeMaterial;

    [view setBlurStyle:@(style)];
  }
}

RCT_CUSTOM_VIEW_PROPERTY(shadowLevel, NSNumber, GlassEffectView)
{
  if (json) {
    NSInteger level = [json integerValue];
    // Apply iOS 26 spec shadows
    CALayer *layer = view.layer;
    layer.shadowColor = [UIColor blackColor].CGColor;
    layer.shadowOpacity = 0;
    layer.shadowRadius = 0;
    layer.shadowOffset = CGSizeZero;

    switch (level) {
      case 1:
        layer.shadowOpacity = 0.04;
        layer.shadowRadius = 8;
        layer.shadowOffset = CGSizeMake(0, 2);
        break;
      case 2:
        layer.shadowOpacity = 0.08;
        layer.shadowRadius = 24;
        layer.shadowOffset = CGSizeMake(0, 8);
        break;
      case 3:
        layer.shadowOpacity = 0.12;
        layer.shadowRadius = 40;
        layer.shadowOffset = CGSizeMake(0, 16);
        break;
      case 4:
        layer.shadowOpacity = 0.16;
        layer.shadowRadius = 56;
        layer.shadowOffset = CGSizeMake(0, 24);
        break;
      default:
        break;
    }
  }
}

- (NSDictionary *)constantsToExport
{
  return @{
    @"BlurStyles": @{
      @"ultraThin": @"systemUltraThinMaterial",
      @"thin": @"systemThinMaterial",
      @"regular": @"systemMaterial",
      @"thick": @"systemThickMaterial",
      @"chrome": @"systemChromeMaterial",
    },
    @"ShadowLevels": @{
      @"level0": @0,
      @"level1": @1,
      @"level2": @2,
      @"level3": @3,
      @"level4": @4,
    },
  };
}

@end