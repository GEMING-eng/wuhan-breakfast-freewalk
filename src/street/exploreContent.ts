import {tourStops,type TourPage,type TourStop,type FoodNote} from './tourContent.ts';
export type PlaceId='noodle'|'doupi'|'mianwo'|'market'|'neighbors'|'courtyard'|'east-middle'|'west-end'|'east-end';
export type Place={id:PlaceId;name:string;short:string;kind:string;food?:FoodNote;anchor:[number,number,number];stop:TourStop;stopIndex:number;chapters:{title:string;pages:TourPage[];stop?:number;view?:TourStop;compare?:boolean}[]};
const doupi:TourStop={id:'doupi',name:'豆皮铺',position:[2.65,2.45,3.2],look:[6.4,2.1,2.1],dawn:.38,pages:[
 {label:'文化小札 · 三鲜豆皮',title:'薄皮裹糯米，切开是三鲜。',text:'绿豆与大米磨成的浆，配上鸡蛋摊成金黄薄皮；里面裹着糯米和肉、香菇、笋丁。不同店家有自己的配方。看看铁盘边的切面：薄皮、米粒与馅料各有层次，一口外脆，一口软糯。',kind:'fact',sources:['T6','T4']},
 {label:'周姨 · 虚构店主',title:'“这一盘，给清晨留着。”',text:'周姨把铲子放在盘边，笑着招呼：“慢慢吃，还热着。”墙后的蒸笼里是下一锅糯米，搪瓷碗已经叠好。你可以先收进食篮，也可以换一个话题看看；逛到哪里，全由你的胃口决定。',kind:'story'},
]};
const doupiObject:TourStop={...doupi,id:'doupi-spatula',name:'盘边的旧铲',position:[3.45,2.45,5.1],look:[6.35,1.93,5.15],pages:[
 {label:'旧物近看 · 场景观察',title:'一把铲子，留着手的分寸。',text:'木柄被磨得圆润，铁面上留着几道浅痕。它是这间虚构小铺的旧物：切开、托起，再送进碗里。近看柜台上的独立铁铲，也看看旁边的蓝边碗；这些物件都有厚度，能遮挡，也能投影。',kind:'observation'},
 {label:'周姨 · 虚构对白',title:'“工具顺手，心里才有数。”',text:'“这铲子我留着，握着舒服。”周姨指了指木柄。今日的台面更容易擦洗，客人会带自己的餐盒来，盘边的铲子和那扇旧窗却还在。这里讲的是创作的生活片段，不是某家真实老字号的掌故。',kind:'story'},
]};
const doupiEras:TourStop={...doupi,id:'doupi-eras',name:'豆皮铺的今昔',position:[2.65,2.45,3.2],look:[7.1,2.55,3.3],pages:[
 {label:'今昔对照 · 情境演绎',title:'旧窗仍在，清晨换了新习惯。',text:'翻过四扇纸墙：补过的灰墙变成修整后的浅绿墙，木台面换成便于擦洗的台面，纸包旁的位置放上了可重复使用的餐盒。周姨换上豆绿围裙，蒸笼、旧窗与铁铲留在原处。两种清晨共享同一间小铺。',kind:'observation'},
]};
const mianwo:TourStop={id:'mianwo',name:'面窝摊',position:[-2.65,2.45,-5.4],look:[-6.4,2.1,-5],dawn:.42,pages:[
 {label:'文化小札 · 面窝',title:'厚边薄心，藏着一把勺。',text:'湖北文旅的介绍提到，米浆与黄豆浆倒入专用铁勺，形成厚边、薄心的面窝。不同部位带来不同口感，一道小吃的形状，也留下了器具的痕迹。',kind:'fact',sources:['T3']},
 {label:'历史与传说',title:'从看得见的手艺开始。',text:'关于面窝的起源，有流传的故事；湖北文旅的资料同时提醒，它们没有具体文字记载。本作不替传说下定论，就从眼前的米浆、铁勺和做法认识这一味。',kind:'fact',sources:['T3']},
]};
const neighborhoodPlaces:Place[]=(['east-middle','west-end','east-end'] as const).map((id,i)=>{
 const x=i===1?-3.2:3.2,z=[-8,-17,-19][i],name=['街坊书屋','巷里人家','邻里小院'][i];
 const pages:TourPage[]=[{label:'沿街今昔 · 场景观察',title:['木门后，也有新的清晨。','窗子修过，街坊还在。','走到街尾，生活接着往前。'][i],text:'站在这栋楼前切换昔日与今日：旧木门、竹帘和斑驳的墙脚，换成维护后的门窗、浅色砖面与新的生活物件；楼上的窗框和门牌也会改变。这里是一处虚构的街坊空间，保留老街的尺度，呈现维护与日常生活的延续。',kind:'observation'}];
 const stop:TourStop={id,name,position:[x,2.45,z],look:[x<0?-7.6:7.6,3.2,z],dawn:.4,pages};
 return {id,name,short:name,kind:'旧窗新事，沿街看看',anchor:[x<0?-5.35:5.35,3.55,z],stop,stopIndex:10+i,chapters:[{title:'街坊今昔',pages,compare:true}]};
});
export const places:Place[]=[
 {id:'noodle',name:'林记热干面',short:'热干面',kind:'芝麻香，趁热拌',food:'noodle',anchor:[-5.35,4.1,5],stop:tourStops[2],stopIndex:2,chapters:[{title:'这一碗',pages:tourStops[2].pages,stop:2},{title:'手艺与来历',pages:tourStops[3].pages,stop:3},{title:'看今昔',pages:tourStops[4].pages,stop:4}]},
 {id:'doupi',name:'豆皮铺',short:'三鲜豆皮',kind:'金黄外层，糯米软香',food:'doupi',anchor:[5.35,4,3],stop:doupi,stopIndex:8,chapters:[{title:'这盘豆皮',pages:doupi.pages},{title:'铲边旧物',pages:doupiObject.pages,view:doupiObject},{title:'看今昔',pages:doupiEras.pages,view:doupiEras,compare:true}]},
 {id:'mianwo',name:'面窝摊',short:'面窝',kind:'厚边薄心，酥香一口',food:'mianwo',anchor:[-5.35,4,-6],stop:mianwo,stopIndex:9,chapters:[{title:'认识面窝',pages:mianwo.pages},{title:'看今昔',compare:true,pages:[{label:'面窝铺今昔 · 场景观察',title:'旧勺不换，清晨接着开门。',text:'翻过纸墙，留意同一间厨房：斑驳的旧砖墙修整成浅色瓷砖，炉台换上便于擦洗的台面，麻袋的位置放着收纳罐，旁边多了纸餐盒。柜台、雨棚和招牌一起变化，背景中的两代店主也不同。这是虚构小铺的生活演绎。',kind:'observation'}]}]},
 {id:'market',name:'巷口菜摊',short:'过早小札',kind:'听听武汉的早餐故事',anchor:[-5.8,3.4,13],stop:tourStops[1],stopIndex:1,chapters:[{title:'武汉过早',pages:tourStops[1].pages}]},
 {id:'neighbors',name:'街坊留言',short:'街坊日常',kind:'一声招呼，一张纸条',anchor:[-5.4,3.7,-25],stop:tourStops[6],stopIndex:6,chapters:[{title:'街坊日常',pages:tourStops[6].pages}]},
 {id:'courtyard',name:'巷尾树下',short:'坐一会儿',kind:'回望来路，收好记忆',anchor:[2,3.8,-30],stop:tourStops[7],stopIndex:7,chapters:[{title:'慢慢坐',pages:[{label:'我 · 巷尾回望',title:'不赶路，也是一种逛法。',text:'回头看看来时的街。有人提着菜，有人在面摊边坐下，太阳慢慢照亮木窗。你随时可以回地图再选一家，也可以打开食篮，带走今天记下的味道。',kind:'story'}]}]},
 ...neighborhoodPlaces,
];
export const placeById=(id:PlaceId)=>places.find(p=>p.id===id)!;
