# التوثيق البرمجي الشامل لجميع مسارات التطبيق (Full API Reference)

هذا هو المستند التقني النهائي والشامل المُستخرج يدوياً من **قواعد الكود الأساسية (Zod Schemas & Controllers)**.
يحتوي على كل مسار (Endpoint) بالإضافة للـ **Request Body (JSON)** المطابق للشروط البرمجية لتجنب أي إيرور (مثل إيرور 400).

---

## 📌 معلومات تقنية عامة
- **رابط السيرفر الأساسي (Base URL):** `https://backend-autism-production-c1fd.up.railway.app`
- **حماية المسارات (Authentication):** جميع المسارات تتطلب إرسال التوكن في הـ Headers `Authorization: Bearer <token>` (باستثناء تسجيل الدخول، ومسارات الـ AI).
- **نوع البيانات (Content-Type):** دائماً `application/json` للبيانات النصية، و `multipart/form-data` للملفات الصوتية.

---

## 🔐 1. قسم المصادقة والمستخدمين (`/auth`)

### تسجيل حساب ولي أمر جديد
- **المسار:** `POST /auth/register-parent`
- **Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!",
  "phone": "01000000000" // اختياري
}
```

### تسجيل الدخول
- **المسار:** `POST /auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "StrongPassword123!"
}
```

### إنشاء حساب طفل (تحت حساب ولي الأمر)
- **المسار:** `POST /auth/create-child`
- **Body:**
```json
{
  "childName": "Ali",
  "email": "ali@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "gender": "MALE", // أو FEMALE (اختياري)
  "dateOfBirth": "2015-05-20" // اختياري
}
```

### استعادة كلمة المرور (طلب الكود)
- **المسار:** `POST /auth/forgot/request`
- **Body:**
```json
{ "email": "john@example.com" }
```

### تأكيد كود الاستعادة
- **المسار:** `POST /auth/forgot/verify`
- **Body:**
```json
{ "email": "john@example.com", "code": "123456" }
```

### إعادة تعيين كلمة المرور
- **المسار:** `POST /auth/forgot/reset`
- **Body:**
```json
{ "token": "token_string_here", "newPassword": "NewPassword123!" }
```

### تغيير الرقم السري للطفل
- **المسار:** `PATCH /auth/children/:childId/password`
- **Body:**
```json
{ "newPassword": "NewChildPassword123!" }
```

### المسارات الأخرى (لا تحتاج Body):
- `GET /auth/my-children` (لجلب بيانات الأطفال التابعين لولي الأمر).
- `POST /auth/refresh` (تجديد التوكن، Body: `{"refreshToken": "..."}`).
- `POST /auth/logout` (تسجيل خروج، Body: `{"refreshToken": "..."}`).

---

## 📅 2. قسم الروتين اليومي (`/routine`)

### إضافة مهمة مخصصة جديدة
- **المسار:** `POST /routine/tasks`
- **Body:**
```json
{
  "title": "غسيل الأسنان",
  "scheduledTime": "08:00 AM", // اختياري
  "iconName": "brush_icon", // اختياري
  "imageUrl": "assets/routines/brush.jpg", // اختياري
  "childId": "ID_الطفل" // يرسل فقط إذا كان المسجل هو ولي الأمر
}
```

### إنجاز مهمة (تعطي الطفل نقطتين 🌟)
- **المسار:** `POST /routine/tasks/:taskId/complete`
- **Body:** (فارغ إذا كان طفل، أو يحتوي على `childId` إذا كان أب)
```json
{ "childId": "ID_الطفل" } 
```

### تخطي مهمة
- **المسار:** `POST /routine/tasks/:taskId/skip`
- **Body:**
```json
{ "childId": "ID_الطفل" }
```

### مسارات أخرى (بدون Body):
- `GET /routine/catalog` (المقترحات الجاهزة بصورها).
- `POST /routine/catalog/:templateId` (لإضافة مهمة من الكتالوج).
- `GET /routine/today` (لجلب مهام اليوم وحالتها).
- `GET /routine/progress` (نسبة الإنجاز).
- `DELETE /routine/tasks/:taskId` (حذف مهمة).

---

## 🤖 3. تقارير الذكاء الاصطناعي (AI & Reports)

### إرسال تقرير الموديل (Reem's API)
- **المسار:** `POST /api/reports`
- **Body:**
```json
{
  "child_id": "ID_الطفل",
  "game_id": "اسم اللعبة أو القسم",
  "report_data": {
    "duration_seconds": 120,
    "distraction_percentage": 15,
    "emotion_percentages": {
      "happy": 0.7,
      "sad": 0.1,
      "angry": 0.0,
      "neutral": 0.2
    }
  }
}
```

### مسارات أخرى (بدون Body):
- `GET /ai-sessions/:childId/dashboard` (جلب لوحة تحكم التحليلات للطفل).
- `GET /ai-sessions/:childId` (سجل كل الجلسات السابقة).

---

## 🎙️ 4. الشات بوت التفاعلي (Flask Python App)
*ملاحظة: هذا هو التطبيق الخاص بالبايثون الذي يرد على الطفل.*

### شات نصي (Text)
- **المسار:** `POST /chat`
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "message": "أنا زعلان",
  "child_id": "ID_الطفل",
  "child_name": "أحمد",
  "child_age": 7,
  "child_interests": "الرسم، السيارات",
  "is_voice": false
}
```

