// Plays a reminder sound inside the app (no notification), for choosing a sound in Settings.
import { Platform } from 'react-native';
import { createAudioPlayer } from 'expo-audio';

const FILES = {
  chime: require('../assets/sounds/chime.wav'),
  bell: require('../assets/sounds/bell.wav'),
  soft: require('../assets/sounds/soft.wav'),
  digital: require('../assets/sounds/digital.wav'),
};
let player = null;

export function previewSound(name) {
  if (Platform.OS === 'web' || !FILES[name]) return;
  try {
    if (player) { player.remove(); player = null; }
    player = createAudioPlayer(FILES[name]);
    player.play();
  } catch (e) { /* preview is best-effort */ }
}
