export async function POST(request) {
  try {
    const { messages, mode } = await request.json();

    const systemPrompt = `أنت مهندس برمجيات خبير يعمل كمساعد برمجي ذكي. لديك خبرة واسعة في:

- JavaScript (ES6+, Node.js, React, Next.js, Vue.js, Angular)
- Python (Django, Flask, FastAPI, Data Science)
- تطوير الويب (HTML, CSS, APIs, Databases)
- PHP (Laravel, WordPress)
- C++ و Java
- حل الأخطاء البرمجية (Debugging)
- الخوارزميات وهياكل البيانات
- هندسة البرمجيات وأنماط التصميم (Design Patterns)
- أفضل ممارسات كتابة الكود (Clean Code, SOLID, DRY)
- Git و DevOps

قواعد الرد:
1. اكتب ردودك بالعربية بشكل افتراضي، لكن اكتب الكود بالإنجليزية دائماً.
2. عند كتابة الكود، استخدم دائماً code blocks مع تحديد اللغة.
3. اشرح الكود بطريقة بسيطة وواضحة.
4. إذا كان هناك خطأ في الكود، حدد الخطأ بدقة واشرح سببه وقدم الحل.
5. قدم أفضل الممارسات والنصائح عند الإمكان.
6. كن مختصراً ومفيداً.

${mode === 'generate' ? 'المستخدم يريد توليد كود جديد. اكتب كوداً نظيفاً ومنظماً مع شرح مختصر.' : ''}
${mode === 'debug' ? 'المستخدم يريد حل خطأ برمجي. حلل الكود بدقة، حدد الخطأ، اشرح المشكلة، وقدم الحل مع الكود المصحح.' : ''}
${mode === 'explain' ? 'المستخدم يريد شرح كود. اشرح الكود سطراً بسطر بطريقة بسيطة تساعد على التعلم والفهم.' : ''}
${mode === 'optimize' ? 'المستخدم يريد تحسين كود. حلل الكود وقدم نسخة محسنة أكثر كفاءة وتنظيماً مع شرح التحسينات.' : ''}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { error: `DeepSeek API error: ${response.status} - ${error}` },
        { status: response.status }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch (e) {
                // skip malformed JSON
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return Response.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
