'use strict';
const canvas=document.querySelector('#battle'),g=canvas.getContext('2d'),scrub=document.querySelector('#scrub'),attack=document.querySelector('#attack'),state=document.querySelector('#state');
const make=()=>{const c=document.createElement('canvas');c.width=128;c.height=256;return c;};
let active=14,meta,rig,roster,elapsed=-1,last=0,clock=0,playing=true,speed=1,token=0;
const plateImage=new Image();const plateReady=new Promise((resolve,reject)=>{plateImage.onload=resolve;plateImage.onerror=()=>reject(Error('遮挡底图加载失败'));});plateImage.src='attack-body-plates.png';
let idlePlayback='';
const cache=new Map(),frame=document.createElement('iframe');frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;document.body.append(frame);frame.onload=()=>{idlePlayback='';syncIdle();};
function syncIdle(){const key=active+':'+playing+':'+speed;if(key===idlePlayback)return;const control=frame.contentWindow?.setRosterPlayback;if(typeof control==='function'){control({playing,speed});idlePlayback=key;}}
function trace(q,points){q.beginPath();points.forEach(([x,y],i)=>i?q.lineTo(x/4,y/4):q.moveTo(x/4,y/4));q.closePath();}
function build(image,c){
 const base=make(),q=base.getContext('2d');q.imageSmoothingEnabled=false;q.drawImage(image,0,0,512,1024,0,0,128,256);
 if(c.rangedRig)return RangedRig.build(image,c.name==='隼'?5:13);
 if(c.layerRig)return JinLayerRig.build(image,plateImage);
 if(c.poseAtlas)return{base};
 const mask=make(),mq=mask.getContext('2d'),parts=c.limbs.map(l=>{const a=make(),z=a.getContext('2d');trace(z,l.polygon);z.clip();z.drawImage(base,0,0);trace(mq,l.polygon);mq.fill();return a;});
 const body=make(),bq=body.getContext('2d');bq.drawImage(base,0,0);
 bq.globalCompositeOperation='destination-out';bq.drawImage(mask,0,0);bq.globalCompositeOperation='source-over';
 const repair=make(),rq=repair.getContext('2d'),col=c.name==='烬'?0:c.name==='赫恩'?1:2;
 rq.imageSmoothingEnabled=false;rq.drawImage(plateImage,col*512,0,512,1024,0,0,128,256);
 const pix=rq.getImageData(0,0,128,256);for(let i=3;i<pix.data.length;i+=4)pix.data[i]=pix.data[i]>=128?255:0;rq.putImageData(pix,0,0);
 rq.globalCompositeOperation='destination-in';rq.drawImage(mask,0,0);bq.drawImage(repair,0,0);
 const capes=[];
 if(c.name==='烬'){
  // Only the two exposed cloth tails: dark outlines included, body and weapon excluded.
  const regions=[[30,506,125,741],[461,598,503,835]];
  for(const [x,y,r,b] of regions){
   const piece=make(),pq=piece.getContext('2d');pq.drawImage(body,0,0);
   const pixels=pq.getImageData(0,0,128,256),d=pixels.data;
   for(let Y=0;Y<256;Y++)for(let X=0;X<128;X++){const i=(Y*128+X)*4;
    if(X*4<x||X*4>r||Y*4<y||Y*4>b||d[i]<d[i+1]*1.3||d[i]<d[i+2]*1.15)d[i+3]=0;
   }pq.putImageData(pixels,0,0);bq.globalCompositeOperation='destination-out';bq.drawImage(piece,0,0);bq.globalCompositeOperation='source-over';capes.push({image:piece,top:y,bottom:b});
  }
 }
 return{base,body,parts,capes};
}
function loadPoseAtlas(c){return new Promise((resolve,reject)=>{const image=new Image();image.onerror=()=>reject(Error('攻击动作帧加载失败'));image.onload=()=>{
 const poses=c.poseFrames.map(f=>{const [x,y,right,bottom]=f.rect,w=right-x,h=bottom-y,out=document.createElement('canvas');out.width=Math.ceil(w/2);out.height=Math.ceil(h/2);const q=out.getContext('2d');q.imageSmoothingEnabled=false;
 if(f.polygon){q.beginPath();f.polygon.forEach(([X,Y],i)=>i?q.lineTo((X-x)/2,(Y-y)/2):q.moveTo((X-x)/2,(Y-y)/2));q.closePath();q.clip();}
 q.drawImage(image,x,y,w,h,0,0,w/2,h/2);
 // Reject isolated pieces of neighboring sprites at atlas boundaries.
 const pixels=q.getImageData(0,0,out.width,out.height),data=pixels.data,seen=new Uint8Array(out.width*out.height),groups=[];
 for(let seed=0;seed<seen.length;seed++){if(seen[seed]||data[seed*4+3]<128)continue;const queue=[seed];seen[seed]=1;for(let j=0;j<queue.length;j++){const i=queue[j],X=i%out.width,Y=Math.floor(i/out.width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=X+dx,yy=Y+dy;if(xx<0||xx>=out.width||yy<0||yy>=out.height)continue;const n=yy*out.width+xx;if(!seen[n]&&data[n*4+3]>=128){seen[n]=1;queue.push(n);}}}groups.push(queue);}
 const largest=Math.max(0,...groups.map(g=>g.length)),keep=new Uint8Array(seen.length);for(const group of groups)if(group.length>=largest*.12)for(const i of group)keep[i]=1;
 for(let i=0;i<seen.length;i++)data[i*4+3]=keep[i]?255:0;q.putImageData(pixels,0,0);return out;});
 if(c.poseAtlas==='feique-shooting-v2.png'){
  // Keep the approved extended-arm silhouette; recoil pitches the same gun/forearm pixels upward.
  const aim=poses[1],recoil=document.createElement('canvas');recoil.width=aim.width;recoil.height=aim.height;
  const patch=document.createElement('canvas');patch.width=aim.width;patch.height=aim.height;
  const points=[[800,284],[875,275],[887,232],[1025,232],[1025,259],[1068,266],[1068,304],[1012,310],[1000,341],[944,354],[896,347],[845,343],[800,326]];
  const path=q=>{q.beginPath();points.forEach(([x,y],i)=>i?q.lineTo((x-512)/2,y/2):q.moveTo((x-512)/2,y/2));q.closePath();};
  const pq=patch.getContext('2d');path(pq);pq.clip();pq.drawImage(aim,0,0);
  const rq=recoil.getContext('2d');rq.imageSmoothingEnabled=false;rq.drawImage(aim,0,0);rq.globalCompositeOperation='destination-out';path(rq);rq.fill();rq.globalCompositeOperation='source-over';
  rq.translate((800-512)/2,320/2);rq.rotate(-.035);rq.drawImage(patch,-(800-512)/2,-320/2);
  poses[2]=recoil;
 }
 resolve(poses);};image.src=c.poseAtlas;});}
