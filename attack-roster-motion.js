(function(root){
 const actors={
  14:{name:'烬',move:'刃火 · 斜劈',color:'#f28e73',description:'屈肘提剑，肩膀带动斜劈，收剑回到原姿势。',duration:1600,launches:[650],impacts:[870],keys:[[0,0,0],[400,1,0],[510,1,0],[740,-.17,1],[880,-.2,.7],[1440,0,0],[1600,0,0]],limbs:[{shoulder:[210,295],elbow:[191,368],upper:-.8,lower:-.76,polygon:[[187,287],[237,304],[234,344],[214,378],[203,416],[208,457],[222,482],[258,511],[526,940],[506,945],[212,553],[174,523],[160,495],[147,470],[123,436],[122,420],[137,416],[159,440],[155,405],[163,364],[163,330]]}]},
  1:{name:'赫恩',move:'盾缘击 · 盾顶',color:'#ffd580',description:'手臂收盾蓄力，肩膀带盾顶出，重量收稳后复位。',duration:1500,launches:[610],impacts:[800],keys:[[0,0,0],[380,1,0],[470,1,0],[650,-1,1],[800,-.7,.6],[1320,0,0],[1500,0,0]],limbs:[{shoulder:[181,285],elbow:[110,369],upper:-.07,lower:.03,shift:34,polygon:[[167,258],[208,279],[200,318],[169,351],[195,380],[210,408],[227,510],[221,947],[190,967],[70,960],[55,930],[53,494],[66,414],[56,402],[56,361],[91,338],[115,315],[136,282]]}]},
  6:{name:'绯雀',move:'双响 · 交替射击',color:'#ff9c9d',description:'双手屈肘抬枪，交替射击并分别承受后坐，再放低双枪。',duration:1800,launches:[580,830],impacts:[760,1010],keys:[[0,0,0],[420,1,0],[560,1,0],[1100,1,0],[1640,0,0],[1800,0,0]],limbs:[{shoulder:[166,292],elbow:[143,411],upper:.92,lower:.55,polygon:[[149,272],[188,284],[190,335],[179,382],[170,415],[144,472],[143,521],[132,560],[105,621],[64,622],[64,602],[80,553],[87,495],[105,464],[120,413],[111,389],[115,350],[127,309]]},{shoulder:[345,319],elbow:[366,430],upper:1.02,lower:.77,polygon:[[329,303],[357,308],[375,350],[389,397],[391,426],[411,474],[434,512],[443,520],[480,600],[467,621],[447,622],[415,561],[392,552],[380,525],[380,491],[352,445],[337,429],[327,391]]}]}
 };
 actors[5]={name:'隼',move:'定点 · 精准射击',description:'双手托枪 → 瞄准镜对眼 → 稳定射击 → 收枪回位。',color:'#ffd393',duration:2100,launches:[900],impacts:[1020],rangedRig:true};
 actors[13]={name:'霜翎',move:'霜弦 · 蓄力放箭',description:'屈腿低蹲、前腿伸出 → 斜持弓 → 拉弦放箭 → 收弓起身。',color:'#b8e4ff',duration:2400,launches:[1230],impacts:[1410],rangedRig:true};
 Object.assign(actors[14],{move:'刃火 · 双重十字斩',description:'压低重心、侧身收剑 → 第一重斩停刀 → 低位回带 → 反向挑斩 → 缓慢收势。',duration:2500,launches:[650,1320],impacts:[780,1450],layerRig:true});
 // Eight authored full-body stages; native source sizes stay constant while crouching.
 Object.assign(actors[1],{move:'盾缘击 · 抬盾冲撞',description:'举盾护头 → 屈膝压低重心 → 蹬地接近敌人 → 盾面撞击 → 收力退回。',duration:2200,launches:[],impacts:[900],poseAtlas:'heern-sequence-v5.png',poseScale:222.2/568,poseFrames:[
 {rect:[0,30,325,625],anchor:200,foot:618},
 {rect:[325,75,632,620],anchor:477,foot:609},
 {rect:[635,90,950,620],anchor:790,foot:616},
 {rect:[950,170,1254,620],anchor:1100,foot:610},
 {rect:[0,730,332,1216],anchor:170,foot:1209,polygon:[[0,730],[332,730],[332,1105],[295,1130],[295,1216],[0,1216]]},
 {rect:[277,745,696,1216],anchor:480,foot:1210,polygon:[[330,745],[696,745],[696,1216],[277,1216],[277,1160],[330,1100]]},
 {rect:[690,730,950,1216],anchor:810,foot:1208},
 {rect:[945,630,1254,1216],anchor:1100,foot:1207}
 ]});
 Object.assign(actors[6],{move:'双响 · 前倾双枪射击',description:'双手抬枪 → 屈肘前倾 → 双枪瞄准 → 分别射击与缓冲后坐 → 收枪回位。',duration:1800,launches:[580,830],impacts:[760,1010],poseAtlas:'feique-sequence-v5.png',poseScale:211.2/562,poseFrames:[
 {rect:[0,30,319,610],anchor:196,foot:603},
 {rect:[300,30,635,610],anchor:480,foot:603},
 {rect:[600,30,955,610],anchor:775,foot:603},
 {rect:[927,30,1254,610],anchor:1085,foot:603},
 {rect:[0,640,360,1220],anchor:184,foot:1218,polygon:[[0,640],[318,640],[318,750],[360,750],[360,835],[318,835],[318,1220],[0,1220]]},
 {rect:[325,640,670,1220],anchor:504,foot:1218},
 {rect:[635,640,975,1220],anchor:832,foot:1217},
 {rect:[935,640,1254,1220],anchor:1105,foot:1217}
 ]});
 Object.assign(actors[1],{poseAtlas:'rebuild-v6--heern.png',poseScale:222.2/508,poseFrames:[
 {rect:[0,80,315,627],anchor:180,foot:623},
 {rect:[330,100,628,627],anchor:490,foot:623},
 {rect:[635,120,935,627],anchor:800,foot:623},
 {rect:[945,160,1254,627],anchor:1115,foot:623},
 {rect:[0,690,378,1195],anchor:180,foot:1183},
 {rect:[320,730,735,1195],anchor:505,foot:1183,polygon:[[380,730],[735,730],[735,1195],[320,1195],[320,1120],[380,1090]]},
 {rect:[735,690,965,1200],anchor:815,foot:1188},
 {rect:[970,650,1254,1210],anchor:1105,foot:1200}
 ]});
 Object.assign(actors[6],{poseAtlas:'rebuild-v6--feique.png',poseScale:211.2/540,poseFrames:[
 {rect:[0,45,315,627],anchor:190,foot:614},
 {rect:[320,50,635,627],anchor:495,foot:614},
 {rect:[635,60,945,627],anchor:805,foot:614},
 {rect:[945,60,1254,627],anchor:1105,foot:614},
 {rect:[0,640,323,1210],anchor:200,foot:1188},
 {rect:[325,640,635,1210],anchor:510,foot:1188},
 {rect:[635,640,945,1210],anchor:815,foot:1188},
 {rect:[950,640,1254,1210],anchor:1132,foot:1188}
 ]});
 // Explicit user rollback to the saved second shooting version.
 Object.assign(actors[6],{poseAtlas:'feique-shooting-v2.png',poseScale:211.2/850,poseFrames:[
 {rect:[0,0,512,1024],anchor:270,foot:952},
 {rect:[512,0,1068,1024],anchor:750,foot:952},
 {rect:[512,0,1068,1024],anchor:750,foot:952}
 ]});
 const smooth=t=>t*t*(3-2*t);
 function sample(id,ms){const c=actors[id];if(!c)throw Error('Unknown attack actor');const idle=ms<0||ms>=c.duration;
 if(c.rangedRig)return (typeof module!=='undefined'?require('./ranged-rig.js'):root.RangedRig).sample(id,ms);
 if(id===14)return (typeof module!=='undefined'?require('./jin-rig-motion.js'):root.JinRigMotion).sample(ms);
 if(c.poseAtlas){
  let poseFrame=-1,x=0,recoilX=0,label='待机';
  if(!idle&&id===1){
   poseFrame=ms<100?0:ms<230?1:ms<380?2:ms<620?3:ms<760?4:ms<1020?5:ms<1200?6:ms<1400?3:ms<1600?2:ms<1800?1:ms<1940?7:-1;
   if(ms>=620&&ms<900)x=288*((ms-620)/280)**2;
   else if(ms>=900&&ms<1020)x=288;
   else if(ms>=1020&&ms<1600)x=288*(1-smooth((ms-1020)/580));
   label=ms<300?'举盾护头':ms<620?'屈膝 · 压低重心':ms<900?'蹬地 · 前撞':ms<1020?'盾面接触命中':ms<1600?'退回原位':'收盾 · 恢复待机';
  }else if(!idle){
   poseFrame=ms<100?-1:ms<380?0:ms<580?1:ms<680?2:ms<830?1:ms<930?2:ms<1200?1:ms<1500?0:-1;
   const d=ms-830;if(d>=0&&d<160)recoilX=-2*Math.sin(d/160*Math.PI);
   label=ms<280?'双手抬枪':ms<580?'前倾 · 瞄准':ms<1200?'双枪交替射击':'收枪 · 恢复待机';
  }
  return{idle,poseFrame,x,recoilX,scale:1,power:0,lean:0,recoil:[],hits:c.impacts.filter(t=>ms>=t).length,label};
 }
 let power=0,lean=0;
 if(!idle){let k=1;while(ms>c.keys[k][0])k++;const a=c.keys[k-1],b=c.keys[k],p=smooth((ms-a[0])/(b[0]-a[0]));power=a[1]+(b[1]-a[1])*p;lean=(a[2]+(b[2]-a[2])*p)*-.025;}
 const recoil=c.launches.map(t=>{const d=ms-t;return d>=0&&d<180?Math.sin(d/180*Math.PI)*.11:0;});
 return{idle,power,lean,recoil,x:0,scale:1,hits:c.impacts.filter(t=>ms>=t).length,label:idle?'待机':ms<420?'抬手 · 蓄力':ms<c.launches[0]?'准备出手':ms<c.impacts[c.impacts.length-1]+100?'出手 · 收力':'收招 · 恢复待机'};
 }
 const api={actors,sample};if(typeof module!=='undefined')module.exports=api;root.RosterAttacks=api;
})(typeof globalThis!=='undefined'?globalThis:this);
