# دليل النشر السريع - MOI Fingerprint System

## الطريقة الأسهل: نشر يدوي على Render (10 دقائق)

### الخطوة 1: إنشاء قاعدة البيانات (دقيقتان)

1. اذهب إلى: https://dashboard.render.com
2. اضغط **New +** (الزر الأزرق أعلى اليمين)
3. اختر **PostgreSQL**
4. املأ النموذج:
   - **Name:** `moi-fingerprint-db`
   - **Database:** `moi_fingerprint`
   - **User:** `moi_user`
   - **Region:** Singapore (الأقرب للكويت)
   - **PostgreSQL Version:** 16 (الافتراضي)
   - **Plan:** Free
5. اضغط **Create Database**
6. انتظر دقيقة حتى يصبح الوضع "Available"
7. **مهم جداً:** انسخ **Internal Database URL** (ستجده في قسم Connections)
   - يبدأ بـ: `postgresql://...`

---

### الخطوة 2: نشر الباك إند (3 دقائق)

1. اضغط **New +** → **Web Service**
2. اختر **Build and deploy from a Git repository**
3. اضغط **Connect a repository** → ابحث عن **Nedo960/moi-fingerprint-system**
4. اضغط **Connect**
5. املأ النموذج:
   - **Name:** `moi-fingerprint-backend`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Region:** Singapore
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. اضغط **Advanced** (زر صغير تحت)
7. اضغط **Add Environment Variable** وأضف الأربعة التالية:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | الصق الـ Internal Database URL من الخطوة 1 |
   | `JWT_SECRET` | `moi-demo-secret-key-2024` |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |

8. اضغط **Create Web Service**
9. انتظر 3-5 دقائق حتى يكتمل البناء
10. **انسخ URL الباك إند** (مثل: `https://moi-fingerprint-backend.onrender.com`)

---

### الخطوة 3: تعبئة قاعدة البيانات بالحسابات التجريبية (دقيقة)

1. في صفحة الباك إند على Render، اضغط **Shell** (في القائمة اليسرى)
2. اكتب الأمر التالي واضغط Enter:
   ```
   npm run seed
   ```
3. يجب أن ترى: ✅ Demo accounts seeded successfully

---

### الخطوة 4: نشر الفرونت إند (3 دقائق)

1. اضغط **New +** → **Static Site**
2. اختر **Nedo960/moi-fingerprint-system**
3. املأ النموذج:
   - **Name:** `moi-fingerprint-frontend`
   - **Root Directory:** `frontend`
   - **Branch:** main
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. اضغط **Advanced**
5. أضف متغير بيئة واحد:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://moi-fingerprint-backend.onrender.com/api`
     (استبدل بالـ URL الفعلي من الخطوة 2)
6. اضغط **Create Static Site**
7. انتظر 5 دقائق حتى يكتمل البناء

---

### الخطوة 5: اختبار النظام ✅

1. افتح رابط الفرونت إند (مثل: `https://moi-fingerprint-frontend.onrender.com`)
2. سجل دخول بأحد الحسابات:
   - موظف: `10001` / `demo123`
   - رئيس مباشر: `20001` / `demo123`
   - مراقب: `30001` / `demo123`
   - رئيس شؤون: `40001` / `demo123`

---

### (اختياري) إعداد الإيميل

إذا أردت تفعيل إشعارات البريد الإلكتروني:

1. ارجع لصفحة **moi-fingerprint-backend** على Render
2. اضغط **Environment** (القائمة اليسرى)
3. أضف:
   - `EMAIL_USER` = بريدك الجيميل
   - `EMAIL_PASS` = App Password من جوجل
4. اضغط **Save Changes** (سيعيد تشغيل السيرفر تلقائياً)

**للحصول على App Password:**
- https://myaccount.google.com/apppasswords
- قم بتسجيل الدخول
- اختر "Mail" و "Windows Computer"
- انسخ كلمة المرور المكونة من 16 حرف

---

## المشاكل الشائعة

### الباك إند يعطي خطأ "DATABASE_URL is not defined"
✅ تأكد أنك نسخت Internal Database URL (وليس External)

### الفرونت إند لا يتصل بالباك إند
✅ تأكد أن `REACT_APP_API_URL` تحتوي على `/api` في النهاية

### "Your account's default identity"
✅ لا يهم - الكود موجود على GitHub بالفعل

---

## روابط مهمة

- **الكود المصدري:** https://github.com/Nedo960/moi-fingerprint-system
- **Render Dashboard:** https://dashboard.render.com

---

**الوقت الإجمالي: 10-15 دقيقة**

بعد الانتهاء، أرسل لي رابط الفرونت إند وسأختبره معك!
