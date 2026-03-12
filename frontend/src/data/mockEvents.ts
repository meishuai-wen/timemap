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
    themeSummary: "东方大一统与西方争霸的前奏",
    events: [
      {
        id: "1",
        lat: 34.2655,
        lng: 108.9542,
        title: "秦始皇统一六国",
        description: "秦始皇统一六国，建立中国历史上第一个大一统帝国。修筑万里长城，统一车轨、文字、度量衡。",
        region: "东亚（中国）",
        relatedEventIds: ["2", "5", "7"]
      },
      {
        id: "2",
        lat: 41.9028,
        lng: 12.4964,
        title: "第二次布匿战争前夕",
        description: "罗马共和国与迦太基正处于第二次布匿战争前夕（前218年爆发）。地中海世界正处于霸权交替的关键节点。",
        region: "西欧（罗马/迦太基）",
        relatedEventIds: ["4", "8"]
      },
      {
        id: "3",
        lat: 31.2001,
        lng: 29.9187,
        title: "第四次叙利亚战争",
        description: "拉菲亚战役中托勒密埃及击败塞琉古帝国。",
        region: "中东"
      }
    ]
  },
  {
    year: 14,
    themeSummary: "罗马盛世与王朝危机",
    events: [
      {
        id: "4",
        lat: 41.9028,
        lng: 12.4964,
        title: "奥古斯都去世",
        description: "罗马帝国第一位皇帝奥古斯都去世，结束了长达四十余年的统治。在位期间罗马从内战中恢复，进入相对和平的'罗马和平'时期。但条顿堡森林战役惨败，止步于日耳曼尼亚扩张。",
        region: "欧洲（罗马帝国）"
      },
      {
        id: "5",
        lat: 34.2655,
        lng: 108.9542,
        title: "王莽改制",
        description: "王莽篡汉建新，实施'托古改制'。此时正值西汉末年改革与社会动荡，最终引发赤眉、绿林起义，导致新朝覆灭。",
        region: "东亚（中国）",
        relatedEventIds: ["1"]
      }
    ]
  },
  {
    year: 1492,
    themeSummary: "全球化的开端与东方帝国的平衡",
    events: [
      {
        id: "6",
        lat: 37.1773,
        lng: -3.5986,
        title: "收复失地运动结束",
        description: "格拉纳达陷落，西班牙收复失地运动结束，同年哥伦布发现美洲新大陆，开启大航海时代。",
        region: "欧洲/美洲（西班牙）",
        relatedEventIds: ["8", "9"]
      },
      {
        id: "7",
        lat: 39.9042,
        lng: 116.4074,
        title: "明朝中期",
        description: "明朝弘治五年，孝宗在位。史称'弘治中兴'。社会相对稳定，经济繁荣，但海禁政策依然严格，与欧洲大航海形成鲜明对比。",
        region: "东亚（中国·明朝）",
        relatedEventIds: ["1", "10"]
      }
    ]
  },
  {
    year: 1789,
    themeSummary: "旧制度的崩溃与革命的浪潮",
    events: [
      {
        id: "8",
        lat: 48.8566,
        lng: 2.3522,
        title: "法国大革命爆发",
        description: "巴黎民众攻占巴士底狱，法国大革命爆发，提出'自由、平等、博爱'口号，推翻君主专制，对全球政治产生深远影响。",
        region: "欧洲（法国）",
        relatedEventIds: ["2", "6"]
      },
      {
        id: "9",
        lat: 40.7128,
        lng: -74.0060,
        title: "美国联邦政府成立",
        description: "乔治·华盛顿就任美国第一任总统，联邦政府正式成立，美国宪法开始生效。",
        region: "美洲（美国）",
        relatedEventIds: ["6"]
      },
      {
        id: "10",
        lat: 39.9042,
        lng: 116.4074,
        title: "乾隆盛世接近尾声",
        description: "清朝正处于乾隆盛世末期，虽然国力达到顶峰，但闭关锁国政策使其与欧洲启蒙运动、工业革命渐行渐远，内部腐败与社会矛盾开始显现。",
        region: "东亚（中国·清朝）",
        relatedEventIds: ["7"]
      }
    ]
  }
];
