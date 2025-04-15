// MBTI数据生成脚本
// 生成MBTI题库和类型详情数据，并保存到MongoDB

import { MongoDBService } from "../services/mongodb.service.ts";
import { Logger } from "../utils/logger.ts";

// 创建日志记录器
const logger = new Logger({ prefix: "MBTI-Generator" });

// MBTI问题数据
const mbtiQuestions = [
  {
    id: 1,
    question: "在社交场合中，你通常会：",
    options: [
      { value: "E", text: "认识新朋友，扩大社交圈" },
      { value: "I", text: "与少数几个好友交流，保持安静" }
    ],
    dimension: "EI"
  },
  {
    id: 2,
    question: "你更喜欢的工作环境是：",
    options: [
      { value: "E", text: "开放的协作空间，可以随时与同事交流" },
      { value: "I", text: "安静的独立空间，可以专注思考" }
    ],
    dimension: "EI"
  },
  {
    id: 3,
    question: "在休息日，你更倾向于：",
    options: [
      { value: "E", text: "参加社交活动，与朋友聚会" },
      { value: "I", text: "待在家里，享受个人时光" }
    ],
    dimension: "EI"
  },
  {
    id: 4,
    question: "当别人邀请你参加一个意外的活动时，你通常会：",
    options: [
      { value: "E", text: "感到兴奋并欣然接受" },
      { value: "I", text: "感到压力，需要时间考虑" }
    ],
    dimension: "EI"
  },
  {
    id: 5,
    question: "你更关注：",
    options: [
      { value: "S", text: "具体的事实和细节" },
      { value: "N", text: "概念和可能性" }
    ],
    dimension: "SN"
  },
  {
    id: 6,
    question: "当描述事物时，你倾向于：",
    options: [
      { value: "S", text: "详细描述你所看到和经历的" },
      { value: "N", text: "联想到的想法和潜在意义" }
    ],
    dimension: "SN"
  },
  {
    id: 7,
    question: "你认为自己是：",
    options: [
      { value: "S", text: "实际的，脚踏实地的" },
      { value: "N", text: "创新的，富有想象力的" }
    ],
    dimension: "SN"
  },
  {
    id: 8,
    question: "你更喜欢阅读的书籍是：",
    options: [
      { value: "S", text: "基于事实的、描述真实事件的书" },
      { value: "N", text: "富有想象力的、探索新概念的书" }
    ],
    dimension: "SN"
  },
  {
    id: 9,
    question: "做决定时，你更看重：",
    options: [
      { value: "T", text: "逻辑分析和客观事实" },
      { value: "F", text: "个人价值观和对他人的影响" }
    ],
    dimension: "TF"
  },
  {
    id: 10,
    question: "当朋友有问题向你倾诉时，你更倾向于：",
    options: [
      { value: "T", text: "提供解决问题的建议" },
      { value: "F", text: "表达理解和情感支持" }
    ],
    dimension: "TF"
  },
  {
    id: 11,
    question: "你更欣赏别人称赞你是：",
    options: [
      { value: "T", text: "思维清晰，理性客观" },
      { value: "F", text: "富有同情心，善解人意" }
    ],
    dimension: "TF"
  },
  {
    id: 12,
    question: "面对冲突时，你倾向于：",
    options: [
      { value: "T", text: "直接面对问题，关注事实" },
      { value: "F", text: "考虑各方感受，寻求和谐" }
    ],
    dimension: "TF"
  },
  {
    id: 13,
    question: "你更喜欢：",
    options: [
      { value: "J", text: "计划好的生活，有明确的日程安排" },
      { value: "P", text: "灵活自由的生活，随机应变" }
    ],
    dimension: "JP"
  },
  {
    id: 14,
    question: "工作或学习时，你倾向于：",
    options: [
      { value: "J", text: "提前完成任务，避免最后期限带来的压力" },
      { value: "P", text: "临近截止日期才有工作动力" }
    ],
    dimension: "JP"
  },
  {
    id: 15,
    question: "你的工作环境通常是：",
    options: [
      { value: "J", text: "整洁有序，物品都有固定位置" },
      { value: "P", text: "随意舒适，能找到所需物品就好" }
    ],
    dimension: "JP"
  },
  {
    id: 16,
    question: "计划旅行时，你倾向于：",
    options: [
      { value: "J", text: "提前规划每一天的活动和行程" },
      { value: "P", text: "只规划大致方向，保留即兴探索的空间" }
    ],
    dimension: "JP"
  },
  {
    id: 17,
    question: "当你犯错误时，你通常会：",
    options: [
      { value: "A", text: "接受它并继续前进，相信自己的能力" },
      { value: "T", text: "反复思考，担心可能产生的后果" }
    ],
    dimension: "AT"
  },
  {
    id: 18,
    question: "面对压力和挑战时，你通常：",
    options: [
      { value: "A", text: "保持冷静和自信，相信自己能够应对" },
      { value: "T", text: "感到焦虑和不安，担心自己无法达到期望" }
    ],
    dimension: "AT"
  },
  {
    id: 19,
    question: "对于自己的决定，你通常：",
    options: [
      { value: "A", text: "一旦做出决定就很少怀疑" },
      { value: "T", text: "经常重新考虑并怀疑自己的选择" }
    ],
    dimension: "AT"
  },
  {
    id: 20,
    question: "在团队中，当你的想法被否定时：",
    options: [
      { value: "A", text: "保持自信，不会对自己的能力产生怀疑" },
      { value: "T", text: "开始质疑自己，担心自己的不足" }
    ],
    dimension: "AT"
  }
];

