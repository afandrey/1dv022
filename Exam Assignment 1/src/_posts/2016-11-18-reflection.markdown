---
layout: post
title:  "Reflektion"
date:   2016-11-22 14:31:16
---

- Vad tycker du om att pre-compiling din CSS?
    - Jämfört med vanlig CSS?
    - Vilka tekniker använde du?
    - För-/Nackdelar?

    I början tyckte jag det var ganska komplicerat med pre-compiling. Jag ansåg att man måste först kika igenom alla filerna, alternativt börja om helt från början, för att förstå vad man ska göra.
    För varje gång man satte sig med denna uppgiften blev det dock lättare och även efter man kikat på <https://jekyllrb.com/>. Det vi gjorde i kursen (1ME321) innan tyckte jag var lite lättare att förstå CSS koden med en gång.

    I main.css skapade jag variablar för de färger jag skulle använda till min webbplats. Flera mediaquerys för att kunna få en responsiv design, som även ska se snygg ut på mobila enheter.

    För- eller nackdel, lite beroende på vad man själv tycker, är väl att det blir ganska många filer. Personligen tycker jag bättre om att kunna ha fler filer, med lite mindre information i än att packa in all kod i en och samma fil.
    Ska man göra ett mindre projekt så kan pre-compiling kanske kännas lite onödigt.
    En nackdel är också att om man är ett större team som ska arbeta, behöver alla känna till hur det fungerar. Om någon börjar gå in och ändra och inte förstår sig på pre-compiling kan det istället skapa problem.
    Dock kan det även va en fördel när man arbetar i större team för alla kan arbeta med sina egna filer. Om man till exempel är en utvecklare och en designer, då har designern sina css filer och behöver inte bli berörd utav javascript utan det är enbart filer som utvecklaren behöver röra i.

- Vad tycker du om static site generators?
    - Vilken typ av projekt är det passande för?

    Jag tycker det fungerar bra, men de passar kanske inte till alla webbplatser.
    En bra egenskap med static site generators är hur snabbt de laddas och när allt är statiskt så packas det ihop i filer vilket gör att det blir så få anrop som möjligt till servern.
    När jag skapat min webbplats har jag använt mig av "npm run watch" för att kunna se förändringarna i webbläsaren hela tiden, dock blir detta ett problem om man till exempel vill se hur webbplatsen ser ut i annat än datorn. Då måste man först ladda upp webbplatsen.
    Eftersom att static site generators inte kräver så mycket underhåll är detta förmodligen något man sparar tid och pengar på, vilket alltid är positivt.

- Vad är robots.txt och hur har du konfigurerat det för din webbplats?

    Robots.txt är en text-fil som sökmotorer och "robotar" hämtar för att kontrollera vilka mappar de får åtkomst till. Man kan styra fritt vad man vill blockera och inte.
    På min sida har jag valt att blockera alla "robotar" från hela webbplatsen med:

    {% highlight ruby %}
    User-agent: *
    Disallow: /
    {% endhighlight %}

Men man kan även ge "robotar" tillgång till hela webbplatsen, blockera / tillåta vissa delar av webbplatsen, blockera / tillåta vissa sökrobotar osv.

- Vad är humans.txt och hur har du konfigurerat den för din webbplats?

    Humans.txt är en lättillgänglig och lättläst text-fil som innehåller information om vilka som byggt webbplatsen. Humans.txt kan till exempel innehålla kontaktinformation, speciella tack eller mjukvaruinformation.
    Egentligen kan man väl lägga till vilken information man vill som är relevant för webbplatsen. I min humans.txt har jag enbart använt mig av information om mig själv och vart jag befinner mig i världen.

    {% highlight ruby %}
    /* TEAM */
    Alva Fandrey
    Email: af222ug@student.lnu.se
    Github: afandrey
    Twitter: @alvaaf_
    Location: Kalmar, Sweden
    {% endhighlight %}


- Hur implementerade du kommentarer till dina blogginlägg?

    Jag använde mig utav disqus som var rekommendationen. Att lägga till disqus var inte alls svårt. Efter jag registrerat mig använde jag "universal code" och där fick man instruktioner var man skulle lägga in koden.
    Jag försökte dock även att lägga till att på sidan med alla blogginläggen skulle det synas hur många kommentarer det fanns på inläggen (innan man gick in på inlägget eller så kunde man trycka på kommentarer för att hoppa direkt till kommentarsfältet).
    Dock fungerar detta bara på vissa inlägg och syns endast ibland, har försökt lösa problemet, men vet tyvärr inte var felet ligger då jag följt instruktionerna till detta och det fungerar ändå inte.
    Här nedan är koden jag implementerade i post.html.

{% highlight ruby %}
    (function() {
        var d = document, s = d.createElement('script');
        s.src = '//afandrey.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
{% endhighlight %}

- Vad är Open Graph och hur får du ut något från det?

    Open graph läggs i meta taggar i ditt HTML-head. I Open graph kan du lägga in information hur du vill att din webbplats presenteras när den länkas på till exempel Facebook eller Twitter.
    Till exempel kan du styra titel, bild och en beskrivning av din webbplats.
    Det blir betydligt snyggare när du delar din webbplats om du använt dig av Open Graph. Tyvärr kan besökare bli lite lurade när vissa lägger in information som är orelevant för sin webbplats, enbart för att få fler besökare.
