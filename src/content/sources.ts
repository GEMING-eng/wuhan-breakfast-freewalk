export const disclaimer = '本作依据武汉饮食文化资料进行艺术化演绎，街段与人物为虚构，不是某一历史地点的精确复原。';
export const sources = [
  { id: 'S01', title: '湖北美食上线，你“鄂”了么？', institution: '中国非物质文化遗产网 · 湖北省非物质文化遗产保护中心', date: '2020-05-20', url: 'https://www.ihchina.cn/special2020_gdfc_detail/20947.html', scope: '“过早”与热干面；技艺介绍。文中真实品牌的身份不属于本作虚构店铺。' },
  { id: 'S02', title: '武汉面窝', institution: '湖北省文化和旅游厅 · 志说湖北', date: '2016-06-06', url: 'https://wlt.hubei.gov.cn/bmdt/ztzl/zshb/201912/t20191226_1799589.shtml', scope: '厚边薄心、米与黄豆浆、专用铁勺。页面明确指出起源传说缺乏文字记载。' },
  { id: 'S03', title: '武汉十大名点（PDF）', institution: '武汉市人民政府门户网站公开资料', date: '2025-06 · 文件目录', url: 'https://www.wuhan.gov.cn/wwwz/ywwz_1/H_1/NWP/202506/P020250626403473866731.pdf', scope: 'PDF第1—5页：热干面材料、豆皮形态与材料、面窝材料。未据其宣传表述认定唯一发明者。' },
  { id: 'S04', title: '武汉“名家论坛”探寻武汉老字号的活态传承', institution: '武汉市商务局', date: '2025-06-17', url: 'https://sw.wuhan.gov.cn/xwdt/gzdt/202506/t20250617_2596270.shtml', scope: '支持饮食文化仍在生活中延续的策展角度；作品记忆签属于设计归纳。' },
  { id: 'S05', title: '正街凝眸——汉正街小商品市场照片档案展', institution: '武汉市档案馆', date: '2020-09-23 · 展厅标注', url: 'https://www.whda.org.cn/dawh/wszt/202512/t20251203_2689114.shtml', scope: '时期调研入口，不作为本作虚构街段或器具组合的精确证明。馆藏图片未复制入本作。' },
] as const;
export const facts = [
  { id:'F01', sourceIds:['S01','S02'], text:'武汉地方饮食语境中，“过早”指吃早餐。' },
  { id:'F02', sourceIds:['S01','S03'], text:'热干面的辨识元素包含碱水面、芝麻酱及掸面等工艺。' },
  { id:'F03', sourceIds:['S03'], text:'三鲜豆皮常呈金色方块，包含糯米、鸡蛋与馅料。' },
  { id:'F04', sourceIds:['S02'], text:'面窝厚边薄心的形态与专用铁勺有关。' },
] as const;
