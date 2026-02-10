// api/chat.js
export const config = {
  runtime: 'edge', // هذا يجعل السيرفر سريعاً جداً
};

export default async function handler(req) {
  // 1. التعامل مع سياسات الأمان (CORS) للسماح لموقعك بالاتصال
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { prompt } = await req.json();
    
    // 2. مفتاحك السري (سنضعه في إعدادات الموقع لاحقاً)
    const apiKey = process.env.GEMINI_API_KEY; 

    // 3. الاتصال بسيرفرات جوجل من الخلفية (آمن 100%)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const data = await response.json();

    // 4. إرسال الإجابة لموقعك
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', 
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}

