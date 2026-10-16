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
  const sayEn = (text) => ({ lang: "en-GB", text });
  // İngilizce soru cümlesi: soru kelimesi ya da yardımcı fiille başlar (metin norm() edilmiştir: "what's" → "what is").
  const EN_SORU = { re: "^(what|where|when|who|how|why|which|do|does|did|are|is|have|has|can|could|would)\\b", ipucu: "Soru kelimesiyle (What, Where, How…) ya da yardımcı fiille (Do you…, Have you…) başla" };

  window.ACADEMIA.practice = {
    // İngilizce (Birleşik Krallık aile vizesi). Life Skills yalnız konuşma ve dinleme olduğu için yazma yok.
    lifeskills: {
      lang: "en-GB", dil: "İngilizce", ad: "Life Skills A1", alanlar: { konusma: "Konuşma" },
      konusma: [
        {
          id: "a1-t1", baslik: "Görevliyle konuş", aciklama: "1. bölüm: görevlinin kişisel sorularına tam cümleyle cevap ver.",
          gorevler: [
            { id: "a1-t1-1", gorev: "Görevli adını soruyor.", soru: sayEn("What's your name?"), kurallar: [kw("(my name is|i am|name is) \\p{L}+", "“My name is …” ya da “I'm …” ile cevap ver")], ornek: "My name is Ayşe Kaya." },
            { id: "a1-t1-2", gorev: "Görevli nereli olduğunu soruyor.", soru: sayEn("Where are you from?"), kurallar: [kw("(i am from|i come from)", "“I'm from …” kalıbını kullan")], ornek: "I'm from Turkey." },
            { id: "a1-t1-3", gorev: "Görevli nerede oturduğunu soruyor.", soru: sayEn("Where do you live?"), kurallar: [kw("i live in", "“I live in …” kalıbını kullan")], ornek: "I live in Izmir." },
            { id: "a1-t1-4", gorev: "Görevli yaşını soruyor.", soru: sayEn("How old are you?"), kurallar: [kw("i am \\d+", "Yaşı “I'm …” ile söyle (have değil)")], ornek: "I'm thirty-two years old." },
            { id: "a1-t1-5", gorev: "Görevli ne iş yaptığını soruyor.", soru: sayEn("What do you do?"), kurallar: [kw("(i am an? |i work|i do not work|i look after|i am a housewife|i am a student)", "“I'm a …”, “I work in …” ya da “I don't work at the moment.” de")], ornek: "I'm a nurse. I work in a hospital." },
            { id: "a1-t1-6", gorev: "Görevli ailen hakkında soru soruyor.", soru: sayEn("Tell me about your family."), kurallar: [kw("(husband|wife|son|daughter|children|child|brother|sister|parents|mother|father)", "Aile üyelerini söyle (husband, son, daughter …)"), kw("(i have|my|there are)", "Tam cümle kur: “I've got …”, “My husband …”")], ornek: "I'm married and I've got two children, a son and a daughter." },
            { id: "a1-t1-7", gorev: "Görevli boş zamanında ne yaptığını soruyor.", soru: sayEn("What do you do in your free time?"), kurallar: [kw("(i like|i love|i enjoy|i usually|i often|i sometimes|i go|i play|i watch|i read|i cook|i walk)", "Kendinden bahset: “I like …”, “I usually …”")], ornek: "I like cooking and I often go for a walk in the park." },
            { id: "a1-t1-8", gorev: "Görevli evini anlatmanı istiyor.", soru: sayEn("Tell me about your home."), kurallar: [kw("(i live in|there is|there are|my house|my flat|my home)", "“I live in a …”, “There are … rooms” gibi cümleler kur")], ornek: "I live in a flat. There are two bedrooms and a small kitchen." },
            { id: "a1-t1-9", gorev: "Görevli soyadını harf harf söylemeni istiyor.", soru: sayEn("Can you spell your surname, please?"), kurallar: [kw("(\\b\\p{L}\\b\\s*){3,}|double", "Harfleri tek tek söyle: K – A – Y – A")], ornek: "Yes. K – A – Y – A." },
          ],
        },
        {
          id: "a1-t2", baslik: "Diğer adayla konuş", aciklama: "Görevli bir konu verir; diğer adaya soru sorar ve onun sorularına cevap verirsin.",
          gorevler: [
            { id: "a1-t2-1", kart: "Food", gorev: "Konu yemek. Diğer adaya bir soru sor.", kurallar: [EN_SORU, kw("(eat|food|cook|breakfast|dinner|lunch)", "Yemekle ilgili sor (food, eat, cook)")], ornek: "What food do you like?" },
            { id: "a1-t2-2", kart: "Family", gorev: "Konu aile. Diğer adaya bir soru sor.", kurallar: [EN_SORU, kw("(brother|sister|children|family|married|husband|wife)", "Aileyle ilgili sor (children, brothers, sisters)")], ornek: "Have you got any children?" },
            { id: "a1-t2-3", kart: "Work", gorev: "Konu iş. Diğer adaya bir soru sor.", kurallar: [EN_SORU, kw("(work|job|do)", "İşle ilgili sor (work, job)")], ornek: "Where do you work?" },
            { id: "a1-t2-4", kart: "The weekend", gorev: "Konu hafta sonu. Diğer adaya bir soru sor.", kurallar: [EN_SORU, kw("weekend", "“weekend” kelimesini kullan")], ornek: "What do you do at the weekend?" },
            { id: "a1-t2-5", kart: "Home", gorev: "Konu ev. Diğer adaya bir soru sor.", kurallar: [EN_SORU, kw("(live|house|flat|home|room)", "Evle ilgili sor (live, house, flat)")], ornek: "Do you live in a house or a flat?" },
            { id: "a1-t2-6", kart: "Transport", gorev: "Konu ulaşım. Diğer adaya bir soru sor.", kurallar: [EN_SORU, kw("(come|bus|car|train|travel|drive|walk)", "Ulaşımla ilgili sor (bus, car, come)")], ornek: "How do you come to the test centre?" },
            { id: "a1-t2-7", gorev: "Diğer aday soruyor. Cevap ver ve bir ek cümle söyle.", soru: sayEn("Do you like cooking?"), kurallar: [kw("^(yes|no)", "“Yes, I do.” ya da “No, I don't.” ile başla"), kw("\\bi (like|love|cook|do|am|make|usually|often|sometimes|do not)\\b", "Bir cümle daha ekle: “I cook every day.”")], ornek: "Yes, I do. I cook every day for my family." },
            { id: "a1-t2-8", gorev: "Diğer aday soruyor. Cevap ver.", soru: sayEn("What do you do at the weekend?"), kurallar: [kw("\\bi\\b", "Kendinden bahset: “I usually …”, “At the weekend I …”")], ornek: "At the weekend I usually visit my family." },
            { id: "a1-t2-9", gorev: "Diğer aday soruyor. Cevap ver.", soru: sayEn("Have you got any children?"), kurallar: [kw("^(yes|no)", "“Yes, I have.” ya da “No, I haven't.” ile başla"), kw("(i have|i do|not|son|daughter|children)", "Kaç çocuğun olduğunu söyle")], ornek: "Yes, I have. I've got a son. He's six." },
          ],
        },
        {
          id: "a1-t3", alan: "Dinleme", baslik: "Dinle ve konuş", aciklama: "2. bölüm: kısa bir kaydı dinle, sonra soruyu tam cümleyle cevapla. Not alabilirsin.",
          gorevler: [
            { id: "a1-t3-1", gorev: "Kaydı dinle ve soruyu cevapla: When is the football match?", soru: sayEn("Hi, this is Sam. The football match is on Saturday at two o'clock in the park."), kurallar: [kw("saturday", "Günü söyle"), kw("\\b2\\b", "Saati söyle")], ornek: "It's on Saturday at two o'clock." },
            { id: "a1-t3-2", gorev: "Kaydı dinle ve soruyu cevapla: When is the surgery closed?", soru: sayEn("The doctor's surgery is closed on Wednesday afternoon. It's open every morning from eight."), kurallar: [kw("wednesday", "Günü söyle"), kw("afternoon", "Günün hangi bölümü?")], ornek: "It's closed on Wednesday afternoon." },
            { id: "a1-t3-3", gorev: "Kaydı dinle ve soruyu cevapla: What does her sister do?", soru: sayEn("My sister lives in Leeds. She's a teacher and she has got three children."), kurallar: [kw("teacher", "Mesleği söyle")], ornek: "She's a teacher." },
            { id: "a1-t3-4", gorev: "Kaydı dinle ve soruyu cevapla: Where is the new shop?", soru: sayEn("The new shop sells bread, milk and fruit. It's next to the bus station."), kurallar: [kw("next to", "Yer edatını kullan (next to)"), kw("station", "Neyin yanında?")], ornek: "It's next to the bus station." },
            { id: "a1-t3-5", gorev: "Kaydı dinle ve soruyu cevapla: How is Tom going to work today?", soru: sayEn("Tom usually walks to work, but today it's raining, so he's taking the bus."), kurallar: [kw("bus", "Bugün neyle gidiyor?")], ornek: "He's taking the bus today." },
            { id: "a1-t3-6", gorev: "Kaydı dinle ve soruyu cevapla: What time does the class start?", soru: sayEn("The English class starts at quarter past six and finishes at eight."), kurallar: [kw("(quarter past 6|6 15)", "Başlangıç saatini söyle (quarter past six)")], ornek: "It starts at quarter past six." },
          ],
        },
        {
          id: "a1-tek", baslik: "Dinle ve tekrar et", aciklama: "Cümleyi dinle, aynısını söyle. Hangi kelimelerin anlaşıldığını görürsün.",
          gorevler: [
            ["My name is Ayşe Kaya.", "Adım Ayşe Kaya."], ["I'm from Turkey.", "Türkiye'denim."], ["I live in Izmir.", "İzmir'de oturuyorum."],
            ["I'm married and I've got two children.", "Evliyim ve iki çocuğum var."], ["I get up at seven o'clock.", "Saat yedide kalkarım."],
            ["My husband works in a restaurant.", "Kocam bir restoranda çalışıyor."], ["There are two bedrooms and a small kitchen.", "İki yatak odası ve küçük bir mutfak var."],
            ["Can you spell that, please?", "Bunu harf harf söyler misiniz lütfen?"], ["Sorry, can you say that again, please?", "Pardon, tekrar söyler misiniz lütfen?"],
            ["A return ticket to Leeds, please.", "Leeds'e bir gidiş-dönüş bilet, lütfen."], ["I'd like to make an appointment, please.", "Randevu almak istiyorum."],
            ["The post office is next to the bank.", "Postane bankanın yanında."],
          ].map(([tekrar, tr], i) => ({ id: `a1-tek-${i + 1}`, gorev: "Cümleyi dinle ve aynısını söyle.", tekrar, tr })),
        },
      ],
    },
    "lifeskills-a2": {
      lang: "en-GB", dil: "İngilizce", ad: "Life Skills A2", alanlar: { konusma: "Konuşma" },
      konusma: [
        {
          id: "a2-t1", baslik: "Görevliyle konuş", aciklama: "Geçmişin, planların ve günlük hayatın hakkında daha uzun cevaplar ver.",
          gorevler: [
            { id: "a2-t1-1", gorev: "Görevli geçen hafta sonunu soruyor.", soru: sayEn("What did you do last weekend?"), kurallar: [kw("\\bi (went|visited|had|saw|played|watched|cooked|stayed|met|took|did|bought|walked|cleaned)\\b", "Geçmiş zamanla anlat: I went …, I visited …"), kw("\\b(and|then|because|so|but)\\b", "İki şeyi bağla: and, then, because …")], ornek: "On Saturday I went shopping, and on Sunday we visited my sister." },
            { id: "a2-t1-2", gorev: "Görevli Birleşik Krallık'a ne zaman geldiğini soruyor.", soru: sayEn("When did you come to the UK?"), kurallar: [kw("\\bi came\\b|\\bwe came\\b|\\bi arrived\\b|\\bwe arrived\\b", "“I came …” (come → came)"), kw("(ago|in \\d{4}|last year|last month)", "Zamanı söyle: two years ago, in 2024 …")], ornek: "I came here two years ago, in 2024." },
            { id: "a2-t1-3", gorev: "Görevli gelecek planlarını soruyor.", soru: sayEn("What are your plans for the future?"), kurallar: [kw("(going to|i would like to|i want to|i will|i am planning|i hope to)", "Plan anlat: I'm going to …, I'd like to …")], ornek: "I'm going to improve my English and then I'd like to work in a school." },
            { id: "a2-t1-4", gorev: "Görevli memleketini buradaki şehirle karşılaştırmanı istiyor.", soru: sayEn("Is your home town different from the town where you live now?"), kurallar: [kw("(\\w+er than|more \\w+ than|less \\w+ than|\\w+er\\b|more \\w+)", "Karşılaştır: bigger, quieter, more expensive …"), kw("\\b(but|because|and)\\b", "Bir neden ya da fark ekle")], ornek: "Yes, my home town is smaller and warmer, but life here is quieter." },
            { id: "a2-t1-5", gorev: "Görevli ne zamandır şu anki evinde oturduğunu soruyor.", soru: sayEn("How long have you lived in your home?"), kurallar: [kw("(i have lived|we have lived|for \\d|since)", "“I've lived there for … / since …”")], ornek: "I've lived there for two years." },
            { id: "a2-t1-6", gorev: "Görevli işini neden sevdiğini ya da sevmediğini soruyor.", soru: sayEn("Do you like your job? Why?"), kurallar: [kw("because", "Nedenini “because” ile söyle")], ornek: "Yes, I do, because my colleagues are friendly and I like helping people." },
            { id: "a2-t1-7", gorev: "Görevli hiç Birleşik Krallık'ta başka bir şehre gidip gitmediğini soruyor.", soru: sayEn("Have you ever been to another city in the UK?"), kurallar: [kw("^(yes|no)", "“Yes, I have.” ya da “No, I haven't.” ile başla"), kw("(i went|we went|i have been|i have never|never)", "Ayrıntı ver: I went to … last year / I've never …")], ornek: "Yes, I have. I went to Manchester last summer with my family." },
            { id: "a2-t1-8", gorev: "Görevli en sevdiğin mevsimi ve nedenini soruyor.", soru: sayEn("What's your favourite season and why?"), kurallar: [kw("(spring|summer|autumn|winter)", "Mevsimi söyle"), kw("because", "Nedenini söyle")], ornek: "My favourite season is spring because it's warm and sunny." },
          ],
        },
        {
          id: "a2-t2", baslik: "Diğer adayla konuş", aciklama: "Soru sor, cevap ver, takip sorusuyla konuşmayı sürdür.",
          gorevler: [
            { id: "a2-t2-1", kart: "Last weekend", gorev: "Diğer adaya geçen hafta sonunu sor.", kurallar: [EN_SORU, kw("\\bdid\\b", "Geçmiş soru: What did you do …?")], ornek: "What did you do last weekend?" },
            { id: "a2-t2-2", kart: "Holidays", gorev: "Diğer adaya tatil planlarını sor.", kurallar: [EN_SORU, kw("(going to|holiday|summer|plan)", "Plan sor: Are you going to …?")], ornek: "Are you going to go on holiday this summer?" },
            { id: "a2-t2-3", kart: "Living in the UK", gorev: "Diğer adaya burada en çok neyi sevdiğini sor.", kurallar: [EN_SORU, kw("(like|best|enjoy|favourite)", "Sevdiğini sor: What do you like …?")], ornek: "What do you like best about living here?" },
            { id: "a2-t2-4", gorev: "Diğer aday soruyor. Cevap ver ve bir neden ekle.", soru: sayEn("Do you prefer living in a city or in the countryside?"), kurallar: [kw("(prefer|city|countryside|town|village)", "Tercihini söyle: I prefer …"), kw("because", "Nedenini söyle")], ornek: "I prefer the city because there are more jobs and shops." },
            { id: "a2-t2-5", gorev: "Diğer aday “I can't sleep well at night.” dedi. Ona tavsiye ver.", soru: sayEn("I can't sleep well at night."), kurallar: [kw("(you should|why do not you|you could|try to)", "Tavsiye ver: You should …")], ornek: "You should stop drinking coffee in the evening." },
            { id: "a2-t2-6", gorev: "Diğer aday “I went to Wales last summer.” dedi. Kısa bir tepki ver ve takip sorusu sor.", soru: sayEn("I went to Wales last summer."), kurallar: [kw("(really|nice|great|lovely|wow|interesting)", "Kısa bir tepki ver: Really? That's nice."), kw("(what|where|how|did|who|why)", "Bir takip sorusu sor")], ornek: "Really? That's nice. What did you do there?" },
            { id: "a2-t2-7", gorev: "Diğer adayın önerisine katılıyorsun.", soru: sayEn("Let's meet at the library after the test."), kurallar: [kw("(good idea|great idea|i agree|ok|okay|sounds good|why not|yes)", "Katıl: That's a good idea. / I agree.")], ornek: "That's a good idea. What time shall we meet?" },
          ],
        },
        {
          id: "a2-t3", alan: "Dinleme", baslik: "Dinle ve konuş", aciklama: "2. bölüm: kaydı dinle, soruyu tam cümleyle cevapla. Not alabilirsin.",
          gorevler: [
            { id: "a2-t3-1", gorev: "Kaydı dinle ve soruyu cevapla: Why is the new job better?", soru: sayEn("My new job is better than my old one. The pay is higher and I don't have to work at weekends."), kurallar: [kw("(pay|money|higher)", "Maaştan bahset"), kw("weekend", "Hafta sonunu söyle")], ornek: "Because the pay is higher and she doesn't have to work at weekends." },
            { id: "a2-t3-2", gorev: "Kaydı dinle ve soruyu cevapla: How long are they staying in Turkey?", soru: sayEn("We're going to Turkey in August to see my parents. We're staying for three weeks."), kurallar: [kw("(3 weeks|three weeks)", "Süreyi söyle")], ornek: "They're staying for three weeks." },
            { id: "a2-t3-3", gorev: "Kaydı dinle ve soruyu cevapla: What should you bring to register?", soru: sayEn("To register with the GP, please bring a photo ID and a letter with your address on it."), kurallar: [kw("(photo|id|identity)", "Kimliği söyle"), kw("(letter|address)", "Adresli mektubu söyle")], ornek: "You should bring a photo ID and a letter with your address." },
            { id: "a2-t3-4", gorev: "Kaydı dinle ve soruyu cevapla: When is the next train?", soru: sayEn("The 7.45 train to Cardiff has been cancelled. The next train leaves at 8.15 from platform four."), kurallar: [kw("(8 15|quarter past 8)", "Saati söyle (8.15)")], ornek: "The next train leaves at quarter past eight." },
            { id: "a2-t3-5", gorev: "Kaydı dinle ve soruyu cevapla: Why didn't she enjoy the film?", soru: sayEn("I didn't enjoy the film. It was too long and the story was boring."), kurallar: [kw("long", "Uzunluğundan bahset"), kw("boring", "Hikâyeyi söyle")], ornek: "Because it was too long and the story was boring." },
          ],
        },
        {
          id: "a2-tek", baslik: "Dinle ve tekrar et", aciklama: "Cümleyi dinle, aynısını söyle.",
          gorevler: [
            ["Last weekend I visited my sister.", "Geçen hafta sonu kız kardeşimi ziyaret ettim."], ["We came to the UK two years ago.", "Birleşik Krallık'a iki yıl önce geldik."],
            ["Next year I'm going to start an English course.", "Seneye bir İngilizce kursuna başlayacağım."], ["London is bigger than my home town.", "Londra memleketimden daha büyük."],
            ["You should drink more water.", "Daha çok su içmelisin."], ["I'd like to register with the surgery, please.", "Bu muayenehaneye kayıt olmak istiyorum."],
            ["I've had a sore throat for three days.", "Üç gündür boğazım ağrıyor."], ["First, we took the train to London.", "Önce Londra'ya trenle gittik."],
            ["I like living here because people are friendly.", "Burada yaşamayı seviyorum çünkü insanlar arkadaş canlısı."], ["The bus was late, so I walked.", "Otobüs geç kaldı, bu yüzden yürüdüm."],
          ].map(([tekrar, tr], i) => ({ id: `a2-tek-${i + 1}`, gorev: "Cümleyi dinle ve aynısını söyle.", tekrar, tr })),
        },
      ],
    },
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

      // Kelime: [Almanca, Türkçe] ya da [Almanca, Türkçe, "pl"] (çoğul isim). Liste özgün seçimdir; resmî kelime listesinden kopyalanmadı.
      kelime: [
        { id: "kisisel", tema: "Kişisel bilgiler", kelimeler: [["der Name", "ad, isim"], ["der Vorname", "ad (ilk ad)"], ["der Nachname", "soyadı"], ["die Adresse", "adres"], ["die Straße", "cadde, sokak"], ["die Hausnummer", "kapı numarası"], ["die Postleitzahl", "posta kodu"], ["die Telefonnummer", "telefon numarası"], ["das Alter", "yaş"], ["das Geburtsdatum", "doğum tarihi"], ["der Geburtsort", "doğum yeri"], ["das Land", "ülke"], ["die Staatsangehörigkeit", "uyruk"], ["die Sprache", "dil"], ["der Beruf", "meslek"], ["der Familienstand", "medeni durum"], ["ledig", "bekâr"], ["verheiratet", "evli"], ["geschieden", "boşanmış"], ["die Unterschrift", "imza"]] },
        { id: "aile", tema: "Aile", kelimeler: [["die Familie", "aile"], ["der Vater", "baba"], ["die Mutter", "anne"], ["die Eltern", "anne baba", "pl"], ["der Bruder", "erkek kardeş"], ["die Schwester", "kız kardeş"], ["die Geschwister", "kardeşler", "pl"], ["der Sohn", "oğul"], ["die Tochter", "kız evlat"], ["das Kind", "çocuk"], ["das Baby", "bebek"], ["der Mann", "adam; koca"], ["die Frau", "kadın; eş (karı)"], ["der Großvater", "büyükbaba"], ["die Großmutter", "büyükanne"], ["die Großeltern", "büyükanne ve büyükbaba", "pl"], ["der Onkel", "amca, dayı"], ["die Tante", "hala, teyze"], ["der Freund", "arkadaş (erkek)"], ["die Freundin", "arkadaş (kadın)"]] },
        { id: "zaman", tema: "Zaman ve günler", kelimeler: [["der Tag", "gün"], ["die Woche", "hafta"], ["der Monat", "ay"], ["das Jahr", "yıl"], ["heute", "bugün"], ["morgen", "yarın"], ["gestern", "dün"], ["der Morgen", "sabah"], ["der Vormittag", "öğleden önce"], ["der Mittag", "öğle"], ["der Nachmittag", "öğleden sonra"], ["der Abend", "akşam"], ["die Nacht", "gece"], ["die Stunde", "saat (süre)"], ["die Minute", "dakika"], ["die Uhr", "saat"], ["das Wochenende", "hafta sonu"], ["der Montag", "pazartesi"], ["der Dienstag", "salı"], ["der Mittwoch", "çarşamba"], ["der Donnerstag", "perşembe"], ["der Freitag", "cuma"], ["der Samstag", "cumartesi"], ["der Sonntag", "pazar"]] },
        { id: "aylar", tema: "Aylar ve mevsimler", kelimeler: [["der Januar", "ocak"], ["der Februar", "şubat"], ["der März", "mart"], ["der April", "nisan"], ["der Mai", "mayıs"], ["der Juni", "haziran"], ["der Juli", "temmuz"], ["der August", "ağustos"], ["der September", "eylül"], ["der Oktober", "ekim"], ["der November", "kasım"], ["der Dezember", "aralık"], ["der Frühling", "ilkbahar"], ["der Sommer", "yaz"], ["der Herbst", "sonbahar"], ["der Winter", "kış"]] },
        { id: "ev", tema: "Ev ve daire", kelimeler: [["die Wohnung", "daire"], ["das Haus", "ev"], ["das Zimmer", "oda"], ["die Küche", "mutfak"], ["das Bad", "banyo"], ["das Schlafzimmer", "yatak odası"], ["das Wohnzimmer", "oturma odası"], ["der Balkon", "balkon"], ["der Garten", "bahçe"], ["die Tür", "kapı"], ["das Fenster", "pencere"], ["der Tisch", "masa"], ["der Stuhl", "sandalye"], ["das Bett", "yatak"], ["der Schrank", "dolap"], ["die Lampe", "lamba"], ["die Miete", "kira"], ["der Stock", "kat"], ["der Aufzug", "asansör"], ["die Treppe", "merdiven"], ["die Heizung", "kalorifer"], ["der Schlüssel", "anahtar"]] },
        { id: "yemek", tema: "Yiyecek ve içecek", kelimeler: [["das Essen", "yemek"], ["das Frühstück", "kahvaltı"], ["das Mittagessen", "öğle yemeği"], ["das Abendessen", "akşam yemeği"], ["das Brot", "ekmek"], ["das Brötchen", "küçük ekmek"], ["die Butter", "tereyağı"], ["der Käse", "peynir"], ["das Ei", "yumurta"], ["die Milch", "süt"], ["der Kaffee", "kahve"], ["der Tee", "çay"], ["das Wasser", "su"], ["der Saft", "meyve suyu"], ["das Fleisch", "et"], ["der Fisch", "balık"], ["das Hähnchen", "tavuk"], ["der Reis", "pirinç"], ["die Kartoffel", "patates"], ["das Gemüse", "sebze"], ["das Obst", "meyve"], ["der Apfel", "elma"], ["die Tomate", "domates"], ["der Kuchen", "pasta, kek"], ["der Zucker", "şeker"], ["das Salz", "tuz"]] },
        { id: "alisveris", tema: "Alışveriş ve giyim", kelimeler: [["der Supermarkt", "süpermarket"], ["der Markt", "pazar"], ["die Bäckerei", "fırın"], ["die Apotheke", "eczane"], ["das Geschäft", "dükkân, mağaza"], ["die Kasse", "kasa"], ["der Preis", "fiyat"], ["das Geld", "para"], ["der Euro", "euro"], ["der Cent", "sent"], ["das Angebot", "kampanya, indirim"], ["kaufen", "satın almak"], ["bezahlen", "ödemek"], ["kosten", "(fiyatı) tutmak"], ["billig", "ucuz"], ["teuer", "pahalı"], ["die Kleidung", "giysi"], ["die Hose", "pantolon"], ["das Hemd", "gömlek"], ["die Jacke", "ceket, mont"], ["der Schuh", "ayakkabı"], ["die Größe", "beden"]] },
        { id: "sehir", tema: "Şehir ve ulaşım", kelimeler: [["die Stadt", "şehir"], ["der Bahnhof", "tren istasyonu"], ["der Flughafen", "havalimanı"], ["die Haltestelle", "durak"], ["der Bus", "otobüs"], ["der Zug", "tren"], ["die U-Bahn", "metro"], ["die Straßenbahn", "tramvay"], ["das Auto", "araba"], ["das Fahrrad", "bisiklet"], ["das Taxi", "taksi"], ["die Fahrkarte", "bilet"], ["das Gleis", "peron"], ["die Abfahrt", "kalkış"], ["die Ankunft", "varış"], ["links", "sol, solda"], ["rechts", "sağ, sağda"], ["geradeaus", "düz, dosdoğru"], ["die Ampel", "trafik ışığı"], ["die Post", "postane"], ["die Bank", "banka"], ["das Rathaus", "belediye binası"]] },
        { id: "saglik", tema: "Sağlık ve vücut", kelimeler: [["der Arzt", "doktor (erkek)"], ["die Ärztin", "doktor (kadın)"], ["die Praxis", "muayenehane"], ["das Krankenhaus", "hastane"], ["der Termin", "randevu"], ["krank", "hasta"], ["gesund", "sağlıklı"], ["das Fieber", "ateş"], ["die Kopfschmerzen", "baş ağrısı", "pl"], ["der Kopf", "baş"], ["der Bauch", "karın"], ["der Rücken", "sırt"], ["das Auge", "göz"], ["das Ohr", "kulak"], ["die Hand", "el"], ["der Fuß", "ayak"], ["das Bein", "bacak"], ["der Zahn", "diş"], ["die Tablette", "hap"], ["das Rezept", "reçete"]] },
        { id: "is", tema: "İş ve meslekler", kelimeler: [["die Arbeit", "iş"], ["arbeiten", "çalışmak"], ["der Lehrer", "öğretmen (erkek)"], ["die Lehrerin", "öğretmen (kadın)"], ["der Verkäufer", "satıcı (erkek)"], ["die Verkäuferin", "satıcı (kadın)"], ["der Koch", "aşçı (erkek)"], ["die Köchin", "aşçı (kadın)"], ["der Fahrer", "şoför"], ["die Krankenschwester", "hemşire"], ["der Ingenieur", "mühendis"], ["der Kellner", "garson"], ["die Firma", "firma"], ["das Büro", "ofis, büro"], ["der Chef", "şef, patron (erkek)"], ["die Chefin", "şef, patron (kadın)"], ["der Kollege", "iş arkadaşı (erkek)"], ["die Kollegin", "iş arkadaşı (kadın)"]] },
        { id: "bos", tema: "Boş zaman", kelimeler: [["die Freizeit", "boş zaman"], ["das Hobby", "hobi"], ["der Sport", "spor"], ["der Fußball", "futbol"], ["schwimmen", "yüzmek"], ["lesen", "okumak"], ["kochen", "yemek yapmak"], ["tanzen", "dans etmek"], ["spielen", "oynamak"], ["das Kino", "sinema"], ["der Film", "film"], ["die Musik", "müzik"], ["die Party", "parti"], ["der Urlaub", "tatil"], ["die Reise", "yolculuk"], ["das Meer", "deniz"], ["der Park", "park"], ["das Buch", "kitap"], ["das Foto", "fotoğraf"]] },
        { id: "resmi", tema: "Resmî işler ve kurs", kelimeler: [["das Amt", "resmî daire"], ["der Ausweis", "kimlik kartı"], ["der Reisepass", "pasaport"], ["das Visum", "vize"], ["die Botschaft", "büyükelçilik"], ["das Konsulat", "konsolosluk"], ["der Antrag", "başvuru (dilekçe)"], ["das Formular", "form"], ["die Anmeldung", "kayıt"], ["der Kurs", "kurs"], ["die Prüfung", "sınav"], ["die Hausaufgabe", "ödev"], ["die Schule", "okul"], ["der Unterricht", "ders"]] },
        { id: "fiil", tema: "Günlük fiiller", kelimeler: [["sein", "olmak"], ["haben", "sahip olmak"], ["heißen", "adı … olmak"], ["kommen", "gelmek"], ["wohnen", "oturmak, ikamet etmek"], ["gehen", "gitmek (yürüyerek)"], ["fahren", "gitmek (araçla)"], ["essen", "yemek"], ["trinken", "içmek"], ["schlafen", "uyumak"], ["machen", "yapmak"], ["sprechen", "konuşmak"], ["lernen", "öğrenmek"], ["verstehen", "anlamak"], ["schreiben", "yazmak"], ["hören", "duymak, dinlemek"], ["sehen", "görmek"], ["brauchen", "ihtiyacı olmak"], ["möchten", "istemek (kibar)"], ["können", "-ebilmek"], ["müssen", "-mek zorunda olmak"], ["helfen", "yardım etmek"], ["anrufen", "telefon etmek"], ["warten", "beklemek"], ["öffnen", "açmak"], ["schließen", "kapatmak"], ["beginnen", "başlamak"], ["kennen", "tanımak"], ["wissen", "bilmek"]] },
        { id: "sifat", tema: "Sıfatlar", kelimeler: [["groß", "büyük"], ["klein", "küçük"], ["alt", "yaşlı; eski"], ["neu", "yeni"], ["jung", "genç"], ["gut", "iyi"], ["schlecht", "kötü"], ["schön", "güzel"], ["schnell", "hızlı"], ["langsam", "yavaş"], ["kalt", "soğuk"], ["warm", "ılık, sıcak"], ["heiß", "çok sıcak"], ["laut", "gürültülü, yüksek sesli"], ["leise", "sessiz, alçak sesli"], ["früh", "erken"], ["spät", "geç"], ["richtig", "doğru"], ["falsch", "yanlış"], ["offen", "açık"], ["geschlossen", "kapalı"]] },
        { id: "hava", tema: "Hava", kelimeler: [["das Wetter", "hava (durumu)"], ["die Sonne", "güneş"], ["der Regen", "yağmur"], ["der Schnee", "kar"], ["der Wind", "rüzgâr"], ["Es regnet.", "Yağmur yağıyor."], ["Es schneit.", "Kar yağıyor."], ["Die Sonne scheint.", "Güneş parlıyor."]] },
        { id: "ifade", tema: "Günlük ifadeler", kelimeler: [["Hallo!", "Merhaba!"], ["Guten Morgen!", "Günaydın!"], ["Guten Tag!", "İyi günler! (selam)"], ["Guten Abend!", "İyi akşamlar!"], ["Gute Nacht!", "İyi geceler!"], ["Auf Wiedersehen!", "Hoşça kalın!"], ["Tschüss!", "Hoşça kal! (samimi)"], ["Danke!", "Teşekkürler!"], ["Vielen Dank!", "Çok teşekkürler!"], ["Bitte!", "Lütfen! / Rica ederim!"], ["Gern geschehen!", "Rica ederim!"], ["Entschuldigung!", "Affedersiniz!"], ["Wie bitte?", "Efendim? (anlamadım)"], ["Tut mir leid.", "Üzgünüm."], ["Ja.", "Evet."], ["Nein.", "Hayır."]] },
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
