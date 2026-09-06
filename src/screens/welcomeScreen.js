import React, { useEffect, useRef, useState} from "react";
import {
    Animated,
    Text,
    Pressable,
    View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from '../styles/welcomeScreenStyles';

const EMOJIS = ['📚', '✏️', '💡', '🎯', '⏰'];
const CIRCLE_SIZE = 184;
const EMOJI_MIN_SIZE = 38;
const EMOJI_MAX_SIZE = 58;
const EMOJI_PADDING = 22;

function getRandomEmojiStyle() {
    const fontSize = Math.floor(
        Math.random() * (EMOJI_MAX_SIZE - EMOJI_MIN_SIZE + 1),
    ) + EMOJI_MIN_SIZE;
    const emojiBoxSize = fontSize * 1.25;
    const maxOffset = Math.max(
        0,
        CIRCLE_SIZE - emojiBoxSize - EMOJI_PADDING * 2,
    );
    const rotation = Math.round(Math.random() * 24 - 12);

    return {
        position: 'absolute',
        top: EMOJI_PADDING + Math.random() * maxOffset,
        left: EMOJI_PADDING + Math.random() * maxOffset,
        fontSize,
        lineHeight: fontSize * 1.2,
        transform: [{ rotate: `${rotation}deg` }],
    };
}

export default function WelcomeScreen({ onGetStarted, onLogin }) {
    const [emojiIndex, setEmojiIndex] = useState(0);
    const [emojiStyle, setEmojiStyle] = useState(getRandomEmojiStyle);
    const emojiOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let cancelled = false;
        let animation;
    
        const runAnimation = () => {
          setEmojiStyle(getRandomEmojiStyle());

          animation = Animated.sequence([
            Animated.timing(emojiOpacity, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
    
            Animated.delay(600),
    
            Animated.timing(emojiOpacity, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
          ]);
    
          animation.start(({ finished }) => {
            if (!finished || cancelled) {
              return;
            }
    
            setEmojiIndex((currentIndex) => {
              return (currentIndex + 1) % EMOJIS.length;
            });
    
            runAnimation();
          });
        };
    
        runAnimation();
    
        return () => {
          cancelled = true;
          animation?.stop();
        };
      }, [emojiOpacity]);

      
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="auto"/>
            <View style={styles.container}>
                {/* Logo */}
                <View style={styles.logoRow}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>S</Text>
                    </View>

                    <View>
                        <Text style={styles.brandName}>Study Buddy</Text>
                        <Text style={styles.subtitle}>Focus smarter, together ^_^</Text>
                    </View>
                </View>
                {/* Illustration */}
                <View style={styles.illustration}>
                    <View style={styles.circle}>
                    <Animated.Text
                        style={[
                        styles.emoji,
                        emojiStyle,
                        { opacity: emojiOpacity },
                        ]}
                    >
                        {EMOJIS[emojiIndex]}
                    </Animated.Text>
                    </View>

                    <View style={[styles.infoCard, styles.focusCard]}>
                        <Text style={styles.icon}>◷</Text>
                        <Text>Focus time</Text>
                    </View>

                    <View style={[styles.infoCard, styles.streakCard]}>
                        <Text style={styles.icon}>✓</Text>
                        <Text style={styles.greenText}>7 day streak</Text>
                    </View>
                    </View>

                {/* Main text */}
                <Text style={styles.title}>Make every study session count</Text>
                <Text style={styles.description}>Track your focus, practice what you learn, and build better.</Text>
                 
                 {/* Buttons */}
                 <View style={styles.buttonContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.pressedButton,
                        ]}
                        onPress={onGetStarted}
                    >
                        <Text style={styles.primaryText}>Get Started</Text>
                    </Pressable>
                    <View style={styles.loginPrompt}>
                        <Text style={styles.loginPromptText}>
                            Already have an account?
                        </Text>

                        <Pressable
                            style={({ pressed }) => [
                                styles.loginLink,
                                pressed && styles.pressedLink,
                            ]}
                            onPress={onLogin}
                        >
                            <Text style={styles.loginText}>Login</Text>
                        </Pressable>
                    </View>
                 </View>

                 <Text style={styles.footer}>
                    Your progress stays yours.
                 </Text>
            </View>
        </SafeAreaView>
    );
}
