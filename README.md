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
- `public/lessons.js`: ders oynatıcısı ve simülasyonlar (kesir çubuğu, sayı doğrusu, zar deneyi, koordinat düzlemi, kesen/teğet, kod izleyici, satır dizme, liste görseli)
- `public/modules/<modül>/`: her program bağımsız bir modül. `manifest.json` (dersler), `lessons/<id>.json` (adımlar ve bildirimsel cevap kontrolü), `curriculum.json` (müfredat). Ders içeriği kod değil veridir; aynı dersler ileride API ile kurumlara verilebilir.
- `public/index.html`: başlık, menü, alt bilgi
- `public/app.js`: ana sayfa, program sayfaları, öğrenme alanı (hash yönlendirme: `#p-<slug>`, `#ogren-tus`)
- `public/engine.js`: HMGS motoru (Beta ustalık, soru seçici, en büyük kalan kotası, plan sıralaması, tekrar takvimi, Wilson aralığı)
- `public/data.js`: 10 program, 8 ASK Robotik modülü ve TUS/HMGS/YDS/IELTS/İngilizce demo soru bankaları (özgün sorular, gerçek ÖSYM sorusu yok)
- `public/img/`: Openverse'ten CC lisanslı fotoğraflar, künyeleri `credits.json` içinde

## Bilinçli kararlar

- Edubook Kids ve YetenekFest belgeleri yalnız fikir kaynağıdır; onların marka adları ve kitap adları kullanılmaz.
- Denemeler "çıkacak soruları tahmin etmez". Sınavın alan dağılımına göre hazırlanır (HMGS'deki kararla aynı).
- Ustalık her zaman belirsizlik aralığıyla gösterilir; sahte puan ve değerlendirme sayısı yok.
- Program sayfalarındaki resmî rakamlar yalnız ÖSYM kılavuzundan alınır ve kaynak satırıyla gösterilir. TUS motor ağırlıkları kılavuzun Tablo 1B'sidir; YDS kılavuzu soru türüne göre soru sayısı vermediği için YDS sayfasında tür başına sayı gösterilmez.

## Müfredat kaynakları

- Matematik 1–12: MEB Türkiye Yüzyılı Maarif Modeli ve 2018 programı (2026–27 durumuna göre), TYT/AYT konu dağılımı 2023–2025 sınavlarından. `curriculum.json` içinde `kaynaklar`.
- Python: docs.python.org öğreticisi, CS50P ve tipik bir ilk yıl bilgisayar bilimi dersi. 142 örneğin çıktısı çalıştırılarak doğrulandı.

## Sıradaki işler

- Modül API'si: kurum anahtarı, modül lisansı, sunucu tarafında cevap kontrolü, öğrenci ilerleme veritabanı, gömülebilir oynatıcı; HMGS ve Robotik dış modül olarak
- Planlanan simülasyonlar (onluk bloklar, geometri tahtası, birim çember, integral alanı…) ve yeni dersler

- Gerçek kullanıcı hesabı ve sunucu tarafı veri (şu an ilerleme yalnız tarayıcıda)
- TUS Klinik Bilimler ve İngilizce seviye tespiti bankaları
- ASK Robotik ile ortak giriş (ayrı alt alan adı önerilir)
- Fotoğrafların kurumun kendi fotoğraflarıyla değiştirilmesi
