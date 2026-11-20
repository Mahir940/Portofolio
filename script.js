// Tells the inline <head> script that this file loaded, so it keeps animations on.
window.siteReady=true;

// Indonesian translations. English text lives in the HTML and is the default.
const ID={n_home:"Beranda",n_about:"Tentang",n_skills:"Keahlian",n_projects:"Proyek",n_journey:"Perjalanan",n_contact:"Kontak",
role:"Pelajar, calon developer dan desainer UI/UX.",
hero_p:"Saya membangun untuk web dan dunia fisik: antarmuka, kode, dan eksperimen IoT kecil.",
cta1:"Lihat proyek",cta2:"Hubungi saya",
about_h:"Pelajar yang suka membuat sesuatu berfungsi.",
about_p1:"Saya pelajar di IDN Boarding School, Indonesia, yang tertarik pada pengembangan web, pemrograman, desain UI/UX, IoT, dan elektronika.",
about_p2:"[Placeholder: tambahkan beberapa kalimat tentang awal mula kamu tertarik pada teknologi dan apa yang ingin dipelajari berikutnya.]",
f1:"Sekolah",f2:"Lokasi",f3:"Fokus",f4:"Bahasa",
skills_h:"Bidang yang saya tekuni",s1:"Pengembangan web",s2:"Aplikasi mobile",s3:"Desain UI/UX",s4:"IoT dan elektronika",
s_note:"[Dapat diedit: ubah daftar ini sesuai yang benar-benar kamu gunakan.]",
proj_h:"Proyek",
pp_intro:"Hal-hal yang sudah saya bangun dan yang masih saya kerjakan, di bidang web, mobile, UI/UX, dan IoT.",
pp_cta_h:"Punya ide atau masukan?",pp_empty:"Proyek akan segera ditambahkan.",
st_progress:"Sedang dikerjakan",st_done:"Selesai",l_demo:"Lihat demo",l_code:"Kode sumber",
j_h:"Perjalanan",j_now:"Sekarang",j1:"Pelajar di IDN Boarding School",j1p:"Belajar dan membangun di bidang web, UI/UX, dan IoT.",
j2:"[Placeholder: proyek pertama atau momen pertama kamu belajar coding]",j3:"[Placeholder: pencapaian berikutnya]",
c_h:"Mari berbincang",c_p:"Terbuka untuk pertanyaan, kolaborasi, dan masukan tentang proyek saya.",
c_note:"[Dapat diedit: ganti email dan tautan # dengan milik kamu.]",
l_name:"Nama",l_msg:"Pesan",send:"Kirim pesan"};

/* ---------- Projects page: build cards from PROJECTS (projects.js) ---------- */
// Runs before the language setup so the generated labels get translated too.
const list=document.getElementById("project-list");
if(list)renderProjects(list,typeof PROJECTS!=="undefined"?PROJECTS:[]);