async function select(id){
 if(id===5||id===13){location.href=id===5?'xun-motion.html':'shuangling-motion.html';return;}
 const current=++token;active=id;elapsed=-1;rig=null;playing=true;document.querySelector('#pause').textContent='暂停';attack.disabled=true;
 const c=RosterAttacks.actors[id];document.querySelector('#heading').textContent=c.name+' · '+c.move;document.querySelector('#description').textContent=c.description;
 document.querySelectorAll('[data-id]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.id===id)));scrub.max=c.duration;scrub.value=0;document.querySelector('#hits').textContent='命中 0 / '+c.impacts.length;state.textContent='载入中…';g.clearRect(0,0,800,420);
 try{await plateReady;if(current!==token)return;meta=roster.find(m=>m.id===id);if(!cache.has(id))cache.set(id,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(build(im,c));im.onerror=()=>reject(Error('素材载入失败，请刷新'));im.src='roster-assets--'+meta.file;}));const result=await cache.get(id);if(c.poseAtlas&&!result.poses)result.poses=await loadPoseAtlas(c);if(current!==token)return;rig=result;frame.src='index.html?actor='+id;attack.disabled=false;draw();}catch(e){if(current===token)state.textContent=e.message;}
}
function target(c){let kick=0;for(const t of c.impacts){const d=elapsed-t;if(d>=0&&d<200)kick=Math.max(kick,Math.sin(d/200*Math.PI));}g.save();g.translate(640+kick*7,338);g.rotate(kick*.035);g.fillStyle=kick>.2?c.color:'#535469';g.fillRect(-38,-110,76,98);g.fillRect(-48,-80,16,65);g.fillRect(32,-80,16,65);g.fillRect(-30,-20,20,20);g.fillRect(10,-20,20,20);g.fillStyle='#242739';g.fillRect(-25,-94,50,24);g.fillStyle='#e2c5ff';g.fillRect(-20,-88,11,6);g.fillRect(9,-88,11,6);g.restore();}
function effects(c){if(!document.querySelector('#effects').checked)return;g.save();g.strokeStyle=c.color;g.lineWidth=3;
 for(let i=0;i<c.launches.length;i++){const u=(elapsed-c.launches[i])/(c.impacts[i]-c.launches[i]);if(u<0||u>1)continue;const start=active===6?(i===0?[266,174]:[285,184]):[335,230],x=start[0]+u*(635-start[0]),y=start[1]+u*(230-start[1]);g.beginPath();if(active===5||active===13){g.moveTo(x-22,y);g.lineTo(x,y);if(active===13){g.moveTo(x-6,y-4);g.lineTo(x,y);g.lineTo(x-6,y+4);}}else if(active===6){g.moveTo(x-14,y-2);g.lineTo(x,y);}else if(active===1){g.moveTo(x-7,204);g.lineTo(x+6,230);g.lineTo(x-7,256);}else if(active===14){const direction=i===0?1:-1;g.moveTo(x-24,230-direction*30);g.quadraticCurveTo(x+12,230-direction*8,x+24,230+direction*30);}else{g.moveTo(x-15,202);g.quadraticCurveTo(x+20,230,x-15,258);}g.stroke();}
 for(const time of c.impacts){const t=(elapsed-time)/200;if(t<0||t>1)continue;g.globalAlpha=1-t;g.fillStyle=c.color;for(let j=0;j<8;j++){const a=j*Math.PI/4;g.fillRect((active===1?592:635)+Math.cos(a)*(8+30*t),(active===1?260:230)+Math.sin(a)*(8+30*t),3,3);}}g.restore();}
