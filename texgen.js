(function(){"use strict";

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
if(d.usd)h.push(item("Dolar / TL",f(d.usd,2)+" ₺"));
if(d.eur)h.push(item("Euro / TL",f(d.eur,2)+" ₺"));
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
renderHomeNews=function(){var a=EVENTS.slice(0,3);document.getElementById("homeNews").innerHTML=a.map(function(e){return '<button type="button" class="card ncard" data-ev="'+e.id+'"><span class="meta">'+relDay(e)+'<span class="sep"></span>'+e.src+'</span><h3>'+e.title+'</h3><div class="chips">'+impPills(e)+'</div></button>'}).join("")+'<p class="note">Gerçek haberler, kaynak: '+SRC+'. Etiketler otomatik atanır.</p>';return a};
renderHomeNews();
if(window.gundemNewsLoaded)gundemNewsLoaded(SRC);
}).catch(function(){})});
addEventListener("load",function(){var s=document.createElement("script");s.src="/real.js";document.body.appendChild(s)});
