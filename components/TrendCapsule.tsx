// components/TrendCapsule.tsx dosyası

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { TrendingUp } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Trend verisinin yapısını tanımlar.
interface TrendData {
  trend: string; // 'trends' yerine 'trend' olarak düzeltildi
}

export function TrendCapsule() {
  const { colors } = useTheme();
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestTrend = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Kullanıcı oturumu bulunamadı, trend verisi çekilemiyor.');
        setError('Kullanıcı oturumu bulunamadı.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('trend_analyses')
        .select('trend, created_at') // 'trends' yerine 'trend' olarak düzeltildi
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase sorgu hatası:', fetchError);
        throw fetchError;
      }

      if (data) {
        setTrendData({ trend: data.trend }); // 'trends' yerine 'trend' olarak düzeltildi
        console.log('Trend verisi başarıyla çekildi:', data.trend); // 'trends' yerine 'trend' olarak düzeltildi
      } else {
        setTrendData(null); 
        console.log('Belirtilen kullanıcı için trend verisi bulunamadı.');
      }

    } catch (err: any) {
      console.error('Trend verisi yüklenirken genel bir hata oluştu:', err.message || err);
      setError('Trend verisi yüklenemedi: ' + (err.message || 'Bilinmeyen Hata'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestTrend();

    const channel = supabase
      .channel('trend_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trend_analyses'
      }, (payload) => {
        console.log('Supabase gerçek zamanlı değişiklik algılandı:', payload);
        fetchLatestTrend();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      console.log('Supabase kanal aboneliği kaldırıldı.');
    };
  }, []);

  if (loading) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={[styles.container, { backgroundColor: `${colors.primary}15` }]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.text, { color: colors.primary, marginLeft: 8 }]}>Yükleniyor...</Text>
      </Animated.View>
    );
  }

  if (error) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={[styles.container, { backgroundColor: `${colors.error}15` }]}
      >
        <TrendingUp size={16} color={colors.error} style={styles.icon} />
        <Text style={[styles.text, { color: colors.error }]}>{error}</Text>
      </Animated.View>
    );
  }

  if (!trendData || !trendData.trend) { // 'trends' yerine 'trend' olarak düzeltildi
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={[styles.container, { backgroundColor: `${colors.primary}15` }]}
      >
        <TrendingUp size={16} color={colors.primary} style={styles.icon} />
        <Text style={[styles.text, { color: colors.primary }]}>
          Henüz trend analizi yok
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={[styles.container, { backgroundColor: `${colors.primary}15` }]}
    >
      <TrendingUp size={16} color={colors.primary} style={styles.icon} />
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.text, { color: colors.primary }]}
          numberOfLines={1} 
        >
          Lead Sayısı: {trendData.trend} {/* 'trends' yerine 'trend' kullanıldı */}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Daha büyük kapsül
    paddingHorizontal: 16, // Daha büyük kapsül
    borderRadius: 20,
    alignSelf: 'flex-start',
    width: '100%', // Enine uzaması için
  },
  icon: {
    marginRight: 8,
    flexShrink: 0,
  },
  contentContainer: {
    flex: 1,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 16, // Font boyutunu artır
  },
});