import type {Era} from '../atelier/content';

export type StreetMoment='tea'|'market'|'notice';
export const streetMoments:Record<StreetMoment,{
  label:string;position:[number,number,number];offset:[number,number,number];
  text:Record<Era,{title:string;body:string;detail:string}>;
}>={
  tea:{label:'茶桌边',position:[7.25,1.35,14.4],offset:[-4.5,3.8,6.4],text:{
    past:{title:'茶还热，慢慢坐。',body:'竹壳暖瓶靠着旧收音机，搪瓷杯沿留下了细小的磕碰。早点还没端来，街坊已经聊起今天的天气。',detail:'留意旋钮、杯沿和桌上的一圈水印。'},
    present:{title:'带走一杯，留下一句话。',body:'保温杯、帆布袋和翻开的街巷手册放在原来的木桌上。来看老街的人，也在这里停一停脚。',detail:'桌子没有换，桌上的生活继续添新。'},
  }},
  market:{label:'菜篮旁',position:[-6.3,1.35,13],offset:[5.4,3.5,2.3],text:{
    past:{title:'秤杆轻轻一抬。',body:'蔬菜码进竹筐，杆秤挂在摊边。纸包折好，菜篮一提，又是街坊家常的一顿饭。',detail:'看秤盘的小链、竹篮编纹与纸包折角。'},
    present:{title:'还是这口时鲜。',body:'小电子秤摆上木摊，布袋留在手边。称重的工具换了，慢慢挑菜的习惯还在。',detail:'保留旧木摊，换上今日的小物件。'},
  }},
  notice:{label:'留言板',position:[-5.85,2,-25.5],offset:[5.5,3.2,6],text:{
    past:{title:'一张纸，把邻里连起来。',body:'修伞、借书、招领的小纸条钉在木板上。走过的人读一读，再把消息捎给楼上的街坊。',detail:'这块留言板是情境创作，纸条不是历史档案。'},
    present:{title:'新的纸条，熟悉的关照。',body:'旧木框里贴上了街巷散步与旧物修补的消息。花盆移了位置，愿意相互照应的人仍在这里。',detail:'同一块木框，两种清晨的生活。'},
  }},
};
