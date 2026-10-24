import React, { createContext, useContext, useRef, useState } from 'react';
import {
  View, Text, Pressable, TextInput, Modal, Switch, ScrollView, I18nManager, Platform, KeyboardAvoidingView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { C, R, shadow, ff } from './theme';

// ---------- haptics ----------
export function haptic(kind = 'select') {
  try {
    if (Platform.OS === 'web') return;
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else Haptics.selectionAsync();
  } catch (e) { /* noop */ }
}

// ---------- glass ----------
// Soft neutral backdrop with two faint accent glows, so translucent surfaces read as glass.
export function Backdrop() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <LinearGradient colors={[C.bgFrom, C.bgTo]} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View style={{ position: 'absolute', width: 420, height: 420, borderRadius: 210, top: -160, right: -140, backgroundColor: C.orb, opacity: 0.9 }} />
      <View style={{ position: 'absolute', width: 360, height: 360, borderRadius: 180, bottom: 60, left: -170, backgroundColor: C.orb, opacity: 0.55 }} />
    </View>
  );
}

// Frosted surface. Real blur on iOS; on Android a translucent fill (Android blur is unreliable).
export function Glass({ style, children, intensity = 40, strong }) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint={C.scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
        style={[{ overflow: 'hidden' }, style]}>
        {children}
      </BlurView>
    );
  }
  return <View style={[{ backgroundColor: strong ? C.glassStrong : C.glass, overflow: 'hidden' }, style]}>{children}</View>;
}

// ---------- i18n / direction context ----------
// The app controls direction itself (instead of the phone's system direction), so the
// language can be switched instantly without restarting.
export const I18nCtx = createContext(null);
export const useI18n = () => useContext(I18nCtx);

export function makeDir(rtl) {
  // If the native layout is already RTL, rows are already reversed by the OS.
  const flip = rtl !== I18nManager.isRTL;
  return {
    rtl,
    row: flip ? 'row-reverse' : 'row',
    align: flip ? 'right' : 'left',
    alignOpp: flip ? 'left' : 'right',
    start: flip ? 'flex-end' : 'flex-start',
    writing: rtl ? 'rtl' : 'ltr',
    fwd: rtl ? 'chevron-back' : 'chevron-forward',
    back: rtl ? 'chevron-forward' : 'chevron-back',
  };
}

// ---------- text ----------
const VARIANTS = () => ({
  display: { fontSize: 32, color: C.ink, letterSpacing: -0.6, lineHeight: 38, ...ff(800) },
  title: { fontSize: 22, color: C.ink, letterSpacing: -0.3, ...ff(700) },
  h2: { fontSize: 17, color: C.ink, ...ff(600) },
  body: { fontSize: 16, color: C.ink, lineHeight: 22, ...ff(400) },
  strong: { fontSize: 16, color: C.ink, lineHeight: 22, ...ff(500) },
  small: { fontSize: 14, color: C.ink, lineHeight: 19, ...ff(400) },
  muted: { fontSize: 14, color: C.muted, lineHeight: 19, ...ff(400) },
  tiny: { fontSize: 12.5, color: C.muted, ...ff(500) },
  label: { fontSize: 14, color: C.muted, ...ff(600) },
});

export function Txt({ v = 'body', w, style, center, children, ...rest }) {
  const { dir } = useI18n();
  return (
    <Text
      {...rest}
      style={[VARIANTS()[v], w ? ff(w) : null, { textAlign: center ? 'center' : dir.align, writingDirection: dir.writing }, style]}
    >
      {children}
    </Text>
  );
}

export function Row({ style, align = 'center', justify, gap = 8, children, ...rest }) {
  const { dir } = useI18n();
  return (
    <View {...rest} style={[{ flexDirection: dir.row, alignItems: align, justifyContent: justify, gap }, style]}>
      {children}
    </View>
  );
}

export function Icon({ name, size = 22, color, style }) {
  return <Ionicons name={name} size={size} color={color || C.ink} style={style} />;
}

export function Card({ style, children, onPress, tint, flat }) {
  const body = (
    <View style={[{ backgroundColor: tint || C.card, borderRadius: R.lg, padding: 16 }, flat ? null : shadow(1), style]}>{children}</View>
  );
  if (!onPress) return body;
  return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>{body}</Pressable>;
}

