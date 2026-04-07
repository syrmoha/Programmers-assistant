# مساعد المبرمج الذكي (Programmer Assistant)

تطبيق ويب متطور مبني باستخدام **Next.js** و **React**، مصمم خصيصاً لمساعدة المبرمجين في مهامهم اليومية باستخدام الذكاء الاصطناعي (عبر واجهة DeepSeek API). يوفر التطبيق واجهة محادثة ذكية متكاملة مع محرر أكواد برمجي (Monaco Editor).

## 🚀 المميزات الرئيسية

- **محادثة ذكية:** واجهة محادثة سلسة مبنية للحصول على إجابات للمشاكل البرمجية بشكل مباشر.
- **محرر أكواد مدمج:** دمج محرر الأكواد Monaco Editor لدعم كتابة الأكواد بمرونة.
- **أوضاع متعددة للمساعدة:**
  - ⚡ **توليد كود (Generate):** كتابة أكواد جديدة ونظيفة بناءً على متطلباتك.
  - 🔧 **حل الأخطاء (Debug):** تحديد الأخطاء في الكود وشرحها مع تقديم الحلول.
  - 📖 **شرح الكود (Explain):** شرح مفصل ومبسط للأسطر البرمجية لفهم أعمق.
  - 🚀 **تحسين الكود (Optimize):** إعادة صياغة الأكواد لتصبح أكثر كفاءة وتنظيماً.
  - 💬 **محادثة حرة (Chat):** مناقشة عامة واستفسارات برمجية.
- **حفظ المحادثات محلياً:** يتم حفظ سجل محادثاتك في المتصفح (Local Storage) لسهولة العودة إليها وعدم ضياع عملك.
- **دعم اللغة العربية:** واجهة مستخدم وتفاعلات منسقة خصيصاً للتعامل باللغة العربية.
- **عرض الأكواد بشكل منسق:** استخدام `react-markdown` و `react-syntax-highlighter` لعرض الرسائل المخرجة من الذكاء الاصطناعي بشكل منظم ومقروء.

## 🛠 التقنيات المستخدمة

- **إطار العمل:** [Next.js](https://nextjs.org/) (إصدار 14)
- **مكتبة واجهة المستخدم:** [React](https://reactjs.org/) (إصدار 18)
- **محرر الأكواد:** [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **محرك الذكاء الاصطناعي:** [DeepSeek API](https://platform.deepseek.com/)

## ⚙️ متطلبات التشغيل

- [Node.js](https://nodejs.org/) (إصدار 18 فما فوق).
- مساحة عمل مع اتصال إنترنت.
- مفتاح API خاص بـ DeepSeek.

## 📥 التثبيت والتشغيل المحلي

1. **استنساخ المستودع (Clone Repository):**
   ```bash
   git clone https://github.com/YOUR_USERNAME/programmer-assistant.git
   cd programmer-assistant
   ```

2. **تثبيت الحزم المعتمدة (Install Dependencies):**
   ```bash
   npm install
   ```

3. **تكوين متغيرات البيئة (Environment Variables):**
   أنشئ ملفاً باسم `.env.local` في المجلد الجذري للمشروع وأضف مفتاح DeepSeek API الخاص بك كما يلي:
   ```env
   DEEPSEEK_API_KEY=your_api_key_here
   ```

4. **تشغيل الخادم المحلي (Run the Development Server):**
   ```bash
   npm run dev
   ```

5. افتح المتصفح الخاص بك وانتقل إلى الرابط [http://localhost:3000](http://localhost:3000) للبدء في استخدام مساعد البرمجة.

## 📁 هيكلية المشروع الأساسية

```text
programmer-assistant/
├── src/
│   ├── app/
│   │   ├── api/chat/         # مسار واجهة برمجة التطبيقات (API) للاتصال بـ DeepSeek
│   │   ├── components/       # مكونات React (الشريط الجانبي، واجهة المحادثة، محرر الكود)
│   │   ├── globals.css       # الأنماط والتصميم الجمالي CSS
│   │   ├── layout.js         # الهيكل الأساسي للصفحات Next.js
│   │   └── page.js           # الصفحة الرئيسية المحتوية على المنطق العام
├── package.json              # تبعيات وإعدادات المشروع
└── next.config.mjs           # إعدادات تهيئة Next.js
```

## 🤝 المساهمة (Contributing)

نرحب بكافة المساهمات! للمساهمة في المشروع:
1. قم بعمل Fork للمستودع.
2. أنشئ فرعاً جديداً لميزتك (`git checkout -b feature/AmazingFeature`).
3. قم بعمل Commit لتغييراتك (`git commit -m 'Add some AmazingFeature'`).
4. ارفع الفرع الخاص بك (`git push origin feature/AmazingFeature`).
5. افتح طلب سحب (Pull Request).

## 📄 الترخيص (License)

هذا المشروع متاح ومفتوح المصدر تحت ترخيص [MIT](LICENSE).
