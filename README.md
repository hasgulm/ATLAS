# ATLAS

Yatırımları karşılaştırma prototipi. Canlı adres: https://atlas-yatirim.vercel.app

- `index.html`, `style.css`, `a1.js`–`a6.js`: uygulamanın kendisi (statik).
- `texgen.js`: "Canlı piyasa" kutusu ve gerçek haberler.
- `gundem.js`: Dünya Gündemi sayfası (düz harita, konu balonları, "ne anlama gelir?" notları) ve ana sayfadaki küçük harita. Harita çizimi `data/world.json`.
- `real.js`: döviz, altın, Bitcoin ve TÜFE grafiklerini gerçek veriyle değiştirir; ana sayfadaki hesaplayıcılar.
- `api/live.js`: anlık kur, altın, Bitcoin ve TCMB EVDS faiz/enflasyon verisi.
- `api/history.js`: 2019'dan bu yana haftalık gerçek fiyat geçmişi; TCMB Konut Fiyat Endeksi (`TP.KFE.TR`) ve haftalık ortalama TL mevduat faizleri (`TP.TRY.MT02/03/04`). Bir seri gelmezse o bölüm simüle veriyle kalır.
- `icons/`, `manifest.webmanifest`: site simgesi, paylaşım önizleme görseli (`og.png`) ve "ana ekrana ekle" desteği.
- `api/news.js`: GDELT, yedek olarak Google Haberler başlıkları.

`EVDS_API_KEY` Vercel'de ortam değişkeni olarak tanımlıdır; depoya konmaz.

Borsa, ana sayfadaki otomobil kartı ve tahminler simüledir.

Kullanım istatistiği Vercel Web Analytics ile tutulur (çerezsiz); Vercel panelinde projenin Analytics sekmesinden açılması gerekir. Yatırım tavsiyesi değildir.

## Yayın

`main` dalına yapılan her push, Vercel'de https://atlas-yatirim.vercel.app adresine otomatik olarak yayınlanır.
