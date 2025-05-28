import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: any;
  badge?: number;
}

interface NotificationRequest {
  type: 'single' | 'mass' | 'targeted';
  title: string;
  body: string;
  data?: any;
  // Для single
  pushToken?: string;
  // Для targeted
  userIds?: string[];
  // Для mass
  platform?: 'all' | 'ios' | 'android';
}

serve(async (req) => {
  // Обработка CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Инициализация Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, title, body, data, pushToken, userIds, platform } = await req.json() as NotificationRequest;

    console.log('📨 Получен запрос на отправку:', { type, title, platform });

    let pushTokens: string[] = [];
    let targetUsers: string[] = [];

    // Получаем push токены в зависимости от типа
    switch (type) {
      case 'single':
        if (!pushToken) {
          throw new Error('Push token обязателен для single отправки');
        }
        pushTokens = [pushToken];
        break;

      case 'targeted':
        if (!userIds || userIds.length === 0) {
          throw new Error('User IDs обязательны для targeted отправки');
        }
        
        const { data: targetedTokens, error: targetedError } = await supabaseClient
          .from('push_tokens')
          .select('token, user_id')
          .in('user_id', userIds);

        if (targetedError) throw targetedError;
        
        pushTokens = targetedTokens?.map(t => t.token) || [];
        targetUsers = targetedTokens?.map(t => t.user_id) || [];
        break;

      case 'mass':
        let query = supabaseClient
          .from('push_tokens')
          .select('token, user_id, platform');

        if (platform && platform !== 'all') {
          query = query.eq('platform', platform);
        }

        const { data: massTokens, error: massError } = await query;

        if (massError) throw massError;
        
        pushTokens = massTokens?.map(t => t.token) || [];
        targetUsers = massTokens?.map(t => t.user_id) || [];
        break;

      default:
        throw new Error('Неизвестный тип отправки');
    }

    if (pushTokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Не найдено push токенов для отправки' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`📱 Найдено ${pushTokens.length} токенов для отправки`);

    // Подготавливаем сообщения для Expo Push API
    const messages: PushMessage[] = pushTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      badge: 1,
    }));

    // Отправляем через Expo Push API батчами по 100
    const batchSize = 100;
    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });

        const result = await response.json();
        results.push(result);

        // Подсчитываем успешные и неудачные отправки
        if (result.data) {
          result.data.forEach((item: any) => {
            if (item.status === 'ok') {
              sentCount++;
            } else {
              failedCount++;
              console.error('❌ Ошибка отправки:', item);
            }
          });
        }

        console.log(`✅ Батч ${Math.floor(i/batchSize) + 1} отправлен: ${batch.length} сообщений`);
        
      } catch (error) {
        console.error('❌ Ошибка отправки батча:', error);
        failedCount += batch.length;
      }
    }

    // Сохраняем статистику в базу данных
    if (type === 'mass') {
      try {
        await supabaseClient
          .from('notification_stats')
          .insert({
            title,
            body,
            total_users: targetUsers.length,
            sent_count: sentCount,
            failed_count: failedCount,
            platform: platform || 'all',
            data: data || {}
          });
      } catch (error) {
        console.error('❌ Ошибка сохранения статистики:', error);
      }
    }

    const response = {
      success: true,
      message: 'Push уведомления отправлены',
      stats: {
        total: pushTokens.length,
        sent: sentCount,
        failed: failedCount,
        successRate: Math.round((sentCount / pushTokens.length) * 100)
      },
      results
    };

    console.log('📊 Результат отправки:', response.stats);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Ошибка в Edge Function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}) 