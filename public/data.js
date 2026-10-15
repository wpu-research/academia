// Academia içerik verisi: programlar ve demo soru bankaları.
// Soru bankaları özgün yazılmıştır; gerçek ÖSYM sorusu içermez.

window.ACADEMIA = {};

ACADEMIA.groups = [
  { id: "dijital", label: "Robotik" },
  { id: "sinav", label: "Sınava Hazırlık" },
  { id: "ingilizce", label: "Genel İngilizce" },
];

ACADEMIA.programs = [
  {
    slug: "robotik", group: "dijital", title: "ASK Robotik",
    fact: "8 modül · 241 ders",
    summary: "Blokla kodlamadan Arduino'ya, sensörlerden yapay zekâ mühendisliğine kadar sanal laboratuvarda robotik eğitimi.",
    body: [
      "Öğrenci devreleri ve kodu tarayıcıdaki simülatörde kurar ve çalıştırır. Robi adlı yapay zekâ öğretmen takıldığı yerde ipucu verir.",
      "Okullar için öğretmen paneli, sınıf ve ödev takibi bulunur.",
    ],
    modules: [
      { slug: "blokla-kodlama", title: "Blokla Kodlamaya İlk Adım", lessons: 10, age: "5+ yaş", desc: "Okuma gerektirmeyen bloklarla komut, tekrar ve olay kavramları; küçük hikâye sahneleri kurulur." },
      { slug: "scratch", title: "Scratch ile Kendi Oyununu Yap", lessons: 16, age: "8+ yaş", desc: "Scratch ile tanışma, animasyon, müzik ve etkileşim, hikâye anlatımı ve ardından ilk oyunlar." },
      { slug: "arduino", title: "Arduino Temelleri", lessons: 35, age: "12+ yaş", desc: "Girdi ve mantık, analog dünya, PWM, renk ve ses, motorlar, zamanlama ve ekranlar; hepsi sanal devre tahtasında." },
      { slug: "sensorler", title: "Sensörler ve Projeler", lessons: 40, age: "12+ yaş", desc: "Mesafe, engel, ortam, ışık, ses, gaz ve hareket sensörleriyle haftalık projeler; simülasyondan gerçek devreye geçiş." },
      { slug: "robotik-modul", title: "Robotik", lessons: 40, age: "13+ yaş", desc: "Hareket, engelden kaçma, çizgi izleme, enkoder ve odometri, PID, IMU ve denge, robot kol ve bitirme robotu." },
      { slug: "yapay-zeka", title: "Yapay Zekâ Mühendisliği", lessons: 40, age: "13+ yaş", desc: "Dil modelleri, prompt yazımı, değerlendirme, embedding ve RAG, araçlar ve ajanlar, kod yazan yapay zekâ ve sorumlu kullanım." },
      { slug: "mikro-kart", title: "Mikro Kart", lessons: 30, age: "8+ yaş", desc: "Tek kartlık mikrodenetleyici: düğmeler ve olaylar, sensörler, müzik, radyo ile iletişim ve projeler." },
      { slug: "oyun-atolyesi", title: "Oyun Atölyesi", lessons: 30, age: "8+ yaş", desc: "Çarpışma ve skor, harita, düşman zekâsı, platform fiziği ve baştan sona tam oyun projeleri." },
    ],
    link: { href: "https://web-production-06ee9.up.railway.app", label: "ASK Robotik'i aç" },
  },
  {
    slug: "tus", group: "sinav", title: "TUS Hazırlık",
    fact: "Temel + Klinik · 2 × 100 soru",
    summary: "Seviye tespitiyle başlayan, zayıf olduğun alanlara göre her gün yeniden kurulan bir tıpta uzmanlık hazırlığı.",
    engine: "tus",
    body: [
      "Tıpta Uzmanlık Sınavı iki testten oluşur: Temel Tıp Bilimleri ve Klinik Tıp Bilimleri. Sorular alanlara sabit oranlarla dağılır, bu yüzden çalışma sırası tahmine değil bu orana ve senin alan ustalığına göre belirlenir.",
      "Her soruyu çözmeden önce ne kadar emin olduğunu işaretlersin. Emin olduğun halde yanlış yaptığın konular daha hızlı geri gelir; şansla doğru bildiklerin daha az kanıt sayılır.",
    ],
    structure: [
      ["Anatomi", "14"], ["Fizyoloji, Histoloji, Embriyoloji", "16"], ["Biyokimya", "18"],
      ["Mikrobiyoloji", "20"], ["Patoloji", "20"], ["Farmakoloji", "12"],
    ],
    structureNote: "Temel Tıp Bilimleri testi, alan başına yaklaşık soru sayısı. Demo bu testi kullanır.",
  },
  {
    slug: "hmgs", group: "sinav", title: "HMGS Hazırlık", engine: "hmgs",
    fact: "Hukuk Mesleklerine Giriş Sınavı",
    summary: "Öğrenme motorumuzun ilk uygulandığı program: kaynak maddeye dayanan sorular, hata defteri ve kaynak gösteren çalışma koçu.",
    body: [
      "Academia'nın kişisel çalışma motoru ilk olarak HMGS için geliştirildi. Her soru dayandığı kanun maddesiyle birlikte gelir; yanlış cevaptan sonra nedenini işaretlersin ve bu bilgi programına geri döner.",
      "Yapay zekâ ile hazırlanan soru taslakları, yayına girmeden önce bir hukukçu tarafından incelenir.",
    ],
    status: "Tam portal kapalı beta aşamasında. Buradaki seviye tespiti aynı motoru örnek sorularla gösterir.",
  },
  {
    slug: "yds", group: "sinav", title: "YDS Hazırlık",
    fact: "80 soru · 180 dakika",
    summary: "ÖSYM'nin soru mantığına göre yedi soru tipine ayrılmış, seviyene göre sıralanan bir YDS programı.",
    engine: "yds",
    body: [
      "Yabancı Dil Bilgisi Seviye Tespit Sınavı'nda 80 sorunun yarıdan fazlası okuma ve anlam bütünlüğü üzerinedir. Program önce hangi soru tipinde puan kaybettiğini bulur, sonra çalışma süreni o tiplere kaydırır.",
      "Kelime ve dilbilgisi soruları kısa tekrar aralıklarıyla geri gelir; okuma soruları ise süre tutularak çözülür.",
    ],
    structure: [
      ["Kelime", "6"], ["Dilbilgisi", "10"], ["Cloze test", "10"], ["Cümle tamamlama", "10"],
      ["Çeviri (İng–Tr, Tr–İng)", "6"], ["Okuma", "20"], ["Diyalog, yakın anlam, paragraf, anlamı bozan cümle", "18"],
    ],
    structureNote: "Soru tipine göre soru sayısı.",
  },
  {
    slug: "ielts", group: "sinav", title: "IELTS Hazırlık", engine: "ielts",
    fact: "4 modül · 0–9 band",
    summary: "Listening, Reading, Writing ve Speaking modüllerinde hedef band skoruna göre kurulan, deneme ağırlıklı program.",
    body: [
      "Önce dört modülde kısa bir ölçüm yapılır. Hedef band skorunla aradaki fark modül modül çıkarılır ve haftalık plan bu farka göre dağıtılır.",
      "Writing ve Speaking çalışmaları resmi değerlendirme ölçütleri üzerinden geri bildirim alır.",
    ],
    structure: [["Listening", "4 bölüm, 40 soru"], ["Reading", "3 metin, 40 soru"], ["Writing", "2 görev"], ["Speaking", "3 bölümlü görüşme"]],
  },
  {
    slug: "toefl", group: "sinav", title: "TOEFL Hazırlık", engine: "ingilizce",
    fact: "Bilgisayar tabanlı · 4 beceri",
    summary: "Amerika ve Kanada başta olmak üzere üniversite başvuruları için bilgisayar tabanlı TOEFL iBT'ye hazırlık.",
    body: [
      "Okuma, dinleme, konuşma ve yazma bölümlerinin her biri için ayrı seviye ölçülür. Entegre görevlerde (dinle, oku, konuş veya yaz) sık yapılan hatalar hata defterinde toplanır.",
    ],
  },
  {
    slug: "hazirlik-atlama", group: "sinav", title: "Hazırlık Atlama", engine: "ingilizce",
    fact: "Proficiency sınavlarına hazırlık",
    summary: "Üniversitenin İngilizce yeterlik sınavını geçip hazırlık sınıfını atlamak isteyenler için yoğun program.",
    body: [
      "Üniversitelerin yeterlik sınavları farklı biçimlerde olur. Program, hedef üniversitenin sınav biçimini temel alır ve ona benzer denemelerle ilerler.",
    ],
  },
  {
    slug: "gencler", group: "ingilizce", title: "Gençler İçin (11–17 Yaş)", engine: "ingilizce",
    fact: "Okul + LGS/YKS desteği",
    summary: "Okul derslerini destekleyen, sınav altyapısını güçlendiren ve konuşma özgüveni kazandıran İngilizce programı.",
    body: ["Okuldaki ünitelere paralel ilerler. Haftalık konuşma pratiği ve okuma görevleriyle sınav altyapısı birlikte kurulur."],
  },
  {
    slug: "cocuklar", group: "ingilizce", title: "Çocuklar İçin (7–11 Yaş)", engine: "ingilizce",
    fact: "Oyun ve hikâye temelli",
    summary: "İngilizceyi kural ezberleyerek değil; hikâyeler, şarkılar ve oyunlarla, yaşayarak öğrenme.",
    body: ["Her hafta bir hikâye etrafında kelime, dinleme ve kısa konuşma görevleri yapılır. Veli, çocuğun hangi kelimeleri öğrendiğini haftalık özetten görür."],
  },
  {
    slug: "ozel-ders", group: "ingilizce", title: "Özel Ders", engine: "ingilizce",
    fact: "Birebir · esnek takvim",
    summary: "Programı, içeriği ve hızı tamamen senin hedefine göre belirlenen birebir eğitim.",
    body: ["Seviye tespitinden çıkan eksik listesi eğitmeninle paylaşılır. Dersler bu listeye göre planlanır, ders aralarındaki çalışmalar platformdan takip edilir."],
  },
];

