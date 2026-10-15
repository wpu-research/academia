# Academia Projesi — Claude Kuralları

## Proje Özeti

**Academia** — Yapay zeka destekli adaptif öğrenme platformu.
- HMGS-AI: Kişisel ders programları
- ASK Robotik: Sanal robotik
- Edubookk Kids: Konuşan kitaplar
- Dil kursları: IELTS, YDS, TUS
- Din Kültürü: Animasyonlu etik eğitimi

## Git Kuralları

- **Repository**: `wpu-research/academia` (yeni, bu projede)
- **Ana branch**: `main`
- **Geliştirme branch**: `develop`
- **Feature branch**: `feature/feature-name`
- **Bug fix**: `fix/bug-name`

## Teknik Stack

### Frontend
- **HTML5** — Semantik markup
- **CSS3** — Responsive tasarım (Dilkur Akademi tarzı)
- **JavaScript** — Vanilla JS (şimdilik, sonra React olabilir)
- **Animation**: CSS transitions, Framer Motion (gelecek)

### Backend (Planlanıyor)
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (öğrenci verileri, ilerleme)
- **AI Engine**: HMGS adaptif algoritması (kişisel uygulama)

### DevOps
- **Deploy**: Railway (existing kipay altyapısından ayrı)
- **CI/CD**: GitHub Actions
- **Container**: Docker (gelecek)

## Dosya Organizasyonu

```
academia/
├── public/
│   ├── index.html              # Ana sayfa (demo)
│   ├── courses/
│   │   ├── ask-robotik.html
│   │   ├── edubook-kids.html
│   │   └── ...
│   ├── assets/
│   │   ├── css/style.css       # Ana stil
│   │   ├── js/app.js           # Frontend logic
│   │   └── images/
│   └── konusan-kitaplar/       # Edubook Kids dosyaları
├── src/
│   ├── api/
│   │   ├── students.js         # Öğrenci API
│   │   ├── courses.js          # Kurs API
│   │   └── assessments.js      # Seviye testi API
│   ├── hmgs/
│   │   ├── engine.js           # Adaptif algoritma
│   │   ├── algorithm.js        # HMGS logic
│   │   └── utils.js
│   └── middleware/
│       └── auth.js             # Kimlik doğrulama
├── docs/
│   ├── architecture.md         # Sistem mimarisi
│   ├── hmgs-algorithm.md       # HMGS algoritması
│   ├── api-reference.md        # API dökümantasyonu
│   └── curriculum.md           # Müfredat yapısı
├── tests/
│   ├── unit/
│   └── integration/
├── .claude/
│   └── CLAUDE.md               # Bu dosya
├── .gitignore
├── package.json
├── server.js                   # Entry point
└── README.md
```

## Kodlama Kuralları

### HTML/CSS
- Responsive design: Mobile-first approach
- Accessibility: WCAG 2.1 AA standartları
- Renkler: Dilkur Akademi tarzı (mavi #003d7a, turuncu #ff6b35)

### JavaScript
- Modular: Bir dosya, bir sorumluluk
- Comments: Sadece "why" açıklanması (what ve how kodu açıklar)
- Naming: camelCase functions, UPPER_CASE constants
- No dependencies: Vanilla JS (başlangıçta)

### Commit Mesajları

```
type(scope): subject

body

footer
```

Types:
- `feat`: Yeni özellik
- `fix`: Hata düzeltme
- `docs`: Dokümantasyon
- `style`: Kod stili (formatting)
- `refactor`: Refaktor
- `test`: Test ekleme/güncelleme
- `chore`: Build, dependency, vb.

Örnek:
```
feat(hmgs): AI tarafından oluşturulan deneme sınavı

HMGS motoruna deneme sınavı oluşturma özelliği eklendi.
Önceki sınav hataları analiz edilerek sorular seçiliyor.

Closes #42
```

## Tasarım Sistemi

- **Typography**: Segoe UI, Tahoma, sans-serif
- **Colors**:
  - Primary: #0066cc (mavi)
  - Dark: #003d7a (koyu mavi)
  - Accent: #ff6b35 (turuncu)
  - Light: #f5f7fa (açık gri)

- **Spacing**: 8px grid (1rem = 16px)
- **Components**: Card-based grid layout

## Proje Hedefleri (2026 Q4)

- [x] Demo landing page ✅
- [ ] Student authentication
- [ ] HMGS assessment engine
- [ ] Konuşan kitaplar player
- [ ] Progress dashboard
- [ ] AI sınav üretimi
- [ ] Öğretmen dashboard
- [ ] Kurumsal paket

## İletişim & Sorular

- Project Lead: Murat Arslan (research@wpu.edu.tr)
- GitHub Issues: Teknik sorular
- Discord: Gerçek zamanlı iletişim
