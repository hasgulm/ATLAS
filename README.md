# ATLAS

Yatırımları karşılaştırma prototipi. Canlı adres: https://atlas-yatirim.vercel.app

- `index.html`, `style.css`, `a1.js`–`a6.js`: uygulamanın kendisi (statik).
- `texgen.js`: dünya haritası dokusu, "Canlı piyasa" kutusu ve gerçek haberler.
- `real.js`: döviz, altın, Bitcoin ve TÜFE grafiklerini gerçek veriyle değiştirir; ana sayfadaki hesaplayıcılar.
- `api/live.js`: anlık kur, altın, Bitcoin ve TCMB EVDS faiz/enflasyon verisi.
- `api/history.js`: 2019'dan bu yana haftalık gerçek fiyat geçmişi.
- `api/news.js`: GDELT, yedek olarak Google Haberler başlıkları.

`EVDS_API_KEY` Vercel'de ortam değişkeni olarak tanımlıdır; depoya konmaz.

Borsa, konut, otomobil ve mevduat geçmişi ile tahminler simüledir. Yatırım tavsiyesi değildir.
