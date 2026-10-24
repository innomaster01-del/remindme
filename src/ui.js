import React, { createContext, useContext } from 'react';
import {
  View, Text, Pressable, TextInput, Modal, Switch, ScrollView, I18nManager, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R, shadow } from './theme';

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
    // RN mirrors 'left'/'right' text alignment in native RTL, so use the same flip rule.
    align: flip ? 'right' : 'left',
    alignOpp: flip ? 'left' : 'right',
    writing: rtl ? 'rtl' : 'ltr',
    // icons that point "forward" / "back"
    fwd: rtl ? 'chevron-back' : 'chevron-forward',
    back: rtl ? 'chevron-forward' : 'chevron-back',
  };
}

// ---------- primitives ----------
const VARIANTS = {
  display: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  title: { fontSize: 22, fontWeight: '700', color: C.ink },
  h2: { fontSize: 17, fontWeight: '700', color: C.ink },
  body: { fontSize: 16, color: C.ink },
  small: { fontSize: 14, color: C.ink },
  muted: { fontSize: 14, color: C.muted },
  tiny: { fontSize: 12, color: C.muted },
  label: { fontSize: 13, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
};

export function Txt({ v = 'body', style, center, children, ...rest }) {
  const { dir } = useI18n();
  return (
    <Text
      {...rest}
      style={[VARIANTS[v], { textAlign: center ? 'center' : dir.align, writingDirection: dir.writing }, style]}
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

export function Icon({ name, size = 22, color = C.ink, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

export function Card({ style, children, onPress, tint }) {
  const body = (
    <View style={[{ backgroundColor: tint || C.card, borderRadius: R.lg, padding: 14 }, shadow, style]}>{children}</View>
  );
  if (!onPress) return body;
  return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>{body}</Pressable>;
}

export function Button({ title, onPress, variant = 'primary', icon, style, small, disabled }) {
  const { dir } = useI18n();
  const palette = {
    primary: { bg: C.primary, fg: '#fff' },
    soft: { bg: C.primarySoft, fg: C.primary },
    ghost: { bg: 'transparent', fg: C.primary },
    danger: { bg: C.dangerSoft, fg: C.danger },
    outline: { bg: C.card, fg: C.ink, border: C.line },
  }[variant];
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [{
        backgroundColor: palette.bg, borderRadius: R.pill, paddingVertical: small ? 8 : 13,
        paddingHorizontal: small ? 14 : 20, opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        borderWidth: palette.border ? 1 : 0, borderColor: palette.border, alignItems: 'center',
      }, style]}
    >
      <Row gap={6} justify="center">
        {icon ? <Icon name={icon} size={small ? 16 : 19} color={palette.fg} /> : null}
        <Text style={{ color: palette.fg, fontWeight: '700', fontSize: small ? 14 : 16, writingDirection: dir.writing }}>{title}</Text>
      </Row>
    </Pressable>
  );
}

export function IconBtn({ name, onPress, color = C.ink, size = 22, bg, style, label }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [{
        width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
        backgroundColor: bg || 'transparent', opacity: pressed ? 0.6 : 1,
      }, style]}
    >
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon, color = C.primary, style }) {
  const { dir } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        paddingVertical: 8, paddingHorizontal: 14, borderRadius: R.pill,
        backgroundColor: selected ? color : C.card, borderWidth: 1, borderColor: selected ? color : C.line,
        opacity: pressed ? 0.8 : 1,
      }, style]}
    >
      <Row gap={5} justify="center">
        {icon ? <Icon name={icon} size={15} color={selected ? '#fff' : color} /> : null}
        <Text style={{ color: selected ? '#fff' : C.ink, fontWeight: '600', fontSize: 14, writingDirection: dir.writing }}>{label}</Text>
      </Row>
    </Pressable>
  );
}

export function Check({ checked, onPress, color = C.primary, size = 26 }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2, borderWidth: 2,
        borderColor: checked ? color : C.faint, backgroundColor: checked ? color : 'transparent',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {checked ? <Icon name="checkmark" size={size * 0.65} color="#fff" /> : null}
      </View>
    </Pressable>
  );
}

