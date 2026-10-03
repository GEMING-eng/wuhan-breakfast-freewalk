export type ShopId = 'noodle' | 'doupi' | 'mianwo';
export type ObjectId = 'sauceJar' | 'spatula' | 'stool';
export type Screen = 'welcome' | 'present-entry' | 'past-street' | 'shop' | 'photo-return' | 'present-ending';
export type End = { type:'next'; target:string } | { type:'choices' } | { type:'returnMenu'; shop:ShopId; topic:string } | { type:'completeShop'; shop:ShopId } | { type:'ready' };
export interface DialogueNode { id:string; speaker:string; text:string; expression:'neutral'|'warm'|'thought'; contentType:'fictionalDialogue'; end:End; alternate?:{ withoutShop:ShopId; text:string } }
export interface Topic { id:string; label:string; target:string; requires?:ObjectId }
export interface Shop { id:ShopId; name:string; owner:string; subtitle:string; prefix:string; object:ObjectId; objectName:string; detail:string; reaction:string; topics:Topic[]; memory:{ title:string; text:string }; food:{ sensory:string; text:string; sourceIds:string[]; factIds:string[]; contentType:'sourcedFact' }; anchors:{ owner:[number,number]; object:[number,number]; food:[number,number] }; portraitFocus:number }
export const shopIds:ShopId[] = ['noodle','doupi','mianwo'];
export const shops:Record<ShopId,Shop> = {
  noodle:{id:'noodle',name:'热干面铺',owner:'林姐',subtitle:'一碗面，唤醒一天',prefix:'n',object:'sauceJar',objectName:'芝麻酱罐',detail:'罐口有一圈用过的痕迹，旁边的勺子已经磨亮。',reaction:'这个罐子啊，天天都要拿起来。',portraitFocus:.36,anchors:{owner:[.245,.40],object:[.36,.70],food:[.54,.80]},topics:[{id:'n_a',label:'为什么大家说“过早”？',target:'n_topic_a_01'},{id:'n_b',label:'这碗面的香从哪里来？',target:'n_topic_b_01'},{id:'n_follow',label:'你怎么记住每个人的口味？',target:'n_follow_01',requires:'sauceJar'}],memory:{title:'一碗面的清晨',text:'过早把一天的脚步，与一口热食连在一起。'},food:{sensory:'芝麻香从碗边升起来。',text:'热干面是武汉过早的代表性食物。碱水面、芝麻酱等形成它容易辨认的风味。',sourceIds:['S01','S03'],factIds:['F01','F02'],contentType:'sourcedFact'}},
  doupi:{id:'doupi',name:'豆皮铺',owner:'周师傅',subtitle:'一口锅，慢慢看出分寸',prefix:'d',object:'spatula',objectName:'旧锅铲',detail:'木柄磨得圆滑，挂在离锅很近的位置。',reaction:'这把今天不拿来用，放在这里，看着顺眼。',portraitFocus:.37,anchors:{owner:[.22,.40],object:[.43,.43],food:[.53,.78]},topics:[{id:'d_a',label:'豆皮里是什么？',target:'d_topic_a_01'},{id:'d_b',label:'怎么知道这一锅好了？',target:'d_topic_b_01'},{id:'d_follow',label:'这把旧锅铲为什么还留着？',target:'d_follow_01',requires:'spatula'}],memory:{title:'手上的分寸',text:'手艺不只写在配方里，也在一次次观察和练习里。'},food:{sensory:'外层与糯米，藏着两种口感。',text:'三鲜豆皮常呈金色方块，包含外层、糯米和馅料。不同层次形成它的口感。',sourceIds:['S03'],factIds:['F03'],contentType:'sourcedFact'}},
  mianwo:{id:'mianwo',name:'面窝摊',owner:'陈伯',subtitle:'一张凳，留一点坐下的时间',prefix:'m',object:'stool',objectName:'小木凳',detail:'凳面磨得发亮，边角有几处旧磕痕。它就在照片中同一个位置。',reaction:'看到这张凳子了？来，把照片翻过来。',portraitFocus:.35,anchors:{owner:[.22,.40],object:[.44,.86],food:[.54,.66]},topics:[{id:'m_a',label:'为什么叫面窝？',target:'m_topic_a_01'},{id:'m_b',label:'这张凳子给谁坐？',target:'m_topic_b_01'},{id:'m_follow',label:'照片背面的留言，你怎么看？',target:'m_follow_01',requires:'stool'}],memory:{title:'街坊的一张凳',text:'食物之外，留下的还有招呼、停留和相处。'},food:{sensory:'一圈金黄，中间留下一处窝。',text:'面窝厚边与薄心的形态，和专用铁勺有关，形成不同的口感。关于它的起源，仍有缺乏文字记录的传说。',sourceIds:['S02'],factIds:['F04'],contentType:'sourcedFact'}}
};
export const dialogue:Record<string,DialogueNode> = {};
function sequence(ids:string[], lines:[string,string][], end:End, expressions:DialogueNode['expression'][] = []) {
  ids.forEach((id,i)=>{if(dialogue[id]) throw Error('Duplicate '+id); dialogue[id]={id,speaker:lines[i][0],text:lines[i][1],expression:expressions[i]??'neutral',contentType:'fictionalDialogue',end:i<ids.length-1?{type:'next',target:ids[i+1]}:end};});
}
function numbered(prefix:string,count:number) {return Array.from({length:count},(_,i)=>prefix+String(i+1).padStart(2,'0'));}
sequence(numbered('intro_',3),[['我','整理家里的相册时，我找到一张没有署名的照片。'],['我','背面只有一句话——“先坐下，吃口热的。”'],['我','我想知道，照片里的这顿过早，是怎样的一段清晨。']],{type:'next',target:'pick_photo'});
sequence(['pick_photo'],[['我','照片里，像是有一缕热气在慢慢升起。']],{type:'ready'});
sequence(['street_01','street_02','street_ready'],[['我','照片里的清晨，忽然有了声音。'],['林姐','站在街口看半天了，来过早啊？'],['我','点店主聊聊，也可以看看店里的东西。']],{type:'ready'});
sequence(numbered('n_greet_',3),[['林姐','先看看？面就在这儿。'],['我','我带着一张老照片，想认认里面的生活。'],['林姐','那就慢慢看。看街上的人，也看这只碗。']],{type:'next',target:'n_menu'},['neutral','neutral','warm']);
sequence(numbered('n_topic_a_',3),[['林姐','先吃口东西，再去忙一天的事。我这铺子，也是跟着大家的脚步醒的。'],['林姐','有的端着走，有的坐一会儿。赶不赶时间，一眼就看得出来。'],['我','原来我看到的，不只是早餐，也是一天开始的样子。']],{type:'returnMenu',shop:'noodle',topic:'n_a'});
sequence(numbered('n_topic_b_',3),[['林姐','先闻闻这罐芝麻酱。香味在这儿，碗里还得拌开。'],['林姐','这一碗少点辣，下一碗酱厚些。有人刚开口，我就认出来了。'],['我','一样的面，到了不同的人手里，又有不同的习惯。']],{type:'returnMenu',shop:'noodle',topic:'n_b'},['neutral','warm','warm']);
sequence(numbered('n_follow_',4),[['我','你怎么记住每个人的口味？'],['林姐','来得多了，就熟了。拌面的功夫，也能问一句今天忙不忙。'],['林姐','去看看隔壁吧。周师傅还在看他的那口锅，可不爱分神。'],['我','这罐酱，连着一碗面，也连着许多个清晨里的招呼。']],{type:'completeShop',shop:'noodle'},['neutral','warm','warm','warm']);
sequence(numbered('d_greet_',3),[['周师傅','往旁边站一点，锅还热。'],['我','林姐让我来看看。不过，我也想听听你的事。'],['周师傅','看可以。先看边，再看中间，别只看热闹。']],{type:'next',target:'d_menu'});
dialogue.d_greet_02.alternate={withoutShop:'noodle',text:'我在街口看到这口锅，想来看看。'};
sequence(numbered('d_topic_a_',3),[['周师傅','别让名字骗了，里面还有糯米和配料。看清楚，再尝。'],['我','表面和里面，是两层不同的感觉。'],['周师傅','吃东西，有时候也要留心。']],{type:'returnMenu',shop:'doupi',topic:'d_a'});
sequence(numbered('d_topic_b_',3),[['周师傅','眼睛看，耳朵听，手上也得有分寸。'],['周师傅','我年轻时也做坏过。下回知道该看哪里，就是学到一点。'],['我','配方能写下来，注意什么却得有人提醒。']],{type:'returnMenu',shop:'doupi',topic:'d_b'},['neutral','thought','thought']);
sequence(numbered('d_follow_',4),[['我','这把旧锅铲为什么还留着？'],['周师傅','是教我做的人留下的。看到它，就想起他让我再等一会儿的样子。'],['周师傅','如今我也要这样提醒年轻人。不是照搬我的手，是让他学会自己看。'],['我','留下来的不只是一把工具，还有看待这一口锅的方法。']],{type:'completeShop',shop:'doupi'},['neutral','thought','thought','thought']);
sequence(numbered('m_greet_',3),[['陈伯','站着累不累？这边有凳子。'],['我','我刚才在照片里，也看见了它。'],['陈伯','东西没多少，坐一坐的地方，总要有。']],{type:'next',target:'m_menu'},['neutral','neutral','warm']);
sequence(numbered('m_topic_a_',3),[['陈伯','看中间这一处凹下去，边上又厚一些。'],['陈伯','我摆在这里，来的人一眼就认得。'],['我','原来形状也是记住食物的一种办法。']],{type:'returnMenu',shop:'mianwo',topic:'m_a'});
sequence(numbered('m_topic_b_',3),[['陈伯','谁来谁坐。买不买东西，都能歇一会儿。'],['陈伯','有人说两句话就走，有人等熟人路过，一等就是半个早上。'],['我','街上的路，也会在一张小凳子旁边慢下来。']],{type:'returnMenu',shop:'mianwo',topic:'m_b'},['warm','warm','warm']);
sequence(numbered('m_follow_',4),[['我','“先坐下，吃口热的。”这句话是写给谁的？'],['陈伯','我不知道是谁写的。倒像街上每天都会说的一句招呼。'],['陈伯','碗、锅、凳子，都得有人用。有人来，这个清晨才算热闹。'],['我','也许照片留下的，不是一个答案，而是邀请人坐下的心意。']],{type:'completeShop',shop:'mianwo'},['neutral','warm','warm','warm']);
sequence(numbered('return_',3),[['我','照片还是这张照片，我却认出了更多东西。'],['我','一罐酱，一把旧工具，一张小凳子。'],['我','它们把一段清晨，留在了街上。']],{type:'ready'});
sequence(numbered('ending_',4),[['我','回到今天，门面和器具已经有了变化。'],['当代店主','坐下吃，还是带着走？'],['我','留下来的，并不一定是原来的样子。'],['我','也有一口味道，一点手上的经验，和一句愿意招呼人的话。']],{type:'ready'});
sequence(['partial_01','partial_02'],[['我','我先把照片收好。还有一些故事，留在那条街里。'],['当代店主','坐下吃，还是带着走？']],{type:'ready'});
shopIds.forEach(id=>{const s=shops[id];sequence([s.prefix+'_menu'],[[s.owner,'慢慢看，想聊哪一件事？']],{type:'choices'}); sequence([s.prefix+'_observe_01'],[[s.owner,s.reaction]],{type:'ready'});});
export const title = '过早旧影';
