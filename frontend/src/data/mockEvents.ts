export interface HistoricalEvent {
  id: string;
  lat: number;
  lng: number;
  year: number;
  title: string;
  description: string;
}

export const mockEvents: HistoricalEvent[] = [
  {
    id: "1",
    lat: 41.9028,
    lng: 12.4964,
    year: -753,
    title: "罗马建城",
    description: "相传罗慕路斯和瑞摩斯两兄弟在帕拉蒂尼山建立了罗马城，标志着罗马文明的开端。"
  },
  {
    id: "2",
    lat: 34.2655,
    lng: 108.9542,
    year: -221,
    title: "秦始皇统一六国",
    description: "秦始皇嬴政先后灭韩、赵、魏、楚、燕、齐六国，完成了统一中国的大业，建立起中国历史上第一个大一统王朝。"
  },
  {
    id: "3",
    lat: 37.9838,
    lng: 23.7275,
    year: -508,
    title: "克里斯提尼改革",
    description: "克里斯提尼在雅典进行民主改革，确立了雅典民主政治的基础，对西方政治制度产生了深远影响。"
  },
  {
    id: "4",
    lat: 31.7683,
    lng: 35.2137,
    year: -586,
    title: "巴比伦之囚",
    description: "新巴比伦王国国王尼布甲尼撒二世攻陷耶路撒冷，灭亡犹大王国，将大批犹太人掳往巴比伦。"
  },
  {
    id: "5",
    lat: 25.0330,
    lng: 121.5654,
    year: 1949,
    title: "测试事件",
    description: "这是一个测试事件的描述。"
  }
];