// MBTI类型详情
const mbtiTypes = [
  // ISTJ
  {
    type: "ISTJ-A",
    name: "检查者 (自信型)",
    title: "自信、严谨的现实主义者",
    description: "ISTJ-A型人格是认真负责、注重传统和秩序的实践者，拥有强烈的自信心。他们相信自己的能力和判断，很少怀疑自己的决定。ISTJ-A安静、严肃，追求安全和平静的生活，注重责任感和承诺，做事非常可靠且处变不惊。",
    strengths: ["自信", "可靠", "实际", "逻辑性强", "忠诚", "注重细节", "有组织能力"],
    weaknesses: ["固执", "不善于表达情感", "对变化适应慢", "过于严肃", "判断过快"],
    roles: "哨兵(Sentinel)",
    careers: ["会计师", "工程师", "法官", "军人", "警察", "医生", "牙医"],
    famousPeople: ["伊丽莎白二世", "沃伦·巴菲特", "亨利·福特"]
  },
  {
    type: "ISTJ-T",
    name: "检查者 (谨慎型)",
    title: "谨慎、可靠的现实主义者",
    description: "ISTJ-T型人格是认真负责、注重传统和秩序的实践者，但常常质疑自己的决定。他们对自己的工作有极高的要求，追求完美，害怕出错。ISTJ-T安静、严肃，追求安全和平静的生活，注重责任感和承诺，做事非常可靠但压力较大。",
    strengths: ["细致", "可靠", "实际", "逻辑性强", "忠诚", "注重细节", "有组织能力"],
    weaknesses: ["自我怀疑", "完美主义", "压力大", "过于自我批评", "对变化适应慢", "过于严肃"],
    roles: "哨兵(Sentinel)",
    careers: ["会计师", "研究员", "分析师", "质量控制专家", "项目管理", "数据分析师"],
    famousPeople: ["米尔顿·弗里德曼", "伊斯特伍德", "安吉拉·默克尔"]
  },
  
  // INFJ
  {
    type: "INFJ-A",
    name: "提倡者 (自信型)",
    title: "有远见、自信的理想主义者",
    description: "INFJ-A型人格是富有洞察力和理想主义的人，拥有强烈的自信心。他们有强烈的个人价值观，对于人性、关系和意义等方面有很深的理解，相信自己的直觉和判断。INFJ-A通常很安静，但对自己的理想和价值观坚定不移，能激发他人，有很强的创造力和想象力。",
    strengths: ["自信", "有洞察力", "有创造力", "有同理心", "有决心", "有远见", "善于倾听"],
    weaknesses: ["固执", "过于理想化", "完美主义", "缺乏灵活性", "对批评敏感"],
    roles: "外交家(Diplomat)",
    careers: ["心理咨询师", "作家", "艺术家", "治疗师", "教师", "人力资源专家", "社会活动家"],
    famousPeople: ["马丁·路德·金", "纳尔逊·曼德拉", "歌德"]
  },
  {
    type: "INFJ-T",
    name: "提倡者 (谨慎型)",
    title: "有远见、敏感的理想主义者",
    description: "INFJ-T型人格是富有洞察力和理想主义的人，但常常质疑自己的判断。他们有强烈的个人价值观，对于人性、关系和意义等方面有很深的理解，但容易对自己的直觉产生怀疑。INFJ-T通常很安静，对自己的理想和价值观有坚定的追求，但也常常担忧自己是否做得足够好。",
    strengths: ["敏感", "有洞察力", "有创造力", "有同理心", "有决心", "有远见", "善于倾听"],
    weaknesses: ["自我怀疑", "过于理想化", "完美主义", "容易筋疲力尽", "对批评极度敏感", "情绪波动大"],
    roles: "外交家(Diplomat)",
    careers: ["作家", "艺术家", "治疗师", "咨询师", "教师", "社会工作者", "非营利组织工作"],
    famousPeople: ["德蕾莎修女", "托尔金", "普鲁斯特"]
  },
  {
    type: "ISFJ",
    name: "守卫者",
    title: "尽职尽责的守护者",
    description: "ISFJ型人格是谦虚、勤劳、责任心强的保护者。他们愿意承担责任，注重实际和细节，热爱传统和安全。ISFJ通常非常忠诚，对人有耐心，善于关注他人的需求，为了帮助他人而乐于付出自己的时间和精力。",
    strengths: ["忠诚", "有同情心", "有耐心", "细心", "有责任感", "可靠"],
    weaknesses: ["过于自我牺牲", "回避冲突", "害怕变化", "过于谦虚", "情绪敏感"],
    careers: ["护士", "小学教师", "社会工作者", "行政助理", "客户服务", "室内设计师"],
    famousPeople: ["凯特·米德尔顿", "安妮·海瑟薇", "玛丽·居里"]
  },
  {
    type: "INTJ-A",
    name: "建筑师 (自信型)",
    title: "自信、有策略的思想家",
    description: "INTJ-A型人格是独立、创新、有战略思维的思想家，具有坚定的自信心。他们有强烈的内在动力，追求知识和目标，喜欢分析和构建理论，并且对自己的判断充满信心。INTJ-A型人格独立自主，不断追求改进和效率，在实现长期目标方面表现出非凡的决心和自信。",
    strengths: ["自信", "战略思考", "独立", "有远见", "决断力强", "渊博知识"],
    weaknesses: ["过于批判", "情感表达困难", "完美主义", "过于自信", "不耐烦"],
    roles: "分析师(Analyst)",
    careers: ["科学家", "工程师", "企业战略家", "法官", "系统分析师", "程序员", "企业家"],
    famousPeople: ["伊隆·马斯克", "尼古拉·特斯拉", "弗里德里希·尼采"]
  },
  {
    type: "INTJ-T",
    name: "建筑师 (谨慎型)",
    title: "谨慎、有策略的思想家",
    description: "INTJ-T型人格是独立、创新、有战略思维的思想家，但常常对自己的能力和决策产生怀疑。他们有强烈的内在动力，追求知识和目标，喜欢分析和构建理论，但会对自己的计划不断进行自我审视和完善。INTJ-T型人格独立自主，不断追求改进和效率，但也容易感到焦虑和压力。",
    strengths: ["分析能力强", "战略思考", "独立", "有远见", "渊博知识", "追求完美"],
    weaknesses: ["自我怀疑", "过于批判", "情感表达困难", "完美主义", "焦虑", "压力大"],
    roles: "分析师(Analyst)",
    careers: ["研究员", "学者", "系统架构师", "分析师", "作家", "哲学家"],
    famousPeople: ["艾萨克·牛顿", "史蒂芬·霍金", "马克·扎克伯格"]
  },
  {
    type: "ISTP",
    name: "鉴赏家",
    title: "多才多艺的工匠",
    description: "ISTP型人格是思考者和制造者。他们冷静、安静，热爱探索和理解如何运作。ISTP喜欢用手动方式解决问题，有优秀的机械和技术技能，对风险和刺激有天生的吸引力，行动迅速而精确。",
    strengths: ["观察力敏锐", "实际", "富有探索精神", "冷静", "适应性强", "解决问题能力强"],
    weaknesses: ["容易厌倦", "风险倾向", "不善于长期承诺", "情感表达困难", "固执"],
    careers: ["机械师", "工程师", "飞行员", "运动员", "紧急救援人员", "计算机技术员"],
    famousPeople: ["迈克尔·乔丹", "布鲁斯·李", "克林特·伊斯特伍德"]
  },
  {
    type: "ISFP",
    name: "探险家",
    title: "灵活而迷人的艺术家",
    description: "ISFP型人格是安静、友善、敏感的艺术家。他们热爱生活，欣赏美好事物，注重个人价值观和情感连接。ISFP型人格通常腼腆而谦虚，但内在有着强烈的创造力和艺术感。他们用行动而非言语表达自己，喜欢自由探索。",
    strengths: ["富有艺术感", "敏感", "忠诚", "善良", "富有同情心", "灵活"],
    weaknesses: ["容易受伤", "回避冲突", "过于谦虚", "不善于计划", "容易分心"],
    careers: ["艺术家", "音乐家", "厨师", "设计师", "护士", "森林管理员"],
    famousPeople: ["迈克尔·杰克逊", "鲍勃·迪伦", "大卫·贝克汉姆"]
  },
  {
    type: "INFP",
    name: "调停者",
    title: "富有诗意的理想主义者",
    description: "INFP型人格是温和、体贴的理想主义者，有着强烈的个人价值观和内在理想。他们寻求内心和外界的和谐，对自己和他人有很高的道德标准。INFP型人格通常很好奇，关注可能性，对他人有极强的同理心和理解力。",
    strengths: ["富有创造力", "有同理心", "忠诚", "有适应力", "具有理想主义", "善于语言表达"],
    weaknesses: ["过于理想化", "对批评敏感", "回避冲突", "情绪化", "不切实际"],
    careers: ["作家", "诗人", "艺术家", "心理咨询师", "社会工作者", "教师"],
    famousPeople: ["威廉·莎士比亚", "托尔金", "约翰·列侬"]
  },
  {
    type: "INTP",
    name: "思想家",
    title: "创新的逻辑学家",
    description: "INTP型人格是思想家和发明家。他们喜欢寻找问题的解决方案，重视知识和智力发展，有很强的理论和抽象思维能力。INTP型人格好奇、独立，对于理解世界的底层逻辑有着强烈的渴望，在特定领域可以展现出非凡的专注力。",
    strengths: ["分析能力强", "原创性思考", "开放思想", "客观", "诚实", "富有好奇心"],
    weaknesses: ["过度分析", "情感表达困难", "容易分心", "不切实际", "常常拖延"],
    careers: ["科学家", "程序员", "数学家", "教授", "作家", "分析师"],
    famousPeople: ["阿尔伯特·爱因斯坦", "比尔·盖茨", "查尔斯·达尔文"]
  },
  {
    type: "ESTP",
    name: "企业家",
    title: "大胆而实际的冒险家",
    description: "ESTP型人格是充满活力、灵活的行动者。他们热爱刺激和物质上的享受，学习通过实际经验，善于解决当前问题。ESTP型人格通常乐观、幽默，享受生活，对周围的事物有很强的观察力，能在压力下保持冷静。",
    strengths: ["大胆", "理性", "乐观", "观察力敏锐", "直接", "社交能力强"],
    weaknesses: ["冲动", "缺乏长期计划", "风险倾向", "不敏感", "容易厌倦"],
    careers: ["企业家", "销售代表", "市场营销", "警察", "消防员", "演员"],
    famousPeople: ["唐纳德·特朗普", "麦当娜", "汤姆·克鲁斯"]
  },
  {
    type: "ESFP",
    name: "表演者",
    title: "自发而热情的表演者",
    description: "ESFP型人格是热情、友好的表演者。他们喜欢成为关注的中心，热爱生活，享受当下，乐于与他人分享喜悦。ESFP型人格通常很实际，喜欢通过经验学习，关注细节，是天生的娱乐者和团队活动的促进者。",
    strengths: ["热情", "友好", "幽默", "实际", "细心", "适应性强"],
    weaknesses: ["寻求关注", "容易冲动", "容易分心", "避免冲突", "缺乏长期计划"],
    careers: ["演员", "艺人", "销售", "公关", "旅游顾问", "事件策划师"],
    famousPeople: ["玛丽莲·梦露", "杰米·福克斯", "史蒂夫·欧文"]
  },
  {
    type: "ENFP-A",
    name: "活动家 (自信型)",
    title: "热情洋溢、自信的创新者",
    description: "ENFP-A型人格是充满热情、创造力和社交能力的自由思想家，拥有对自己能力的坚定信心。他们善于发现联系，看到可能性，热爱新想法和人际互动，对自己的直觉判断很少怀疑。ENFP-A型人格通常很有魅力，能激励他人，对生活充满好奇和热情，善于适应变化且不惧挑战。",
    strengths: ["自信", "热情", "创造力强", "善于交际", "有同理心", "灵活", "幽默"],
    weaknesses: ["注意力不集中", "缺乏组织", "过度承诺", "容易厌倦", "有时过于乐观"],
    roles: "探险家(Explorer)",
    careers: ["记者", "演员", "咨询顾问", "营销人员", "企业家", "创意总监", "艺术家"],
    famousPeople: ["奥斯卡·王尔德", "沃尔特·迪士尼", "罗伯特·唐尼"]
  },
  {
    type: "ENFP-T",
    name: "活动家 (谨慎型)",
    title: "热情洋溢、多疑的创新者",
    description: "ENFP-T型人格是充满热情、创造力和社交能力的自由思想家，但常常怀疑自己的决定和能力。他们善于发现联系，看到可能性，热爱新想法和人际互动，但同时会担心自己是否做出了正确的选择。ENFP-T型人格情感丰富且敏感，渴望得到他人的认可，对生活充满热情但也容易感到焦虑。",
    strengths: ["热情", "创造力强", "善于交际", "有同理心", "灵活", "情感丰富", "直觉敏锐"],
    weaknesses: ["自我怀疑", "情绪波动大", "注意力不集中", "过度思考", "对批评敏感", "容易焦虑"],
    roles: "探险家(Explorer)",
    careers: ["艺术家", "音乐家", "作家", "心理咨询师", "教师", "公益组织工作者"],
    famousPeople: ["罗宾·威廉姆斯", "艾伦·德杰尼勒斯", "约翰·列侬"]
  },
  {
    type: "ESTJ-A",
    name: "总裁 (自信型)",
    title: "自信、高效的管理者",
    description: "ESTJ-A型人格是实际、注重事实的管理者，对自己的能力和判断有坚定的信心。他们喜欢秩序和组织，关注细节，有很强的责任感和决断力，很少质疑自己的决策。ESTJ-A型人格通常直接、诚实，遵循传统和规则，在实现目标方面非常有效率且处变不惊。",
    strengths: ["自信", "组织能力强", "专注", "忠诚", "务实", "直接", "负责任"],
    weaknesses: ["固执", "不灵活", "判断过快", "不善于处理情感", "过于专注于规则"],
    roles: "哨兵(Sentinel)",
    careers: ["高管", "经理", "主管", "军官", "法官", "金融分析师", "政府官员"],
    famousPeople: ["米歇尔·奥巴马", "山姆·沃尔顿", "约翰·洛克菲勒"]
  },
  {
    type: "ESTJ-T",
    name: "总裁 (谨慎型)",
    title: "谨慎、高效的管理者",
    description: "ESTJ-T型人格是实际、注重事实的管理者，但常常担心自己是否做得足够好。他们喜欢秩序和组织，关注细节，有很强的责任感和决断力，但也容易对自己的决策产生怀疑。ESTJ-T型人格通常直接、诚实，遵循传统和规则，但对自己有极高的要求和压力。",
    strengths: ["组织能力强", "专注", "忠诚", "务实", "直接", "负责任", "勤奋"],
    weaknesses: ["自我批评", "压力大", "不灵活", "对失败恐惧", "过于苛求", "完美主义"],
    roles: "哨兵(Sentinel)",
    careers: ["项目经理", "质量管理专家", "公务员", "人力资源经理", "行政主管"],
    famousPeople: ["希拉里·克林顿", "索尼娅·索托马约尔", "弗兰克·辛纳屈"]
  },
  {
    type: "ESFJ",
    name: "执政官",
    title: "热心肠的守护者",
    description: "ESFJ型人格是热情、尽责的照顾者。他们重视和谐与合作，注重传统和稳定，有很强的责任感。ESFJ型人格通常热心助人，关注他人的需求，善于组织社交活动，在团队中扮演重要的支持角色。",
    strengths: ["合作", "忠诚", "善解人意", "有责任感", "实际", "善于交际"],
    weaknesses: ["过于敏感", "需要认可", "不灵活", "回避冲突", "过于自我牺牲"],
    careers: ["护士", "教师", "社会工作者", "人力资源专家", "销售代表", "客户服务"],
    famousPeople: ["泰勒·斯威夫特", "比尔·克林顿", "萨利·菲尔德"]
  },
  {
    type: "ENFJ",
    name: "主人公",
    title: "富有魅力的领导者",
    description: "ENFJ型人格是热情、有责任感的领导者。他们有感染力，关注他人的成长和发展，有很强的沟通能力。ENFJ型人格通常非常关心他人的福祉，乐于帮助他人实现潜力，在团队中能激发积极性和协作精神。",
    strengths: ["有同理心", "有领导力", "可靠", "有魅力", "善于交际", "利他主义"],
    weaknesses: ["过于理想化", "过于敏感", "优柔寡断", "需要认可", "过于自我牺牲"],
    careers: ["教师", "咨询师", "人力资源经理", "政治家", "营销人员", "公共关系专家"],
    famousPeople: ["奥普拉·温弗瑞", "巴拉克·奥巴马", "莱昂纳多·迪卡普里奥"]
  },
  {
    type: "ENTJ",
    name: "指挥官",
    title: "大胆而果断的领导者",
    description: "ENTJ型人格是果断、有魄力的领导者。他们有战略思维，能快速识别问题并找到解决方案，追求效率和结果。ENTJ型人格通常自信、直接，有很强的组织能力，在实现长期目标方面表现出色。",
    strengths: ["有决断力", "有效率", "自信", "战略思考", "有领导力", "直接"],
    weaknesses: ["过于自负", "不耐烦", "固执", "冷漠", "咄咄逼人"],
    careers: ["企业高管", "企业家", "律师", "管理顾问", "政治家", "系统分析师"],
    famousPeople: ["史蒂夫·乔布斯", "玛格丽特·撒切尔", "吉姆·卡里"]
  }
];

