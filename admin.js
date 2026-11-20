/* Admin proyek: edit daftar proyek (projects.js) lewat form, tanpa edit kode. */
const $=s=>document.querySelector(s);
const F=$("#f");
const loaded=typeof PROJECTS!=="undefined";
let sel=0,dirty=false,dir=null;

function norm(p){
  const d=typeof p.desc==="string"?{en:p.desc,id:p.desc}:(p.desc||{}),l=p.links||{};
  return{title:p.title||"",status:p.status==="done"?"done":"progress",year:p.year||"",featured:!!p.featured,
    desc:{en:d.en||"",id:d.id||""},stack:Array.isArray(p.stack)?p.stack.slice():[],image:p.image||"",
    links:{demo:l.demo||"",code:l.code||""}};
}
let data=(loaded?PROJECTS:[]).map(norm);

const HEAD=`/* Dibuat oleh admin.html, boleh juga diedit manual.
   status: "progress" atau "done". featured: true hanya untuk satu proyek.
   desc: en = Inggris, id = Indonesia. image: "img/nama.png" atau "". links: "" kalau tidak ada. */
`;
const serialize=()=>HEAD+"const PROJECTS = "+JSON.stringify(data,null,2)+";\n";

function toast(m){$("#msg").textContent=m}
function touch(){dirty=true;toast("Ada perubahan yang belum disimpan.")}

function renderList(){
  const ul=$("#list");ul.replaceChildren();
  data.forEach((p,i)=>{
    const li=document.createElement("li"),b=document.createElement("button");
    b.type="button";b.className="a-item"+(i===sel?" on":"");
    const t=document.createElement("strong"),m=document.createElement("span");
    t.textContent=p.title||"(tanpa judul)";
    m.textContent=[p.featured&&"Utama",p.status==="done"?"Selesai":"Sedang dikerjakan"].filter(Boolean).join(", ");
    b.append(t,m);
    b.onclick=()=>{sel=i;renderList();fill()};
    li.append(b);ul.append(li);
  });
}

function preview(){
  const p=data[sel],img=$("#pv");
  img.hidden=true;
  if(!p||!p.image)return;
  img.onload=()=>{img.hidden=false};img.onerror=()=>{img.hidden=true};
  img.src=p.image;
}

function fill(){
  const p=data[sel];
  F.hidden=!p;$("#empty").hidden=!!p;
  if(!p)return;
  const e=F.elements;
  e.title.value=p.title;e.status.value=p.status;e.year.value=p.year;e.featured.checked=p.featured;
  e.d_en.value=p.desc.en;e.d_id.value=p.desc.id;e.stack.value=p.stack.join(", ");
  e.image.value=p.image;e.demo.value=p.links.demo;e.code.value=p.links.code;
  preview();
}

F.addEventListener("submit",e=>e.preventDefault());
F.addEventListener("input",ev=>{
  const p=data[sel],e=F.elements;
  if(!p)return;
  p.title=e.title.value;p.status=e.status.value;p.year=e.year.value.trim();
  p.desc.en=e.d_en.value;p.desc.id=e.d_id.value;
  p.stack=e.stack.value.split(",").map(s=>s.trim()).filter(Boolean);
  p.image=e.image.value.trim();p.links.demo=e.demo.value.trim();p.links.code=e.code.value.trim();
  if(e.featured.checked!==p.featured){ // cuma boleh satu proyek utama
    p.featured=e.featured.checked;
    if(p.featured)data.forEach((q,i)=>{if(i!==sel)q.featured=false});
  }
  touch();renderList();
  if(ev.target.name==="image")preview();
});

$("#add").onclick=()=>{data.push(norm({title:"Proyek baru"}));sel=data.length-1;touch();renderList();fill();F.elements.title.select()};
function move(d){
  const j=sel+d;
  if(j<0||j>=data.length)return;
  [data[sel],data[j]]=[data[j],data[sel]];sel=j;touch();renderList();
}
$("#up").onclick=()=>move(-1);
$("#dn").onclick=()=>move(1);
$("#del").onclick=()=>{
  const p=data[sel];
  if(!p||!confirm('Hapus proyek "'+(p.title||"tanpa judul")+'"?'))return;
  data.splice(sel,1);sel=Math.max(0,Math.min(sel,data.length-1));
  touch();renderList();fill();
};

/* ---------- Server: login, simpan, upload ---------- */
async function api(url,opt={}){
  const r=await fetch(url,{...opt,headers:{"X-Requested-With":"admin",...opt.headers}});
  if(r.status===401){location.href="login.html";throw new Error("Sesi habis, silakan login lagi.")}
  if(!r.ok){let m="Error "+r.status;try{m=(await r.json()).error||m}catch(_){}throw new Error(m)}
  return r.json();
}
$("#pick").onclick=()=>$("#file").click();
$("#file").onchange=async ev=>{
  const f=ev.target.files[0];ev.target.value="";
  if(!f)return;
  toast("Mengunggah gambar...");
  try{
    const r=await api("/api/upload?name="+encodeURIComponent(f.name),{method:"POST",headers:{"Content-Type":f.type},body:f});
    const im=F.elements.image;im.value=r.path;
    im.dispatchEvent(new Event("input",{bubbles:true}));
    toast("Gambar terunggah. Klik Simpan untuk menerapkannya.");
  }catch(err){toast("Gagal unggah: "+err.message)}
};
async function save(){
  if(!loaded&&!confirm("projects.js tidak terbaca, jadi daftar ini mulai dari kosong. Tetap lanjut dan timpa file lama?"))return;
  try{
    await api("/api/projects",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    dirty=false;toast("Tersimpan. Proyek sudah tampil di projects.html.");
  }catch(err){toast("Gagal menyimpan: "+err.message)}
}
$("#save").onclick=save;
$("#out").onclick=async()=>{try{await api("/api/logout",{method:"POST"})}catch(_){}location.href="login.html"};
addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="s"){e.preventDefault();save()}});
addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});

if(!loaded)toast("projects.js tidak ditemukan. Taruh admin.html di folder yang sama dengan projects.js.");
renderList();fill();