// ---------- Demo soru bankaları ----------
// q: soru, o: şıklar, a: doğru şık indeksi, e: açıklama

ACADEMIA.exams = {
  tus: {
    name: "TUS · Temel Tıp Bilimleri",
    short: "TUS",
    blueprint: { "Anatomi": 14, "Fizyoloji": 16, "Biyokimya": 18, "Mikrobiyoloji": 20, "Patoloji": 20, "Farmakoloji": 12 },
    areaNote: { "Fizyoloji": "Fizyoloji, Histoloji ve Embriyoloji" },
    items: [
      { id: "t-an1", alan: "Anatomi", q: "Deltoid kasını innerve eden sinir hangisidir?", o: ["N. radialis", "N. axillaris", "N. musculocutaneus", "N. suprascapularis", "N. thoracodorsalis"], a: 1, e: "Deltoid ve teres minor kaslarını n. axillaris (C5–C6) innerve eder. Humerusun collum chirurgicum kırıklarında bu sinir zarar görebilir." },
      { id: "t-an2", alan: "Anatomi", q: "Foramen ovale'den geçen sinir hangisidir?", o: ["N. maxillaris", "N. mandibularis", "N. ophthalmicus", "N. facialis", "N. glossopharyngeus"], a: 1, e: "N. mandibularis (V3) foramen ovale'den geçer. N. maxillaris foramen rotundum'dan, a. meningea media foramen spinosum'dan geçer." },
      { id: "t-an3", alan: "Anatomi", q: "Aşağıdaki kaslardan hangisi rotator manşetin (rotator cuff) parçası değildir?", o: ["M. supraspinatus", "M. infraspinatus", "M. teres minor", "M. subscapularis", "M. teres major"], a: 4, e: "Rotator manşet supraspinatus, infraspinatus, teres minor ve subscapularis kaslarından oluşur. Teres major bu gruba girmez." },
      { id: "t-an4", alan: "Anatomi", q: "Trigonum femorale içinde en lateralde yer alan yapı hangisidir?", o: ["V. femoralis", "A. femoralis", "N. femoralis", "Nodi lymphoidei inguinales profundi", "V. saphena magna"], a: 2, e: "Lateralden mediale sıralama sinir, arter, ven ve lenf kanallarıdır. En lateralde n. femoralis bulunur." },
      { id: "t-fz1", alan: "Fizyoloji", q: "Sağlıklı bir kalpte normal ritmi başlatan yapı hangisidir?", o: ["Atriyoventriküler düğüm", "His demeti", "Sinoatriyal düğüm", "Purkinje lifleri", "Sol dal"], a: 2, e: "Sinoatriyal düğüm en yüksek spontan depolarizasyon hızına sahiptir ve kalbin doğal pacemaker'ıdır." },
      { id: "t-fz2", alan: "Fizyoloji", q: "Filtre edilen sodyumun en büyük kısmı nefronun hangi bölümünde geri emilir?", o: ["Proksimal tübül", "Henle kulpunun ince inen kolu", "Henle kulpunun kalın çıkan kolu", "Distal tübül", "Toplayıcı kanal"], a: 0, e: "Filtre edilen sodyumun yaklaşık üçte ikisi proksimal tübülde geri emilir." },
      { id: "t-fz3", alan: "Fizyoloji", q: "Aşağıdakilerden hangisi oksijen-hemoglobin ayrışma eğrisini sağa kaydırır?", o: ["Vücut ısısının düşmesi", "Alkaloz", "2,3-bisfosfogliseratın artması", "Kanda CO₂ düzeyinin azalması", "Fetal hemoglobin oranının artması"], a: 2, e: "2,3-BPG artışı, asidoz, hiperkapni ve ısı artışı eğriyi sağa kaydırır; hemoglobin dokuya oksijeni daha kolay bırakır." },
      { id: "t-fz4", alan: "Fizyoloji", q: "Nöral tüp hangi germ yaprağından gelişir?", o: ["Ektoderm", "Mezoderm", "Endoderm", "Ekstraembriyonik mezoderm", "Trofoblast"], a: 0, e: "Nöral tüp, notokordun uyarısıyla ektodermden gelişen nöral plaktan oluşur." },
      { id: "t-bk1", alan: "Biyokimya", q: "Glikolizin hız kısıtlayıcı enzimi hangisidir?", o: ["Hekzokinaz", "Fosfofruktokinaz-1", "Pirüvat kinaz", "Gliseraldehit-3-fosfat dehidrogenaz", "Aldolaz"], a: 1, e: "Fosfofruktokinaz-1, fruktoz-6-fosfatı fruktoz-1,6-bisfosfata çevirir ve glikolizin ana düzenleme noktasıdır." },
      { id: "t-bk2", alan: "Biyokimya", q: "Kolesterol sentezinde hız kısıtlayıcı basamağı katalizleyen enzim hangisidir?", o: ["Asetil-KoA karboksilaz", "HMG-KoA sentaz", "HMG-KoA redüktaz", "Skualen sentaz", "Mevalonat kinaz"], a: 2, e: "HMG-KoA redüktaz, HMG-KoA'yı mevalonata çevirir. Statinler bu enzimi inhibe eder." },
      { id: "t-bk3", alan: "Biyokimya", q: "Üre döngüsünün mitokondride gerçekleşen ilk basamağını katalizleyen enzim hangisidir?", o: ["Arjinaz", "Karbamoil fosfat sentetaz I", "Argininosüksinat liyaz", "Ornitin transkarbamilaz", "Glutamin sentetaz"], a: 1, e: "Karbamoil fosfat sentetaz I, amonyak ve bikarbonattan karbamoil fosfat oluşturur ve N-asetilglutamat ile aktive olur." },
      { id: "t-bk4", alan: "Biyokimya", q: "Diş eti kanaması ve yara iyileşmesinde gecikme ile seyreden skorbüt, hangi vitaminin eksikliğinde görülür?", o: ["A vitamini", "B1 vitamini", "C vitamini", "D vitamini", "K vitamini"], a: 2, e: "C vitamini, kollajendeki prolin ve lizin kalıntılarının hidroksilasyonu için gereklidir. Eksikliğinde kollajen zayıf kalır." },
      { id: "t-mb1", alan: "Mikrobiyoloji", q: "Gram pozitif, koagülaz pozitif ve kümeler oluşturan kok hangisidir?", o: ["Staphylococcus epidermidis", "Staphylococcus aureus", "Streptococcus pyogenes", "Enterococcus faecalis", "Staphylococcus saprophyticus"], a: 1, e: "Koagülaz pozitif tek önemli stafilokok S. aureus'tur. Diğer stafilokoklar koagülaz negatiftir." },
      { id: "t-mb2", alan: "Mikrobiyoloji", q: "Mycobacterium tuberculosis'i göstermek için kullanılan boyama yöntemi hangisidir?", o: ["Gram", "Ziehl-Neelsen", "Giemsa", "Çini mürekkebi", "Gümüşleme"], a: 1, e: "Hücre duvarındaki mikolik asit nedeniyle mikobakteriler aside dirençlidir ve Ziehl-Neelsen ile boyanır." },
      { id: "t-mb3", alan: "Mikrobiyoloji", q: "Kızamık virüsü hangi aileye aittir?", o: ["Orthomyxoviridae", "Paramyxoviridae", "Togaviridae", "Picornaviridae", "Herpesviridae"], a: 1, e: "Kızamık etkeni Paramyxoviridae ailesinden Morbillivirus cinsine aittir." },
      { id: "t-mb4", alan: "Mikrobiyoloji", q: "Tetanoz toksininin etki mekanizması hangisidir?", o: ["Asetilkolin salınımını engeller", "İnhibitör nörotransmiterlerin (GABA, glisin) salınımını engeller", "Adenilat siklazı aktive eder", "Protein sentezini 60S alt biriminde durdurur", "Hücre zarında por oluşturur"], a: 1, e: "Tetanospazmin inhibitör internöronlardan GABA ve glisin salınımını engeller; sonuç spastik paralizidir. Asetilkolin salınımını engelleyen botulinum toksinidir." },
      { id: "t-pt1", alan: "Patoloji", q: "Miyokard enfarktüsünde tipik olarak görülen nekroz tipi hangisidir?", o: ["Likefaksiyon nekrozu", "Koagülasyon nekrozu", "Kazeifikasyon nekrozu", "Yağ nekrozu", "Fibrinoid nekroz"], a: 1, e: "Beyin dışındaki solid organlarda iskemi koagülasyon nekrozu yapar. Beyinde ise likefaksiyon nekrozu görülür." },
      { id: "t-pt2", alan: "Patoloji", q: "Kazeifikasyon nekrozu en tipik olarak hangi enfeksiyonda görülür?", o: ["Tüberküloz", "Akut apandisit", "Pnömokok pnömonisi", "Viral hepatit", "Gazlı gangren"], a: 0, e: "Kazeifikasyon nekrozu tüberküloz granülomlarının merkezinde görülen, peynir kıvamında amorf nekrozdur." },
      { id: "t-pt3", alan: "Patoloji", q: "Aşağıdakilerden hangisi fizyolojik (hormonal) hiperplaziye örnektir?", o: ["Egzersizle büyüyen iskelet kası", "Hipertansiyonda kalınlaşan sol ventrikül", "Laktasyon döneminde meme bezi epitelinin çoğalması", "Sigara içenlerde bronş epitelinde skuamöz metaplazi", "Denervasyon sonrası küçülen kas"], a: 2, e: "Gebelik ve laktasyonda meme bezi epitelinin çoğalması hormonal hiperplazidir. Kas büyümesi hipertrofi, bronştaki değişim metaplazidir." },
      { id: "t-pt4", alan: "Patoloji", q: "Akut inflamasyonda bölgeye ilk saatlerde en fazla göç eden hücre hangisidir?", o: ["Makrofaj", "Lenfosit", "Nötrofil", "Plazma hücresi", "Eozinofil"], a: 2, e: "İlk 6–24 saatte nötrofiller baskındır; 24–48 saatten sonra yerini monosit ve makrofajlara bırakır." },
      { id: "t-fk1", alan: "Farmakoloji", q: "Varfarin kaynaklı kanamada etkiyi geri çevirmek için kullanılan ilaç hangisidir?", o: ["Protamin sülfat", "K vitamini", "Traneksamik asit", "Desmopressin", "N-asetilsistein"], a: 1, e: "Varfarin K vitaminine bağımlı pıhtılaşma faktörlerinin sentezini engeller; K vitamini bu etkiyi geri çevirir. Protamin heparinin antidotudur." },
      { id: "t-fk2", alan: "Farmakoloji", q: "Parasetamol (asetaminofen) zehirlenmesinin antidotu hangisidir?", o: ["Nalokson", "Flumazenil", "N-asetilsistein", "Atropin", "Deferoksamin"], a: 2, e: "N-asetilsistein glutatyon depolarını yeniler ve toksik metabolit NAPQI'nin etkisizleştirilmesine yardım eder." },
      { id: "t-fk3", alan: "Farmakoloji", q: "Asetilsalisilik asidin trombosit üzerindeki etkisinin uzun sürmesinin nedeni nedir?", o: ["COX enzimini geri dönüşümsüz inhibe etmesi", "ADP reseptörünü geri dönüşümlü bloke etmesi", "Trombin oluşumunu engellemesi", "Glikoprotein IIb/IIIa reseptörünü bloke etmesi", "Yarı ömrünün çok uzun olması"], a: 0, e: "Aspirin COX enzimini asetilleyerek geri dönüşümsüz inhibe eder. Çekirdeği olmayan trombosit yeni enzim üretemez, etki trombositin ömrü boyunca sürer." },
      { id: "t-fk4", alan: "Farmakoloji", q: "Selektif olmayan beta blokerler aşağıdaki hastalardan hangisinde en çok dikkat gerektirir?", o: ["Esansiyel hipertansiyon", "Astım", "Migren profilaksisi", "Esansiyel tremor", "Hipertiroidi semptomları"], a: 1, e: "Beta-2 blokajı bronkospazma yol açabilir; astımlı hastada selektif olmayan beta blokerlerden kaçınılır." },
    ],
  },

  hmgs: {
    name: "HMGS · Hukuk Mesleklerine Giriş",
    short: "HMGS",
    blueprint: { "Anayasa Hukuku": 30, "İdare Hukuku": 28, "Medeni Hukuk": 41, "Borçlar Hukuku": 36, "Ticaret Hukuku": 33, "Medeni Usul ve İcra-İflas": 49, "Ceza ve Ceza Muhakemesi": 44, "Diğer alanlar": 79 },
    blueprintNote: "Ağırlıklar, HMGS projesinde etiketlenen 340 gerçek sınav sorusunun alan dağılımından alındı.",
    areaNote: { "Anayasa Hukuku": "Anayasa yargısı dahil", "İdare Hukuku": "İdari yargılama dahil", "Diğer alanlar": "İş, vergi, avukatlık, milletlerarası hukuk, hukuk felsefesi ve tarihi" },
    items: [
      { id: "h-an1", alan: "Anayasa Hukuku", q: "Anayasa Mahkemesine doğrudan iptal davası açma hakkı, iptali istenen kanunun Resmî Gazete'de yayımlanmasından başlayarak kaç gün sonra düşer?", o: ["30 gün", "45 gün", "60 gün", "90 gün", "1 yıl"], a: 2, e: "Anayasa m.151: doğrudan iptal davası açma hakkı, kanunun Resmî Gazete'de yayımlanmasından başlayarak 60 gün sonra düşer." },
      { id: "h-an2", alan: "Anayasa Hukuku", q: "Türkiye Büyük Millet Meclisi seçimleri kaç yılda bir yapılır?", o: ["3 yıl", "4 yıl", "5 yıl", "6 yıl", "7 yıl"], a: 2, e: "Anayasa m.77: TBMM ve Cumhurbaşkanı seçimleri beş yılda bir aynı günde yapılır." },
      { id: "h-an3", alan: "Anayasa Hukuku", q: "Aşağıdakilerden hangisi Cumhurbaşkanlığı kararnamesiyle düzenlenebilir?", o: ["Kişi hak ve ödevleri", "Temel haklar", "Siyasi haklar ve ödevler", "Sosyal ve ekonomik haklar ve ödevler", "Hiçbiri"], a: 3, e: "Anayasa m.104/17: ikinci kısmın birinci ve ikinci bölümündeki temel haklar, kişi hakları ve ödevleri ile dördüncü bölümdeki siyasi haklar CBK ile düzenlenemez. Üçüncü bölümdeki sosyal ve ekonomik haklar bu yasağın dışındadır." },
      { id: "h-id1", alan: "İdare Hukuku", q: "Özel kanunlarında ayrı süre gösterilmeyen hâllerde idare mahkemelerinde dava açma süresi kaç gündür?", o: ["15 gün", "30 gün", "45 gün", "60 gün", "90 gün"], a: 3, e: "İYUK m.7: dava açma süresi Danıştayda ve idare mahkemelerinde 60, vergi mahkemelerinde 30 gündür." },
      { id: "h-id2", alan: "İdare Hukuku", q: "İdari yargı yetkisi, idari eylem ve işlemlerin hangi yönden denetimini kapsamaz?", o: ["Yetki", "Şekil", "Sebep", "Maksat", "Yerindelik"], a: 4, e: "İYUK m.2/2: idari yargı yetkisi, idari eylem ve işlemlerin hukuka uygunluğunun denetimiyle sınırlıdır; yerindelik denetimi yapılamaz." },
      { id: "h-id3", alan: "İdare Hukuku", q: "Bir idari eylem nedeniyle kişisel hakları doğrudan zarar gören kişinin zararının giderilmesi için açacağı dava hangisidir?", o: ["İptal davası", "Tam yargı davası", "Tespit davası", "İtirazın iptali davası", "Menfi tespit davası"], a: 1, e: "İYUK m.2/1-b: idari eylem ve işlemlerden kişisel hakları doğrudan muhtel olanlar tarafından açılan dava tam yargı davasıdır." },
      { id: "h-me1", alan: "Medeni Hukuk", q: "Türk Medeni Kanunu'na göre ergin kılınma için mahkemeye başvurabilecek küçüğün en az kaç yaşını doldurmuş olması gerekir?", o: ["12", "14", "15", "16", "17"], a: 2, e: "TMK m.12: on beş yaşını dolduran küçük, kendi isteği ve velisinin rızasıyla mahkeme kararıyla ergin kılınabilir." },
      { id: "h-me2", alan: "Medeni Hukuk", q: "Eşler arasında kanuni (yasal) mal rejimi hangisidir?", o: ["Mal ayrılığı", "Paylaşmalı mal ayrılığı", "Edinilmiş mallara katılma", "Mal ortaklığı", "Mal birliği"], a: 2, e: "TMK m.202: eşler arasında edinilmiş mallara katılma rejiminin geçerli olması asıldır." },
      { id: "h-me3", alan: "Medeni Hukuk", q: "Erginlik yaşı kaçtır?", o: ["15", "16", "17", "18", "21"], a: 3, e: "TMK m.11: erginlik on sekiz yaşın doldurulmasıyla başlar. Evlenme de kişiyi ergin kılar." },
      { id: "h-bo1", alan: "Borçlar Hukuku", q: "Kanunda aksine bir hüküm bulunmadıkça her alacak kaç yıllık zamanaşımına tabidir?", o: ["2 yıl", "5 yıl", "10 yıl", "15 yıl", "20 yıl"], a: 2, e: "TBK m.146: kanunda aksine hüküm yoksa her alacak on yıllık zamanaşımına tabidir." },
      { id: "h-bo2", alan: "Borçlar Hukuku", q: "Haksız fiilden doğan tazminat istemi, zarar görenin zararı ve tazminat yükümlüsünü öğrendiği tarihten başlayarak kaç yılda zamanaşımına uğrar?", o: ["1 yıl", "2 yıl", "3 yıl", "5 yıl", "10 yıl"], a: 1, e: "TBK m.72: öğrenmeden itibaren iki yıl, her hâlde fiilin işlendiği tarihten itibaren on yıl." },
      { id: "h-bo3", alan: "Borçlar Hukuku", q: "Aşırı yararlanma (gabin) nedeniyle sözleşmeyle bağlı olmadığını bildirme hakkı hangi süreler içinde kullanılmalıdır?", o: ["Öğrenmeden itibaren 6 ay, her hâlde 2 yıl", "Öğrenmeden itibaren 1 yıl, her hâlde sözleşmeden itibaren 5 yıl", "Öğrenmeden itibaren 2 yıl, her hâlde 10 yıl", "Sözleşmeden itibaren 1 yıl", "Süre sınırı yoktur"], a: 1, e: "TBK m.28: zor durumda kalma, düşüncesizlik veya deneyimsizliğin öğrenildiği ya da etkisinin ortadan kalktığı tarihten başlayarak bir yıl, her hâlde sözleşmenin kurulmasından başlayarak beş yıl." },
      { id: "h-ti1", alan: "Ticaret Hukuku", q: "Bir anonim şirket en az kaç kurucu ile kurulabilir?", o: ["1", "2", "3", "5", "7"], a: 0, e: "TTK m.338: anonim şirketin kurucusu bir veya daha fazla kişi olabilir." },
      { id: "h-ti2", alan: "Ticaret Hukuku", q: "Limited şirketin ortak sayısı en fazla kaç olabilir?", o: ["25", "40", "50", "75", "Sınır yoktur"], a: 2, e: "TTK m.574: limited şirket ortaklarının sayısı elliyi aşamaz." },
      { id: "h-ti3", alan: "Ticaret Hukuku", q: "Aşağıdakilerden hangisi bononun kanunda sayılan zorunlu unsurlarından biri değildir?", o: ["Senet metninde “bono” veya “emre muharrer senet” kaydı", "Kayıtsız şartsız belirli bir bedeli ödeme vaadi", "Lehtarın adı", "Düzenleyenin imzası", "Faiz şartı"], a: 4, e: "TTK m.776 bononun zorunlu unsurlarını sayar. Faiz şartı bunlardan biri değildir." },
      { id: "h-us1", alan: "Medeni Usul ve İcra-İflas", q: "HMK'ya göre genel yetkili mahkeme hangisidir?", o: ["Davacının yerleşim yeri mahkemesi", "Sözleşmenin yapıldığı yer mahkemesi", "Davalının dava tarihindeki yerleşim yeri mahkemesi", "Taşınmazın bulunduğu yer mahkemesi", "Davacının seçeceği herhangi bir mahkeme"], a: 2, e: "HMK m.6: genel yetkili mahkeme, davalı gerçek veya tüzel kişinin davanın açıldığı tarihteki yerleşim yeri mahkemesidir." },
      { id: "h-us2", alan: "Medeni Usul ve İcra-İflas", q: "HMK'ya göre istinaf yoluna başvuru süresi, ilamın tebliğinden itibaren ne kadardır?", o: ["1 hafta", "2 hafta", "15 gün", "1 ay", "2 ay"], a: 1, e: "HMK m.345: istinaf yoluna başvuru süresi iki haftadır ve ilamın usulen taraflardan her birine tebliğiyle başlar." },
      { id: "h-us3", alan: "Medeni Usul ve İcra-İflas", q: "Genel haciz yoluyla ilamsız takipte borçlu, ödeme emrine kaç gün içinde itiraz edebilir?", o: ["3 gün", "5 gün", "7 gün", "10 gün", "15 gün"], a: 2, e: "İİK m.62: itirazı olan borçlu, itirazını ödeme emrinin tebliği tarihinden itibaren yedi gün içinde icra dairesine bildirir." },
      { id: "h-ce1", alan: "Ceza ve Ceza Muhakemesi", q: "TCK'ya göre fiili işlediği sırada kaç yaşını doldurmamış olan çocukların ceza sorumluluğu yoktur?", o: ["10", "12", "13", "15", "18"], a: 1, e: "TCK m.31/1: fiili işlediği sırada on iki yaşını doldurmamış çocukların ceza sorumluluğu yoktur; çocuklara özgü güvenlik tedbirleri uygulanabilir." },
      { id: "h-ce2", alan: "Ceza ve Ceza Muhakemesi", q: "CMK'ya göre bireysel suçlarda gözaltı süresi, yakalama yerine en yakın hâkime gönderilmek için zorunlu süre hariç en çok ne kadardır?", o: ["12 saat", "24 saat", "48 saat", "4 gün", "7 gün"], a: 1, e: "CMK m.91/1: gözaltı süresi, yakalama yerine en yakın hâkim veya mahkemeye gönderilmesi için zorunlu süre hariç, yakalama anından itibaren yirmi dört saati geçemez." },
      { id: "h-ce3", alan: "Ceza ve Ceza Muhakemesi", q: "Aşağıdakilerden hangisi TCK'da düzenlenen hukuka uygunluk sebeplerindendir?", o: ["Haksız tahrik", "Meşru savunma", "Yaş küçüklüğü", "Akıl hastalığı", "Geçici nedenler"], a: 1, e: "TCK m.25'teki meşru savunma hukuka uygunluk sebebidir. Haksız tahrik cezada indirim sebebi; yaş küçüklüğü ve akıl hastalığı kusurluluğu etkileyen hâllerdir." },
      { id: "h-di1", alan: "Diğer alanlar", q: "İş Kanunu'na göre hizmet süresi bir yıldan beş yıla kadar (beş yıl dahil) olan işçiye verilecek yıllık ücretli izin süresi en az kaç gündür?", o: ["10", "14", "18", "20", "26"], a: 1, e: "İş Kanunu m.53: bir yıldan beş yıla kadar (beş yıl dahil) hizmeti olanlara en az on dört gün yıllık ücretli izin verilir." },
      { id: "h-di2", alan: "Diğer alanlar", q: "Avukatlık Kanunu'na göre avukatlık stajının süresi ne kadardır?", o: ["6 ay", "1 yıl", "18 ay", "2 yıl", "3 yıl"], a: 1, e: "Avukatlık Kanunu m.15: staj süresi bir yıldır; ilk altı ayı mahkemelerde, kalanı avukat yanında yapılır." },
      { id: "h-di3", alan: "Diğer alanlar", q: "Vergi Usul Kanunu'na göre vergi alacağı, doğduğu takvim yılını izleyen yıldan başlayarak kaç yıl içinde tarh edilip tebliğ edilmezse zamanaşımına uğrar?", o: ["3 yıl", "5 yıl", "7 yıl", "10 yıl", "15 yıl"], a: 1, e: "VUK m.114: vergi alacağı, doğduğu takvim yılını takip eden yılın başından başlayarak beş yıl içinde tarh ve ilgiliye tebliğ edilmezse zamanaşımına uğrar." },
    ],
  },

  yds: {
    name: "YDS · İngilizce",
    short: "YDS",
    blueprint: { "Kelime": 6, "Dilbilgisi": 10, "Cloze test": 10, "Cümle tamamlama": 10, "Çeviri": 6, "Okuma": 20, "Anlam bütünlüğü": 18 },
    areaNote: { "Anlam bütünlüğü": "Diyalog, yakın anlam, paragraf tamamlama, anlamı bozan cümle" },
    items: [
      { id: "y-k1", alan: "Kelime", q: "The new policy was designed to ---- the negative effects of inflation on low-income families.", o: ["mitigate", "exacerbate", "postpone", "overlook", "predict"], a: 0, e: "“Designed to” olumlu bir amaç bildirir; olumsuz etkileri “hafifletmek” anlamındaki mitigate uyar. Exacerbate “kötüleştirmek” demektir." },
      { id: "y-k2", alan: "Kelime", q: "Despite years of research, scientists have not been able to ---- the exact cause of the disease.", o: ["identify", "abandon", "reward", "imitate", "neglect"], a: 0, e: "Yıllarca araştırmaya rağmen nedeni “belirleyememek”: identify." },
      { id: "y-k3", alan: "Kelime", q: "The museum's collection is so ---- that visitors need several days to see all of it.", o: ["fragile", "extensive", "obscure", "temporary", "modest"], a: 1, e: "Tamamını görmek için birkaç gün gerekiyorsa koleksiyon “kapsamlı, geniş”tir: extensive." },
      { id: "y-g1", alan: "Dilbilgisi", q: "By the time the rescue team arrived, the hikers ---- in the cave for nearly three days.", o: ["have been trapped", "had been trapped", "are trapped", "will have been trapped", "were being trapped"], a: 1, e: "“By the time + past simple” ile ondan önce süregelen durum past perfect ile anlatılır: had been trapped." },
      { id: "y-g2", alan: "Dilbilgisi", q: "If the bridge ---- properly, the accident would never have happened.", o: ["was maintained", "has been maintained", "had been maintained", "would be maintained", "is maintained"], a: 2, e: "Ana cümle “would have happened” olduğu için geçmişe dönük koşul (type 3) kurulur: had been maintained." },
      { id: "y-g3", alan: "Dilbilgisi", q: "The report, ---- was published last month, highlights the risks of rapid urbanisation.", o: ["that", "what", "which", "whom", "whose"], a: 2, e: "Virgülle ayrılmış (non-defining) sıfat cümlesinde “that” kullanılmaz; nesne için which gelir." },
      { id: "y-c1", alan: "Cloze test", q: "Coral reefs cover less than one percent of the ocean floor. ----, they support about a quarter of all known marine species.", o: ["Therefore", "However", "For instance", "Similarly", "In addition"], a: 1, e: "Küçük alan ile büyük tür çeşitliliği arasında zıtlık var: However." },
      { id: "y-c2", alan: "Cloze test", q: "Many early maps were inaccurate, largely ---- the limited tools available to cartographers at the time.", o: ["in spite of", "instead of", "due to", "apart from", "as long as"], a: 2, e: "Hatalı haritaların nedeni sınırlı araçlardır; neden bildiren due to uyar." },
      { id: "y-c3", alan: "Cloze test", q: "Honeybees communicate the location of food sources ---- a series of movements known as the waggle dance.", o: ["against", "through", "without", "beyond", "despite"], a: 1, e: "İletişimin aracı dans hareketleridir: through (aracılığıyla)." },
      { id: "y-s1", alan: "Cümle tamamlama", q: "Although electric cars produce no exhaust emissions, ----.", o: ["they are becoming increasingly popular in large cities", "their overall environmental impact depends on how the electricity is generated", "many governments offer tax incentives to buyers", "they are quieter than conventional vehicles", "their batteries can be charged at home"], a: 1, e: "“Although” zıtlık ister. Egzoz emisyonu olmamasına karşın toplam çevresel etkinin elektriğin kaynağına bağlı olması bu zıtlığı kurar." },
      { id: "y-s2", alan: "Cümle tamamlama", q: "Unless the water supply is protected from contamination, ----.", o: ["outbreaks of waterborne disease are likely to occur", "the town has invested in a new treatment plant", "clean water was available to everyone", "residents drink less water in winter", "the river flows through several villages"], a: 0, e: "“Unless” (…mazsa) bir sonuç ister ve gelecek zamana uygun olmalıdır: salgın çıkması olasıdır." },
      { id: "y-s3", alan: "Cümle tamamlama", q: "The more people use public transport, ----.", o: ["the city opened a new metro line", "the less congested the roads become", "buses are usually cheaper than taxis", "if fares were lower", "which reduces air pollution"], a: 1, e: "“The more …, the less …” kalıbı iki karşılaştırmalı ifadeyi birbirine bağlar." },
      { id: "y-t1", alan: "Çeviri", q: "Uzmanlar, iklim değişikliğinin tarımsal verimliliği önemli ölçüde etkileyebileceği konusunda uyarıyor.", o: ["Experts warned that climate change had significantly affected agricultural productivity.", "Experts warn that climate change may significantly affect agricultural productivity.", "According to experts, agricultural productivity has a significant effect on climate change.", "Experts are not sure whether climate change will affect agricultural productivity.", "Climate change, experts say, will certainly reduce agricultural productivity."], a: 1, e: "Şimdiki zaman “uyarıyor” (warn), olasılık “-ebileceği” (may) ve “önemli ölçüde” (significantly) yalnız B'de birlikte korunur." },
      { id: "y-t2", alan: "Çeviri", q: "Few studies have examined the long-term effects of the drug on children.", o: ["Birkaç çalışma, ilacın çocuklarda uzun süre kullanılmasının etkilerini incelemiştir.", "İlacın çocuklar üzerindeki uzun vadeli etkilerini inceleyen çalışma sayısı azdır.", "Hiçbir çalışma ilacın çocuklar üzerindeki etkilerini incelememiştir.", "Çalışmaların çoğu, ilacın çocuklar üzerindeki uzun vadeli etkilerini incelemiştir.", "İlacın çocuklar üzerindeki kısa vadeli etkileri birkaç çalışmada incelenmiştir."], a: 1, e: "“Few” olumsuz anlam taşır (çok az, yetersiz). “A few” olsaydı “birkaç” derdik. B bu vurguyu ve “long-term effects” ifadesini doğru verir." },
      { id: "y-t3", alan: "Çeviri", q: "Bu yöntem pahalı olmasına rağmen daha güvenilir sonuçlar verir.", o: ["Since this method is expensive, its results are more reliable.", "Although this method is expensive, it yields more reliable results.", "This method is expensive, and its results are not reliable.", "Despite yielding reliable results, this method is expensive.", "This method would be more reliable if it were less expensive."], a: 1, e: "“-masına rağmen” zıtlık bildirir ve pahalılık yan cümlededir: Although this method is expensive… D'de zıtlığın yönü ters çevrilmiştir." },
      { id: "y-r1", alan: "Okuma", q: "Sleep plays a crucial role in memory consolidation. During deep sleep, the brain replays the day's experiences, strengthening the neural connections that underlie new memories. Studies show that students who sleep after learning recall information better than those who stay awake for the same period.\n\nAccording to the passage, ----.", o: ["sleeping after learning can improve the recall of new information", "deep sleep weakens the neural connections formed during the day", "students who stay awake after learning remember more", "memories are consolidated only while we are awake", "the brain stops processing information during deep sleep"], a: 0, e: "Son cümle, öğrendikten sonra uyuyan öğrencilerin bilgiyi daha iyi hatırladığını söylüyor." },
      { id: "y-r2", alan: "Okuma", q: "Cities are often several degrees warmer than the surrounding countryside, a phenomenon known as the urban heat island effect. Asphalt and concrete absorb heat during the day and release it at night, while the lack of vegetation reduces cooling through evaporation. Planting trees and installing reflective roofs are two common ways to reduce this effect.\n\nWhich of the following is NOT mentioned as a cause of the urban heat island effect?", o: ["Heat absorbed by asphalt and concrete", "The release of stored heat at night", "Limited vegetation in cities", "Emissions from heavy industry", "Reduced cooling through evaporation"], a: 3, e: "Metin sanayi emisyonlarından hiç söz etmiyor; diğer seçeneklerin hepsi metinde geçiyor." },
      { id: "y-r3", alan: "Okuma", q: "Cities are often several degrees warmer than the surrounding countryside, a phenomenon known as the urban heat island effect. Asphalt and concrete absorb heat during the day and release it at night, while the lack of vegetation reduces cooling through evaporation. Planting trees and installing reflective roofs are two common ways to reduce this effect.\n\nIt can be inferred from the passage that reflective roofs ----.", o: ["absorb more heat than concrete", "help keep buildings and their surroundings cooler", "are more expensive than planting trees", "increase evaporation in urban areas", "are used mainly in rural areas"], a: 1, e: "Yansıtıcı çatılar etkiyi azaltma yolu olarak anılıyor; yani çevrenin daha az ısınmasına yardım ettikleri çıkarılabilir." },
      { id: "y-a1", alan: "Anlam bütünlüğü", q: "Cümlelerden hangisi parçanın anlam bütünlüğünü bozar?\n\n(I) The printing press, invented around 1440, transformed the spread of knowledge in Europe. (II) Books, which had been copied by hand, could now be produced quickly and cheaply. (III) As a result, literacy rates gradually increased. (IV) Paper was first developed in ancient China. (V) Ideas could travel further and faster than ever before.", o: ["I", "II", "III", "IV", "V"], a: 3, e: "Parça matbaanın bilginin yayılmasına etkisini anlatıyor. Kâğıdın Çin'de icadı bu akışın dışında kalıyor." },
      { id: "y-a2", alan: "Anlam bütünlüğü", q: "Diyaloğu tamamlayın.\n\nEmma: I've been learning Spanish for months, but I still can't follow a real conversation.\nDaniel: ----\nEmma: That's a good idea. I'll look for a group near my office.", o: ["I've never been to Spain, actually.", "Have you thought about joining a conversation club to practise with native speakers?", "Spanish grammar is quite similar to French.", "Children learn languages much faster than adults.", "You should stop studying for a while."], a: 1, e: "Emma'nın cevabı bir öneriye (“good idea”) ve bir gruba (“group”) karşılık geliyor; bu yalnız konuşma kulübü önerisiyle uyuşur." },
      { id: "y-a3", alan: "Anlam bütünlüğü", q: "Verilen cümleye anlamca en yakın olanı seçin.\n\nIt was not until the 19th century that the link between hygiene and infection was widely accepted.", o: ["The link between hygiene and infection only became widely accepted in the 19th century.", "In the 19th century, people rejected the link between hygiene and infection.", "Hygiene was first practised in the 19th century.", "Before the 19th century, the link between hygiene and infection was widely accepted.", "Infections largely disappeared in the 19th century thanks to hygiene."], a: 0, e: "“It was not until … that …” yapısı “ancak … -de/-da” anlamı verir: bağlantı ancak 19. yüzyılda genel kabul gördü." },
    ],
  },
  ielts: {
    name: "IELTS · Academic",
    short: "IELTS",
    blueprint: { "Listening": 1, "Reading": 1, "Writing": 1 },
    blueprintNote: "Speaking canlı görüşmeyle değerlendirilir, bu demoda yok. Listening sorularında ses kaydı yerine yazılı döküm verilir.",
    areaNote: { "Listening": "Demoda ses kaydı yerine yazılı döküm" },
    items: [
      { id: "i-l1", alan: "Listening", q: "Kayıtta şunu duyuyorsunuz:\n“The museum is open every day except Monday, from half past nine until five. On Thursdays, we stay open until eight.”\n\nMüze perşembe günleri saat kaçta kapanır?", o: ["5 pm", "8 pm", "9.30 am", "Perşembe kapalıdır", "8 am"], a: 1, e: "Genel kapanış saati beşte olsa da perşembe günleri müze sekize kadar açık." },
      { id: "i-l2", alan: "Listening", q: "Kayıtta şunu duyuyorsunuz:\n“My surname is Whitfield. That's W-H-I-T-F-I-E-L-D.”\n\nFormda soyadı nasıl yazılmalı?", o: ["Whitfeild", "Whitfield", "Witfield", "Whitefield", "Whitfeld"], a: 1, e: "Harf harf söylenen yazım W-H-I-T-F-I-E-L-D'dir. Listening'de yanlış yazılan cevap puan almaz." },
      { id: "i-l3", alan: "Listening", q: "Kayıtta şunu duyuyorsunuz:\n“The talk was supposed to start at two, but the speaker's train has been delayed, so we'll begin forty-five minutes later.”\n\nKonuşma saat kaçta başlayacak?", o: ["2.00", "2.15", "2.45", "3.45", "1.15"], a: 2, e: "Saat ikiye 45 dakika eklenir: 2.45." },
      { id: "i-l4", alan: "Listening", q: "Kayıtta şunu duyuyorsunuz:\n“I was going to book the Tuesday tour, but it's full, so I've gone for Wednesday instead. Thursday would be too late for me.”\n\nKonuşmacı hangi günü ayırttı?", o: ["Tuesday", "Wednesday", "Thursday"], a: 1, e: "Salı ilk tercihti ama dolu; perşembe çok geç. Ayırtılan gün çarşamba. Listening'de ilk duyulan cevap çoğu zaman çeldiricidir." },
      { id: "i-r1", alan: "Reading", q: "The town's first public library opened in 1897. It was funded by a local merchant who had made his fortune in the textile trade. At first the library lent books only to adults, but a children's section was added in 1912.\n\nStatement: The library was paid for by the town council.", o: ["TRUE", "FALSE", "NOT GIVEN"], a: 1, e: "Metin kütüphaneyi yerel bir tüccarın finanse ettiğini söylüyor; bu, ifadeyle çelişir." },
      { id: "i-r2", alan: "Reading", q: "The town's first public library opened in 1897. It was funded by a local merchant who had made his fortune in the textile trade. At first the library lent books only to adults, but a children's section was added in 1912.\n\nStatement: The merchant's textile business later failed.", o: ["TRUE", "FALSE", "NOT GIVEN"], a: 2, e: "Metin tüccarın işinin sonradan ne olduğu hakkında bilgi vermiyor." },
      { id: "i-r3", alan: "Reading", q: "The town's first public library opened in 1897. It was funded by a local merchant who had made his fortune in the textile trade. At first the library lent books only to adults, but a children's section was added in 1912.\n\nStatement: Children could borrow books when the library first opened.", o: ["TRUE", "FALSE", "NOT GIVEN"], a: 1, e: "Başlangıçta kitaplar yalnız yetişkinlere veriliyordu; çocuk bölümü 1912'de eklendi." },
      { id: "i-r4", alan: "Reading", q: "Many coastal cities are now investing in “sponge” infrastructure: parks, wetlands and permeable pavements that absorb heavy rainfall instead of channelling it into drains. Supporters say this reduces flooding and cools the city in summer, although critics point out that the approach needs large amounts of land.\n\nParagraf için en uygun başlık hangisidir?", o: ["The high cost of traditional drains", "Using natural surfaces to manage rainwater", "Why coastal cities are shrinking", "A record summer heatwave", "The history of urban parks"], a: 1, e: "Paragrafın ana fikri, yağmur suyunu emen doğal yüzeylerle taşkının yönetilmesidir." },
      { id: "i-w1", alan: "Writing", q: "Academic Writing Task 1'de bir ulaşım grafiği için hangisi en uygun genel değerlendirme (overview) cümlesidir?", o: ["Overall, car use rose steadily over the period, while cycling declined.", "I think cars are better than bicycles.", "In 1990, 23% of people drove, 12% cycled and 8% walked.", "This graph is about transport.", "Cars will probably become even more popular in the future."], a: 0, e: "Overview ana eğilimleri özetler. C ayrıntıdır, B kişisel görüş, E tahmindir; ikisi de Task 1'de istenmez." },
      { id: "i-w2", alan: "Writing", q: "“Some people believe university education should be free. To what extent do you agree?” sorusuna hangi tez cümlesi doğrudan cevap verir?", o: ["This essay will discuss university education.", "I strongly agree that tuition should be free, because it widens access and benefits society as a whole.", "Universities have existed for many centuries.", "There are many advantages and disadvantages.", "Education is very important for everyone."], a: 1, e: "“To what extent” sorusu net bir görüş ister. Yalnız B görüşü ve gerekçesini açıkça söylüyor." },
      { id: "i-w3", alan: "Writing", q: "Boşluğa en uygun bağlacı seçin:\n“Public transport reduces traffic. ----, it is often cheaper than driving.”", o: ["Moreover", "However", "Therefore", "Instead", "Otherwise"], a: 0, e: "İkinci cümle aynı yönde ek bir avantaj veriyor: Moreover." },
      { id: "i-w4", alan: "Writing", q: "Writing Task 2'de yazılması beklenen en az kelime sayısı kaçtır?", o: ["150", "200", "250", "300", "350"], a: 2, e: "Task 1 için en az 150, Task 2 için en az 250 kelime yazılması beklenir." },
    ],
  },

  ingilizce: {
    name: "İngilizce Seviye Tespiti · A1–C1",
    short: "İngilizce",
    levels: true,
    blueprint: { "A1": 1, "A2": 1, "B1": 1, "B2": 1, "C1": 1 },
    blueprintNote: "Seviyeler Avrupa Ortak Dil Referans Çerçevesi'ne (CEFR) göredir. Tahmini seviye, %60 ve üzeri ustalığa ulaştığın en yüksek kesintisiz seviyedir.",
    items: [
      { id: "e-a1-1", alan: "A1", q: "My sister ---- a teacher.", o: ["am", "is", "are", "be", "been"], a: 1, e: "Tekil üçüncü şahısla “to be” fiilinin şimdiki zamanı “is” olur." },
      { id: "e-a1-2", alan: "A1", q: "There ---- two apples on the table.", o: ["is", "are", "am", "be", "has"], a: 1, e: "Çoğul isimle “there are” kullanılır." },
      { id: "e-a1-3", alan: "A1", q: "I get up ---- seven o'clock.", o: ["in", "on", "at", "to", "by"], a: 2, e: "Saatlerden önce “at” kullanılır." },
      { id: "e-a1-4", alan: "A1", q: "---- you like coffee?", o: ["Does", "Do", "Are", "Is", "Have"], a: 1, e: "“You” ile geniş zaman sorusu “Do” ile kurulur." },
      { id: "e-a2-1", alan: "A2", q: "We ---- to Antalya last summer.", o: ["go", "went", "have gone", "going", "goes"], a: 1, e: "“Last summer” geçmişte bitmiş bir zamandır; past simple: went." },
      { id: "e-a2-2", alan: "A2", q: "This box is ---- than that one.", o: ["heavy", "heavier", "heaviest", "more heavy", "the heaviest"], a: 1, e: "Kısa sıfatlarda karşılaştırma “-er + than” ile yapılır; y harfi i'ye döner: heavier." },
      { id: "e-a2-3", alan: "A2", q: "I ---- my grandmother tomorrow. I've already bought the train ticket.", o: ["visit", "visited", "am visiting", "have visited", "was visiting"], a: 2, e: "Kesinleşmiş gelecek planları için present continuous kullanılır." },
      { id: "e-a2-4", alan: "A2", q: "You ---- wear a seatbelt in the car. It's the law.", o: ["must", "can", "might", "would", "could"], a: 0, e: "Kural veya zorunluluk “must” ile anlatılır." },
      { id: "e-b1-1", alan: "B1", q: "If I ---- more time, I would learn to play the guitar.", o: ["have", "had", "will have", "would have", "having"], a: 1, e: "Şimdiki zamana dair gerçek dışı koşul (second conditional): If + past simple, would + fiil." },
      { id: "e-b1-2", alan: "B1", q: "I have lived in this city ---- 2015.", o: ["for", "since", "during", "from", "ago"], a: 1, e: "Başlangıç noktası (yıl) “since” ile; süre (ör. ten years) “for” ile verilir." },
      { id: "e-b1-3", alan: "B1", q: "The bridge ---- in 1890.", o: ["built", "was built", "has built", "is building", "builds"], a: 1, e: "Köprü işi yapan değil, yapılan şeydir; geçmiş zaman edilgen: was built." },
      { id: "e-b1-4", alan: "B1", q: "She asked me where I ----.", o: ["live", "lived", "am living", "will live", "living"], a: 1, e: "Dolaylı anlatımda “asked” geçmiş zamanda olduğu için zaman bir geri kayar: lived." },
      { id: "e-b2-1", alan: "B2", q: "By next June, she ---- her degree.", o: ["will finish", "will have finished", "finishes", "has finished", "finished"], a: 1, e: "“By + gelecekteki zaman” o ana kadar tamamlanmış olacak eylemi anlatır: future perfect." },
      { id: "e-b2-2", alan: "B2", q: "I'd rather you ---- smoke in here.", o: ["don't", "didn't", "won't", "not", "haven't"], a: 1, e: "“Would rather + başka bir özne” yapısında şimdiki zaman için past simple kullanılır." },
      { id: "e-b2-3", alan: "B2", q: "Hardly ---- the meeting started when the fire alarm went off.", o: ["had", "has", "did", "was", "have"], a: 0, e: "“Hardly … when” yapısında devrik past perfect kullanılır: Hardly had the meeting started…" },
      { id: "e-b2-4", alan: "B2", q: "The company decided to ---- the launch until the software was fully tested.", o: ["put off", "put up", "put on", "take off", "bring up"], a: 0, e: "“Put off” ertelemek demektir." },
      { id: "e-c1-1", alan: "C1", q: "Not only ---- the deadline, but he also went over budget.", o: ["he missed", "did he miss", "he did miss", "missed he", "has missed he"], a: 1, e: "Cümle başındaki “Not only” devrik yapı ister: did he miss." },
      { id: "e-c1-2", alan: "C1", q: "Had I known about the traffic, I ---- earlier.", o: ["would leave", "would have left", "left", "had left", "will leave"], a: 1, e: "“Had I known” devrik third conditional'dır; ana cümle would have + V3 alır." },
      { id: "e-c1-3", alan: "C1", q: "Her argument was so ---- that even her critics were persuaded.", o: ["compelling", "tentative", "redundant", "ambiguous", "trivial"], a: 0, e: "Eleştirmenleri bile ikna eden bir argüman “compelling” (ikna edici) olur." },
      { id: "e-c1-4", alan: "C1", q: "The proposal, ---- merits are widely recognised, has yet to be approved.", o: ["which", "whose", "whom", "that", "what"], a: 1, e: "Teklifin “değerleri” sahiplik bildirir: whose merits." },
    ],
  },
};

