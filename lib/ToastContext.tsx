import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastContextType = {
  /** Show a brief, non-blocking message (e.g. a soft write failure). */
  notify: (message: string) => void;
};

const ToastContext = createContext<ToastContextType>({ notify: () => {} });

const VISIBLE_MS = 2600;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback(
    (msg: string) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(msg);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(
          ({ finished }) => {
            if (finished) setMessage(null);
          }
        );
      }, VISIBLE_MS);
    },
    [opacity]
  );

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrap, { opacity, bottom: insets.bottom + 90 }]}
        >
          <View style={styles.toast}>
            <Text style={styles.text}>{message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  toast: {
    backgroundColor: "rgba(24,24,27,0.97)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3f3f46",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 18,
    maxWidth: "100%",
  },
  text: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#f4f4f5",
    textAlign: "center",
  },
});
