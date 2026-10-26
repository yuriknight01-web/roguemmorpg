// Separate one-shot state: idle remains untouched when inactive.
function hitPose(elapsed){
 if(elapsed<0||elapsed>=1100)return {active:false,amount:0,pain:false,phase:'待机'};
 let amount;
 if(elapsed<90){const t=elapsed/90;amount=1-(1-t)**3;}
 else if(elapsed<260)amount=1;
 else {const t=(elapsed-260)/840;amount=1-t*t*(3-2*t);}
 return {active:true,amount,pain:elapsed<710,phase:elapsed<90?'受击后仰':elapsed<260?'吃痛停顿':'恢复站姿'};
}
function hitBodyOffset(x,y,amount){
 // Head/shoulders recoil, pelvis drops; both soles remain planted.
 const keys=[[0,-44,3],[125,-35,5],[240,-25,10],[310,-19,14],[390,0,7],[465,0,0],[512,0,0]];
 let a=keys[0],b=keys[1];for(let i=0;i<keys.length-1;i++){if(y>=keys[i][0]){a=keys[i];b=keys[i+1];}}
 const u=Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0]))),s=u*u*(3-2*u);
 let dx=a[1]+(b[1]-a[1])*s,dy=a[2]+(b[2]-a[2])*s;
 // Different knee responses: front knee yields, rear leg braces.
 if(y>315&&y<465){const bend=Math.sin(Math.PI*(y-315)/150),front=Math.max(0,Math.min(1,(x-145)/40));dx+=bend*(-7+19*front);}
 return [dx*amount,dy*amount];
}
function hitWeaponPixel(x,y){const along=((x-152)*218+(y-313)*153)/(218*218+153*153),distance=Math.abs((x-152)*153-(y-313)*218)/Math.hypot(218,153);return along>-.035&&along<1.06&&distance<14;}
if(typeof module!=='undefined')module.exports={hitPose,hitBodyOffset,hitWeaponPixel};