function make(tag,cls,text){
  const e=document.createElement(tag);
  if(cls)e.className=cls;
  if(text!=null)e.textContent=text; // textContent, never innerHTML: data is shown as plain text
  return e;
}
// Only allow normal web links (blocks things like "javascript:" URLs).
function safeUrl(u){
  if(!u||u==="#")return "";
  try{const x=new URL(u,location.href);return ["http:","https:","mailto:",location.protocol].includes(x.protocol)?x.href:""}
  catch(_){return ""}
}
// Shown when a project has no image, or the image path is wrong.
function fallback(media,title){
  media.className="media empty";
  media.setAttribute("aria-hidden","true");
  const s=make("span");
  s.append(make("i",null,">"),String(title||"project").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"project");
  media.replaceChildren(s);
}
function renderProjects(root,items){
  if(!items.length){const p=make("p","note","Projects are on the way.");p.dataset.i18n="pp_empty";root.append(p);return}
  // Featured project first; the rest keep their order from projects.js.
  items.slice().sort((a,b)=>(b.featured?1:0)-(a.featured?1:0)).forEach(p=>{
    const card=make("article","card"+(p.featured?" feat":""));
    card.dataset.reveal="";

    const media=make("div","media");
    if(p.image){
      const img=make("img");
      img.alt="";img.decoding="async";img.loading=p.featured?"eager":"lazy";
      img.onerror=()=>fallback(media,p.title);
      img.src=p.image;
      media.append(img);
    }else fallback(media,p.title);

    const body=make("div","cbody");
    const meta=make("div","meta");
    if(p.status){
      const done=p.status==="done";
      const t=make("span","tag"+(done?" done":""),done?"Completed":"In progress");
      t.dataset.i18n=done?"st_done":"st_progress";
      meta.append(t);
    }
    if(p.year)meta.append(make("span",null,p.year));
    if(meta.childElementCount)body.append(meta);

    body.append(make("h2",null,p.title||"Untitled"));

    const desc=typeof p.desc==="string"?{en:p.desc,id:p.desc}:(p.desc||{});
    if(desc.en||desc.id){
      const d=make("p");
      d.dataset.textEn=desc.en||desc.id;d.dataset.textId=desc.id||desc.en;
      d.textContent=d.dataset.textEn;
      body.append(d);
    }

    if(Array.isArray(p.stack)&&p.stack.length){
      const ul=make("ul","stack");
      p.stack.forEach(s=>ul.append(make("li",null,s)));
      body.append(ul);
    }

    const links=make("div","plinks");
    [["demo","l_demo","Live demo"],["code","l_code","Source code"]].forEach(([k,key,label])=>{
      const url=safeUrl(p.links&&p.links[k]);
      if(!url)return;
      const a=make("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";
      const t=make("span",null,label);t.dataset.i18n=key;
      const arrow=make("span",null," ↗");arrow.setAttribute("aria-hidden","true");
      a.append(t,arrow);links.append(a);
    });
    if(links.childElementCount)body.append(links);

    card.append(media,body);
    root.append(card);
  });
}

/* ---------- Language (EN / ID) ---------- */
const els=[...document.querySelectorAll("[data-i18n]")];
els.forEach(e=>e.dataset.en=e.textContent);
const pairs=[...document.querySelectorAll("[data-text-en]")]; // project descriptions
const btn=document.getElementById("lang");

function setLang(l){
  document.documentElement.lang=l;
  els.forEach(e=>{e.textContent=l==="id"&&ID[e.dataset.i18n]?ID[e.dataset.i18n]:e.dataset.en});
  pairs.forEach(e=>{e.textContent=l==="id"?e.dataset.textId:e.dataset.textEn});
  btn.textContent=l==="id"?"EN":"ID";
  try{localStorage.setItem("lang",l)}catch(_){}
}
let lang="en";
try{lang=localStorage.getItem("lang")==="id"?"id":"en"}catch(_){}
setLang(lang);
btn.addEventListener("click",()=>setLang(document.documentElement.lang==="id"?"en":"id"));

/* ---------- Mobile menu ---------- */
const burger=document.getElementById("burger"),links=document.getElementById("links");
const closeMenu=()=>{links.classList.remove("open");burger.setAttribute("aria-expanded","false")};
burger.addEventListener("click",()=>{burger.setAttribute("aria-expanded",links.classList.toggle("open"))});
links.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));

/* ---------- Contact form (home page only) ---------- */
// Opens the visitor's email app (replace the address below)
const form=document.getElementById("form");
if(form)form.addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  location.href="mailto:your.email@example.com?subject="+encodeURIComponent("Message from "+f.get("name"))+"&body="+encodeURIComponent(f.get("msg"));
});

const yr=document.getElementById("yr");
if(yr)yr.textContent=new Date().getFullYear();

/* ---------- Motion ---------- */
// Off when the visitor asks for reduced motion, or the browser is too old.
const root=document.documentElement;
const animate=root.classList.contains("js")
  &&!matchMedia("(prefers-reduced-motion: reduce)").matches
  &&"IntersectionObserver" in window;

if(!animate){
  root.classList.remove("js"); // show everything as-is
}else{
  // Scroll reveal: elements with data-reveal fade up when they enter the screen.
  // Elements entering together get a small delay each, so they appear one after another.
  const io=new IntersectionObserver(entries=>{
    let i=0;
    entries.forEach(en=>{
      if(!en.isIntersecting)return;
      en.target.style.setProperty("--dl",Math.min(i++,6)*.08+"s");
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  },{rootMargin:"0px 0px -6% 0px",threshold:.1});
  document.querySelectorAll("[data-reveal]").forEach(e=>io.observe(e));

  // Serial monitor: type each line character by character.
  const term=document.querySelector(".term");
  if(term){
    const lines=[...term.querySelectorAll("p")];
    const spans=lines.map(p=>p.querySelector("span"));
    const full=spans.map(s=>s.textContent);
    const cur=term.querySelector(".cur");
    spans.forEach(s=>s.textContent="");
    lines[0].classList.add("on");lines[0].append(cur); // blinking cursor waits on line 1
    let li=0,ci=0;
    const type=()=>{
      if(li===lines.length){term.classList.remove("typing");return}
      if(ci===0){lines[li].classList.add("on");lines[li].append(cur)}
      if(ci<full[li].length){spans[li].textContent+=full[li][ci++];setTimeout(type,22+Math.random()*28)}
      else{li++;ci=0;setTimeout(type,200)}
    };
    new IntersectionObserver((es,o)=>{
      if(!es.some(e=>e.isIntersecting))return;
      o.disconnect();
      setTimeout(()=>{term.classList.add("typing");type()},700);
    }).observe(term);
  }
}
