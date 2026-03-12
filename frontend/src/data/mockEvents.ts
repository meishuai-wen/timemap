export interface HistoricalEvent {
  id: string;
  lat: number;
  lng: number;
  year: number;
  title: string;
  description: string;
  region: string;
  relatedEventIds?: string[];
}

export interface DaySlice {
  month: number;
  day: number;
  events: HistoricalEvent[];
}

export const daySlices: DaySlice[] = [
  {
    month: 1, day: 1,
    events: [
      { id: "0101-1", lat: 41.9028, lng: 12.4964, year: -45, title: "儒略历正式启用", description: "罗马共和国开始使用由尤利乌斯·凯撒推行的儒略历，这是现代公历的前身。", region: "欧洲（罗马）" },
      { id: "0101-2", lat: 51.5074, lng: -0.1278, year: 1801, title: "大不列颠及爱尔兰联合王国成立", description: "根据《1800年联合法案》，大不列颠王国与爱尔兰王国合并，联合王国正式成立。", region: "欧洲（英国）" },
      { id: "0101-3", lat: 39.9042, lng: 116.4074, year: 1912, title: "中华民国成立", description: "孙中山在南京就任临时大总统，中华民国临时政府成立，结束了两千多年的帝制。", region: "东亚（中国）" },
    ]
  },
  {
    month: 3, day: 11,
    events: [
      { id: "0311-1", lat: 38.3220, lng: 140.8820, year: 2011, title: "东日本大地震", description: "日本东北部海域发生9.0级地震并引发海啸，导致福岛核电站事故，是日本有记录以来最强地震。", region: "东亚（日本）", relatedEventIds: ["0311-2"] },
      { id: "0311-2", lat: 40.4168, lng: -3.7038, year: 2004, title: "马德里311爆炸案", description: "西班牙马德里通勤列车遭受连环炸弹袭击，造成193人死亡，是欧洲最严重的恐怖袭击之一。", region: "欧洲（西班牙）" },
      { id: "0311-3", lat: 34.2655, lng: 108.9542, year: 702, title: "武则天设武举", description: "武周长安二年，武则天下令开设武举考试，首次以考试形式选拔军事人才，对后世武官选拔制度影响深远。", region: "东亚（中国）" },
    ]
  },
  {
    month: 7, day: 4,
    events: [
      { id: "0704-1", lat: 39.9526, lng: -75.1652, year: 1776, title: "美国独立宣言签署", description: "大陆会议在费城通过《独立宣言》，宣告北美十三个殖民地脱离英国独立，美利坚合众国诞生。", region: "美洲（美国）", relatedEventIds: ["0704-2"] },
      { id: "0704-2", lat: 48.8566, lng: 2.3522, year: 1789, title: "法国大革命前夕", description: "美国独立的成功极大鼓舞了法国启蒙思想家和民众，为同年爆发的法国大革命提供了重要的思想和实践参照。", region: "欧洲（法国）" },
      { id: "0704-3", lat: 30.5728, lng: 104.0668, year: 1904, title: "中国第一条自建铁路动工", description: "詹天佑主持的京张铁路前期勘测工作推进中，这是中国人自主设计建造的第一条干线铁路。", region: "东亚（中国）" },
    ]
  },
  {
    month: 10, day: 1,
    events: [
      { id: "1001-1", lat: 39.9042, lng: 116.4074, year: 1949, title: "中华人民共和国成立", description: "毛泽东在天安门城楼宣告中华人民共和国中央人民政府成立，标志着中国新民主主义革命的胜利。", region: "东亚（中国）", relatedEventIds: ["1001-3"] },
      { id: "1001-2", lat: 52.5200, lng: 13.4050, year: 1990, title: "两德统一", description: "德意志民主共和国（东德）正式并入德意志联邦共和国（西德），德国在分裂45年后重新统一。", region: "欧洲（德国）" },
      { id: "1001-3", lat: 31.2304, lng: 121.4737, year: 1927, title: "南昌起义后续影响", description: "南昌起义打响了武装反抗国民党反动派的第一枪，为中国共产党创建人民军队奠定了基础。", region: "东亚（中国）", relatedEventIds: ["1001-1"] },
    ]
  },
  {
    month: 12, day: 25,
    events: [
      { id: "1225-1", lat: 41.9028, lng: 12.4964, year: 800, title: "查理曼加冕", description: "教皇利奥三世在罗马为法兰克国王查理曼加冕为'罗马人的皇帝'，标志着西欧帝国传统的复兴。", region: "欧洲（法兰克/罗马）" },
      { id: "1225-2", lat: 55.7558, lng: 37.6173, year: 1991, title: "苏联解体", description: "戈尔巴乔夫辞去苏联总统职务，苏联国旗从克里姆林宫降下，苏维埃社会主义共和国联盟正式解体，冷战结束。", region: "欧洲/亚洲（苏联）" },
      { id: "1225-3", lat: 35.6762, lng: 139.6503, year: 1926, title: "日本大正天皇去世", description: "大正天皇去世，裕仁亲王即位，改元昭和，日本进入昭和时代。", region: "东亚（日本）" },
    ]
  },
];

// 辅助函数：根据月日查找
export function getSliceByDate(month: number, day: number): DaySlice | undefined {
  return daySlices.find(s => s.month === month && s.day === day);
}

// 辅助函数：搜索所有事件
export function searchAllEvents(query: string): HistoricalEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return daySlices.flatMap(s => s.events).filter(ev =>
    ev.title.toLowerCase().includes(q) ||
    ev.description.toLowerCase().includes(q) ||
    ev.region.toLowerCase().includes(q) ||
    String(ev.year).includes(q)
  );
}
