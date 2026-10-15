// Academia içerik verisi: programlar ve demo soru bankaları.
// Soru bankaları özgün yazılmıştır; gerçek ÖSYM sorusu içermez.

window.ACADEMIA = {};

ACADEMIA.groups = [
  { id: "sinav", label: "Sınava Hazırlık" },
  { id: "ingilizce", label: "Genel İngilizce" },
  { id: "dijital", label: "Dijital Programlar" },
];

ACADEMIA.programs = [
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
    slug: "hmgs", group: "sinav", title: "HMGS Hazırlık",
    fact: "Hukuk Mesleklerine Giriş Sınavı",
    summary: "Öğrenme motorumuzun ilk uygulandığı program: kaynak maddeye dayanan sorular, hata defteri ve kaynak gösteren çalışma koçu.",
    body: [
      "Academia'nın kişisel çalışma motoru ilk olarak HMGS için geliştirildi. Her soru dayandığı kanun maddesiyle birlikte gelir; yanlış cevaptan sonra nedenini işaretlersin ve bu bilgi programına geri döner.",
      "Yapay zekâ ile hazırlanan soru taslakları, yayına girmeden önce bir hukukçu tarafından incelenir.",
    ],
    status: "Portal kapalı beta aşamasında. Bu demoda motorun aynısını TUS ve YDS üzerinde deneyebilirsin.",
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
    slug: "ielts", group: "sinav", title: "IELTS Hazırlık",
    fact: "4 modül · 0–9 band",
    summary: "Listening, Reading, Writing ve Speaking modüllerinde hedef band skoruna göre kurulan, deneme ağırlıklı program.",
    body: [
      "Önce dört modülde kısa bir ölçüm yapılır. Hedef band skorunla aradaki fark modül modül çıkarılır ve haftalık plan bu farka göre dağıtılır.",
      "Writing ve Speaking çalışmaları resmi değerlendirme ölçütleri üzerinden geri bildirim alır.",
    ],
    structure: [["Listening", "4 bölüm, 40 soru"], ["Reading", "3 metin, 40 soru"], ["Writing", "2 görev"], ["Speaking", "3 bölümlü görüşme"]],
  },
  {
    slug: "toefl", group: "sinav", title: "TOEFL Hazırlık",
    fact: "Bilgisayar tabanlı · 4 beceri",
    summary: "Amerika ve Kanada başta olmak üzere üniversite başvuruları için bilgisayar tabanlı TOEFL iBT'ye hazırlık.",
    body: [
      "Okuma, dinleme, konuşma ve yazma bölümlerinin her biri için ayrı seviye ölçülür. Entegre görevlerde (dinle, oku, konuş veya yaz) sık yapılan hatalar hata defterinde toplanır.",
    ],
  },
  {
    slug: "hazirlik-atlama", group: "sinav", title: "Hazırlık Atlama",
    fact: "Proficiency sınavlarına hazırlık",
    summary: "Üniversitenin İngilizce yeterlik sınavını geçip hazırlık sınıfını atlamak isteyenler için yoğun program.",
    body: [
      "Üniversitelerin yeterlik sınavları farklı biçimlerde olur. Program, hedef üniversitenin sınav biçimini temel alır ve ona benzer denemelerle ilerler.",
    ],
  },
  {
    slug: "gencler", group: "ingilizce", title: "Gençler İçin (11–17 Yaş)",
    fact: "Okul + LGS/YKS desteği",
    summary: "Okul derslerini destekleyen, sınav altyapısını güçlendiren ve konuşma özgüveni kazandıran İngilizce programı.",
    body: ["Okuldaki ünitelere paralel ilerler. Haftalık konuşma pratiği ve okuma görevleriyle sınav altyapısı birlikte kurulur."],
  },
  {
    slug: "cocuklar", group: "ingilizce", title: "Çocuklar İçin (7–11 Yaş)",
    fact: "Oyun ve hikâye temelli",
    summary: "İngilizceyi kural ezberleyerek değil; hikâyeler, şarkılar ve oyunlarla, yaşayarak öğrenme.",
    body: ["Her hafta bir hikâye etrafında kelime, dinleme ve kısa konuşma görevleri yapılır. Veli, çocuğun hangi kelimeleri öğrendiğini haftalık özetten görür."],
  },
  {
    slug: "minikler", group: "ingilizce", title: "Minikler İçin (3–6 Yaş)",
    fact: "Okul öncesi · dinle ve tekrar et",
    summary: "Şarkılar, masallar ve oyunlarla İngilizceyle güvenli ve eğlenceli bir ilk tanışma.",
    body: ["Kısa, sesli ve görsel etkinliklerle ilerler. Ekran süresi kısa tutulur; etkinliklerin çoğu veliyle birlikte yapılacak şekilde tasarlanır."],
  },
  {
    slug: "ozel-ders", group: "ingilizce", title: "Özel Ders",
    fact: "Birebir · esnek takvim",
    summary: "Programı, içeriği ve hızı tamamen senin hedefine göre belirlenen birebir eğitim.",
    body: ["Seviye tespitinden çıkan eksik listesi eğitmeninle paylaşılır. Dersler bu listeye göre planlanır, ders aralarındaki çalışmalar platformdan takip edilir."],
  },
  {
    slug: "robotik", group: "dijital", title: "ASK Robotik",
    fact: "8 modül · 241 ders",
    summary: "Blokla kodlamadan Arduino'ya, sensörlerden yapay zekâ mühendisliğine kadar sanal laboratuvarda robotik eğitimi.",
    body: [
      "Öğrenci devreleri ve kodu tarayıcıdaki simülatörde kurar ve çalıştırır. Robi adlı yapay zekâ öğretmen takıldığı yerde ipucu verir.",
      "Okullar için öğretmen paneli, sınıf ve ödev takibi bulunur.",
    ],
    structure: [
      ["Blokla Kodlama", "10 ders"], ["Sahne Atölyesi (Scratch)", "16 ders"], ["Arduino", "35 ders"], ["Sensörler", "40 ders"],
      ["Robotik", "40 ders"], ["Yapay Zekâ Mühendisliği", "40 ders"], ["Mikro Kart", "30 ders"], ["Oyun Atölyesi", "30 ders"],
    ],
    link: { href: "https://web-production-06ee9.up.railway.app", label: "ASK Robotik'i aç" },
  },
  {
    slug: "konusan-kitaplar", group: "dijital", title: "Konuşan Kitaplar",
    fact: "Level 1–10 · 4–14 yaş",
    summary: "Seslendirilmiş, animasyonlu İngilizce kitaplar ve kitapla yapay zekâ destekli konuşma pratiği.",
    body: [
      "Her kitap bir MEB kazanımına ve bir değer hedefine bağlıdır. Çocuk kitabı dinler, okur, kısa bir quiz çözer, sonra kitabın karakteriyle İngilizce konuşur.",
      "Öğretmen panelinde kimin hangi kitabı okuduğu, konuşma süresi ve kelime çeşitliliği görünür.",
    ],
    levels: [
      ["1", "4–5", "Okul öncesi", "Gör, duy, tekrar et"], ["2", "5–6", "Okul öncesi", "Kelime dağarcığı"],
      ["3", "6–7", "1. sınıf", "Akademik dile giriş"], ["4", "7–8", "2. sınıf", "Cümle ve basit diyalog"],
      ["5", "8–9", "3. sınıf", "Bağlamsal okuma, konuşma pratiği başlar"], ["6", "9–10", "4. sınıf", "Akıcı okuma, geçmiş ve gelecek zaman"],
      ["7", "10–11", "5. sınıf", "Betimleme ve karşılaştırma"], ["8", "11–12", "6. sınıf", "Eleştirel düşünme"],
      ["9", "12–13", "7. sınıf", "Akademik okuma ve tartışma"], ["10", "13–14", "8. sınıf", "LGS hazırlığı, B2 hedefi"],
    ],
    matrixExample: { kitap: "Good Morning, Neighbour!", kod: "E.K1.G1", hedef: "Selamlaşma ifadelerini anlama", deger: "Nezaket: Komşusunu güler yüzle selamlama", cikti: "Selamlaşır ve kendini tanıtır" },
  },
  {
    slug: "klasikler", group: "dijital", title: "Dünya Klasikleri",
    fact: "1–8. sınıf · 40+ eser",
    summary: "Kamu malı dünya klasiklerinin sınıf seviyesine göre uyarlanmış, seslendirilmiş ve animasyonlu baskıları.",
    body: ["Her eser bir değer üzerine kurulur: Pinokyo'da dürüstlük, Ağustos Böceği ile Karınca'da çalışkanlık gibi. Okuma sonrası sorular hem anlamayı hem de bu değeri tartışmayı hedefler."],
    classics: [
      ["1. sınıf", "Bremen Mızıkacıları, Aslan ile Fare, Kırmızı Başlıklı Kız, Çirkin Ördek Yavrusu, Ağustos Böceği ile Karınca"],
      ["2. sınıf", "Pinokyo, Kurşun Asker, Altın Yumurtlayan Tavuk, Şehir Faresi ile Tarla Faresi, Parmak Çocuk"],
      ["3. sınıf", "Heidi, Alice Harikalar Diyarında, Oz Büyücüsü, Peter Pan, Kara İnci"],
      ["4. sınıf", "Pollyanna, Mutlu Prens, Demiryolu Çocukları, Gulliver'in Gezileri, Gizli Bahçe"],
      ["5. sınıf", "80 Günde Devriâlem, Gümüş Patenler, Alice Harikalar Diyarında, Demiryolu Çocukları, Pollyanna"],
      ["6. sınıf", "Mercan Adası, Prens ile Dilenci, Beyaz Diş, Küçük Kadınlar, Sherlock Holmes'tan Seçmeler"],
      ["7. sınıf", "Robinson Crusoe, Oliver Twist, Dünyanın Merkezine Yolculuk, Define Adası, Gulliver'in Gezileri"],
      ["8. sınıf", "Sefiller, İki Şehrin Hikâyesi, Don Kişot, Moby Dick, Frankenstein"],
    ],
  },
  {
    slug: "yarismalar", group: "dijital", title: "Yetenek Yarışmaları",
    fact: "Hikâye · Şiir · Kısa film",
    summary: "Okul öncesinden liseye, Türkçe, İngilizce ve Almanca eserlerle katılınan yaratıcı yazarlık ve kısa film yarışmaları.",
    body: [
      "Eserler kâğıt üzerinde hazırlanıp yüklenebilir ya da doğrudan platformda yazılabilir. Her eser özgünlük kontrolünden geçer ve jüri, kademeye göre hazırlanmış bir ölçütle değerlendirir.",
      "Her katılımcıya puanının yanında, gelişim önerileri içeren bir jüri karnesi verilir.",
    ],
    structure: [["Hikâye", "Okul öncesi – 12. sınıf"], ["Şiir", "1. – 12. sınıf"], ["Kısa film", "5. – 12. sınıf"]],
    status: "Yarışma takvimi duyurulacak.",
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
};

// Örnek öğrenci verisi (demo): [soru id, doğru mu, güven 1-3]
ACADEMIA.sample = {
  tus: [
    ["t-an1",1,3],["t-an2",1,2],["t-fz1",1,3],["t-fz2",0,2],["t-fz3",1,2],["t-bk1",0,3],["t-bk2",1,1],["t-bk3",0,2],
    ["t-mb1",1,3],["t-mb2",1,2],["t-mb3",0,1],["t-pt1",1,2],["t-pt2",1,3],["t-pt3",0,2],["t-fk1",0,3],["t-fk2",0,2],
    ["t-an3",1,2],["t-mb4",1,2],
  ],
  yds: [
    ["y-k1",1,2],["y-g1",1,3],["y-g2",0,3],["y-c1",1,2],["y-c2",1,2],["y-s1",0,2],["y-s2",1,1],["y-t1",1,2],
    ["y-r1",0,2],["y-r2",0,3],["y-a1",1,2],["y-a2",1,3],["y-k2",1,3],["y-g3",0,2],
  ],
};
