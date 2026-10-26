(function(root){
 // Shoulder lifts first; torso follows the descending strike and settles last.
 const keys=[[0,0,0,0],[380,-1.08,.018,-.72],[500,-1.12,.018,-.78],[710,.18,-.038,-.14],[820,.22,-.032,-.12],[1180,.24,-.008,-.38],[1400,0,0,0],[1500,0,0,0]];
 const smooth=t=>t*t*(3-2*t);
 function sample(ms){
  if(ms<0||ms>=1500)return{idle:true,angle:0,elbow:0,lean:0,x:225,label:'待机',hits:ms>=1500?1:0};
  let k=1;while(ms>keys[k][0])k++;const a=keys[k-1],b=keys[k],t=smooth((ms-a[0])/(b[0]-a[0]));
  return{idle:false,x:225,angle:a[1]+(b[1]-a[1])*t,lean:a[2]+(b[2]-a[2])*t,elbow:a[3]+(b[3]-a[3])*t,label:ms<380?'抬手举剑':ms<500?'蓄力':ms<710?'向下挥砍':ms<820?'顺势收力':'收剑 · 恢复待机',hits:ms>=900?1:0};
 }
 const api={sample,duration:1500,launches:[630],impacts:[900]};if(typeof module!=='undefined')module.exports=api;root.StationaryMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this);
