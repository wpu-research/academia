# Academia — Adaptif Öğrenme Platformu

Yapay zeka destekli, kişiselleştirilmiş eğitim platformu. Öğrencilerin seviyelerini belirleyip, eksiklerini tespit ederek uyarlanabilir ders programları sunuyor.

## Platform Özellikleri

### 🧠 HMGS-AI — Uyarlanabilir Öğrenme Motoru
- Başlangıç yeterlilik testi ile tam seviye analizi
- Otomatik eksik konu tespiti
- AI tarafından oluşturulan özel ders programı
- Önceki sınavları analiz edip hata paternleri bulma
- Dinamik zorluk ayarı
- AI tarafından oluşturulan deneme sınavları

### 📚 Kurs Kategorileri

1. **ASK Robotik** — 8 modülde 241 ders; sanal robotik simülasyonları
2. **Edubook Kids** — Konuşan kitaplar (Level 1-10, CEFR standardları)
3. **Din Kültürü & Ahlak Bilgisi** — Animasyonlu İslami değerler
4. **Dünya Klasikleri** — Animasyonlu klasik eserler
5. **Digital Literacy** — 21. yüzyıl becerileri
6. **TUS Hazırlığı** — Tıp Ulusal Sınavı
7. **İngilizce A1-A2** — Sıfırdan İngilizce
8. **IELTS Hazırlığı** — Uluslararası İngilizce sınavı
9. **YDS Hazırlığı** — Üniversite sınavı
10. **Daha Fazlası** — Ek kurslar (kurumsal, etkinlik, vb.)

## Teknoloji

- **Frontend**: HTML5, CSS3, JavaScript
- **AI Engine**: HMGS adaptif algoritması
- **Database**: Öğrenci profilleri, ilerleme, sınavlar
- **Video**: Konuşan kitaplar, animasyonlu içerik

## Hızlı Başlangıç

```bash
# Demo'yu açın
open public/index.html

# Veya tarayıcıda
http://localhost:8000
```

## Proje Yapısı

```
academia/
├── public/
│   ├── index.html          # Ana sayfa
│   ├── assets/
│   │   ├── css/            # Stil dosyaları
│   │   ├── js/             # JavaScript
│   │   └── images/         # Resimler
│   └── konusan-kitaplar/   # Edubook Kids
├── src/
│   ├── api/                # Backend API
│   ├── components/         # React components (gelecek)
│   └── utils/              # Yardımcı fonksiyonlar
├── docs/
│   ├── architecture.md     # Sistem mimarisi
│   ├── kurulum.md          # Kurulum rehberi
│   └── api.md              # API dokümantasyonu
├── README.md               # Bu dosya
├── package.json            # Bağımlılıklar
└── .claude/                # Claude Code konfigürasyonu
    └── CLAUDE.md           # Proje kuralları
```

## Gelecek Özellikleri

- [ ] Canlı sınıf modülü
- [ ] Mentorluş sistemi
- [ ] Sosyal öğrenme (grup çalışması)
- [ ] Sertifika sistemi
- [ ] Mobil uygulama
- [ ] Kurumsal dashboard
- [ ] YetenekFest entegrasyonu (Hikaye, Şiir, Kısa-Film yarışmaları)

## Katkıda Bulunma

Katkılar hoş geldiniz! Lütfen:
1. Bir fork oluşturun
2. Feature branch'i açın (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin
4. Branch'i push edin
5. Pull Request açın

## Lisans

MIT License - Detaylar için LICENSE dosyasına bakın

## İletişim

- Email: research@wpu.edu.tr
- Proje Müdürü: Murat Arslan
- Repository: https://github.com/wpu-research/academia

---

**Academia** — Kişiselleştirilmiş eğitim, herkesin erişimine açık. 📚
