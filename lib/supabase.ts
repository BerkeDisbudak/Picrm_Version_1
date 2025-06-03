import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set up real-time subscription for reports
// Bu blokta, aboneliği döndüren bir değişkeni yakalamalıyız
// ve ardından uygulamamızın yaşam döngüsünde aboneliği iptal etmeliyiz.
// Şimdilik, genel bir çözüm olarak burada bir değişken tanımlayabiliriz.
// Ancak, daha iyi bir yaklaşım, bu abonelikleri belirli React bileşenlerinin
// useEffect kancaları içinde yönetmek olacaktır.
// Yine de, bu hatayı gidermek için, abonelik nesnesinin düzgün bir şekilde
// yönetildiğinden emin olalım.

let reportsChannel: any = null; // reports kanalını tutacak değişken

if (Platform.OS === 'web') {
  // Eğer kanal henüz oluşturulmadıysa ve abone olunmadıysa
  if (!reportsChannel || reportsChannel.state === 'closed') { 
    reportsChannel = supabase
      .channel('reports')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Reports',
      }, () => {
        // Dispatch custom event for real-time updates
        const event = new CustomEvent('reportUpdate');
        window.dispatchEvent(event);
      })
      .subscribe();

    // Uygulama kapatıldığında veya yeniden yüklendiğinde aboneliği iptal et
    // Bu, StackBlitz'in "destroy is not a function" hatasına neden olan
    // yaşam döngüsü sorunlarını gidermeye yardımcı olabilir.
    // Bu listener'ı yalnızca bir kez eklediğimizden emin olmalıyız.
    if (!window.__supabaseReportsChannelCleanupRegistered) {
      window.addEventListener('beforeunload', () => {
        if (reportsChannel) {
          reportsChannel.unsubscribe();
          reportsChannel = null; // Kanalı sıfırla
        }
      });
      window.__supabaseReportsChannelCleanupRegistered = true; // Kayıtlı olduğunu işaretle
    }
  }
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  report: string;
  created_at: string;
}

export async function createReport(title: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('Reports')
    .insert([
      {
        title,
        report: content,
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReports() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('Reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteReport(id: string) {
  const { error } = await supabase
    .from('Reports')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Global scope'a bu değişkeni ekliyoruz ki, birden fazla kez tanımlanmasın
declare global {
  interface Window {
    __supabaseReportsChannelCleanupRegistered?: boolean;
  }
}