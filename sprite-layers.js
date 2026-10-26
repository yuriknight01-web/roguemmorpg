// Semantic cutout ownership, in the original 384x512 cell coordinates.
// 0 = protected foreground; 1/2 = free coat tails; 3/4 = outer hair tips.
const cutoutPolygons=[
 [[130,318],[145,331],[125,370],[111,419],[111,454],[74,434],[54,406],[74,365],[105,335]],
 [[242,246],[268,274],[283,322],[303,380],[318,464],[286,437],[249,415],[235,364],[228,311]],
 [[146,42],[163,57],[154,88],[146,103],[128,103],[137,87],[125,80]],
 [[235,56],[259,77],[251,97],[275,135],[246,123],[228,104],[229,84]]
];
function insidePolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function spriteLayerAt(x,y){
 const along=((x-152)*218+(y-313)*153)/(218*218+153*153);
 const bladeDistance=Math.abs((x-152)*153-(y-313)*218)/Math.hypot(218,153);
 // Hard holdouts: sword (including outline), hand, hood and face.
 if(along>-.1&&along<1.08&&bladeDistance<14)return 0;
 if(((x-145)/34)**2+((y-285)/34)**2<1)return 0;
 if(x<236&&y>=106&&y<230)return 0;
 if(x>=165&&x<=226&&y>=55&&y<=121)return 0;
 for(let i=0;i<cutoutPolygons.length;i++)if(insidePolygon(x,y,cutoutPolygons[i]))return i+1;
 return 0;
}
function makeLayerOwnership(w,h){const ids=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)ids[y*w+x]=spriteLayerAt(x*384/w,y*512/h);return ids;}
if(typeof module!=='undefined')module.exports={spriteLayerAt,makeLayerOwnership};
