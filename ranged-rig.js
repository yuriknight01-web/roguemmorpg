(function(root){
const configs={
5:{duration:2100,launch:900,impact:1020,grip:[232,458],elbow:[166,416],parts:[
['hand',[[203,425],[242,427],[260,449],[259,489],[236,503],[208,482]]],
['weapon',[[172,285],[208,285],[247,350],[268,346],[289,376],[308,437],[340,503],[333,529],[371,679],[465,951],[446,964],[414,887],[328,740],[294,660],[255,575],[227,556],[208,510],[220,476],[210,408],[187,350]]],
['upper',[[141,276],[188,285],[184,340],[174,381],[165,417],[133,421],[111,400],[114,351]]],
['forearm',[[143,388],[177,397],[211,417],[220,441],[200,458],[161,440],[139,425]]],
['support',[[383,494],[404,515],[420,563],[425,596],[411,621],[395,603],[387,568],[372,527]]]
]},
13:{duration:2400,launch:1230,impact:1410,grip:[445,423],elbow:[351,407],parts:[
['hand',[[429,393],[459,390],[467,410],[464,445],[444,458],[425,438]]],
['weapon',[[394,34],[428,88],[449,139],[464,203],[484,258],[499,315],[501,377],[476,380],[461,402],[461,462],[491,495],[499,540],[481,599],[448,671],[405,746],[313,882],[299,868],[348,771],[391,692],[425,620],[447,544],[430,496],[427,455],[427,392],[441,338],[449,289],[447,224],[428,148],[396,103]]],
['upper',[[293,323],[334,331],[367,374],[371,410],[340,427],[318,395],[299,371]]],
['forearm',[[328,384],[369,389],[395,405],[430,408],[431,442],[393,445],[351,432],[326,413]]],
['support',[[118,488],[141,480],[162,497],[160,527],[145,550],[121,548],[113,529]]]
]}};
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
function sample(id,ms){const c=configs[id],idle=ms<0||ms>=c.duration,t=Math.max(0,Math.min(ms,c.duration));let aim=0,draw=0,recoil=0;
if(!idle){if(id===5){aim=t<650?ease(t/650):t<1400?1:1-ease((t-1400)/700);const r=t-c.launch;recoil=r>=0&&r<240?Math.sin(Math.PI*r/240)*Math.exp(-r/170):0;}else{aim=t<550?ease(t/550):t<1720?1:1-ease((t-1720)/680);draw=t<550?0:t<1160?ease((t-550)/610):t<1230?1:1-ease((t-1230)/170);const r=t-c.launch;recoil=r>=0&&r<270?Math.sin(r/32)*Math.exp(-r/85):0;}}
return{idle,aim,draw,recoil,x:0,scale:1,power:0,lean:0,hits:ms>=c.impact?1:0,label:idle?'待机':id===5?(t<650?'抬枪 · 屈肘瞄准':t<900?'屏息 · 稳定准星':t<1140?'单发 · 缓冲后坐':'收枪 · 恢复待机'):(t<550?'举弓 · 稳定弓臂':t<1230?'拉弦 · 蓄力瞄准':t<1500?'松弦 · 放箭':'收手 · 恢复待机')};}
function path(q,poly){q.beginPath();poly.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();}
function canvas(){const c=document.createElement('canvas');c.width=512;c.height=1024;return c;}
async function build(image,id){const c=configs[id],source=canvas(),sq=source.getContext('2d');sq.drawImage(image,0,0,512,1024,0,0,512,1024);const parts={},mask=canvas(),mq=mask.getContext('2d');
 for(const [name,poly]of c.parts){const out=canvas(),q=out.getContext('2d');path(q,poly);q.clip();q.drawImage(source,0,0);q.globalCompositeOperation='destination-out';q.drawImage(mask,0,0);parts[name]=out;path(mq,poly);mq.fill();}
 if(id===13){mq.beginPath();mq.moveTo(420,110);mq.lineTo(354,785);mq.strokeStyle='white';mq.lineWidth=5;mq.stroke();}
 const body=canvas(),q=body.getContext('2d');q.drawImage(source,0,0);q.globalCompositeOperation='destination-out';q.drawImage(mask,0,0);q.globalCompositeOperation='source-over';
 const plate=new Image();plate.src='ranged-occlusion-v1.png';await plate.decode();const repair=canvas(),rq=repair.getContext('2d'),half=plate.width/2;
 rq.drawImage(plate,id===5?0:half,0,half,plate.height,0,35,512,985);rq.globalCompositeOperation='destination-in';rq.drawImage(mask,0,0);q.drawImage(repair,0,0);
 if(id===13){
 const legPolys={nearThigh:[[188,499],[259,492],[271,583],[263,681],[248,731],[191,721],[178,634]],nearShin:[[191,710],[249,710],[251,842],[252,930],[264,978],[195,983],[185,947],[197,849]],farThigh:[[281,499],[335,494],[364,583],[383,689],[371,738],[318,731],[299,641]],farShin:[[317,718],[375,716],[402,831],[421,913],[463,963],[453,986],[383,984],[365,929],[346,846]]};
 for(const[name,poly]of Object.entries(legPolys)){const out=canvas(),oq=out.getContext('2d');path(oq,poly);oq.clip();oq.drawImage(body,0,0);parts[name]=out;q.globalCompositeOperation='destination-out';path(q,poly);q.fill();}q.globalCompositeOperation='source-over';
 }
 return{source,body,parts,id};}
function transform(q,x,y,a,dx=0,dy=0){q.translate(x+dx,y+dy);q.rotate(a);q.translate(-x,-y);}
function weaponPoint(id,p,point){const c=configs[id],a=id===5?-1.17*p.aim-.025*p.recoil:-.65*p.aim,dx=id===5?156*p.aim-8*p.recoil:25*p.aim,dy=id===5?-242*p.aim:-45*p.aim,co=Math.cos(a),si=Math.sin(a),x=point[0]-c.grip[0],y=point[1]-c.grip[1];return[c.grip[0]+dx+x*co-y*si,c.grip[1]+dy+x*si+y*co];}
function segment(q,part,a,b,A,B){const angle=Math.atan2(B[1]-A[1],B[0]-A[0])-Math.atan2(b[1]-a[1],b[0]-a[0]);q.save();q.translate(...A);q.rotate(angle);q.translate(-a[0],-a[1]);q.drawImage(part,0,0);q.restore();}
function ik(a,b,c,A,C,side=1){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),M=Math.hypot(c[0]-b[0],c[1]-b[1]),dx=C[0]-A[0],dy=C[1]-A[1],d=Math.hypot(dx,dy),along=(L*L-M*M+d*d)/(2*d),h=Math.sqrt(Math.max(0,L*L-along*along));return[A[0]+dx/d*along-side*dy/d*h,A[1]+dy/d*along+side*dx/d*h];}
function draw(q,rig,p){const id=rig.id,c=configs[id];if(p.idle||p.aim<.00001){q.drawImage(rig.source,0,0);return;}
 const drop=id===13?130*p.aim:0;
 if(id===13){
  // A bent supporting leg and a forward leg use their original rigid pieces.
  for(const[thigh,shin,a,b,c,end,side]of [
   ['farThigh','farShin',[310,520],[349,720],[418,963],[418+205*p.aim,963],-1],
   ['nearThigh','nearShin',[228,520],[221,720],[223,965],[223-25*p.aim,965],1]
  ]){const A=[a[0],a[1]+drop],B=ik(a,b,c,A,end,side);segment(q,rig.parts[thigh],a,b,A,B);segment(q,rig.parts[shin],b,c,B,end);}
  // Cloth below the waist folds as the pelvis drops; head/torso retain their scale.
  q.drawImage(rig.body,0,0,512,580,0,drop,512,580);
  q.drawImage(rig.body,0,580,512,444,0,580+drop,512,444-drop);
 }else q.drawImage(rig.body,0,0);
 q.save();q.translate(0,drop);
 const hand=weaponPoint(id,p,c.grip),angle=id===5?-1.17*p.aim-.025*p.recoil:-.65*p.aim;
 // Forearm and upper arm meet at the solved elbow; weapon grip and wrist coincide.
 const shoulder=id===5?[180,270]:[302,335],elbow=id===5?[153,414]:[351,407],wrist=c.grip,B=ik(shoulder,elbow,wrist,shoulder,hand,id===5?1:1);
 segment(q,rig.parts.upper,shoulder,elbow,shoulder,B);segment(q,rig.parts.forearm,elbow,wrist,B,hand);
 q.save();transform(q,...c.grip,angle,hand[0]-c.grip[0],hand[1]-c.grip[1]);q.drawImage(rig.parts.weapon,0,0);q.drawImage(rig.parts.hand,0,0);q.restore();
 q.save();if(id===5){const target=weaponPoint(id,p,[285,540]);q.translate((target[0]-408)*p.aim,(target[1]-580)*p.aim);transform(q,408,580,-1.3*p.aim);}else q.translate((275-115*p.draw)*p.aim,-145*p.aim);q.drawImage(rig.parts.support,0,0);q.restore();
 if(id===13){const top=weaponPoint(id,p,[420,110]),bottom=weaponPoint(id,p,[354,785]),nock=[390+25*p.aim-115*p.draw+3*p.recoil,420-45*p.aim];q.save();q.strokeStyle='#c6dcf5';q.lineWidth=2;q.beginPath();q.moveTo(...top);q.lineTo(...nock);q.lineTo(...bottom);q.stroke();if(p.draw>.05){q.strokeStyle='#bfeaff';q.lineWidth=3;q.beginPath();q.moveTo(...nock);q.lineTo(510+25*p.aim,nock[1]);q.stroke();q.beginPath();q.moveTo(500+25*p.aim,nock[1]-5);q.lineTo(515+25*p.aim,nock[1]);q.lineTo(500+25*p.aim,nock[1]+5);q.stroke();}q.restore();}q.restore();}
const api={configs,sample,build,draw,weaponPoint};root.RangedRig=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