// 添加MBTI角色分类
const mbtiRoles = [
  {
    role: "分析师(Analyst)",
    types: ["INTJ", "INTP", "ENTJ", "ENTP"],
    description: "分析师类型理性且善于策略思考，他们不断追求知识和能力。他们擅长发现系统和概念中的逻辑，并战略性地解决复杂问题。",
    traits: ["理性", "策略性", "好奇", "独立", "追求知识"],
    color: "紫色"
  },
  {
    role: "外交家(Diplomat)",
    types: ["INFJ", "INFP", "ENFJ", "ENFP"],
    description: "外交家类型富有同理心和理想主义，他们注重个人成长和贡献。他们善于理解他人情感，追求真实的联系，并致力于创造积极影响。",
    traits: ["富有同情心", "理想主义", "和谐", "深度", "利他主义"],
    color: "绿色"
  },
  {
    role: "哨兵(Sentinel)",
    types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
    description: "哨兵类型务实且注重安全，他们重视传统、秩序和稳定性。他们可靠、勤奋，善于维护社会结构和组织。",
    traits: ["实际", "可靠", "有条理", "尽职尽责", "传统"],
    color: "蓝色"
  },
  {
    role: "探险家(Explorer)",
    types: ["ISTP", "ISFP", "ESTP", "ESFP"],
    description: "探险家类型灵活且注重体验当下，他们本能地适应环境。他们热爱自由，擅长观察细节，并能迅速适应新情况。",
    traits: ["灵活", "实用", "自发", "实际", "注重现在"],
    color: "黄色"
  }
];

