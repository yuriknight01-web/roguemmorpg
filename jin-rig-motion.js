(function(root){
 const duration=2500;
 // Time, shoulder, elbow, wrist, torso, pelvis drop. Rotations are radians.
 const keys=[[0,0,0,0,0,0],[170,.08,-.32,-.02,.012,5],[340,.20,-.95,-.06,.031,13],[510,.26,-1.52,-.10,.048,20],[600,.27,-1.57,-.10,.05,21],[690,.10,-.92,-.03,.034,14],[780,-.06,-.12,0,-.018,8],[825,-.06,-.12,0,-.018,8],[960,.08,-.35,-.03,.014,15],[1140,.20,-.65,-.08,.04,21],[1240,.19,-.67,-.08,.042,21],[1360,-.18,-1.05,-.10,-.012,10],[1450,-.52,-1.16,-.12,-.026,5],[1495,-.52,-1.16,-.12,-.026,5],[1680,-.46,-1.12,-.10,-.018,7],[1940,-.22,-.65,-.04,.005,10],[2220,-.05,-.15,0,.003,4],[2500,0,0,0,0,0]];
 const identity=()=>[1,0,0,1,0,0];
 // Shape-preserving cubic Hermite curves carry velocity through intermediate keys.
 // Only true direction changes and intentional impact holds reach zero velocity.
 function tangent(i,j){if(i===0||i===keys.length-1)return 0;const a=keys[i-1],b=keys[i],c=keys[i+1],h0=b[0]-a[0],h1=c[0]-b[0],d0=(b[j]-a[j])/h0,d1=(c[j]-b[j])/h1;if(d0*d1<=0)return 0;const w1=2*h1+h0,w2=h1+2*h0;return(w1+w2)/(w1/d0+w2/d1);}
 function pose(t){let i=1;while(t>keys[i][0])i++;const a=keys[i-1],b=keys[i],h=b[0]-a[0],u=(t-a[0])/h;return[1,2,3,4,5].map(j=>(2*u**3-3*u*u+1)*a[j]+(u**3-2*u*u+u)*h*tangent(i-1,j)+(-2*u**3+3*u*u)*b[j]+(u**3-u*u)*h*tangent(i,j));}
 function mul(a,b){return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
 function pivot(x,y,r){const c=Math.cos(r),s=Math.sin(r);return[c,s,-s,c,x-c*x+s*y,y-s*x-c*y];}
 const point=(m,p)=>[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];
 function segment(a,b,A,B){const r=Math.atan2(B[1]-A[1],B[0]-A[0])-Math.atan2(b[1]-a[1],b[0]-a[0]),c=Math.cos(r),s=Math.sin(r);return[c,s,-s,c,A[0]-c*a[0]+s*a[1],A[1]-s*a[0]-c*a[1]];}
 function leg(hip,knee,ankle,drop){const H=[hip[0],hip[1]+drop],L=Math.hypot(knee[0]-hip[0],knee[1]-hip[1]),M=Math.hypot(ankle[0]-knee[0],ankle[1]-knee[1]),dx=ankle[0]-H[0],dy=ankle[1]-H[1],d=Math.hypot(dx,dy),along=(L*L-M*M+d*d)/(2*d),h=Math.sqrt(Math.max(0,L*L-along*along));const candidates=[1,-1].map(sign=>[H[0]+dx/d*along-sign*dy/d*h,H[1]+dy/d*along+sign*dx/d*h]);const K=candidates.sort((a,b)=>Math.hypot(a[0]-knee[0],a[1]-knee[1])-Math.hypot(b[0]-knee[0],b[1]-knee[1]))[0];return[segment(hip,knee,H,K),segment(knee,ankle,K,ankle)];}
 function sample(ms){const idle=ms<0||ms>=duration,t=Math.max(0,Math.min(duration,ms));const v=idle?[0,0,0,0,0]:pose(t);
 const [shoulder,elbow,wrist,torso,drop]=v,body=mul([1,0,0,1,0,drop],pivot(290,440,torso));
 const upper=mul(body,pivot(209,251,shoulder)),fore=mul(upper,pivot(191,367,elbow)),hand=mul(fore,pivot(176,448,wrist));
 const near=leg([271,455],[219,624],[184,741],drop),far=leg([331,458],[364,649],[354,787],drop),envelope=idle?0:Math.sin(Math.PI*t/duration)**2;
 const gust=(start,sign)=>{const age=t-start;return age<0?0:sign*Math.sin(age/180)*Math.exp(-age/420);};
 const cape=(gust(680,1)+gust(1360,-1))*.038*envelope;
 const transforms={'torso':body,'head':mul(body,pivot(296,184,-torso*.35)),'scarf':body,'upperarm':upper,'forearm':fore,'hand':hand,'sword':hand,'thigh-near':near[0],'shin-near':near[1],'boot-near':identity(),'thigh-far':far[0],'shin-far':far[1],'boot-far':identity(),'cape-center':body,'cape-left':mul(body,pivot(175,260,cape)),'cape-right':mul(body,pivot(360,312,-cape*.8))};
 return{idle,transforms,x:0,scale:1,power:0,lean:0,recoil:[],hits:[780,1450].filter(n=>t>=n).length,label:idle?'待机':t<600?'压低重心 · 侧身蓄力':t<825?'第一重斩 · 停刀':t<1240?'低位回带 · 再次蓄力':t<1680?'反向挑斩 · 停刀':'收剑 · 恢复待机'};
 }
 const api={sample,duration,keys,point,mul};root.JinRigMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
