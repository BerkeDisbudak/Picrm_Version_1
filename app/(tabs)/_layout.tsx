import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
// İkonlar için doğru import yolları (lucide-react-native)
import { Chrome as Home, FileText, TrendingUp, Settings, Lock } from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 90,
          paddingBottom: 24,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 13,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerShown: false,
      }}
    >
      {/* Ana Sayfa Sekmesi */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Home color={color} size={size} />
            </View>
          ),
        }}
      />
      {/* Raporlar Sekmesi */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Raporlar',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <FileText color={color} size={size} />
            </View>
          ),
        }}
      />
      {/* Trendler Sekmesi */}
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trendler',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <TrendingUp color={color} size={size} />
            </View>
          ),
        }}
      />
      {/* Gizlilik Sekmesi */}
      <Tabs.Screen
        name="privacy"
        options={{
          title: 'Gizlilik',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Lock color={color} size={size} />
            </View>
          ),
        }}
      />
      {/* Ayarlar Sekmesi */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Settings color={color} size={size} />
            </View>
          ),
        }}
      />
      {/* Profile sekmesi kaldırıldı */}
      {/* <Tabs.Screen
        name="profile"
        options={{
          href: null // Bu sekmeyi doğrudan gezintiden kaldırır
        }}
      /> */}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
});