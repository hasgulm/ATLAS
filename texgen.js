window.ATLAS_TEX_READY=async function(){const t=2048,a=1024,e="https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/",[o,n]=await Promise.all([fetch(e+"land-50m.json").then((t=>t.json())),fetch(e+"countries-110m.json").then((t=>t.json()))]),c=(t,a)=>{const e=document.createElement("canvas");return e.width=t,e.height=a,e},s=(t,a,e,o)=>[(t+180)/360*e,(90-a)/180*o];function r(t){const a=[t[0]]
;for(let e=1;e<t.length;e++){let[o,n]=t[e];const c=a[a.length-1][0];for(;o-c>180;)o-=360;for(;o-c<-180;)o+=360;a.push([o,n])}return a}function l(t){const a=[];for(const e of t.features){const t=e.geometry;t&&("Polygon"===t.type?a.push(t.coordinates):"MultiPolygon"===t.type&&a.push(...t.coordinates))}return a}function d(t,a,e,o,n){for(const c of a)for(const a of[-360,0,360]){t.beginPath()
;for(let l of c)l=r(l),Math.abs(l[l.length-1][0]-l[0][0])>300&&(l=l.concat([[l[l.length-1][0],-90],[l[0][0],-90]])),l.forEach((([n,c],r)=>{const[l,d]=s(n+a,c,e,o);r?t.lineTo(l,d):t.moveTo(l,d)})),n||t.closePath();n?t.stroke():t.fill("evenodd")}}const f=c(t,a),g=f.getContext("2d");g.fillStyle="#000",g.fillRect(0,0,t,a),g.fillStyle="#fff",d(g,l(topojson.feature(o,o.objects.land)),t,a)
;const h=c(t,a),i=h.getContext("2d");i.strokeStyle="#fff",i.lineWidth=1,d(i,l(topojson.feature(n,n.objects.countries)),t,a,!0);const m=c(t,a),u=m.getContext("2d");u.filter="blur(14px)",u.drawImage(f,0,0);const p=t=>t.getContext("2d").getImageData(0,0,t.width,t.height).data;let x=7;function y(t,a,e){const o=new Float32Array(t*a),n=c(t,a).getContext("2d");n.imageSmoothingEnabled=!0,
n.imageSmoothingQuality="high";let s=1,r=0;for(let l=0;l<e;l++){const e=2**(l+2),d=e+1,f=e/2+1,g=c(d,f),h=g.getContext("2d"),i=h.createImageData(d,f);for(let t=0;t<f;t++){const a=[];for(let e=0;e<d;e++){const o=e===d-1?a[0]:255*(x=16807*x%2147483647,x/2147483647)|0;a.push(o);const n=4*(t*d+e);i.data[n]=i.data[n+1]=i.data[n+2]=o,i.data[n+3]=255}}h.putImageData(i,0,0),n.drawImage(g,0,0,t,a)
;const m=n.getImageData(0,0,t,a).data;for(let e=0;e<t*a;e++)o[e]+=s*m[4*e]/255;r+=s,s*=.55}for(let e=0;e<t*a;e++)o[e]/=r;return o}
const I=y(t,a,6),D=y(t,a,5),M=y(t,a,4),w=p(f),j=p(h),C=p(m),b=[[46,82,52],[120,118,70],[176,150,104],[70,98,60],[112,112,98],[236,240,244]],E=c(t,a),S=E.getContext("2d"),P=S.createImageData(t,a),v=P.data,A=c(t,a),T=A.getContext("2d"),k=T.createImageData(t,a),R=t=>Math.max(0,Math.min(1,t));for(let e=0;e<a;e++){const o=90-e/(a-1)*180,n=Math.abs(o);for(let a=0;a<t;a++){
const c=e*t+a,s=4*c,r=n+22*(D[c]-.5)+10*(M[c]-.5),l=(t,a,e=7)=>R((r-t)/e+.5)*R((a-r)/e+.5),d=[l(-10,14),l(12,19),l(17,34,9)*Math.min(1.4,Math.max(.15,3*(M[c]-.35))),l(30,60,10),l(58,72),l(70,140)+Math.min(4,Math.max(0,(-o-62)/3))];let f=0,g=0,h=0,i=0;d.forEach(((t,a)=>{f+=t*b[a][0],g+=t*b[a][1],h+=t*b[a][2],i+=t})),i=Math.max(i,.001);const m=.78+.44*I[c];f=f/i*m,g=g/i*m,h=h/i*m
;const u=C[s]/255,p=.85+.3*D[c],x=10*p+20*u*.7,y=30*p+55*u*.7,E=62*p+80*u*.7,S=w[s]/255,P=j[s]/255*.35*S;v[s]=(x*(1-S)+f*S)*(1-P)+220*P,v[s+1]=(y*(1-S)+g*S)*(1-P)+225*P,v[s+2]=(E*(1-S)+h*S)*(1-P)+230*P,v[s+3]=255,k.data[s]=k.data[s+1]=k.data[s+2]=200*(1-S),k.data[s+3]=255}}S.putImageData(P,0,0),T.putImageData(k,0,0)
;const _=1024,F=512,L=y(_,F,7),Q=y(_,F,5),W=c(_,F),X=W.getContext("2d"),Y=X.createImageData(_,F);for(let t=0;t<_*F;t++){const a=255*Math.pow(R(3.2*(.7*L[t]+.3*Q[t]-.52)),1.3);Y.data[4*t]=Y.data[4*t+1]=Y.data[4*t+2]=a,Y.data[4*t+3]=255}return X.putImageData(Y,0,0),{day:E,spec:A,cloud:W}}();
(function(){"use strict";
var pb=document.querySelector(".proto");if(pb){pb.textContent="Prototip · canlı + simüle veri";pb.setAttribute("data-tip","Bu bir prototiptir. Canlı piyasa kutusu ve kaynağı belirtilen haberler gerçek verilerdir. Grafikler, fiyat geçmişi ve tahminler simüle veridir. Yatırım tavsiyesi değildir.")}
var mk=document.getElementById("markets");if(!mk)return;var el=document.createElement("div");el.className="live";el.id="live";el.hidden=true;mk.parentNode.insertBefore(el,mk);
var css=".live{margin-top:18px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md);padding:14px 18px;box-shadow:var(--shadow)}"+
".live-h{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-bottom:10px;font-size:12px;color:var(--ink-3)}"+
".live-b{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--up);background:var(--up-soft);padding:3px 9px;border-radius:999px}"+
".live-b:before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}"+
".live-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px 12px}"+
".live-i .k{font-size:12px;color:var(--ink-2);font-weight:600}.live-i .v{font-family:var(--f-data);font-size:18px;font-weight:500;color:var(--ink);margin-top:2px}"+
".live-i .c{font-family:var(--f-data);font-size:12px}.live-i .c.up{color:var(--up)}.live-i .c.dn{color:var(--down)}.live-i .c.n{color:var(--ink-3)}"+
"@media (max-width:640px){.live-g{grid-template-columns:repeat(2,minmax(0,1fr))}}";
var s=document.createElement("style");s.textContent=css;document.head.appendChild(s);
function f(n,d){return n.toLocaleString("tr-TR",{minimumFractionDigits:d,maximumFractionDigits:d})}
function item(k,v,c,n){return '<div class="live-i"><div class="k">'+k+'</div><div class="v">'+v+'</div>'+(c==null?(n?'<div class="c n">'+n+'</div>':''):'<div class="c '+(c>=0?'up':'dn')+'">'+(c>=0?'+':'')+f(c,2)+'% · 24 saat</div>')+'</div>'}
fetch("/api/live").then(function(r){return r.ok?r.json():Promise.reject()}).then(function(d){
var h=[];
if(d.usd)h.push(item("Dolar / TL",f(d.usd,4)+" ₺"));
if(d.eur)h.push(item("Euro / TL",f(d.eur,4)+" ₺"));
if(d.gold)h.push(item("Gram altın (yaklaşık)",f(d.gold,0)+" ₺",d.goldChg));
if(d.btc)h.push(item("Bitcoin",f(d.btc,0)+" ₺",d.btcChg));
var e=d.evds||{};function dd(x){return x&&x.d?" · "+x.d.split("-").slice(0,2).join("."):""}
if(e.funding)h.push(item("TCMB fonlama faizi","%"+f(e.funding.v,2),null,"günlük"+dd(e.funding)));
if(e.deposit3m)h.push(item("TL mevduat faizi (3 aya kadar)","%"+f(e.deposit3m.v,2),null,"haftalık"+dd(e.deposit3m)));
if(e.cpiYoy)h.push(item("Yıllık enflasyon (TÜFE)","%"+f(e.cpiYoy.v,2),null,"aylık · "+e.cpiYoy.d.split("-").reverse().join(".")));
if(!h.length)return;
var src=[];if(d.sources.fx)src.push(d.sources.fx);if(d.sources.crypto)src.push("altın ve Bitcoin: "+d.sources.crypto);if(d.sources.evds)src.push("faiz ve enflasyon: "+d.sources.evds);
var t=new Date(d.updated).toLocaleString("tr-TR",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
el.innerHTML='<div class="live-h"><span class="live-b">Canlı piyasa</span><span>Kaynak: '+src.join(", ")+' · Güncelleme: '+t+'</span><span>Aşağıdaki grafikler ve tahminler simüle veridir.</span></div><div class="live-g">'+h.join("")+'</div>';
el.hidden=false;var ft=document.querySelector("#foot p");if(ft)ft.textContent='ATLAS bir prototiptir. "Canlı piyasa" kutusundaki değerler ve kaynağı belirtilen haberler gerçektir. Bunların dışındaki fiyatlar, grafikler ve tahminler simüle edilmiştir. Hiçbiri yatırım tavsiyesi niteliği taşımaz.'}).catch(function(){})})();
addEventListener("load",function(){"use strict";
if(typeof EVENTS==="undefined")return;
var NT={fed:"ABD Merkez Bankası (Fed)",tcmb:"TCMB / Türkiye faiz politikası",ecb:"Avrupa Merkez Bankası",boj:"Japonya Merkez Bankası",boe:"İngiltere Merkez Bankası",oil:"Petrol ve OPEC",gold:"Altın piyasası",crypto:"Kripto paralar",china:"Çin ekonomisi",trmkt:"Türkiye piyasaları",konut:"Konut piyasası",infl:"Enflasyon",rate:"Faiz oranları"};
fetch("/api/news").then(function(r){return r.ok?r.json():Promise.reject()}).then(function(d){
if(!d.events||!d.events.length)return;var SRC=d.source||"GDELT";
EVENTS.length=0;d.events.forEach(function(e){EVENTS.push(e)});
var orig=renderGlobePanel;
renderGlobePanel=function(){var sel=state.gSel&&EVENTS.find(function(x){return x.id===state.gSel});var keep=state.gSel;
if(sel)state.gSel=null;orig();state.gSel=keep;
var p=document.getElementById("gPanel");
if(!sel){p.querySelectorAll(".note").forEach(function(n){n.textContent="Haberler "+SRC+" üzerinden gerçek kaynaklardan gelir. Etiketler konuya göre otomatik atanır, fiyat yönü tahmini değildir."});return}
var dt=new Date(sel.ts).toLocaleString("tr-TR",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
p.innerHTML='<div class="ev" style="display:grid;gap:14px"><button type="button" class="ev-back" data-back="1">← Tüm gelişmeler</button>'+
'<span class="meta">'+relDay(sel)+' · '+dt+' · '+sel.src+'</span><h2>'+sel.title+'</h2>'+
'<div class="qa"><h4>Konu</h4><p>'+(NT[sel.theme]||"Piyasalar")+' · '+sel.place+'</p></div>'+
'<div class="qa"><h4>Hangi yatırımlarla ilgili olabilir?</h4><div class="imp">'+sel.impacts.map(function(x){return '<span class="chip" style="cursor:default;padding:6px 12px;font-size:13.5px">'+CATS[x[0]]+'</span>'}).join("")+'</div></div>'+
'<a class="btn" href="'+sel.url+'" target="_blank" rel="noopener noreferrer">Haberi kaynağında oku ↗</a>'+
'<p class="note">Kaynak: '+sel.src+' ('+SRC+' aracılığıyla). Konu etiketleri başlıktaki kelimelere göre otomatik atanır; fiyatların yönüne dair bir tahmin değildir ve yatırım tavsiyesi değildir.</p></div>'};
renderHomeNews=function(){var a=EVENTS.slice(0,3);document.getElementById("homeNews").innerHTML=a.map(function(e){return '<button type="button" class="card ncard" data-ev="'+e.id+'"><span class="meta">'+relDay(e)+'<span class="sep"></span>'+e.src+'</span><h3>'+e.title+'</h3><div class="chips">'+impPills(e)+'</div></button>'}).join("")+'<p class="note">Gerçek haberler, kaynak: '+SRC+'. Etiketler otomatik atanır.</p>';return a};
renderHomeNews();
if(typeof homeGlobe!=="undefined"&&homeGlobe)homeGlobe.setEvents(EVENTS.filter(function(e){return e.days<=7}));
updateGlobe();
}).catch(function(){})});
addEventListener("load",function(){var s=document.createElement("script");s.src="/real.js";document.body.appendChild(s)});
