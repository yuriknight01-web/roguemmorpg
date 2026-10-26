(function(root){
 async function build(image,plate){const spec=await fetch('jin-layers.json').then(r=>r.json()),source=document.createElement('canvas');source.width=512;source.height=1024;const sq=source.getContext('2d');sq.drawImage(image,0,0,512,1024,0,0,512,1024);const original=sq.getImageData(0,0,512,1024),owned=new Uint8Array(512*1024),layers={};
 for(const info of spec.layers){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;const q=canvas.getContext('2d');if(info.polygon){q.beginPath();info.polygon.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill();}else q.fillRect(0,0,512,1024);const mask=q.getImageData(0,0,512,1024),pixels=q.createImageData(512,1024);for(let i=0;i<owned.length;i++)if(!owned[i]&&mask.data[i*4+3]>=128){owned[i]=1;pixels.data.set(original.data.subarray(i*4,i*4+4),i*4);}q.putImageData(pixels,0,0);layers[info.id]=canvas;}
 // Existing occlusion plate fills only pixels originally hidden by the moving arm/weapon.
 const hidden=document.createElement('canvas');hidden.width=512;hidden.height=1024;const hq=hidden.getContext('2d');
 for(const id of ['upperarm','forearm','hand','sword'])hq.drawImage(layers[id],0,0);
 const repairSource=document.createElement('canvas');repairSource.width=512;repairSource.height=1024;const rq=repairSource.getContext('2d');rq.drawImage(plate,0,0,512,1024,0,0,512,1024);rq.globalCompositeOperation='destination-in';rq.drawImage(hidden,0,0);
 const repairs={},claimed=document.createElement('canvas');claimed.width=512;claimed.height=1024;const cq=claimed.getContext('2d');
 for(const info of spec.layers){if(['upperarm','forearm','hand','sword'].includes(info.id))continue;
 const patch=document.createElement('canvas');patch.width=512;patch.height=1024;const q=patch.getContext('2d');
 if(info.polygon){q.beginPath();info.polygon.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill();}else q.fillRect(0,0,512,1024);
 q.globalCompositeOperation='destination-out';q.drawImage(claimed,0,0);cq.drawImage(patch,0,0);q.globalCompositeOperation='source-in';q.drawImage(repairSource,0,0);repairs[info.id]=patch;
 }
 return{source,layers,repairs};}
 // Back-to-front ordering: sword and glove share one rigid transform.
 const order=['cape-center','cape-left','cape-right','boot-far','shin-far','thigh-far','boot-near','shin-near','thigh-near','torso','head','scarf','upperarm','forearm','sword','hand'];
 function draw(q,rig,p){if(p.idle){q.drawImage(rig.source,0,0);return;}for(const id of order){q.save();q.transform(...p.transforms[id]);if(rig.repairs[id])q.drawImage(rig.repairs[id],0,0);q.drawImage(rig.layers[id],0,0);q.restore();}}
 root.JinLayerRig={build,draw};
})(globalThis);