export function Button({ title, onPress, variant = 'primary', icon, style, small, disabled, color }) {
  const { dir } = useI18n();
  const accent = color || C.primary;
  const palette = {
    primary: { bg: accent, fg: C.onPrimary },
    soft: { bg: color ? C.card : C.primarySoft, fg: accent },
    ghost: { bg: 'transparent', fg: accent },
    danger: { bg: C.dangerSoft, fg: C.danger },
    outline: { bg: C.card, fg: C.ink, border: C.line },
  }[variant];
  return (
    <Pressable
      onPress={disabled ? undefined : () => { haptic('light'); onPress && onPress(); }}
      style={({ pressed }) => [{
        backgroundColor: palette.bg, borderRadius: R.pill, minHeight: small ? 36 : 52, justifyContent: 'center',
        paddingHorizontal: small ? 14 : 22, opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        borderWidth: palette.border ? 1 : 0, borderColor: palette.border, alignItems: 'center',
        transform: [{ scale: pressed ? 0.98 : 1 }],
      }, style]}
    >
      <Row gap={7} justify="center">
        {icon ? <Icon name={icon} size={small ? 16 : 20} color={palette.fg} /> : null}
        <Text style={{ color: palette.fg, fontSize: small ? 14 : 16, writingDirection: dir.writing, ...ff(600) }}>{title}</Text>
      </Row>
    </Pressable>
  );
}

export function IconBtn({ name, onPress, color, size = 22, bg, style, label, badge }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [{
        width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
        backgroundColor: bg || 'transparent', opacity: pressed ? 0.6 : 1,
      }, style]}
    >
      <Icon name={name} size={size} color={color || C.ink} />
      {badge ? <View style={{ position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: C.bday, borderWidth: 2, borderColor: C.card }} /> : null}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon, color, style }) {
  const { dir } = useI18n();
  const accent = color || C.primary;
  return (
    <Pressable
      onPress={onPress ? () => { haptic(); onPress(); } : undefined}
      style={({ pressed }) => [{
        minHeight: 38, paddingHorizontal: 14, borderRadius: R.pill, justifyContent: 'center',
        backgroundColor: selected ? accent : C.sunken, opacity: pressed ? 0.8 : 1,
      }, style]}
    >
      <Row gap={5} justify="center">
        {icon ? <Icon name={icon} size={15} color={selected ? C.onPrimary : accent} /> : null}
        <Text numberOfLines={1} style={{ color: selected ? C.onPrimary : C.ink, fontSize: 14, writingDirection: dir.writing, ...ff(500) }}>{label}</Text>
      </Row>
    </Pressable>
  );
}

