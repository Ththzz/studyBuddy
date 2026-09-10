import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    Text,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import LineIcon from '../components/lineIcon';
import styles from '../styles/setupCompleteScreenStyles';

function formatGoal (minutes = 120) {
    if (minutes < 60 ){
        return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes/60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`
    }
    return `${hours}h ${remainingMinutes}m`
}

export default function SetupCompleteScreen ({
    dailyTargetMinutes = 120,
    onStartStudying,
}) {
    const goalLabel = formatGoal(dailyTargetMinutes);
    const motionProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const motionAnimation = Animated.loop(
            Animated.timing(motionProgress, {
                toValue: 1,
                duration: 1800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        );

        motionAnimation.start();

        return () => {
            motionAnimation.stop();
        };
    }, [motionProgress]);

    const rippleStyle = {
        opacity: motionProgress.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0.45, 0.28, 0],
        }),
        transform: [
            {
                scale: motionProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.55],
                }),
            },
        ],
    };

    const pulseStyle = {
        transform: [
            {
                scale: motionProgress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.08, 1],
                }),
            },
        ],
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="auto" />
            <View style={styles.content}>
                <View style={styles.successStage}>
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.successRipple, rippleStyle]}
                    />

                    <Animated.View
                        style={[styles.successBurst, pulseStyle]}
                    />

                    <View style={styles.successCircle}>
                        <LineIcon
                            name="check"
                            size={44}
                            color="#FFFFFF"
                            strokeWidth={2.3}
                        />
                    </View>
                </View>

                <Text style={styles.eyebrow}>SETUP COMPLETE</Text>
                <Text style={styles.title}>You're all set!</Text>

                <Text style={styles.description}>Your daily goal is{' '}
                    <Text style={styles.descriptionStrong}>{goalLabel}</Text>.
                    {'\n'}
                    A little progress every day adds up.
                </Text>

                <View style={styles.summaryCard}>
                    <View style={styles.settingIcon}>
                        <LineIcon
                        name="clock"
                        size={17}
                        color="#438C31"
                        strokeWidth={1.8}
                        />
                    </View>

                    <View style={styles.summaryCopy}>
                        <Text style={styles.summaryTitle}>Daily focus goal</Text>
                        <Text style={styles.summarySubtitle}>Ready when you are</Text>
                    </View>

                    <Text style={styles.summaryValue}>{goalLabel}</Text>
                </View>

                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed,]}
                    onPress={onStartStudying}
                    accessibilityRole="button"
                    accessibilityLabel="Start Studying"
                >
                    <Text style={styles.primaryButtonText}>Start Studying</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}
