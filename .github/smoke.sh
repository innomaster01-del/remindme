#!/bin/bash
# Emulator end-to-end test: install, launch, onboarding, keyboard behaviour, a real reminder, tabs.
APP=com.remindme.personal
OUT=/tmp/smoke
mkdir -p $OUT
adb install -r out/PoofReminder.apk
adb shell pm grant $APP android.permission.POST_NOTIFICATIONS || true
adb logcat -c
adb shell monkey -p $APP -c android.intent.category.LAUNCHER 1
sleep 20

log() { echo "$1" >> $OUT/screens.txt; }
dump() {  # $1 = name
  adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
  adb pull /sdcard/ui.xml $OUT/$1.xml >/dev/null 2>&1
  log "[$1] $(grep -o 'text="[^"]*"' $OUT/$1.xml | sed 's/text=//' | tr -d '"' | grep -v '^$' | head -30 | tr '\n' '|')"
}
center() {  # $1 = attribute pattern, $2 = dump name → prints "x y"
  local b
  b=$(grep -o "$1[^>]*bounds=\"\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]\"" $OUT/$2.xml | head -1 | grep -o 'bounds="[^"]*"' | grep -o '[0-9]*')
  [ -z "$b" ] && return 1
  set -- $b
  echo "$(( ($1 + $3) / 2 )) $(( ($2 + $4) / 2 ))"
}
tap_text() { local c; c=$(center "text=\"$1\"" $2) || { log "[tap] '$1' not found"; return; }; adb shell input tap $c; sleep 4; }
tap_desc() { local c; c=$(center "content-desc=\"$1\"" $2) || { log "[tap] desc '$1' not found"; return 1; }; adb shell input tap $c; }
kbd() { adb shell dumpsys input_method | grep -o 'mInputShown=[a-z]*' | head -1; }

dump 1-start
tap_text "עברית" 1-start
dump 2-after-language
tap_text "אחר כך" 2-after-language
dump 3-home

# --- keyboard: tap the quick-add field and check the keyboard stays open ---
if tap_desc quick-add 3-home; then
  sleep 1; k1=$(kbd); sleep 3; k2=$(kbd)
  log "[keyboard home] after 1s: $k1 | after 4s: $k2"
  # --- real reminder: a task 2 minutes from now, then leave the app ---
  adb shell input text "smoke%sreminder%sin%s2%sminutes"
  adb shell input keyevent 66
  sleep 3
  dump 4-after-quick-add
  adb shell input keyevent 4   # hide keyboard
  adb shell input keyevent 3   # home: app goes to background
  sleep 150
  adb shell dumpsys notification --noredact > $OUT/notifications.txt 2>/dev/null
  if grep -q "smoke reminder" $OUT/notifications.txt; then log "[reminder] POSTED"; else log "[reminder] NOT POSTED"; fi
  grep -n "pkg=$APP" $OUT/notifications.txt | head -5 >> $OUT/screens.txt
  adb shell monkey -p $APP -c android.intent.category.LAUNCHER 1
  sleep 6
fi

# --- tabs, and the quick-add field on the Tasks tab ---
dump 5-back
tap_text "משימות" 5-back
dump 6-tasks
if tap_desc quick-add 6-tasks; then sleep 1; k1=$(kbd); sleep 3; k2=$(kbd); log "[keyboard tasks] after 1s: $k1 | after 4s: $k2"; adb shell input keyevent 4; sleep 1; fi
tap_text "פתקים" 6-tasks
dump 7-notes
# create a note so the search field appears, then test the keyboard in it
if tap_desc "+" 7-notes; then sleep 3; adb shell input text "smoke%snote"; sleep 1; adb shell input keyevent 4; sleep 1; adb shell input keyevent 4; sleep 3; fi
dump 7b-notes-list
if tap_desc notes-search 7b-notes-list; then sleep 1; k1=$(kbd); sleep 3; k2=$(kbd); log "[keyboard notes search] after 1s: $k1 | after 4s: $k2"; adb shell input keyevent 4; sleep 1; fi
dump 7c-notes
tap_text "יומן" 7c-notes
dump 8-calendar
adb exec-out screencap -p > out/smoke.png || true

if adb shell pidof $APP >/dev/null; then echo APP_RUNNING > $OUT/status.txt; else echo APP_NOT_RUNNING > $OUT/status.txt; fi
adb logcat -d -v brief > $OUT/logcat.txt || true
grep "\[dbg\]" $OUT/logcat.txt | head -40 >> $OUT/screens.txt
