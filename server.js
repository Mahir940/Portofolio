// Server portfolio: file statis + login admin + simpan proyek + upload gambar. Tanpa dependency (Node 18+).
// Jalankan:  ADMIN_PASSWORD="password-panjang-kamu" node server.js   lalu buka http://localhost:3000
const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const ROOT=__dirname,PORT=process.env.PORT||3000,PASS=process.env.ADMIN_PASSWORD||"";
if(PASS.length<8){console.error('Isi ADMIN_PASSWORD (minimal 8 karakter) dulu, contoh:\n  ADMIN_PASSWORD="password-panjang-kamu" node server.js');process.exit(1)}

const sha=s=>crypto.createHash("sha256").update(s).digest(),PASS_HASH=sha(PASS);
const sessions=new Map(),fails=new Map(),TTL=8*3600e3; // sesi login 8 jam
const MIME={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif",".ico":"image/x-icon",".txt":"text/plain; charset=utf-8"};
const IMG={"image/png":".png","image/jpeg":".jpg","image/webp":".webp","image/gif":".gif"};
const GATED=new Set(["/admin.html","/admin.js","/admin.css"]); // cuma bisa dibuka setelah login
const DENY=/(^|\/)(\.|server\.js$|package(-lock)?\.json$|node_modules)/i;
const HEAD=`/* Dibuat oleh admin. Boleh juga diedit manual.
   status: "progress" atau "done". featured: true hanya untuk satu proyek.
   desc: en = Inggris, id = Indonesia. image: "img/nama.png" atau "". links: "" kalau tidak ada. */
`;

const send=(res,code,obj,h={})=>{res.writeHead(code,{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...h});res.end(JSON.stringify(obj))};
const cookie=(req,v,age)=>`sid=${v}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}`+((req.socket.encrypted||req.headers["x-forwarded-proto"]==="https")?"; Secure":"");
function session(req){
  const m=/(?:^|; )sid=([a-f0-9]{64})/.exec(req.headers.cookie||""),t=m&&m[1],exp=t&&sessions.get(t);
  if(exp&&exp>Date.now())return t;
  if(t)sessions.delete(t);
  return null;
}
function body(req,max){
  return new Promise((ok,no)=>{
    const a=[];let n=0;
    req.on("data",c=>{n+=c.length;if(n>max){no(Object.assign(new Error("besar"),{code:413}));req.destroy()}else a.push(c)});
    req.on("end",()=>ok(Buffer.concat(a)));req.on("error",no);
  });
}
const magic=(b,t)=>t==="image/png"?b.subarray(0,4).equals(Buffer.from([0x89,0x50,0x4e,0x47])):t==="image/jpeg"?(b[0]===0xff&&b[1]===0xd8):t==="image/gif"?b.subarray(0,3).toString()==="GIF":(b.subarray(0,4).toString()==="RIFF"&&b.subarray(8,12).toString()==="WEBP");

// Data dari browser tidak dipercaya: dibersihkan dan dibatasi sebelum ditulis ke projects.js
const str=(v,n)=>typeof v==="string"?v.trim().slice(0,n):"";
const link=v=>{v=str(v,300);return /^https?:\/\//i.test(v)?v:""};
function clean(list){
  if(!Array.isArray(list)||list.length>100)throw new Error("invalid");
  let feat=false;
  return list.map(p=>{
    p=p||{};const d=p.desc||{},l=p.links||{},f=!!p.featured&&!feat,img=str(p.image,80);
    feat=feat||f;
    return{title:str(p.title,120),status:p.status==="done"?"done":"progress",year:str(p.year,12),featured:f,
      desc:{en:str(d.en,1200),id:str(d.id,1200)},
      stack:(Array.isArray(p.stack)?p.stack:[]).slice(0,20).map(s=>str(s,40)).filter(Boolean),
      image:/^img\/[a-z0-9._-]+\.(png|jpe?g|webp|gif)$/i.test(img)?img:"",
      links:{demo:link(l.demo),code:link(l.code)}};
  });
}

async function api(req,res,url){
  const p=url.pathname;
  if(req.method!=="GET"&&!req.headers["x-requested-with"])return send(res,403,{error:"Permintaan ditolak."});

  if(p==="/api/login"&&req.method==="POST"){
    const ip=(process.env.TRUST_PROXY&&(req.headers["x-forwarded-for"]||"").split(",")[0].trim())||req.socket.remoteAddress;
    const f=fails.get(ip)||{n:0,until:0};
    if(f.until>Date.now())return send(res,429,{error:"Terlalu banyak percobaan. Coba lagi dalam beberapa menit."});
    let pw="";try{pw=String(JSON.parse((await body(req,2048)).toString()).password||"")}catch(_){}
    if(crypto.timingSafeEqual(sha(pw),PASS_HASH)){
      fails.delete(ip);
      const t=crypto.randomBytes(32).toString("hex");sessions.set(t,Date.now()+TTL);
      return send(res,200,{ok:true},{"Set-Cookie":cookie(req,t,TTL/1000)});
    }
    if(++f.n>=5){f.until=Date.now()+10*60e3;f.n=0}
    fails.set(ip,f);
    return send(res,401,{error:"Password salah."});
  }

  const sid=session(req);
  if(!sid)return send(res,401,{error:"Belum login."});
  if(p==="/api/me")return send(res,200,{ok:true});
  if(p==="/api/logout"&&req.method==="POST"){sessions.delete(sid);return send(res,200,{ok:true},{"Set-Cookie":cookie(req,"",0)})}

  if(p==="/api/projects"&&req.method==="PUT"){
    let list;
    try{list=clean(JSON.parse((await body(req,1e6)).toString()))}catch(e){return send(res,e.code===413?413:400,{error:"Data proyek tidak valid."})}
    const out=path.join(ROOT,"projects.js");
    fs.writeFileSync(out+".tmp",HEAD+"const PROJECTS = "+JSON.stringify(list,null,2)+";\n");
    fs.renameSync(out+".tmp",out);
    return send(res,200,{ok:true,count:list.length});
  }

  if(p==="/api/upload"&&req.method==="POST"){
    const type=(req.headers["content-type"]||"").split(";")[0].trim(),ext=IMG[type];
    if(!ext)return send(res,415,{error:"Format harus PNG, JPG, WEBP, atau GIF."});
    const buf=await body(req,5e6);
    if(!magic(buf,type))return send(res,415,{error:"Isi file bukan gambar yang valid."});
    const base=path.parse(url.searchParams.get("name")||"").name.toLowerCase().replace(/[^a-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"gambar";
    const file=base+"-"+crypto.randomBytes(3).toString("hex")+ext;
    fs.mkdirSync(path.join(ROOT,"img"),{recursive:true});
    fs.writeFileSync(path.join(ROOT,"img",file),buf);
    return send(res,200,{path:"img/"+file});
  }
  send(res,404,{error:"Tidak ditemukan."});
}

function serve(req,res,p){
  if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405);return res.end()}
  let rel;try{rel=decodeURIComponent(p)}catch(_){res.writeHead(400);return res.end()}
  if(rel==="/")rel="/index.html";else if(rel==="/admin")rel="/admin.html";
  const file=path.join(ROOT,rel);
  const miss=()=>{res.writeHead(404,{"Content-Type":"text/plain"});res.end("404")};
  if(rel.includes("\0")||!file.startsWith(ROOT+path.sep)||DENY.test(rel))return miss();
  if(GATED.has(rel.toLowerCase())&&!session(req)){res.writeHead(302,{Location:"/login.html"});return res.end()}
  fs.stat(file,(e,st)=>{
    const type=MIME[path.extname(file).toLowerCase()];
    if(e||!st.isFile()||!type)return miss();
    res.writeHead(200,{"Content-Type":type,"X-Content-Type-Options":"nosniff","Cache-Control":rel.startsWith("/img/")?"public, max-age=3600":"no-cache"});
    if(req.method==="HEAD")return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,"http://x");
    if(url.pathname.startsWith("/api/"))await api(req,res,url);else serve(req,res,url.pathname);
  }catch(e){send(res,e.code===413?413:500,{error:e.code===413?"File terlalu besar (maks 5 MB).":"Terjadi kesalahan di server."})}
}).listen(PORT,()=>console.log("Situs jalan di http://localhost:"+PORT+"  (admin: /admin)"));
