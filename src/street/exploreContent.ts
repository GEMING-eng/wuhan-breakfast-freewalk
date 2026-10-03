import {tourStops,type TourPage,type TourStop,type FoodNote} from './tourContent.ts';
export type PlaceId='noodle'|'doupi'|'mianwo'|'market'|'neighbors'|'courtyard';
export type Place={id:PlaceId;name:string;short:string;kind:string;food?:FoodNote;anchor:[number,number,number];stop:TourStop;stopIndex:number;chapters:{title:string;pages:TourPage[];stop?:number}[]};
const doupi:TourStop={id:'doupi',name:'豆皮铺',position:[2.65,2.45,3.2],look:[6.4,2.1,2.1],dawn:.38,pages:[
 {label:'文化小札 · 三鲜豆皮',title:'金黄的一层，包住清晨。',text:'三鲜豆皮常被切成金色方块，外层与鸡蛋相伴，里面是糯米与馅料。武汉市政府的公开食单介绍了它的材料与形态。站在小摊前，看看这一口的层次。',kind:'fact',sources:['T4']},
 {label:'摊前闲话 · 情境创作',title:'“慢慢吃，还热着呢。”',text:'锅铲轻轻碰到铁盘，切好的豆皮排得整整齐齐。你可以把这一味放进自己的食篮，也可以继续去对面的店逛逛。逛早市的顺序，由你来定。',kind:'story'},
]};
const mianwo:TourStop={id:'mianwo',name:'面窝摊',position:[-2.65,2.45,-5.4],look:[-6.4,2.1,-5],dawn:.42,pages:[
 {label:'文化小札 · 面窝',title:'厚边薄心，藏着一把勺。',text:'湖北文旅的介绍提到，米浆与黄豆浆倒入专用铁勺，形成厚边、薄心的面窝。不同部位带来不同口感，一道小吃的形状，也留下了器具的痕迹。',kind:'fact',sources:['T3']},
 {label:'历史与传说',title:'从看得见的手艺开始。',text:'关于面窝的起源，有流传的故事；湖北文旅的资料同时提醒，它们没有具体文字记载。本作不替传说下定论，就从眼前的米浆、铁勺和做法认识这一味。',kind:'fact',sources:['T3']},
]};
export const places:Place[]=[
 {id:'noodle',name:'林记热干面',short:'热干面',kind:'芝麻香，趁热拌',food:'noodle',anchor:[-5.35,4.1,5],stop:tourStops[2],stopIndex:2,chapters:[{title:'这一碗',pages:tourStops[2].pages,stop:2},{title:'手艺与来历',pages:tourStops[3].pages,stop:3},{title:'看今昔',pages:tourStops[4].pages,stop:4}]},
 {id:'doupi',name:'豆皮铺',short:'三鲜豆皮',kind:'金黄外层，糯米软香',food:'doupi',anchor:[5.35,4,3],stop:doupi,stopIndex:8,chapters:[{title:'认识豆皮',pages:doupi.pages}]},
 {id:'mianwo',name:'面窝摊',short:'面窝',kind:'厚边薄心，酥香一口',food:'mianwo',anchor:[-5.35,4,-6],stop:mianwo,stopIndex:9,chapters:[{title:'认识面窝',pages:mianwo.pages}]},
 {id:'market',name:'巷口菜摊',short:'过早小札',kind:'听听武汉的早餐故事',anchor:[-5.8,3.4,13],stop:tourStops[1],stopIndex:1,chapters:[{title:'武汉过早',pages:tourStops[1].pages}]},
 {id:'neighbors',name:'街坊留言',short:'街坊日常',kind:'一声招呼，一张纸条',anchor:[-5.4,3.7,-25],stop:tourStops[6],stopIndex:6,chapters:[{title:'街坊日常',pages:tourStops[6].pages}]},
 {id:'courtyard',name:'巷尾树下',short:'坐一会儿',kind:'回望来路，收好记忆',anchor:[2,3.8,-30],stop:tourStops[7],stopIndex:7,chapters:[{title:'慢慢坐',pages:[{label:'我 · 巷尾回望',title:'不赶路，也是一种逛法。',text:'回头看看来时的街。有人提着菜，有人在面摊边坐下，太阳慢慢照亮木窗。你随时可以回地图再选一家，也可以打开食篮，带走今天记下的味道。',kind:'story'}]}]},
];
export const placeById=(id:PlaceId)=>places.find(p=>p.id===id)!;
