# Routine Module - Flutter Integration Guide

هذا الملف موجه لمطور الـ Flutter لشرح كيفية التعامل مع نظام الروتين (Routine)، وكيفية إدارة الصور، بالإضافة لتوثيق كامل للـ Endpoints الجديدة والقديمة الخاصة بالقسم.

---

## 1. كيفية التعامل مع الصور (Local Assets)

تم تصميم النظام ليعتمد على الـ **Local Assets** داخل تطبيق الـ Flutter لضمان سرعة التحميل وعدم استهلاك الإنترنت.

### الخطوات المطلوبة في الـ Flutter:
1. قم بإنشاء مجلد للصور داخل مشروع الـ Flutter، على سبيل المثال: `assets/routines/`.
2. قم بإضافة الـ 11 صورة الخاصة بالروتين وسمّها بأسماء واضحة:
   `wake-up.jpg`, `brush-teeth.jpg`, `eat.jpg`, `drink.jpg`, `dress.jpg`, `study.jpg`, `play.jpg`, `clean.jpg`, `bath.jpg`, `pray.jpg`, `sleep.jpg`.
3. تأكد من تعريف هذا المجلد في ملف `pubspec.yaml` الخاص بـ Flutter:
   ```yaml
   flutter:
     assets:
       - assets/routines/
   ```
4. الـ Backend سيرسل لك مسار الصورة في الـ Response الخاص بالـ API كالتالي: `"imageUrl": "assets/routines/wake-up.jpg"`.
5. لعرض الصورة في التطبيق، استخدم المسار القادم من الـ API مباشرة:
   ```dart
   Image.asset(item.imageUrl)
   ```

---

## 2. توثيق الـ Endpoints (API Reference)

جميع الـ Endpoints تتطلب إرسال الـ Token في הـ Headers (`Authorization: Bearer <token>`).
**ملاحظة هامة:** إذا كان المستخدم الأب (PARENT) هو من يقوم بالطلب، يجب إرسال `childId` لتحديد الطفل المستهدف. أما إذا كان الطفل (CHILD) هو المسجل دخول، فلا حاجة لإرسالها.

### 1. عرض مقترحات الروتين (Catalog)
**الغرض:** جلب قائمة الأنشطة الجاهزة بصورها ليعرضها التطبيق ليختار منها الطفل/الأب.
- **Endpoint:** `GET /routine/catalog`
- **Response:**
  ```json
  {
    "catalog": [
      {
        "id": "12345-abcde",
        "title": "Wake Up",
        "imageUrl": "assets/routines/wake-up.jpg",
        "sortOrder": 1,
        "createdAt": "2024-04-25T10:00:00Z"
      },
      ...
    ]
  }
  ```

### 2. إضافة مقترح لروتين الطفل
**الغرض:** عندما يختار الطفل كارت من المقترحات (Catalog) ويضغط إضافة، يتم استدعاء هذا الـ API.
- **Endpoint:** `POST /routine/catalog/:templateId`
- **Body:** (فقط لو الأب هو اللي بيضيف للطفل)
  ```json
  {
    "childId": "child-uuid-here" // Optional
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "new-task-uuid",
    "title": "Wake Up",
    "imageUrl": "assets/routines/wake-up.jpg",
    "childId": "child-uuid",
    "sortOrder": 1
  }
  ```

### 3. إضافة مهمة مخصصة (Custom Task)
**الغرض:** لو الطفل/الأب عايز يكتب مهمة جديدة بإيده مش موجودة في الـ Catalog.
- **Endpoint:** `POST /routine/tasks`
- **Body:**
  ```json
  {
    "title": "Go to the park",
    "scheduledTime": "16:00", // Optional
    "iconName": "park_icon", // Optional
    "imageUrl": "assets/routines/park.jpg", // Optional (مسار الصورة للمهمة الجديدة)
    "childId": "child-uuid" // Optional (فقط للأب)
  }
  ```

### 4. عرض روتين اليوم (Today's Routine)
**الغرض:** جلب مهام الطفل لليوم الحالي مع حالة كل مهمة (هل تم إنجازها أم لا). هذه الشاشة التي يعلم فيها الطفل على المهام.
- **Endpoint:** `GET /routine/today`
- **Query Params:** `?childId=uuid` (فقط للأب)
- **Response:**
  ```json
  {
    "routine": [
      {
        "id": "task-uuid",
        "title": "Wake Up",
        "imageUrl": "assets/routines/wake-up.jpg",
        "scheduledTime": null,
        "status": "PENDING", // PENDING | COMPLETED | SKIPPED
        "completedAt": null
      }
    ]
  }
  ```

### 5. إنجاز المهمة (Complete Task)
**الغرض:** عندما يضغط الطفل على "تم" أو الـ Checkmark للمهمة. (يعطي الطفل نقطتين/نجمتين 🌟).
- **Endpoint:** `POST /routine/tasks/:taskId/complete`
- **Response:**
  ```json
  {
    "ok": true,
    "message": "Task completed!",
    "stars": 2
  }
  ```

### 6. تخطي المهمة (Skip Task)
**الغرض:** عندما يقوم الطفل بعمل Skip للمهمة.
- **Endpoint:** `POST /routine/tasks/:taskId/skip`
- **Response:**
  ```json
  {
    "ok": true,
    "message": "Task skipped"
  }
  ```

### 7. مسح مهمة من الروتين
**الغرض:** إزالة المهمة بالكامل من روتين الطفل (سواء كانت من الـ Catalog أو Custom).
- **Endpoint:** `DELETE /routine/tasks/:taskId`
- **Query Params:** `?childId=uuid` (فقط للأب)
- **Response:**
  ```json
  {
    "ok": true,
    "message": "Task deleted successfully"
  }
  ```

### 8. نسبة إنجاز الروتين لليوم (Progress)
**الغرض:** جلب النسبة المئوية لإنجاز روتين اليوم (لعرض الـ Progress Bar).
- **Endpoint:** `GET /routine/progress`
- **Query Params:** `?childId=uuid` (فقط للأب)
- **Response:**
  ```json
  {
    "totalTasks": 5,
    "completedTasks": 3,
    "percentage": 60,
    "date": "2024-04-25T00:00:00.000Z"
  }
  ```