// Örnek öğrenci verisi (demo): [soru id, doğru mu, güven 1-3]
ACADEMIA.sample = {
  tus: [
    ["t-an1",1,3],["t-an2",1,2],["t-fz1",1,3],["t-fz2",0,2],["t-fz3",1,2],["t-bk1",0,3],["t-bk2",1,1],["t-bk3",0,2],
    ["t-mb1",1,3],["t-mb2",1,2],["t-mb3",0,1],["t-pt1",1,2],["t-pt2",1,3],["t-pt3",0,2],["t-fk1",0,3],["t-fk2",0,2],
    ["t-an3",1,2],["t-mb4",1,2],
  ],
  hmgs: [
    ["h-an1",1,2],["h-id1",1,3],["h-me1",0,2],["h-bo1",1,3],["h-ti1",0,2],["h-us1",1,2],["h-ce1",1,3],["h-di1",0,1],["h-us2",0,3],["h-ce2",1,2],
    ["h-bo2",0,2],["h-me2",1,2],["h-ti2",0,1],["h-us3",1,2],
  ],
  ielts: [
    ["i-l1",1,2],["i-r1",1,3],["i-w1",0,2],["i-l2",1,3],["i-r2",0,3],["i-w2",1,2],["i-l3",1,2],["i-r3",1,2],["i-w3",1,3],["i-r4",0,2],
  ],
  ingilizce: [
    ["e-a1-1",1,3],["e-a1-2",1,3],["e-a2-1",1,3],["e-a2-2",1,2],["e-b1-1",1,2],["e-b1-2",0,2],["e-b2-1",0,2],["e-b2-2",0,1],["e-c1-1",0,1],["e-c1-2",0,2],
    ["e-b1-3",1,2],["e-a2-3",1,2],
  ],
  yds: [
    ["y-k1",1,2],["y-g1",1,3],["y-g2",0,3],["y-c1",1,2],["y-c2",1,2],["y-s1",0,2],["y-s2",1,1],["y-t1",1,2],
    ["y-r1",0,2],["y-r2",0,3],["y-a1",1,2],["y-a2",1,3],["y-k2",1,3],["y-g3",0,2],
  ],
};