// 添加MBTI测试结果示例数据
const mbtiTestResults = [
  {
    user_id: "user123",
    nickname: "张三",
    tests: [
      {
        test_id: "test001",
        test_date: new Date("2025-03-15T09:30:00Z"),
        completed: true,
        responses: [
          { question_id: 1, selected_value: "I" },
          { question_id: 2, selected_value: "I" },
          { question_id: 3, selected_value: "I" },
          { question_id: 4, selected_value: "I" },
          { question_id: 5, selected_value: "N" },
          { question_id: 6, selected_value: "N" },
          { question_id: 7, selected_value: "N" },
          { question_id: 8, selected_value: "N" },
          { question_id: 9, selected_value: "T" },
          { question_id: 10, selected_value: "T" },
          { question_id: 11, selected_value: "T" },
          { question_id: 12, selected_value: "T" },
          { question_id: 13, selected_value: "J" },
          { question_id: 14, selected_value: "J" },
          { question_id: 15, selected_value: "J" },
          { question_id: 16, selected_value: "J" },
          { question_id: 17, selected_value: "A" },
          { question_id: 18, selected_value: "A" },
          { question_id: 19, selected_value: "A" },
          { question_id: 20, selected_value: "A" }
        ],
        result: {
          type: "INTJ-A",
          scores: {
            EI_E: 0, EI_I: 4,
            SN_S: 0, SN_N: 4,
            TF_T: 4, TF_F: 0,
            JP_J: 4, JP_P: 0,
            AT_A: 4, AT_T: 0
          }
        }
      }
    ],
    test_count: 1,
    latest_type: "INTJ-A",
    created_at: new Date("2025-03-15T09:00:00Z"),
    updated_at: new Date("2025-03-15T09:30:00Z")
  },
  {
    user_id: "user456",
    nickname: "李四",
    tests: [
      {
        test_id: "test002",
        test_date: new Date("2025-03-10T14:20:00Z"),
        completed: true,
        responses: [
          { question_id: 1, selected_value: "E" },
          { question_id: 2, selected_value: "E" },
          { question_id: 3, selected_value: "E" },
          { question_id: 4, selected_value: "E" },
          { question_id: 5, selected_value: "N" },
          { question_id: 6, selected_value: "N" },
          { question_id: 7, selected_value: "N" },
          { question_id: 8, selected_value: "N" },
          { question_id: 9, selected_value: "F" },
          { question_id: 10, selected_value: "F" },
          { question_id: 11, selected_value: "F" },
          { question_id: 12, selected_value: "F" },
          { question_id: 13, selected_value: "P" },
          { question_id: 14, selected_value: "P" },
          { question_id: 15, selected_value: "P" },
          { question_id: 16, selected_value: "P" },
          { question_id: 17, selected_value: "T" },
          { question_id: 18, selected_value: "T" },
          { question_id: 19, selected_value: "T" },
          { question_id: 20, selected_value: "T" }
        ],
        result: {
          type: "ENFP-T",
          scores: {
            EI_E: 4, EI_I: 0,
            SN_S: 0, SN_N: 4,
            TF_T: 0, TF_F: 4,
            JP_J: 0, JP_P: 4,
            AT_A: 0, AT_T: 4
          }
        }
      },
      {
        test_id: "test003",
        test_date: new Date("2025-04-05T16:45:00Z"),
        completed: true,
        responses: [
          { question_id: 1, selected_value: "E" },
          { question_id: 2, selected_value: "E" },
          { question_id: 3, selected_value: "E" },
          { question_id: 4, selected_value: "I" },
          { question_id: 5, selected_value: "N" },
          { question_id: 6, selected_value: "N" },
          { question_id: 7, selected_value: "N" },
          { question_id: 8, selected_value: "S" },
          { question_id: 9, selected_value: "F" },
          { question_id: 10, selected_value: "F" },
          { question_id: 11, selected_value: "F" },
          { question_id: 12, selected_value: "T" },
          { question_id: 13, selected_value: "P" },
          { question_id: 14, selected_value: "P" },
          { question_id: 15, selected_value: "P" },
          { question_id: 16, selected_value: "J" },
          { question_id: 17, selected_value: "T" },
          { question_id: 18, selected_value: "T" },
          { question_id: 19, selected_value: "T" },
          { question_id: 20, selected_value: "A" }
        ],
        result: {
          type: "ENFP-T",
          scores: {
            EI_E: 3, EI_I: 1,
            SN_S: 1, SN_N: 3,
            TF_T: 1, TF_F: 3,
            JP_J: 1, JP_P: 3,
            AT_A: 1, AT_T: 3
          }
        }
      }
    ],
    test_count: 2,
    latest_type: "ENFP-T",
    created_at: new Date("2025-03-10T14:00:00Z"),
    updated_at: new Date("2025-04-05T16:45:00Z")
  },
  {
    user_id: "user789",
    nickname: "王五",
    tests: [
      {
        test_id: "test004",
        test_date: new Date("2025-03-20T10:15:00Z"),
        completed: false,
        responses: [
          { question_id: 1, selected_value: "I" },
          { question_id: 2, selected_value: "I" },
          { question_id: 3, selected_value: "I" },
          { question_id: 4, selected_value: "I" },
          { question_id: 5, selected_value: "S" },
          { question_id: 6, selected_value: "S" },
          { question_id: 7, selected_value: "S" },
          { question_id: 8, selected_value: "S" }
          // 未完成的测试，只回答了部分问题
        ],
        result: null
      },
      {
        test_id: "test005",
        test_date: new Date("2025-03-22T11:30:00Z"),
        completed: true,
        responses: [
          { question_id: 1, selected_value: "I" },
          { question_id: 2, selected_value: "I" },
          { question_id: 3, selected_value: "I" },
          { question_id: 4, selected_value: "I" },
          { question_id: 5, selected_value: "S" },
          { question_id: 6, selected_value: "S" },
          { question_id: 7, selected_value: "S" },
          { question_id: 8, selected_value: "S" },
          { question_id: 9, selected_value: "T" },
          { question_id: 10, selected_value: "T" },
          { question_id: 11, selected_value: "T" },
          { question_id: 12, selected_value: "T" },
          { question_id: 13, selected_value: "J" },
          { question_id: 14, selected_value: "J" },
          { question_id: 15, selected_value: "J" },
          { question_id: 16, selected_value: "J" },
          { question_id: 17, selected_value: "T" },
          { question_id: 18, selected_value: "T" },
          { question_id: 19, selected_value: "T" },
          { question_id: 20, selected_value: "T" }
        ],
        result: {
          type: "ISTJ-T",
          scores: {
            EI_E: 0, EI_I: 4,
            SN_S: 4, SN_N: 0,
            TF_T: 4, TF_F: 0,
            JP_J: 4, JP_P: 0,
            AT_A: 0, AT_T: 4
          }
        }
      }
    ],
    test_count: 2,
    latest_type: "ISTJ-T",
    created_at: new Date("2025-03-20T10:00:00Z"),
    updated_at: new Date("2025-03-22T11:30:00Z")
  }
];

