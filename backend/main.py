import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# 尝试导入 google-genai
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

# 尝试导入 requests 和 BeautifulSoup 用于基础抓取
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    pass

load_dotenv()

class HistoricalEvent(BaseModel):
    year: int = Field(description="The year the event happened (e.g., 1999)")
    title: str = Field(description="A concise title for the event")
    description: str = Field(description="A detailed description of the event")
    lat: float = Field(description="Latitude of the event location")
    lng: float = Field(description="Longitude of the event location")
    region: str = Field(description="The geographical region or country where the event occurred")
    relatedEventIds: list[str] = Field(description="List of related event IDs, can be empty", default_factory=list)

class HistoricalEventList(BaseModel):
    events: list[HistoricalEvent] = Field(description="List of extracted historical events")

def fetch_wikipedia_events(year):
    url = f"https://zh.wikipedia.org/zh-cn/{year}年"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        print(f"开始抓取维基百科 {year}年 的词条...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        content_div = soup.find('div', {'id': 'mw-content-text'})
        if content_div:
            raw_text = content_div.get_text(separator='\n', strip=True)
            print(f"成功抓取到内容，总长度: {len(raw_text)} 字符")
            return raw_text
        else:
            print("未找到主要内容区域。")
            return None
            
    except Exception as e:
        print(f"抓取失败: {e}")
        return None

def clean_historical_data_with_llm(raw_text):
    """
    使用 Google Gemini 清洗维基百科生文本，并提取为结构化的 HistoricalEvent JSON。
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not genai:
        print("未安装 google-genai，返回模拟数据...")
        return _mock_cleaned_data()
        
    if not api_key:
        print("未检测到 GEMINI_API_KEY，跳过真实 API 调用，返回模拟数据...")
        return _mock_cleaned_data()

    print("正在调用 Gemini API 清洗历史数据...")
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    你是一个专业的数据清洗助手。你的任务是从以下维基百科生文本中，提取出所有重要的历史事件，并将其转换为指定的 JSON 格式。
    
    目标接口要求每个事件必须包含以下字段：
    - lat (浮点数): 事件发生地的纬度。
    - lng (浮点数): 事件发生地的经度。
    - year (整数): 事件发生的年份。
    - title (字符串): 简明扼要的事件标题。
    - description (字符串): 详细的事件描述。
    - region (字符串): 事件发生的地理区域或国家。
    - relatedEventIds (字符串数组): 相关的事件 ID 列表（如果没有，留空数组）。
    
    原始文本如下：
    {raw_text}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=HistoricalEventList,
                temperature=0.1,
            ),
        )
        # response.text should be a JSON string that matches HistoricalEventList
        return json.loads(response.text)
    except Exception as e:
        print(f"调用 Gemini API 时出错: {e}")
        return _mock_cleaned_data()

def _mock_cleaned_data():
    return {
        "events": [
            {
                "year": 1999,
                "title": "澳门回归中国",
                "description": "1999年12月20日，葡萄牙共和国结束对澳门的管理，澳门主权移交中华人民共和国，澳门特别行政区成立。",
                "lat": 22.1987,
                "lng": 113.5439,
                "region": "中国澳门",
                "relatedEventIds": []
            }
        ]
    }

def run_test_case():
    print("=== 开始运行测试用例 ===")
    test_text = """
    1999年（MCMXCIX）是平年，它的第一天从星期五开始。
    12月20日——澳门回归中国。葡萄牙结束对澳门的统治。
    12月31日——鲍里斯·叶利钦辞去俄罗斯总统职务，由弗拉基米尔·普京代行总统职务。
    """
    
    print("输入测试文本:")
    print(test_text)
    
    result = clean_historical_data_with_llm(test_text)
    
    print("\n--- 清洗后的 JSON 结果 ---")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    
    # 写入本地文件
    output_file = "test_cleaned_data.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dumps(result, ensure_ascii=False, indent=2)
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"\n结果已保存至 {output_file}")

if __name__ == "__main__":
    run_test_case()
