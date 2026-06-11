# دليل ربط الروتين (Routine Module) لفلاتر 📱

هذا الدليل مصمم لتوضيح كيفية ربط الروتين والتعامل مع الصور (Local Assets) بشكل صحيح لتطبيق الطفل، وتوثيق جميع الـ Endpoints الخاصة بقسم الروتين.

---

## 📸 1. معمارية الصور (Local Assets)

النظام مصمم ليعتمد على الصور المحلية داخل تطبيق فلاتر لضمان سرعة الأداء وعدم استهلاك باقة الإنترنت. الباك إند **لا** يقوم بإرسال روابط سيرفر (Network URLs)، بل يرسل مسار الصورة كاسم لتستدعيه من داخل مجلد الـ Assets.

### المطلوب في تطبيق فلاتر:
1. إنشاء مجلد للصور وتسميته: `assets/routines/`
2. إضافة الصور الأساسية للمهام (مثل: `wake-up.jpg`, `brush-teeth.jpg`, `sleep.jpg`، إلخ).
3. **مهم جداً:** إضافة صورة احتياطية باسم `default-task.jpg` في نفس المجلد. (هذه الصورة سيتم إرسالها تلقائياً من الباك إند كـ Fallback لأي مهمة يتم إضافتها بدون صورة مخصصة لمنع حدوث أي `Null Exception`).
4. تعريف المجلد في ملف `pubspec.yaml`:
   ```yaml
   flutter:
     assets:
       - assets/routines/
   ```
5. عند استلام المسار من الـ API، يتم عرضه مباشرة كالتالي:
   ```dart
   Image.asset(item.imageUrl) // مثال: assets/routines/wake-up.jpg
   ```

---

## 🔌 2. توثيق الـ Endpoints

⚠️ *جميع الـ Endpoints أدناه تتطلب إرسال الـ Token الخاص بالطفل في الـ Headers:* `Authorization: Bearer <token>`

### 1. عرض مقترحات الروتين (Routine Catalog)
**الغرض:** عرض قائمة المهام الجاهزة بالصور ليختار منها الطفل إضافتها لروتينه.
- **المسار:** `GET /routine/catalog`
- **الرد (Response):**
  ```json
  {
    "catalog": [
      {
        "id": "uuid-here",
        "title": "Wake Up",
        "imageUrl": "assets/routines/wake-up.jpg",
        "sortOrder": 1
      }
    ]
  }
  ```

### 2. إضافة مقترح لروتين الطفل
**الغرض:** عند اختيار كارت من الـ Catalog وإضافته لجدول المهام الخاص بالطفل.
- **المسار:** `POST /routine/catalog/:templateId`
- **الرد (201 Created):** يرجع الكائن الذي تم إنشاؤه.

### 3. جلب جميع مهام الروتين
**الغرض:** عرض المهام التي تم إضافتها لروتين الطفل (جدول المهام الثابت).
- **المسار:** `GET /routine/tasks`
- **الرد:** قائمة بكائنات الـ `routineTask`.

### 4. إضافة مهمة مخصصة (Custom Task)
**الغرض:** إنشاء مهمة جديدة غير موجودة في الـ Catalog.
- **المسار:** `POST /routine/tasks`
- **Body:**
  ```json
  {
    "title": "Go to the park",
    "scheduledTime": "16:00", // Optional
    "iconName": "park_icon", // Optional
    "imageUrl": "assets/routines/park.jpg" // Optional
  }
  ```
  *(ملاحظة: إذا تم إنشاء المهمة بدون `imageUrl`، سيقوم الباك إند تلقائياً بإرجاعها كـ `assets/routines/default-task.jpg` لمنع حدوث Crash في واجهة فلاتر).*

### 5. مسح مهمة من الروتين
**الغرض:** إزالة مهمة من جدول الطفل بشكل نهائي.
- **المسار:** `DELETE /routine/tasks/:taskId`
- **الرد:** `{"ok": true, "message": "Task deleted successfully"}`

### 6. عرض روتين اليوم المباشر (Today's Routine)
**الغرض:** هذه هي الشاشة الرئيسية للطفل، حيث تظهر المهام المطلوبة منه اليوم وحالة إنجازها.
- **المسار:** `GET /routine/today`
- **الرد:**
  ```json
  {
    "routine": [
      {
        "id": "task-uuid",
        "title": "Wake Up",
        "imageUrl": "assets/routines/wake-up.jpg",
        "status": "PENDING", // الحالة: PENDING أو COMPLETED أو SKIPPED
        "completedAt": null
      }
    ]
  }
  ```

### 7. إنجاز المهمة (Complete Task) 🌟
**الغرض:** عندما يقوم الطفل بالضغط على زر "تم" أو الـ Checkmark للمهمة، ليحصل على النقاط (Stars).
- **المسار:** `POST /routine/tasks/:taskId/complete`
- **الرد:**
  ```json
  {
    "ok": true,
    "message": "Task completed!",
    "stars": 2
  }
  ```

### 8. تخطي المهمة (Skip Task)
**الغرض:** عندما يتم تحديد المهمة كمتخطاة لليوم الحالي.
- **المسار:** `POST /routine/tasks/:taskId/skip`
- **الرد:** `{"ok": true, "message": "Task skipped"}`

### 9. نسبة إنجاز الروتين لليوم (Progress)
**الغرض:** جلب النسبة المئوية لإنجاز روتين اليوم (لعرض شريط التقدم ProgressBar).
- **المسار:** `GET /routine/progress`
- **الرد:**
  ```json
  {
    "totalTasks": 5,
    "completedTasks": 3,
    "percentage": 60,
    "date": "2024-04-25T00:00:00.000Z"
  }
  ```

---
*💡 **نصيحة أخيرة للمطور:** لتجنب أي أخطاء في الـ UI، يرجى التأكد دائماً أن مسارات الصور (Asset paths) مطابقة تماماً للمسارات المسجلة، وأن ملف `pubspec.yaml` يحتوي على تعريف مجلد `assets/routines/` بشكل صحيح، ولا تنسى إضافة الـ `default-task.jpg`.*