export function Segmented({ options, value, onChange }) {
  const { dir } = useI18n();
  return (
    <View style={{ flexDirection: dir.row, backgroundColor: C.sunken, borderRadius: R.pill, padding: 4 }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => { haptic(); onChange(o.value); }} style={[{
            flex: 1, paddingVertical: 9, borderRadius: R.pill, alignItems: 'center', backgroundColor: sel ? C.card : 'transparent',
          }, sel ? shadow(1) : null]}>
            <Text style={{ fontSize: 14, color: sel ? C.ink : C.muted, writingDirection: dir.writing, ...ff(sel ? 600 : 500) }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Round checkbox with a small "pop" when ticked.
export function Check({ checked, onPress, color, size = 26 }) {
  const accent = color || C.primary;
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    if (!checked) {
      haptic('success');
      scale.setValue(0.7);
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
    } else haptic();
    onPress && onPress();
  };
  return (
    <Pressable onPress={press} hitSlop={12} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <Animated.View style={{
        width: size, height: size, borderRadius: size / 2, borderWidth: 2,
        borderColor: checked ? accent : C.faint, backgroundColor: checked ? accent : 'transparent',
        alignItems: 'center', justifyContent: 'center', transform: [{ scale }],
      }}>
        {checked ? <Icon name="checkmark" size={size * 0.62} color={C.onPrimary} /> : null}
      </Animated.View>
    </Pressable>
  );
}

export function Input({ style, multiline, ...rest }) {
  const { dir } = useI18n();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={C.faint}
      multiline={multiline}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      selectionColor={C.primary}
      {...rest}
      style={[{
        backgroundColor: C.card, borderRadius: R.md, borderWidth: 1.5, borderColor: focus ? C.primary : C.line,
        paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: C.ink, ...ff(400),
        textAlign: dir.align, writingDirection: dir.writing, minHeight: multiline ? 90 : undefined,
        textAlignVertical: multiline ? 'top' : 'center',
      }, style]}
    />
  );
}

export function Field({ label, hint, children, style }) {
  return (
    <View style={[{ gap: 10, marginBottom: 22 }, style]}>
      {label ? <Txt v="label">{label}</Txt> : null}
      {children}
      {hint ? <Txt v="tiny" style={{ ...ff(400) }}>{hint}</Txt> : null}
    </View>
  );
}

export function Toggle({ label, value, onChange, hint, icon, color }) {
  const { dir } = useI18n();
  return (
    <Pressable onPress={() => { haptic(); onChange(!value); }} accessibilityRole="switch" accessibilityState={{ checked: !!value }}
      style={{ flexDirection: dir.row, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, gap: 12 }}>
      {icon ? (
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.sunken, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={18} color={color || C.primary} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Txt>{label}</Txt>
        {hint ? <Txt v="tiny" style={{ ...ff(400) }}>{hint}</Txt> : null}
      </View>
      <Switch value={!!value} onValueChange={(v) => { haptic(); onChange(v); }} trackColor={{ true: C.primary, false: C.line }} thumbColor="#fff" />
    </Pressable>
  );
}

export function Section({ title, color, icon, right, children, style, count }) {
  return (
    <View style={[{ marginTop: 26 }, style]}>
      <Row justify="space-between" style={{ marginBottom: 10, paddingHorizontal: 2 }}>
        <Row gap={8}>
          {icon ? <Icon name={icon} size={17} color={C.muted} /> : null}
          <Txt v="h2">{title}</Txt>
          {count ? <Txt v="tiny" style={{ color: C.faint }}>{count}</Txt> : null}
        </Row>
        {right}
      </Row>
      {children}
    </View>
  );
}

export function Empty({ icon, title, body, action, color }) {
  const accent = color || C.primary;
  return (
    <View style={{ alignItems: 'center', paddingVertical: 44, paddingHorizontal: 30, gap: 10 }}>
      <View style={[{ width: 76, height: 76, borderRadius: 26, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }, shadow(1)]}>
        <Icon name={icon} size={34} color={accent} />
      </View>
      {title ? <Txt v="h2" center style={{ marginTop: 6 }}>{title}</Txt> : null}
      {body ? <Txt v="muted" center>{body}</Txt> : null}
      {action}
    </View>
  );
}

export function Banner({ icon = 'alert-circle', text, action, onAction, color, soft }) {
  const fg = color || C.danger;
  return (
    <View style={{ backgroundColor: soft || C.dangerSoft, borderRadius: R.md, padding: 14, marginTop: 14 }}>
      <Row align="flex-start" gap={10}>
        <Icon name={icon} size={20} color={fg} />
        <View style={{ flex: 1, gap: 10 }}>
          <Txt v="small" style={{ color: fg, ...ff(500) }}>{text}</Txt>
          {action ? (
            <Row><Button small variant="outline" title={action} onPress={onAction} /></Row>
          ) : null}
        </View>
      </Row>
    </View>
  );
}

// Full-screen page with a header (editors, details, birthdays, settings).
export function Page({ title, onBack, right, children, scroll = true, footer, big }) {
  const insets = useSafeAreaInsets();
  const { dir } = useI18n();
  const Body = scroll ? ScrollView : View;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <Backdrop />
      <Row style={{ paddingHorizontal: 8, paddingVertical: 6, minHeight: 54 }} gap={4}>
        {onBack ? <IconBtn name={dir.back} onPress={onBack} size={26} bg={C.card} /> : <View style={{ width: 8 }} />}
        {!big ? <Txt v="title" style={{ flex: 1, marginHorizontal: 6 }} numberOfLines={1}>{title}</Txt> : <View style={{ flex: 1 }} />}
        {right}
      </Row>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Body
          style={{ flex: 1 }}
          contentContainerStyle={scroll ? { padding: 18, paddingTop: 6, paddingBottom: 40 + insets.bottom } : undefined}
          keyboardShouldPersistTaps="handled"
        >
          {big ? <Txt v="display" style={{ marginBottom: 4 }}>{title}</Txt> : null}
          {children}
        </Body>
        {footer ? (
          <View style={{ padding: 16, paddingBottom: 16 + insets.bottom }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

// Bottom sheet modal.
export function Sheet({ visible, onClose, title, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: C.overlay }} onPress={onClose} />
      <Glass strong intensity={80} style={{
        borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, borderWidth: 1, borderColor: C.glassBorder,
        padding: 20, paddingTop: 10, paddingBottom: 20 + insets.bottom, maxHeight: '90%',
      }}>
        <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: C.line, marginBottom: 14 }} />
        {title ? <Txt v="title" style={{ marginBottom: 16 }}>{title}</Txt> : null}
        <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </Glass>
    </Modal>
  );
}

// ---------- toast with undo ----------
export const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ toast, onClose }) {
  const insets = useSafeAreaInsets();
  const { dir } = useI18n();
  if (!toast) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 14, right: 14, bottom: insets.bottom + 92 }}>
      <View style={[{
        flexDirection: dir.row, alignItems: 'center', gap: 10, backgroundColor: C.ink, borderRadius: R.md,
        paddingVertical: 12, paddingHorizontal: 16,
      }, shadow(2)]}>
        {toast.icon ? <Icon name={toast.icon} size={18} color={C.bg} /> : null}
        <Text style={{ flex: 1, color: C.bg, fontSize: 15, writingDirection: dir.writing, textAlign: dir.align, ...ff(500) }} numberOfLines={2}>{toast.text}</Text>
        {toast.action ? (
          <Pressable hitSlop={10} onPress={() => { haptic(); toast.onAction && toast.onAction(); onClose(); }}>
            <Text style={{ color: C.scheme === 'dark' ? C.primary : '#AEB6FF', fontSize: 15, ...ff(700) }}>{toast.action}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
