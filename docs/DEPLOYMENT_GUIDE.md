# 📱 دليل النشر الكامل — Genetic Cipher

## 🎯 المتطلبات المسبقة

### 1. حسابات المطورين

| المنصة | الرابط | التكلفة |
|--------|--------|---------|
| Google Play Console | [play.google.com/console](https://play.google.com/console) | $25 (مرة واحدة) |
| Apple Developer | [developer.apple.com](https://developer.apple.com) | $99/سنة |

### 2. أدوات التطوير

```bash
# تثبيت Node.js 18+
# https://nodejs.org

# تثبيت Expo CLI
npm install -g expo-cli

# تثبيت EAS CLI
npm install -g eas-cli

# تسجيل الدخول
npx eas login
```

## 🚀 الخطوة 1: إعداد المشروع

```bash
# استنساخ المشروع
git clone https://github.com/yourusername/genetic-cipher.git
cd genetic-cipher

# تثبيت التبعيات
npm install

# إعداد EAS
npx eas build:configure
```

## 🤖 الخطوة 2: نشر Android (Google Play)

### 2.1 إعداد Keystore

```bash
# توليد keystore جديد
keytool -genkey -v \
  -keystore genetic-cipher.keystore \
  -alias genetic-cipher \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# تحويل إلى base64
base64 genetic-cipher.keystore > genetic-cipher.keystore.base64
```

### 2.2 إعداد Secrets في EAS

```bash
npx eas secret:create --name ANDROID_KEYSTORE_PASSWORD --value "your-password"
npx eas secret:create --name ANDROID_KEY_PASSWORD --value "your-password"
```

### 2.3 إعداد Google Play Service Account

1. ادخل إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد
3. IAM & Admin → Service Accounts
4. أنشئ Service Account
5. أنشئ مفتاح JSON
6. احفظ الملف كـ `google-service-account.json`

### 2.4 تحديث eas.json

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 2.5 بناء ورفع

```bash
# بناء AAB
npx eas build --platform android --profile production

# رفع تلقائي
npx eas submit --platform android
```

## 🍎 الخطوة 3: نشر iOS (App Store)

### 3.1 إعداد Apple Developer

1. ادخل إلى [Apple Developer Portal](https://developer.apple.com)
2. أنشئ App ID
3. أنشئ Distribution Certificate
4. أنشئ Provisioning Profile

### 3.2 إعداد App Store Connect API Key

1. App Store Connect → Users and Access → Keys
2. أنشئ مفتاح API جديد
3. احفظ:
   - Issuer ID
   - Key ID
   - ملف `.p8`

### 3.3 تحديث eas.json

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APPLE_APP_ID",
        "ascApiKeyPath": "./AuthKey.p8",
        "ascApiKeyIssuerId": "YOUR_ISSUER_ID",
        "ascApiKeyId": "YOUR_KEY_ID"
      }
    }
  }
}
```

### 3.4 بناء ورفع

```bash
# بناء IPA
npx eas build --platform ios --profile production

# رفع تلقائي
npx eas submit --platform ios
```

## 📋 الخطوة 4: إعدادات المتجر

### Google Play Store

#### معلومات التطبيق
- **العنوان**: Genetic Cipher — الشفرة الوراثية
- **الوصف القصير**: لعبة ألغاز وراثية فريدة — مستحيلة التقليد
- **الوصف الكامل**:
```
🧬 Genetic Cipher — الشفرة الوراثية

لعبة ألغاز وراثية فريدة من نوعها!

✨ المميزات:
• بصمة وراثية فريدة لكل جهاز
• 5 أنواع مهام مثيرة
• نظام مستويات متقدم
• سلسلة يومية للمكافآت
• لوحة متصدرين عالمية
• تصميم مذهل بتأثيرات نيون

🎮 أنواع المهام:
• فك الشفرات الوراثية
• ترتيب التسلسلات
• إصلاح الطفرات
• توليف المركبات
• تطوير الأنواع

🏆 ابدأ رحلتك من متدرب وراثي ووصل إلى الكائن الأبدي!

💀 مستحيلة التقليد — تحدى أي شخص يثبت العكس!
```

#### لقطات الشاشة
- 8 لقطات شاشة على الأقل
- مقاس 1080x1920 أو 1080x2160
- بدون حواف أو إطارات

#### الرسومات
- **الأيقونة**: 512x512 PNG
- **Feature Graphic**: 1024x500 PNG
- **Splash Screen**: متوفر في المشروع

### Apple App Store

#### معلومات التطبيق
- **العنوان**: Genetic Cipher
- **الفئة**: Games → Puzzle
- **الوصف**: نفس وصف Google Play

#### لقطات الشاشة
- 6 لقطات شاشة على الأقل
- iPhone: 1290x2796 (iPhone 15 Pro Max)
- iPad: 2048x2732 (iPad Pro)

#### الرسومات
- **الأيقونة**: 1024x1024 PNG
- **App Preview**: فيديو 15-30 ثانية (اختياري)

## 🔄 الخطوة 5: التحديثات المستقبلية

### رفع تحديث جديد

```bash
# 1. تحديث رقم الإصدار
# package.json
"version": "1.1.0"

# app.json
"version": "1.1.0",
"android": { "versionCode": 2 },
"ios": { "buildNumber": "2" }

# 2. بناء جديد
npx eas build --platform all --profile production

# 3. رفع
npx eas submit --platform all
```

### OTA Updates (بدون مراجعة المتجر)

```bash
# تحديث فوري
npx eas update --branch production --message "إصلاحات وتحسينات"
```

## 🧪 الاختبار

### اختبار Android

```bash
# بناء APK للاختبار
npx eas build --platform android --profile preview

# تثبيت يدوي
adb install build-*.apk
```

### اختبار iOS

```bash
# بناء للمحاكي
npx eas build --platform ios --profile development

# اختبار عبر TestFlight
npx eas build --platform ios --profile preview
```

## 📊 المراقبة

### Google Play Console
- مراقبة الأداء
- تحليل الأعطال (Crashlytics)
- مراجعات المستخدمين
- إحصائيات التنزيلات

### App Store Connect
- App Analytics
- Sales and Trends
- Crash Reports
- User Reviews

## 🎯 نصائح للنجاح

1. ✅ **اختبر جيداً** قبل النشر
2. ✅ **أضف لقطات شاشة** جذابة
3. ✅ **اكتب وصفاً** مقنعاً
4. ✅ **استخدم كلمات مفتاحية** مناسبة
5. ✅ **استجب للمراجعات** بسرعة
6. ✅ **حدّث بانتظام**
7. ✅ **استخدم OTA updates** للإصلاحات السريعة
8. ✅ **أضف فيديو ترويجي** للمتجر

## 📞 الدعم

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Docs](https://docs.expo.dev/build/introduction)
- [Google Play Help](https://support.google.com/googleplay/android-developer)
- [Apple Developer Docs](https://developer.apple.com/documentation)

---

**🚀 جاهز للنشر! Genetic Cipher في طريقها للمتاجر!**
