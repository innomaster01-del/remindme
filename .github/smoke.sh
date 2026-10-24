#!/bin/bash
# Emulator smoke test: install, launch, walk through onboarding, record what is on screen.
APP=com.remindme.personal
OUT=/tmp/smoke
mkdir -p $OUT
adb install -r out/RemindMe.apk
adb logcat -c
adb shell monkey -p $APP -c android.intent.category.LAUNCHER 1
sleep 20

dump() {  # $1 = name
  adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
  adb pull /sdcard/ui.xml $OUT/$1.xml >/dev/null 2>&1
  echo "[$1] $(grep -o 'text="[^"]*"' $OUT/$1.xml | sed 's/text=//' | tr -d '"' | grep -v '^$' | head -30 | tr '\n' '|')" >> $OUT/screens.txt
}
tap_text() {  # tap the centre of the first node whose text contains $1
  local b
  b=$(grep -o "text=\"[^\"]*$1[^\"]*\"[^>]*bounds=\"\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]\"" $OUT/$2.xml | head -1 | grep -o 'bounds="[^"]*"' | grep -o '[0-9]*')
  if [ -z "$b" ]; then echo "[tap] '$1' not found" >> $OUT/screens.txt; return; fi
  set -- $b
  adb shell input tap $(( ($1 + $3) / 2 )) $(( ($2 + $4) / 2 ))
  sleep 4
}

dump 1-start
tap_text "עברית" 1-start
dump 2-after-language
tap_text "אחר כך" 2-after-language
dump 3-home
tap_text "פתקים" 3-home
dump 4-notes
tap_text "יומן" 4-notes
dump 5-calendar
tap_text "קניות" 5-calendar
dump 6-shopping
adb exec-out screencap -p > out/smoke.png || true

if adb shell pidof $APP >/dev/null; then echo APP_RUNNING > $OUT/status.txt; else echo APP_NOT_RUNNING > $OUT/status.txt; fi
adb logcat -d -v brief > $OUT/logcat.txt || true