### شات صوتي (Voice)
- **المسار:** `POST /voice`
- **Content-Type:** `multipart/form-data`
- **Form-Data Fields:**
  1. `audio`: (File - بصيغة wav أو m4a)
  2. `child_id`: ID_الطفل
  3. `child_name`: اسم الطفل
  4. `child_age`: عمر الطفل
  5. `child_interests`: اهتماماته

---

## 🌍 5. المجتمع (Community)

### إنشاء منشور جديد
- **المسار:** `POST /community/posts`
- **Body:**
```json
{
  "content": "نص المنشور هنا",
  "imageUrl": "رابط الصورة (اختياري)"
}
```

### إضافة تعليق على منشور
- **المسار:** `POST /community/posts/:postId/comments`
- **Body:**
```json
{
  "content": "نص التعليق"
}
```

### المسارات الأخرى (بدون Body):
- `GET /community/posts` (جلب كل المنشورات)
- `POST /community/posts/:postId/like` (لايك)
- `DELETE /community/posts/:postId/like` (حذف اللايك)

---

## ⚙️ 6. الإعدادات (Settings)

### تحديث الملف الشخصي
- **المسار:** `PATCH /settings/profile`
- **Body:**
```json
{
  "fullName": "John Updated",
  "email": "john_new@example.com",
  "phone": "01111111111"
}
```

### تغيير كلمة المرور (لولي الأمر)
- **المسار:** `POST /settings/password`
- **Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewStrongPassword123!"
}
```

---

## 🔔 7. الإشعارات (Notifications)

### إنشاء إشعار تجريبي
- **المسار:** `POST /notifications`
- **Body:**
```json
{
  "type": "SYSTEM", // "SYSTEM" | "NEW_POST" | "SURVEY_REMINDER"
  "title": "عنوان الإشعار",
  "message": "نص الإشعار"
}
```

### مسارات أخرى (بدون Body):
- `GET /notifications` (عرض إشعاراتي).
- `PATCH /notifications/:id/read` (تعليم إشعار كمقروء).
- `POST /notifications/read-all` (تعليم الكل كمقروء).

---

## 🎮 8. باقي الأقسام الهامة (بدون Body أو Body بسيط)

### الألعاب (`/games`)
- `POST /games/score` | Body: `{"gameType": "MEMORY", "score": 100, "childId": "..."}`
- `GET /games/leaderboard/:gameType`

### التعليم (`/learning`)
- `POST /learning/items/:itemId/log` | Body: `{"childId": "..."}` (لتسجيل قراءة المقال).

### التقدم العام (`/progress`)
- `GET /progress/child/:childId` | عرض المستوى وإجمالي النجوم والشارات.
- `GET /progress/reports/:childId` | عرض التقرير الأسبوعي ونسبة الإنجاز اليومية.

### المكافآت (`/rewards`)
- `GET /rewards` و `GET /rewards/badges`.

### الاستبيان (`/survey`)
- `POST /survey/submit` | Body: `{"answers": {...}, "childId": "..."}`.
- `GET /survey/result/:childId`.

---
> **تنبيه أخير للفريق التقني:** أي طلب (Request) يُرسل للباك اند بدون أن يحتوي على نفس هذه الخصائص المطلوبة سيتم رفضه بـ `400 Bad Request` مباشرةً لأن الكود مبرمج بحماية (Zod Validation) صارمة.