export function Input({ style, multiline, ...rest }) {
  const { dir } = useI18n();
  return (
    <TextInput
      placeholderTextColor={C.faint}
      multiline={multiline}
      {...rest}
      style={[{
        backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.line,
        paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink,
        textAlign: dir.align, writingDirection: dir.writing, minHeight: multiline ? 80 : undefined,
        textAlignVertical: multiline ? 'top' : 'center',
      }, style]}
    />
  );
}

export function Field({ label, hint, children, style }) {
  return (
    <View style={[{ gap: 8, marginBottom: 18 }, style]}>
      {label ? <Txt v="label">{label}</Txt> : null}
      {children}
      {hint ? <Txt v="tiny">{hint}</Txt> : null}
    </View>
  );
}

export function Toggle({ label, value, onChange, hint }) {
  return (
    <Row justify="space-between" style={{ paddingVertical: 8 }}>
      <View style={{ flex: 1 }}>
        <Txt>{label}</Txt>
        {hint ? <Txt v="tiny">{hint}</Txt> : null}
      </View>
      <Switch value={!!value} onValueChange={onChange} trackColor={{ true: C.primary, false: C.line }} thumbColor="#fff" />
    </Row>
  );
}

export function Section({ title, color = C.muted, icon, right, children, style }) {
  return (
    <View style={[{ marginTop: 22 }, style]}>
      <Row justify="space-between" style={{ marginBottom: 10, paddingHorizontal: 4 }}>
        <Row gap={6}>
          {icon ? <Icon name={icon} size={16} color={color} /> : null}
          <Txt v="label" style={{ color }}>{title}</Txt>
        </Row>
        {right}
      </Row>
      {children}
    </View>
  );
}

export function Empty({ icon, title, body, action }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 30, gap: 10 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={34} color={C.primary} />
      </View>
      {title ? <Txt v="h2" center>{title}</Txt> : null}
      {body ? <Txt v="muted" center>{body}</Txt> : null}
      {action}
    </View>
  );
}

export function Banner({ icon = 'alert-circle', text, action, onAction, color = C.danger, soft = C.dangerSoft }) {
  return (
    <View style={{ backgroundColor: soft, borderRadius: R.md, padding: 12, marginTop: 12 }}>
      <Row align="flex-start">
        <Icon name={icon} size={20} color={color} />
        <View style={{ flex: 1, gap: 8 }}>
          <Txt v="small" style={{ color }}>{text}</Txt>
          {action ? (
            <Row><Button small variant="outline" title={action} onPress={onAction} /></Row>
          ) : null}
        </View>
      </Row>
    </View>
  );
}

// Full-screen page with header (used for editors and detail screens).
export function Page({ title, onBack, right, children, scroll = true, footer }) {
  const insets = useSafeAreaInsets();
  const { dir } = useI18n();
  const Body = scroll ? ScrollView : View;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <Row style={{ paddingHorizontal: 8, paddingVertical: 6, minHeight: 52 }} gap={4}>
        {onBack ? <IconBtn name={dir.back} onPress={onBack} size={26} /> : <View style={{ width: 8 }} />}
        <Txt v="title" style={{ flex: 1 }} numberOfLines={1}>{title}</Txt>
        {right}
      </Row>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Body
          style={{ flex: 1 }}
          contentContainerStyle={scroll ? { padding: 16, paddingBottom: 40 + insets.bottom } : undefined}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Body>
        {footer ? (
          <View style={{ padding: 16, paddingBottom: 16 + insets.bottom, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg }}>
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: C.overlay }} onPress={onClose} />
      <View style={{
        backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 18, paddingBottom: 18 + insets.bottom, maxHeight: '88%',
      }}>
        <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 12 }} />
        {title ? <Txt v="h2" style={{ marginBottom: 14 }}>{title}</Txt> : null}
        <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </Modal>
  );
}