function draw(){if(!rig)return;syncIdle();const c=RosterAttacks.actors[active],p=RosterAttacks.sample(active,elapsed),cell=meta.cells[0];
 const bodyTop=Math.max(cell.bounds[1],meta.eyes[1]-60),scale=meta.height*1.1/(cell.foot-bodyTop);
 g.clearRect(0,0,800,420);g.imageSmoothingEnabled=false;g.fillStyle='#70809944';g.fillRect(40,339,720,1);g.fillStyle='#080b14aa';g.beginPath();g.ellipse(230+p.x,339,45,6,0,0,Math.PI*2);g.ellipse(640,339,50,7,0,0,Math.PI*2);g.fill();target(c);
 const live=frame.contentDocument?.querySelector('#actor');
 if((p.idle||p.poseFrame===-1)&&live?.dataset.character===String(active))g.drawImage(live,230-128*1.1,338-242*1.1,256*1.1,256*1.1);
 else if(c.rangedRig){g.save();g.translate(230,338);g.scale(scale,scale);g.translate(-cell.anchor,-cell.foot);RangedRig.draw(g,rig,p);g.restore();}
 else if(c.layerRig){g.save();g.translate(230,338);g.scale(scale,scale);g.translate(-cell.anchor,-cell.foot);JinLayerRig.draw(g,rig,p);g.restore();}
 else if(c.poseAtlas&&p.poseFrame>=0){
 const f=c.poseFrames[p.poseFrame],im=rig.poses[p.poseFrame],s=c.poseScale;
 g.drawImage(im,230+p.x+(p.recoilX||0)+(f.rect[0]-f.anchor)*s,338+(f.rect[1]-f.foot)*s,(f.rect[2]-f.rect[0])*s,(f.rect[3]-f.rect[1])*s);
 }else{
 g.save();g.translate(230,338);g.rotate(p.lean);if(meta.flip)g.scale(-1,1);g.scale(scale,scale);g.translate(-cell.anchor,-cell.foot);
 if(c.poseAtlas||Math.abs(p.power)<.0001)g.drawImage(rig.base,0,0,512,1024);
 else{
 for(const part of rig.capes||[]){
  for(let row=Math.floor(part.top/4);row<=Math.ceil(part.bottom/4);row++){
   const t=Math.max(0,Math.min(1,(row*4-part.top)/(part.bottom-part.top)));
   const dx=(p.cape||0)*t*t;
   g.drawImage(part.image,0,row,128,1,dx,row*4,512,4);
  }
 }
 g.drawImage(rig.body,0,0,512,1024);c.limbs.forEach((l,i)=>{
 const recoil=p.recoil[i]||0;g.save();g.translate(l.shoulder[0],l.shoulder[1]);g.rotate((p.upper??l.upper*p.power)-recoil);g.translate(-l.shoulder[0],-l.shoulder[1]);
 // Forearm/weapon hinge, with a small sleeve overlap over its root.
 g.save();g.translate(l.elbow[0]+(l.shift||0)*p.power,l.elbow[1]);g.rotate((p.lower??l.lower*p.power)-recoil*.5);g.translate(-l.elbow[0],-l.elbow[1]);
 const cut=l.elbow[1]-8;g.drawImage(rig.parts[i],0,cut/4,128,(1024-cut)/4,0,cut,512,1024-cut);g.restore();
 const end=l.elbow[1]+8;g.drawImage(rig.parts[i],0,0,128,end/4,0,0,512,end);g.restore();
 });}g.restore();}
 effects(c);state.textContent=p.label+(c.poseAtlas&&p.poseFrame>=0?' · 动作帧 '+(p.poseFrame+1)+'/'+c.poseFrames.length:'');document.querySelector('#hits').textContent=`命中 ${p.hits} / ${c.impacts.length}`;scrub.value=Math.max(0,elapsed);canvas.dataset.character=String(active);canvas.dataset.phase=p.label;attack.disabled=false;
}
attack.onclick=()=>{if(!rig)return;elapsed=0;playing=true;document.querySelector('#pause').textContent='暂停';draw();};
document.querySelector('#pause').onclick=e=>{playing=!playing;e.target.textContent=playing?'暂停':'播放';};
document.querySelector('#speed').onchange=e=>speed=+e.target.value;
document.querySelector('#effects').onchange=draw;
scrub.oninput=e=>{elapsed=+e.target.value;playing=false;document.querySelector('#pause').textContent='播放';draw();};
document.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>select(+b.dataset.id));
function tick(t){const dt=last?Math.min(t-last,50):0;last=t;if(playing&&!document.hidden){clock+=dt;const c=RosterAttacks.actors[active];if(elapsed>=0)elapsed=Math.min(c.duration,elapsed+dt*speed);}draw();requestAnimationFrame(tick);}requestAnimationFrame(tick);
fetch('roster-assets--roster.json').then(r=>{if(!r.ok)throw Error('角色列表加载失败');return r.json();}).then(data=>{roster=data;const requested=Number(new URLSearchParams(location.search).get('actor'));select([1,6,14].includes(requested)?requested:14);}).catch(e=>state.textContent=e.message);
