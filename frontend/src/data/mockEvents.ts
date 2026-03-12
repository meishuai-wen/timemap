export interface HistoricalEvent {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  region: string;
  relatedEventIds?: string[];
}

export interface EpochSlice {
  year: number;
  themeSummary: string;
  events: HistoricalEvent[];
}

export const epochSlices: EpochSlice[] = [
  {
    year: -221,
    themeSummary: " 东方大一统与西方争霸的前奏\,
 events: [
 { id: \1\, lat: 34.2655, lng: 108.9542, title: \秦始皇统一六国\, description: \秦始皇统一六国，建立中国历史上第一个大一统帝国。修筑万里长城，统一车轨、文字、度量衡。\, region: \东方（中国）\, relatedEventIds: [\2\, \5\, \7\] },
 { id: \2\, lat: 41.9028, lng: 12.4964, title: \第二次布匿战争前夕\, description: \罗马共和国与迦太基正处于第二次布匿战争前夕（前218年爆发）。地中海世界正处于霸权交替的关键节点。\, region: \西方（罗马/迦太基）\, relatedEventIds: [\4\, \8\] },
 { id: \3\, lat: 31.2001, lng: 29.9187, title: \第四次叙利亚战争\, description: \拉菲亚战役中托勒密埃及击败塞琉古帝国。\, region: \中东\ }
 ]
 },
 {
 year: 14,
 themeSummary: \鼎盛帝国的危机与变革\,
 events: [
 { id: \4\, lat: 41.9028, lng: 12.4964, title: \奥古斯都逝世\, description: \罗马帝国第一任皇帝奥古斯都逝世，提比略继任。此前不久罗马军团在条顿堡森林战役惨败，停止向日耳曼尼亚扩张。\, region: \西方（罗马帝国）\ },
 { id: \5\, lat: 34.2655, lng: 108.9542, title: \王莽改制\, description: \王莽代汉建新，实行王莽改制。此时正处于改革引发社会动荡，绿林赤眉起义酝酿的时期。\, region: \东方（中国）\, relatedEventIds: [\1\] }
 ]
 },
 {
 year: 1492,
 themeSummary: \全球化的开端与东方帝国的平稳期\,
 events: [
 { id: \6\, lat: 37.1773, lng: -3.5986, title: \收复失地运动完成\, description: \西班牙攻陷格拉纳达，完成收复失地运动。同年哥伦布发现美洲新大陆，开启大航海时代。\, region: \欧洲/美洲（西班牙）\, relatedEventIds: [\8\, \9\] },
 { id: \7\, lat: 39.9042, lng: 116.4074, title: \弘治中兴\, description: \明朝弘治五年，明孝宗在位，史称弘治中兴。明朝处于政治清明、经济繁荣的内向型发展阶段。\, region: \东方（中国明朝）\, relatedEventIds: [\1\, \10\] }
 ]
 },
 {
 year: 1789,
 themeSummary: \旧制度的崩溃与新秩序的建立\,
 events: [
 { id: \8\, lat: 48.8566, lng: 2.3522, title: \法国大革命爆发\, description: \巴黎人民攻占巴士底狱，法国大革命爆发，发布《人权宣言》。\, region: \欧洲（法国）\, relatedEventIds: [\2\, \6\] },
 { id: \9\, lat: 40.7128, lng: -74.0060, title: \美国联邦政府成立\, description: \乔治·华盛顿就任美国第一任总统，联邦政府正式成立，美国宪法生效。\, region: \美洲（美国）\, relatedEventIds: [\6\] },
 { id: \10\, lat: 39.9042, lng: 116.4074, title: \乾隆盛世与闭关锁国\, description: \清朝处于康乾盛世顶峰，但马戛尔尼使团访华前夕，清政府依然实行严格的闭关锁国政策。\, region: \东方（中国清朝）\, relatedEventIds: [\7\] }
 ]
 }
];
