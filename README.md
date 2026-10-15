# Academia

Seviye tespiti, alan ustalığı, kişisel çalışma planı ve deneme ile çalışan eğitim platformu demosu.
Çalışma motoru HMGS projesinden (`~/Desktop/Urunler/HMGS/portal/src/lib/engine`, `plan`) tarayıcıya aktarıldı.

## Çalıştırma

Derleme adımı yok. `public/` klasörünü bir statik sunucuyla açın:

```
cd public && python3 -m http.server 8765
```

Sonra `http://localhost:8765` adresine gidin. Doğrudan dosya olarak açınca fotoğraf kaynakları listesi yüklenmez.

## Dosyalar

- `public/index.html`: başlık, menü, alt bilgi
- `public/app.js`: ana sayfa, program sayfaları, öğrenme alanı (hash yönlendirme: `#p-<slug>`, `#ogren-tus`)
- `public/engine.js`: HMGS motoru (Beta ustalık, soru seçici, en büyük kalan kotası, plan sıralaması, tekrar takvimi, Wilson aralığı)
- `public/data.js`: 10 program ve TUS/YDS demo soru bankaları (özgün sorular, gerçek ÖSYM sorusu yok)
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