// 主函数
async function main() {
  try {
    // 创建MongoDB服务实例
    const mongoDBService = new MongoDBService({
      uri: Deno.env.get("MONGODB_URI") || "",
      dbName: "elpis-beta"
    });
    
    logger.info("正在连接到MongoDB...");
    await mongoDBService.connect();
    
    // 检查集合是否存在
    logger.info("正在检查MBTI集合...");
    
    // 创建MBTI问题集合
    logger.info("创建MBTI问题集合...");
    
    try {
      // 获取现有问题
      const existingQuestions = await mongoDBService.find("mbti_questions", {});
      
      // 如果有现有数据，删除它们
      if (existingQuestions.length > 0) {
        logger.info(`发现${existingQuestions.length}个现有问题，正在清空...`);
        // 逐个删除每个问题
        for (const question of existingQuestions) {
          const q = question as Record<string, unknown>;
          if (q._id) {
            await mongoDBService.deleteById("mbti_questions", q._id.toString());
          }
        }
      }
      
      logger.info("已清空旧的MBTI问题数据");
    } catch (error) {
      logger.info("MBTI问题集合可能不存在，将创建新集合");
    }
    
    // 插入MBTI问题
    const questionResult = await mongoDBService.insertMany("mbti_questions", mbtiQuestions as Record<string, unknown>[]);
    logger.info(`已插入${questionResult.count}个MBTI问题到数据库`);
    
    // 创建MBTI类型集合
    logger.info("创建MBTI类型集合...");
    
    try {
      // 获取现有类型
      const existingTypes = await mongoDBService.find("mbti_types", {});
      
      // 如果有现有数据，删除它们
      if (existingTypes.length > 0) {
        logger.info(`发现${existingTypes.length}个现有类型，正在清空...`);
        // 逐个删除每个类型
        for (const type of existingTypes) {
          const t = type as Record<string, unknown>;
          if (t._id) {
            await mongoDBService.deleteById("mbti_types", t._id.toString());
          }
        }
      }
      
      logger.info("已清空旧的MBTI类型数据");
    } catch (error) {
      logger.info("MBTI类型集合可能不存在，将创建新集合");
    }
    
    // 插入MBTI类型信息
    const typeResult = await mongoDBService.insertMany("mbti_types", mbtiTypes as Record<string, unknown>[]);
    logger.info(`已插入${typeResult.count}个MBTI类型信息到数据库`);
    
    // 创建MBTI角色集合
    logger.info("创建MBTI角色集合...");
    
    try {
      // 获取现有角色
      const existingRoles = await mongoDBService.find("mbti_roles", {});
      
      // 如果有现有数据，删除它们
      if (existingRoles.length > 0) {
        logger.info(`发现${existingRoles.length}个现有角色，正在清空...`);
        // 逐个删除每个角色
        for (const role of existingRoles) {
          const r = role as Record<string, unknown>;
          if (r._id) {
            await mongoDBService.deleteById("mbti_roles", r._id.toString());
          }
        }
      }
      
      logger.info("已清空旧的MBTI角色数据");
    } catch (error) {
      logger.info("MBTI角色集合可能不存在，将创建新集合");
    }
    
    // 插入MBTI角色信息
    const roleResult = await mongoDBService.insertMany("mbti_roles", mbtiRoles as Record<string, unknown>[]);
    logger.info(`已插入${roleResult.count}个MBTI角色信息到数据库`);
    
    // 创建MBTI测试结果集合
    logger.info("创建MBTI测试结果集合...");
    
    try {
      // 获取现有测试结果
      const existingTestResults = await mongoDBService.find("mbti_test_results", {});
      
      // 如果有现有数据，删除它们
      if (existingTestResults.length > 0) {
        logger.info(`发现${existingTestResults.length}个现有测试结果，正在清空...`);
        // 逐个删除每个测试结果
        for (const result of existingTestResults) {
          const r = result as Record<string, unknown>;
          if (r._id) {
            await mongoDBService.deleteById("mbti_test_results", r._id.toString());
          }
        }
      }
      
      logger.info("已清空旧的MBTI测试结果数据");
    } catch (error) {
      logger.info("MBTI测试结果集合可能不存在，将创建新集合");
    }
    
    // 插入MBTI测试结果信息
    const testResultResult = await mongoDBService.insertMany("mbti_test_results", mbtiTestResults as Record<string, unknown>[]);
    logger.info(`已插入${testResultResult.count}个MBTI测试结果到数据库`);
    
    logger.info("MBTI数据生成完成！");
    
    // 关闭数据库连接
    await mongoDBService.close();
    
  } catch (error) {
    logger.error("生成MBTI数据失败:", error);
  }
}

// 执行主函数
main(); 