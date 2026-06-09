# دليل ربط الشات بوت الخاص بالأب (النصي والصوتي)

بناءً على طلبات المشروع، **تم إلغاء شات الطفل**، وسيقتصر استخدام الشات بوت بكامل مميزاته (النصية والصوتية) على **الأب (ولي الأمر) فقط**. 

تم تحديث المعمارية مؤخراً بحيث يكون الاتصال **فقط من خلال سيرفر Node.js الأساسي**، وذلك لضمان حفظ كل المحادثات في قاعدة البيانات العادية (PostgreSQL) وربطها بحساب الأب و الـ Session ID الخاص به.
خلف الكواليس، يقوم السيرفر بتوجيه كل رسائلك (النصية والصوتية) إلى نموذج **Gemini 2.5 Flash** لضمان استجابة فائقة السرعة والذكاء.

يرجى من مطوري الـ Flutter ربط واجهة الأب بمسارات Node.js التالية:

---

## 🚀 معلومات أساسية للـ Flutter
- **السيرفر المستخدم:** السيرفر الرئيسي (Node.js).
- **الـ Authentication:** هذا السيرفر **يتطلب** إرسال `Authorization: Bearer <token>` في الـ Headers.
- **إدارة الجلسات (Sessions):** يتم التعامل مع كل محادثة من خلال `sessionId` فريد (UUID) يتم تمريره في الـ URL، ويمكنك إنشاء جلسة جديدة باستخدام `POST /chatbot/sessions`.

---

## 📝 1. إرسال رسالة نصية (Text Chat)

عندما يكتب الأب رسالة نصية، استخدم هذا المسار:

- **المسار:** `POST /chatbot/sessions/:sessionId/messages`
- **Headers:**
  ```
  Authorization: Bearer <your_token>
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "content": "ابني يواجه صعوبة في النوم، ماذا أفعل؟"
  }
  ```

- **الرد (Response):** سيرجع لك كائن يحتوي على رسالة المستخدم ورسالة الذكاء الاصطناعي ليتم عرضهما مباشرة:
  ```json
  {
    "userMessage": {
      "id": "...",
      "role": "user",
      "content": "ابني يواجه صعوبة في النوم، ماذا أفعل؟",
      "createdAt": "..."
    },
    "assistantMessage": {
      "id": "...",
      "role": "assistant",
      "content": "إجابة الذكاء الاصطناعي...",
      "createdAt": "..."
    }
  }
  ```

---

## 🎙️ 2. إرسال رسالة صوتية (Voice Note)

هذا المسار يقوم بأخذ الصوت، إرساله لسيرفر البايثون داخلياً (AI)، تحويله لنص، الرد عليه، إنشاء صوت للرد، وحفظ كل ذلك في قاعدة البيانات!

- **المسار:** `POST /chatbot/sessions/:sessionId/voice`
- **Headers:**
  ```
  Authorization: Bearer <your_token>
  ```
- **Content-Type:** `multipart/form-data`
- **الـ Fields (Form Data):**
  - `audio`: الملف الصوتي الخاص بالأب (يفضل بصيغة `wav` أو `m4a`).

- **الرد (Response):** سيرجع لك كائن يحتوي على رسالة المستخدم (كنص تم فهمه من الصوت)، ورسالة الذكاء الاصطناعي (نصياً)، بالإضافة إلى `reply_audio` (الملف الصوتي للرد).
  ```json
  {
    "userMessage": {
      "id": "...",
      "role": "user",
      "content": "النص الذي فهمه السيرفر من صوت الأب",
      "createdAt": "..."
    },
    "assistantMessage": {
      "id": "...",
      "role": "assistant",
      "content": "نص إجابة الذكاء الاصطناعي",
      "createdAt": "..."
    },
    "reply_audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA..." // Base64 String
  }
  ```

### 💡 ملاحظة هامة جداً بخصوص تشغيل الصوت:
قيمة `reply_audio` الراجعة من السيرفر ليست رابطاً (URL)، بل هي **Base64 String** يمثل الملف الصوتي للذكاء الاصطناعي بصيغة `WAV`.
لتشغيله في Flutter يجب فك تشفيره وحفظه كملف مؤقت ثم تشغيله، كالمثال التالي:

```dart
import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';

// 1. استقبال الـ Base64
String base64Audio = response.data['reply_audio'];

// 2. فك التشفير إلى Bytes
List<int> audioBytes = base64Decode(base64Audio);

// 3. حفظه كملف wav في الجهاز لتشغيله
Directory tempDir = await getTemporaryDirectory();
File audioFile = File('${tempDir.path}/ai_reply.wav');
await audioFile.writeAsBytes(audioBytes);

// 4. تشغيل الملف باستخدام أي مكتبة صوت (مثل audioplayers)
audioPlayer.play(DeviceFileSource(audioFile.path));
```
