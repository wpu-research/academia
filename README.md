# Macademia

Seviye tespiti, alan ustalığı, kişisel çalışma planı ve deneme ile çalışan eğitim platformu demosu.
Çalışma motoru HMGS projesinden (`~/Desktop/Urunler/HMGS/portal/src/lib/engine`, `plan`) tarayıcıya aktarıldı.

## Çalıştırma

Derleme adımı ve bağımlılık yok (Node 22):

```
NVIDIA_API_KEY=... node server.js   # http://localhost:8080
```

`server.js` `public/` klasörünü sunar ve Mac için `/api/mac` uç noktasını çalıştırır. Anahtar yoksa site çalışır, Mac "çevrim dışı" der.
Ortam değişkenleri: `NVIDIA_API_KEY` (Mac), isteğe bağlı `NVIDIA_MODEL`, `PORT`.

## Dosyalar

- `server.js`: statik sunum + Mac (NVIDIA, akışlı). Hız sınırı IP başına dakikada 8, günde 60. Cevaplanmamış soruda doğru şıkkı içeren yanıtı göstermez.
- `public/mac.js`: Mac maskotu, sohbet paneli ve tanışma akışı (`#basla`), ASK Robotik'ten uyarlandı
- `public/index.html`: başlık, menü, alt bilgi
- `public/app.js`: ana sayfa, program sayfaları, öğrenme alanı (hash yönlendirme: `#p-<slug>`, `#ogren-tus`)
- `public/engine.js`: HMGS motoru (Beta ustalık, soru seçici, en büyük kalan kotası, plan sıralaması, tekrar takvimi, Wilson aralığı)
- `public/data.js`: 10 program, 8 ASK Robotik modülü ve TUS/HMGS/YDS/IELTS/İngilizce demo soru bankaları (özgün sorular, gerçek ÖSYM sorusu yok)
- `public/img/`: Openverse'ten CC lisanslı fotoğraflar, künyeleri `credits.json` içinde

## Bilinçli kararlar

- Edubook Kids ve YetenekFest belgeleri yalnız fikir kaynağıdır; onların marka adları ve kitap adları kullanılmaz.
- Denemeler "çıkacak soruları tahmin etmez". Sınavın alan dağılımına göre hazırlanır (HMGS'deki kararla aynı).
- Ustalık her zaman belirsizlik aralığıyla gösterilir; sahte puan ve değerlendirme sayısı yok.

## Sıradaki işler

- Gerçek kullanıcı hesabı ve sunucu tarafı veri (şu an ilerleme yalnız tarayıcıda)
- TUS Klinik Bilimler ve İngilizce seviye tespiti bankaları
- ASK Robotik ile ortak giriş (ayrı alt alan adı önerilir)
- Fotoğrafların kurumun kendi fotoğraflarıyla değiştirilmesi
