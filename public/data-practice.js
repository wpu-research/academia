// Konuşma ve yazma pratiği içeriği (practice.js). Özgün yazılmıştır; gerçek sınav sorusu içermez.
// Kurallar (re) practice.js norm() sonrası metne uygulanır: küçük harf, ß → ss, noktalama yok, sayı kelimeleri rakam.
(() => {
  const DE = "de-DE";
  const say = (text) => ({ lang: DE, text });
  // Soru cümlesi: soru kelimesi ya da fiille başlar.
  const SORU = { re: "^(was|wann|wo|wie|wer|woher|wohin|welche[rsnm]?|warum|hast|hat|bist|ist|isst|trinkst|machst|kannst|möchtest|magst|gehst|fährst|kommst|wohnst|arbeitest|spielst|liest|siehst|kaufst|sprichst|haben|sind|gibt|gehen|kommen|spielen|wohnen|trinken|essen)\\b", ipucu: "Soru kelimesiyle (Was, Wo, Wann…) ya da fiille (Hast du…, Machst du…) başla" };
  const RICA = { re: "(können sie|kannst du|könnten sie|kann ich|darf ich|haben sie|hast du)", ipucu: "Kibarca başla: “Können Sie …?”, “Kannst du …?” ya da “Kann ich …?”" };
  const BITTE = { re: "\\bbitte\\b", ipucu: "“bitte” demeyi unutma" };
  const kw = (re, ipucu) => ({ re, ipucu });

  window.ACADEMIA.practice = {
    almanca: {
      konusma: [
        {
          id: "t1", baslik: "Kendini tanıt", aciklama: "Sınavın 1. bölümü: ad, yaş, ülke, oturduğun yer, diller, meslek, hobi.",
          gorevler: [
            { id: "t1-1", gorev: "Görevli adını soruyor. Adını söyle.", soru: say("Wie heißen Sie?"), kurallar: [kw("(ich heisse|mein name ist|ich bin) \\p{L}+", "“Ich heiße …” ya da “Mein Name ist …” ile başla")], ornek: "Ich heiße Ayşe Kaya." },
            { id: "t1-2", gorev: "Görevli yaşını soruyor.", soru: say("Wie alt sind Sie?"), kurallar: [kw("ich bin \\d+", "Yaşı “Ich bin …” ile söyle (sein fiili, haben değil)"), kw("jahre", "“… Jahre alt” demeyi unutma")], ornek: "Ich bin dreißig Jahre alt." },
            { id: "t1-3", gorev: "Görevli nereden geldiğini soruyor.", soru: say("Woher kommen Sie?"), kurallar: [kw("ich komme aus", "“Ich komme aus …” kalıbını kullan")], ornek: "Ich komme aus der Türkei." },
            { id: "t1-4", gorev: "Görevli nerede oturduğunu soruyor.", soru: say("Wo wohnen Sie?"), kurallar: [kw("ich wohne in", "“Ich wohne in …” kalıbını kullan")], ornek: "Ich wohne in Izmir." },
            { id: "t1-5", gorev: "Görevli hangi dilleri konuştuğunu soruyor.", soru: say("Welche Sprachen sprechen Sie?"), kurallar: [kw("ich spreche", "“Ich spreche …” ile başla"), kw("(deutsch|türkisch|englisch|kurdisch|arabisch|französisch|russisch)", "Dilin adını söyle: Türkisch, Deutsch …")], ornek: "Ich spreche Türkisch und ein bisschen Deutsch." },
            { id: "t1-6", gorev: "Görevli mesleğini soruyor.", soru: say("Was sind Sie von Beruf?"), kurallar: [kw("(ich bin|ich arbeite)", "“Ich bin … (von Beruf)” ya da “Ich arbeite als …” de")], ornek: "Ich bin Verkäuferin von Beruf." },
            { id: "t1-7", gorev: "Görevli hobini soruyor.", soru: say("Was ist Ihr Hobby?"), kurallar: [kw("(mein hobby ist|meine hobbys sind|ich \\p{L}+ gern)", "“Mein Hobby ist …” ya da “Ich … gern” de")], ornek: "Ich koche gern." },
            { id: "t1-8", gorev: "Görevli telefon numaranı soruyor. Rakam rakam söyle.", soru: say("Wie ist Ihre Telefonnummer?"), kurallar: [kw("\\d(\\s?\\d){4,}", "Numarayı rakam rakam söyle (en az 5 rakam)")], ornek: "Meine Telefonnummer ist null eins sieben sechs, zwei drei vier fünf sechs." },
            { id: "t1-9", gorev: "Kendini dört bilgiyle tanıt: adın, ülken, oturduğun yer ve yaşın.", soru: say("Stellen Sie sich bitte vor."), kurallar: [kw("(ich heisse|mein name ist)", "Adın (Ich heiße …)"), kw("ich komme aus", "Ülken (Ich komme aus …)"), kw("wohne in", "Oturduğun yer (Ich wohne in …)"), kw("\\d+ jahre", "Yaşın (Ich bin … Jahre alt)")], ornek: "Ich heiße Ayşe Kaya. Ich komme aus der Türkei und wohne in Izmir. Ich bin dreißig Jahre alt." },
          ],
        },
        {
          id: "t2", baslik: "Kartla soru sor, cevap ver", aciklama: "Sınavın 2. bölümü: konu kartındaki kelimeyle soru sorar, diğer adayın sorusunu cevaplarsın.",
          gorevler: [
            { id: "t2-1", kart: "Familie", kelime: "Geschwister", gorev: "Kartı kullanarak diğer adaya bir soru sor.", kurallar: [SORU, kw("geschwister", "Karttaki kelimeyi (Geschwister) kullan")], ornek: "Hast du Geschwister?" },
            { id: "t2-2", kart: "Essen", kelime: "Frühstück", gorev: "Kartı kullanarak diğer adaya bir soru sor.", kurallar: [SORU, kw("frühstück", "Karttaki kelimeyi (Frühstück) kullan")], ornek: "Was isst du zum Frühstück?" },
            { id: "t2-3", kart: "Wohnen", kelime: "Zimmer", gorev: "Kartı kullanarak diğer adaya bir soru sor.", kurallar: [SORU, kw("zimmer", "Karttaki kelimeyi (Zimmer) kullan")], ornek: "Wie viele Zimmer hat deine Wohnung?" },
            { id: "t2-4", kart: "Freizeit", kelime: "Wochenende", gorev: "Kartı kullanarak diğer adaya bir soru sor.", kurallar: [SORU, kw("wochenende", "Karttaki kelimeyi (Wochenende) kullan")], ornek: "Was machst du am Wochenende?" },
            { id: "t2-5", kart: "Arbeit", kelime: "Beruf", gorev: "Kartı kullanarak diğer adaya bir soru sor.", kurallar: [SORU, kw("beruf", "Karttaki kelimeyi (Beruf) kullan")], ornek: "Was bist du von Beruf?" },
            { id: "t2-6", kart: "Einkaufen", kelime: "Supermarkt", gorev: "Kartı kullanarak diğer adaya bir soru sor.", kurallar: [SORU, kw("supermarkt", "Karttaki kelimeyi (Supermarkt) kullan")], ornek: "Wo ist hier ein Supermarkt?" },
            { id: "t2-7", kart: "Freizeit", kelime: "Sport", gorev: "Kartı kullanarak diğer adaya bir soru sor.", kurallar: [SORU, kw("sport", "Karttaki kelimeyi (Sport) kullan")], ornek: "Machst du gern Sport?" },
            { id: "t2-8", kart: "Essen und Trinken", kelime: "Getränk", gorev: "Kartı kullanarak diğer adaya ne içmeyi sevdiğini sor.", kurallar: [SORU, kw("(getränk|trink)", "İçecekle ilgili sor (trinken, Getränk)")], ornek: "Was trinkst du gern?" },
            { id: "t2-9", gorev: "Diğer aday soruyor. Cevap ver.", soru: say("Hast du Geschwister?"), kurallar: [kw("^(ja|nein)", "“Ja, …” ya da “Nein, …” ile başla"), kw("(bruder|brüder|schwester|geschwister)", "Kardeşlerini söyle: einen Bruder, eine Schwester …")], ornek: "Ja, ich habe einen Bruder und eine Schwester." },
            { id: "t2-10", gorev: "Diğer aday soruyor. Cevap ver.", soru: say("Was isst du zum Frühstück?"), kurallar: [kw("ich (esse|trinke)", "“Ich esse …” ya da “Ich trinke …” de")], ornek: "Ich esse Brot mit Käse und trinke Tee." },
            { id: "t2-11", gorev: "Diğer aday soruyor. Cevap ver.", soru: say("Was machst du am Wochenende?"), kurallar: [kw("\\bich\\b", "Kendinden bahset: “Ich …” ya da “Am Wochenende … ich …”")], ornek: "Am Wochenende besuche ich meine Familie." },
            { id: "t2-12", gorev: "Diğer aday soruyor. Cevap ver.", soru: say("Wie viele Zimmer hat deine Wohnung?"), kurallar: [kw("\\d", "Bir sayı söyle"), kw("zimmer", "“… Zimmer” de")], ornek: "Meine Wohnung hat drei Zimmer." },
          ],
        },
        {
          id: "t3", baslik: "Rica et, cevap ver", aciklama: "Sınavın 3. bölümü: kartla kibarca bir şey rica eder, diğer adayın ricasına cevap verirsin.",
          gorevler: [
            { id: "t3-1", kart: "Fenster", gorev: "Görevliden pencereyi açmasını rica et.", kurallar: [RICA, BITTE, kw("fenster", "Karttaki kelimeyi (Fenster) kullan")], ornek: "Können Sie bitte das Fenster öffnen?" },
            { id: "t3-2", kart: "Wasser", gorev: "Diğer adaydan bir bardak su iste.", kurallar: [RICA, BITTE, kw("wasser", "Karttaki kelimeyi (Wasser) kullan")], ornek: "Kannst du mir bitte ein Glas Wasser geben?" },
            { id: "t3-3", kart: "Kugelschreiber", gorev: "Diğer adaydan tükenmez kalemini iste.", kurallar: [RICA, BITTE, kw("(kuli|kugelschreiber|stift)", "Kalemi söyle (Kuli, Kugelschreiber)")], ornek: "Kannst du mir bitte deinen Kuli geben?" },
            { id: "t3-4", kart: "Tür", gorev: "Görevliden kapıyı kapatmasını rica et.", kurallar: [RICA, BITTE, kw("tür", "Karttaki kelimeyi (Tür) kullan")], ornek: "Können Sie bitte die Tür schließen?" },
            { id: "t3-5", kart: "langsam", gorev: "Görevliden daha yavaş konuşmasını rica et.", kurallar: [RICA, BITTE, kw("langsam", "“langsam” ya da “langsamer” de")], ornek: "Können Sie bitte langsamer sprechen?" },
            { id: "t3-6", kart: "Hilfe", gorev: "Birinden yardım iste.", kurallar: [RICA, BITTE, kw("(helfen|hilfe)", "“helfen” fiilini kullan")], ornek: "Können Sie mir bitte helfen?" },
            { id: "t3-7", kart: "Salz", gorev: "Yemekte diğer adaydan tuzu iste.", kurallar: [RICA, BITTE, kw("salz", "Karttaki kelimeyi (Salz) kullan")], ornek: "Kannst du mir bitte das Salz geben?" },
            { id: "t3-8", kart: "Telefon", gorev: "Görevliye telefonunu kullanıp kullanamayacağını sor.", kurallar: [RICA, BITTE, kw("telefon", "Karttaki kelimeyi (Telefon) kullan")], ornek: "Kann ich bitte Ihr Telefon benutzen?" },
            { id: "t3-9", gorev: "Diğer aday senden yardım istiyor. Kabul et.", soru: say("Können Sie mir bitte helfen?"), kurallar: [kw("(ja|natürlich|gern|klar|kein problem)", "Olumlu cevap ver: “Ja, natürlich.” / “Ja, gern.”")], ornek: "Ja, natürlich." },
            { id: "t3-10", gorev: "Diğer aday bir şey rica ediyor ama yapamıyorsun. Kibarca reddet.", soru: say("Kannst du bitte das Fenster schließen?"), kurallar: [kw("(tut mir leid|leider|entschuldigung)", "Kibarca reddet: “Tut mir leid …”, “leider …”")], ornek: "Tut mir leid, das geht leider nicht." },
            { id: "t3-11", gorev: "Diğer aday kalem istiyor. Kalemi ver ve “buyur” de.", soru: say("Hast du einen Kuli für mich?"), kurallar: [kw("(ja|hier|bitte)", "“Ja, hier, bitte.” gibi kısa bir cevap ver")], ornek: "Ja, hier, bitte." },
          ],
        },
        {
          id: "tek", baslik: "Dinle ve tekrar et", aciklama: "Cümleyi dinle, aynısını söyle. Hangi kelimelerin anlaşıldığını görürsün.",
          gorevler: [
            ["Ich komme aus der Türkei.", "Türkiye'den geliyorum."],
            ["Ich wohne in Izmir.", "İzmir'de oturuyorum."],
            ["Ich bin dreißig Jahre alt.", "Otuz yaşındayım."],
            ["Ich spreche Türkisch und ein bisschen Deutsch.", "Türkçe ve biraz Almanca konuşuyorum."],
            ["Ich bin verheiratet und habe zwei Kinder.", "Evliyim ve iki çocuğum var."],
            ["Mein Mann arbeitet in München.", "Kocam Münih'te çalışıyor."],
            ["Ich habe einen Sohn und eine Tochter.", "Bir oğlum ve bir kızım var."],
            ["Ich möchte einen Termin machen.", "Randevu almak istiyorum."],
            ["Haben Sie am Dienstag Zeit?", "Salı günü vaktiniz var mı?"],
            ["Können Sie das bitte wiederholen?", "Bunu tekrar edebilir misiniz lütfen?"],
            ["Ich kann leider nicht kommen.", "Maalesef gelemiyorum."],
            ["Entschuldigung, wo ist der Bahnhof?", "Affedersiniz, istasyon nerede?"],
            ["Gehen Sie geradeaus und dann links.", "Düz gidin, sonra sola dönün."],
            ["Was kostet ein Kilo Tomaten?", "Bir kilo domates ne kadar?"],
            ["Es ist halb vier.", "Saat üç buçuk."],
          ].map(([tekrar, tr], i) => ({ id: `tek-${i + 1}`, gorev: "Cümleyi dinle ve aynısını söyle.", tekrar, tr })),
        },
      ],

      yazma: [
        {
          id: "f1", tur: "form", baslik: "Kurs kaydı: Ayşe Demir", gorev: "Metni oku ve Ayşe'nin bilgileriyle formu doldur.",
          metin: "Ayşe Demir ist 34 Jahre alt. Sie kommt aus Konya und wohnt jetzt mit ihrem Mann in Köln, Bahnhofstraße 7. Sie ist verheiratet und hat zwei Kinder. Sie arbeitet als Friseurin.",
          alanlar: [
            { etiket: "Vorname", cevap: ["Ayşe", "Ayse"] },
            { etiket: "Nachname", cevap: ["Demir"] },
            { etiket: "Wohnort", cevap: ["Köln", "Koeln"], ipucu: "Wohnort şu an oturduğu şehirdir; Konya doğduğu yer." },
            { etiket: "Familienstand", cevap: ["verheiratet"] },
            { etiket: "Anzahl der Kinder", cevap: ["2", "zwei"] },
            { etiket: "Beruf", cevap: ["Friseurin"] },
          ],
        },
        {
          id: "f2", tur: "form", baslik: "Başvuru formu: Tom Becker", gorev: "Metni oku ve Tom'un bilgileriyle formu doldur.",
          metin: "Mein Name ist Tom Becker. Ich bin am 12. März 1988 in Hamburg geboren. Ich bin ledig. Meine Telefonnummer ist 0176 445566.",
          alanlar: [
            { etiket: "Familienname", cevap: ["Becker"] },
            { etiket: "Vorname", cevap: ["Tom"] },
            { etiket: "Geburtsdatum", cevap: ["12.03.1988", "12.3.1988"], ipucu: "Gün.ay.yıl: 12.03.1988" },
            { etiket: "Geburtsort", cevap: ["Hamburg"] },
            { etiket: "Familienstand", cevap: ["ledig"] },
            { etiket: "Telefon", cevap: ["0176 445566", "0176445566"] },
          ],
        },
        {
          id: "f3", tur: "form", baslik: "Almanca kursu kaydı: Mehmet Yıldız", gorev: "Mehmet'in e-postasını oku ve kayıt formunu doldur.",
          metin: "Hallo, ich heiße Mehmet Yıldız und möchte den Deutschkurs A1 am Abend besuchen. Ich wohne in der Goethestraße 15, 60313 Frankfurt. Ich komme aus der Türkei.",
          alanlar: [
            { etiket: "Name", cevap: ["Mehmet Yıldız", "Mehmet Yildiz"] },
            { etiket: "Straße, Hausnummer", cevap: ["Goethestraße 15", "Goethestrasse 15", "Goethestr. 15"] },
            { etiket: "PLZ", cevap: ["60313"] },
            { etiket: "Wohnort", cevap: ["Frankfurt"] },
            { etiket: "Herkunftsland", cevap: ["Türkei", "die Türkei"], ipucu: "Herkunftsland: geldiği ülke." },
            { etiket: "Kurszeit (vormittags / abends)", cevap: ["abends"], ipucu: "“am Abend” → abends" },
          ],
        },
        {
          id: "f4", tur: "form", baslik: "Yüzme kursu: Lena Wolf", gorev: "Metni oku ve çocuğun kayıt formunu doldur.",
          metin: "Lena Wolf ist neun Jahre alt und möchte im Schwimmkurs mitmachen. Ihre Mutter heißt Sabine Wolf. Die Telefonnummer ist 0151 234567. Der Kurs ist am Samstag.",
          alanlar: [
            { etiket: "Name des Kindes", cevap: ["Lena Wolf"] },
            { etiket: "Alter", cevap: ["9", "neun"] },
            { etiket: "Name der Mutter", cevap: ["Sabine Wolf"] },
            { etiket: "Telefon", cevap: ["0151 234567", "0151234567"] },
            { etiket: "Kurstag", cevap: ["Samstag", "samstags"] },
          ],
        },
        {
          id: "m1", tur: "mesaj", resmi: false, baslik: "Doğum günü davetine cevap", gorev: "Arkadaşın Julia seni cumartesi doğum günü partisine davet etti. Ona kısa bir mesaj yaz.",
          noktalar: [{ metin: "Davet için teşekkür et.", re: "dank" }, { metin: "Geleceğini söyle.", re: "(komme|kann kommen|bin da)" }, { metin: "Ne getirebileceğini sor.", re: "(mitbringen|bringen)" }],
          ornek: "Liebe Julia, vielen Dank für deine Einladung! Ich komme gern am Samstag zu deiner Party. Was kann ich mitbringen? Vielleicht einen Kuchen oder etwas zu trinken? Viele Grüße, Ayşe",
        },
        {
          id: "m2", tur: "mesaj", resmi: true, baslik: "Kursa gelemiyorum", gorev: "Kurs öğretmenin Frau Becker'e yaz.",
          noktalar: [{ metin: "Yarın kursa gelemeyeceğini söyle.", re: "(nicht kommen|kann .*nicht|nicht .*kommen)" }, { metin: "Nedenini yaz (hastasın ya da doktora gidiyorsun).", re: "(krank|arzt)" }, { metin: "Ödevleri sor.", re: "hausaufgabe" }],
          ornek: "Sehr geehrte Frau Becker, ich kann morgen leider nicht zum Kurs kommen. Ich bin krank und muss zum Arzt gehen. Welche Hausaufgaben haben wir? Können Sie mir bitte schreiben? Mit freundlichen Grüßen, Ayşe Kaya",
        },
        {
          id: "m3", tur: "mesaj", resmi: true, baslik: "Ev sahibine: kalorifer bozuk", gorev: "Dairende kalorifer çalışmıyor. Ev sahibin Herr Wolf'a yaz.",
          noktalar: [{ metin: "Sorunu yaz (kalorifer bozuk).", re: "(kaputt|funktioniert nicht|geht nicht)" }, { metin: "Ne zaman gelebileceğini sor.", re: "(wann|zeit)" }, { metin: "Hangi saatlerde evde olduğunu yaz.", re: "(zu hause|uhr|vormittag|nachmittag|abend)" }],
          ornek: "Sehr geehrter Herr Wolf, in meiner Wohnung ist die Heizung kaputt. Es ist sehr kalt. Wann haben Sie Zeit? Ich bin jeden Tag ab 15 Uhr zu Hause. Mit freundlichen Grüßen, Mehmet Demir",
        },
        {
          id: "m4", tur: "mesaj", resmi: false, baslik: "Sinemaya davet", gorev: "Arkadaşın Tom'u cumartesi sinemaya davet et.",
          noktalar: [{ metin: "Onu sinemaya davet et.", re: "kino" }, { metin: "Bir saat öner.", re: "(uhr|\\d)" }, { metin: "Nerede buluşacağınızı yaz.", re: "(treffen|vor dem|vor der|am bahnhof|bei mir|bei dir)" }],
          ornek: "Lieber Tom, hast du am Samstag Zeit? Ich möchte ins Kino gehen. Kommst du mit? Der Film beginnt um 20 Uhr. Wir können uns um halb acht vor dem Kino treffen. Viele Grüße, Ali",
        },
        {
          id: "m5", tur: "mesaj", resmi: true, baslik: "Randevuyu iptal et", gorev: "Doktor muayenehanesine (Praxis Dr. Klein) yaz. Perşembe günkü randevuna gidemiyorsun.",
          noktalar: [{ metin: "Randevuna gelemeyeceğini yaz.", re: "(nicht kommen|kann .*nicht|absagen)" }, { metin: "Yeni bir randevu iste.", re: "(neuen termin|anderen termin|neuer termin)" }, { metin: "Ne zaman müsait olduğunu yaz.", re: "(montag|dienstag|mittwoch|donnerstag|freitag|uhr|vormittag|nachmittag)" }],
          ornek: "Sehr geehrte Damen und Herren, ich habe am Donnerstag um 10 Uhr einen Termin. Ich kann leider nicht kommen. Kann ich bitte einen neuen Termin bekommen? Ich habe am Montag und am Dienstag Zeit. Mit freundlichen Grüßen, Elif Kaya",
        },
        {
          id: "m6", tur: "mesaj", resmi: false, baslik: "Kız kardeşin geliyor", gorev: "Kız kardeşin Selin seni ziyarete geliyor. Ona yaz.",
          noktalar: [{ metin: "Onu havalimanından alacağını yaz.", re: "(abholen|hole .*ab)" }, { metin: "Uçağın saat kaçta indiğini sor.", re: "(wann|uhr)" }, { metin: "Türkiye'den ne getirmesini istediğini yaz.", re: "(bring|mitbringen)" }],
          ornek: "Liebe Selin, ich freue mich sehr auf deinen Besuch! Ich hole dich am Flughafen ab. Wann kommt dein Flugzeug an? Bitte bring Tee und Oliven aus der Türkei mit. Liebe Grüße, Ayşe",
        },
        {
          id: "m7", tur: "mesaj", resmi: true, baslik: "Kursa kayıt", gorev: "Dil okulunda Frau Schmidt'e yaz. A1 Almanca kursuna kaydolmak istiyorsun.",
          noktalar: [{ metin: "Kursa kaydolmak istediğini yaz.", re: "(anmelden|kurs)" }, { metin: "Kursun ücretini sor.", re: "(kostet|preis|wie viel)" }, { metin: "Sabah mı akşam mı ders olduğunu sor.", re: "(vormittag|nachmittag|abend|morgen)" }],
          ornek: "Sehr geehrte Frau Schmidt, ich möchte mich für den Deutschkurs A1 anmelden. Wie viel kostet der Kurs? Ist der Unterricht am Vormittag oder am Abend? Mit freundlichen Grüßen, Mehmet Yıldız",
        },
        {
          id: "m8", tur: "mesaj", resmi: false, baslik: "Komşuna rica", gorev: "Gelecek hafta tatile gidiyorsun. Komşun Peter'e yaz.",
          noktalar: [{ metin: "Ne zaman tatile gittiğini yaz.", re: "(urlaub|fahre|fliege|weg)" }, { metin: "Çiçekleri sulamasını rica et.", re: "(blumen|giessen)" }, { metin: "Anahtarın nerede olduğunu yaz.", re: "schlüssel" }],
          ornek: "Lieber Peter, ich fahre nächste Woche von Montag bis Freitag in Urlaub. Kannst du bitte meine Blumen gießen? Der Schlüssel ist bei Frau Meier im ersten Stock. Vielen Dank! Viele Grüße, Elif",
        },
        {
          id: "m9", tur: "mesaj", resmi: true, baslik: "Çocuğum hasta", gorev: "Oğlunun öğretmeni Herr Klein'a yaz.",
          noktalar: [{ metin: "Oğlunun hasta olduğunu yaz.", re: "krank" }, { metin: "Bugün okula gelemeyeceğini yaz.", re: "(nicht .*schule|schule .*nicht|nicht kommen)" }, { metin: "Ne zaman tekrar geleceğini yaz.", re: "(morgen|montag|dienstag|mittwoch|donnerstag|freitag|wieder)" }],
          ornek: "Sehr geehrter Herr Klein, mein Sohn Emre ist krank. Er hat Fieber und kann heute nicht in die Schule kommen. Er kommt am Montag wieder. Mit freundlichen Grüßen, Ayşe Kaya",
        },
        {
          id: "m10", tur: "mesaj", resmi: false, baslik: "Davete gelemiyorum", gorev: "Arkadaşın Ali seni pazar günü yemeğe davet etti ama gidemiyorsun. Ona yaz.",
          noktalar: [{ metin: "Davet için teşekkür et.", re: "dank" }, { metin: "Gelemeyeceğini söyle.", re: "(nicht kommen|kann .*nicht|nicht .*kommen)" }, { metin: "Nedenini yaz.", re: "(weil|denn|muss|arbeit|krank|besuch)" }],
          ornek: "Lieber Ali, vielen Dank für deine Einladung zum Essen! Leider kann ich am Sonntag nicht kommen. Ich muss arbeiten. Können wir uns nächste Woche treffen? Viele Grüße, Mehmet",
        },
      ],
    },
  };
})();
