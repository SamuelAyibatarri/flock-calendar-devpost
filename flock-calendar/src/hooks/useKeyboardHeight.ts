import { useEffect, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';

export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        try {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } catch {}
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        try {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } catch {}
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardHeight;
}
