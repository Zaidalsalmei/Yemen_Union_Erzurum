# حل مشكلة توقف MySQL في XAMPP

## 🔴 المشكلة
```
Error: MySQL shutdown unexpectedly.
Status change detected: stopped
```

## ✅ الحل السريع

### الطريقة 1: من خلال XAMPP Control Panel
1. افتح XAMPP Control Panel
2. اضغط على زر "Stop" بجانب MySQL (إذا كان يعمل)
3. انتظر 5 ثواني
4. اضغط على زر "Start" بجانب MySQL
5. تحقق من أن الحالة أصبحت "Running"

### الطريقة 2: من خلال Command Line (إذا لم تعمل الطريقة الأولى)

#### الخطوة 1: إيقاف العملية
```powershell
taskkill /F /IM mysqld.exe
```

#### الخطوة 2: حذف ملف القفل (إذا وجد)
```powershell
Remove-Item -Path "C:\xampp\mysql\data\*.lock" -Force -ErrorAction SilentlyContinue
```

#### الخطوة 3: بدء MySQL
```powershell
C:\xampp\mysql\bin\mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini --standalone
```

أو من XAMPP Control Panel:
- اضغط "Start" بجانب MySQL

---

## 🔍 الأسباب الشائعة

### 1. المنفذ 3306 مستخدم
**التحقق:**
```powershell
netstat -ano | findstr :3306
```

**الحل:**
- أغلق البرنامج الذي يستخدم المنفذ
- أو غيّر منفذ MySQL في `C:\xampp\mysql\bin\my.ini`

### 2. ملفات قاعدة البيانات تالفة
**الحل:**
```powershell
# نسخ احتياطي
Copy-Item -Path "C:\xampp\mysql\data" -Destination "C:\xampp\mysql\data_backup" -Recurse

# إصلاح الجداول
C:\xampp\mysql\bin\mysqlcheck.exe -u root --auto-repair --all-databases
```

### 3. نفاد المساحة على القرص
**التحقق:**
- تأكد من وجود مساحة كافية على القرص C:

### 4. برنامج مكافحة الفيروسات
**الحل:**
- أضف مجلد `C:\xampp` إلى قائمة الاستثناءات

---

## 📋 خطوات التحقق

### 1. تحقق من حالة MySQL
```powershell
Get-Process mysqld -ErrorAction SilentlyContinue
```

### 2. تحقق من المنفذ
```powershell
Test-NetConnection -ComputerName localhost -Port 3306
```

### 3. تحقق من السجلات
```
C:\xampp\mysql\data\mysql_error.log
```

---

## 🛠️ الإصلاح الشامل (إذا لم تعمل الحلول السابقة)

### الخطوة 1: نسخ احتياطي لقاعدة البيانات
```powershell
C:\xampp\mysql\bin\mysqldump.exe -u root --all-databases > C:\xampp\backup.sql
```

### الخطوة 2: إيقاف MySQL
```powershell
taskkill /F /IM mysqld.exe
```

### الخطوة 3: حذف ملفات InnoDB
```powershell
Remove-Item -Path "C:\xampp\mysql\data\ib_logfile*" -Force
Remove-Item -Path "C:\xampp\mysql\data\ibdata1" -Force
```

### الخطوة 4: بدء MySQL
من XAMPP Control Panel، اضغط "Start"

### الخطوة 5: استعادة البيانات
```powershell
C:\xampp\mysql\bin\mysql.exe -u root < C:\xampp\backup.sql
```

---

## ⚡ الحل السريع الذي استخدمناه

```powershell
# 1. إيقاف العملية
taskkill /F /IM mysqld.exe

# 2. بدء MySQL من جديد
# من XAMPP Control Panel: اضغط Start
```

---

## 🎯 الحالة الحالية

✅ MySQL يعمل الآن
✅ قاعدة البيانات: yemen_union_db
✅ المستخدم التجريبي: 05350703570
✅ كلمة المرور: password

---

## 📞 إذا استمرت المشكلة

### تحقق من:
1. ✅ XAMPP مثبت في `C:\xampp`
2. ✅ لا يوجد برنامج آخر يستخدم المنفذ 3306
3. ✅ برنامج مكافحة الفيروسات لا يحظر MySQL
4. ✅ يوجد مساحة كافية على القرص

### السجلات:
```
C:\xampp\mysql\data\mysql_error.log
```

---

## 🚀 الخطوة التالية

بعد تشغيل MySQL:
1. افتح المتصفح: `http://localhost:5176`
2. سجل الدخول:
   - رقم الهاتف: `05350703570`
   - كلمة المرور: `password`
3. استمتع بالتطبيق المتجاوب!

---

**تم حل المشكلة! ✅**
