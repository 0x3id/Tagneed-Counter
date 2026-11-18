# عدّاد الجيش والشرطة — El-Geish & El-Shorta Countdown (PWA)

Progressive Web App لتتبّق الخدمة في **القوات المسلحة** أو **الشرطة**، مع عدّاد حيّ، آية كل يوم، عدّاد زيارات، وتثبيت على شاشة الهاتف. تعمل بالكامل بدون اتصال بعد الزيارة الأولى.

## الملفات

| الملف | الوصف |
| --- | --- |
| `index.html` | التطبيق كاملاً (HTML + CSS + JS) مع بيانات SEO/OG و meta للـ PWA |
| `manifest.json` | إعدادات التثبيت (RTL، standalone، ألوان، أيقونات) |
| `sw.js` | Service Worker — Cache-First / Stale-While-Revalidate |
| `icon-192.png` / `icon-512.png` | أيقونات التطبيق (maskable) |

## التشغيل محلياً

```bash
cd /home/eid/tagnedCounter
python3 -m http.server 8000
# افتح http://localhost:8000
```

> ملاحظة: الـ Service Worker يحتاج `localhost` أو HTTPS. على `file://` لن يعمل التثبيت.

## النشر (Vercel / Netlify / GitHub Pages)

1. انسخ كل الملفات إلى مجلد المشروع.
2. Vercel / Netlify: اسحب المجلد مباشرة أو اربط المستودع، ولا يلزم أي إعداد بناء.
3. GitHub Pages: ادفع الملفات إلى الفرع المنشور (`gh-pages` أو `main` مع تفعيل Pages). إن كان الرابط يحتوي مساراً فرعياً (مثل `username.github.io/repo/`)، كل المسارات في `index.html` و`manifest.json` و`sw.js` نسبية (`./`) وبذلك تعمل كما هي.
4. تأكد أن الموقع يُقدَّم عبر HTTPS (افتراضي في كل الخدمات أعلاه) حتى يعمل التثبيت والـ Service Worker.

## قواعد الحساب

### القوات المسلحة 🪖
- الدفعات: يناير / أبريل / يوليو / أكتوبر.
- **بداية العد الميري** = أول يوم في الشهر الثالث من شهر الدفعة (بعد شهرين من الاستلام).
- الرديف = بداية العد + مدة المؤهل (١٢ / ١٨ / ٢٤ / ٣٦ شهراً).

### الشرطة 🚓
- أشهر الدخول: فبراير / مايو / أغسطس / نوفمبر.
- **بداية العد الرسمي = يوم ٢٥ من الشهر المختار** بالضبط.
- الرديف = ٢٥ من نفس الشهر بعد مدة المؤهل.

### عام
- أيام الزيادة تُضاف وأيام التخفيض تُطرح، والتاريخ اليدوي يتقدّم على كل شيء.
- العدّاد تقويمي مع مراعاة أطوال الشهور والكبيسة.
- آية اليوم تُختار من ١٢ آية وتتغيّر عند منتصف الليل.

## العدّاد الزيارات

- محلياً: `localStorage` + `sessionStorage` لمنع العد المزدوج في نفس الجلسة، ويعمل بدون اتصال.
- عن بُعد: يحاول التطبيق مزامنة `api.counterapi.dev` ثم `api.countapi.xyz` كبديل. إن تعذّر الوصول (أو كان المستخدم غير متصل) تبقى الأرقام المحلية معروضة بسلاسة.
- المفتاحان: `elGeishCountdown.visits.v1` (الأرقام) و`elGeishCountdown.visited.<YYYY-MM-DD>` (جلسة اليوم).

## التطوير

```bash
# فحص صياغة JavaScript المضمن
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const b=[...h.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)];fs.writeFileSync('/tmp/embedded.js',b.map(x=>x[1]).join('\n'));" && node --check /tmp/embedded.js && node --check sw.js
```

الحفظ الشخصي في `localStorage` تحت `elGeishCountdown.authority.v1`.

Developed by **Eid Yasser (0x3id)**.
