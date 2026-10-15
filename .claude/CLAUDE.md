# Macademia — Claude kuralları

- Statik site, `public/` altında. Derleme yok; kütüphane eklemeden önce sor.
- Tasarım dili dilkurakademi.com'dan alındı: Poppins. Palet makademyadan: espresso bantlar `--deep`, kabuk kahvesi vurgu `--brand`, krem zeminler, yaprak yeşili başarı rengi. Koyu bantlarda vurgu için `--brand-on-deep` kullan. Renkler `styles.css` başındaki tokenlarda; açık ve koyu tema birlikte güncellenir.
- Motor mantığı HMGS ile aynı kalmalı. `engine.js`'i değiştirirken `~/Desktop/Urunler/HMGS/portal/src/lib/engine` ile karşılaştır.
- Soru bankasına gerçek ÖSYM sorusu koyma. Tıbbi ve dilbilgisi içeriğini yazmadan önce doğrula.
- "Çıkacak soruyu tahmin" iddiası, sahte puan veya sahte değerlendirme sayısı kullanma.
- Edubook Kids ve YetenekFest yalnız fikir kaynağıdır; marka ve kitap adlarını kullanma.
- Yeni fotoğraf eklersen `public/img/credits.json` künyesini de güncelle.
- Uzak depo henüz yok. Push ve deploy etmeden önce kullanıcıya sor.
