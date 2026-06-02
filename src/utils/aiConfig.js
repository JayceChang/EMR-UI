/**
 * AI 配置管理工具
 * 负责本地 JSON 配置文件的读取、保存和管理
 */

// 配置文件名
const CONFIG_FILE_NAME = 'ai-config.json';

// 默认配置
const DEFAULT_CONFIG = {
    apiUrl: '/ollama',
    model: 'qwen3:32b',
    prompt: `你是一个专业的医疗质控AI助手。请对以下医疗数据进行严格质控审核，必须按照指定格式返回JSON结果。

审核规则：{rules}

待审核数据：{data}

请仔细分析数据，识别可能存在的质控问题。

重要提示：必须严格按照以下JSON格式返回结果，不要添加任何其他文字、说明或注释：

{
  "emr_quality_control": {
    "患者ID": "从待审核数据中提取的患者ID，如果没有则填写'未知患者'",
    "质控状态": "已质控",
    "AI质控结果": "需人工复核",
    "质控医生": "AI助手",
    "质控时间": "${new Date().toISOString()}"
  },
  "quality_issues": []
}

如果发现问题，则quality_issues数组中应包含问题对象：

{
  "emr_quality_control": {
    "患者ID": "从待审核数据中提取的患者ID",
    "质控状态": "已质控",
    "AI质控结果": "需人工复核",
    "质控医生": "AI助手",
    "质控时间": "${new Date().toISOString()}"
  },
  "quality_issues": [
    {
      "问题类型": "诊断逻辑错误",
      "问题描述": "患者症状与诊断不符，建议重新评估诊断",
      "问题位置": "主要诊断字段",
      "解决状态": "待解决"
    }
  ]
}

专业医疗质控审核标准：

🔥 重要原则：不要简单地标记字段为空的问题，要基于医疗专业知识判断真正的质控问题

1. **严重质控问题**（必须识别）：
   - 医疗安全隐患：药物剂量异常、过敏药物使用、禁忌症用药等
   - 诊断逻辑错误：诊断与症状、检查结果明显不符
   - 时间逻辑矛盾：出院时间早于入院时间、死亡时间早于入院时间等
   - 关键医疗编码错误：ICD-10诊断编码与诊断名称不匹配
   - 费用逻辑异常：费用金额异常高或异常低、收费项目与诊疗不符

2. **一般质控问题**：
   - 文档完整性：必要的医疗文书缺失（入院记录、手术记录等）
   - 编码不规范：药品编码、医疗服务编码格式不标准但不影响医疗安全
   - 数据一致性：同一患者不同记录中的基本信息不一致
   - 流程规范性：医疗流程不符合规范但不影响治疗效果

3. **忽略的情况**（不应作为问题）：
   - 可选字段为空：如患者家属信息、备注信息等
   - 合理的空值：如健康患者的并发症字段为空
   - 不适用的字段：如门诊患者的住院相关字段为空
   - 部分检查结果为空：患者可能未进行某些检查

4. **问题类型参考**：
   - "医疗安全问题"：药物过敏、剂量异常等
   - "诊断逻辑错误"：诊断与症状不符
   - "时间逻辑矛盾"：时间顺序不合理
   - "编码错误"：ICD编码错误
   - "费用异常"：费用与诊疗不符
   - "文档缺失"：必要文书缺失
   - "数据不一致"：相关数据矛盾
   - "流程不规范"：医疗流程问题

严格要求：
1. 只返回JSON格式，不要添加任何说明文字
2. 确保JSON格式正确，可以被JSON.parse()解析
3. 如果没有发现问题，quality_issues必须是空数组[]
4. AI质控结果统一设置为"需人工复核"
5. 患者ID从数据中提取，没有则填"未知患者"
6. 时间使用ISO 8601格式`,
    stream: true,
    timeout: 120,
    temperature: 0.3
};

/**
 * 从本地存储加载配置
 * @returns {Object} 配置对象
 */
export function loadAiConfig() {
    try {
        const configStr = localStorage.getItem(CONFIG_FILE_NAME);
        if (configStr) {
            const config = JSON.parse(configStr);
            // 合并默认配置，确保新增字段有默认值
            return {...DEFAULT_CONFIG, ...config};
        }
    } catch (error) {
        console.warn('加载 AI 配置失败:', error);
    }

    return {...DEFAULT_CONFIG};
}

/**
 * 保存配置到本地存储
 * @param {Object} config 配置对象
 * @returns {boolean} 是否保存成功
 */
export function saveAiConfig(config) {
    try {
        // 验证配置
        if (!validateConfig(config)) {
            throw new Error('配置验证失败');
        }

        const configStr = JSON.stringify(config, null, 2);
        localStorage.setItem(CONFIG_FILE_NAME, configStr);

        console.log('AI 配置已保存:', config);
        return true;
    } catch (error) {
        console.error('保存 AI 配置失败:', error);
        return false;
    }
}

/**
 * 验证配置的有效性
 * @param {Object} config 配置对象
 * @returns {boolean} 是否有效
 */
export function validateConfig(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }

    // 验证必填字段
    const requiredFields = ['apiUrl', 'model', 'prompt'];
    for (const field of requiredFields) {
        if (!config[field] || typeof config[field] !== 'string' || config[field].trim() === '') {
            console.error(`配置字段 ${field} 无效`);
            return false;
        }
    }

    // 验证 API 地址格式
    // 支持完整URL和相对路径
    if (config.apiUrl.startsWith('/')) {
        // 相对路径，格式正确
    } else {
        try {
            new URL(config.apiUrl);
        } catch {
            console.error('API 地址格式无效');
            return false;
        }
    }

    // 验证数值类型字段
    if (config.timeout && (typeof config.timeout !== 'number' || config.timeout < 10 || config.timeout > 300)) {
        console.error('超时时间设置无效');
        return false;
    }

    if (config.temperature && (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 1)) {
        console.error('温度参数设置无效');
        return false;
    }

    return true;
}

/**
 * 重置为默认配置
 * @returns {Object} 默认配置
 */
export function resetToDefaultConfig() {
    const defaultConfig = {...DEFAULT_CONFIG};
    saveAiConfig(defaultConfig);
    return defaultConfig;
}

/**
 * 检查 AI 服务是否可用
 * @param {string} apiUrl API 地址
 * @returns {Promise<boolean>} 是否可用
 */
export async function checkAiService(apiUrl) {
    try {
        const response = await fetch(`${apiUrl}/api/tags`, {
            method: 'GET',
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        console.error('检查 AI 服务失败:', error);
        return false;
    }
}

/**
 * 获取可用的模型列表
 * @param {string} apiUrl API 地址
 * @returns {Promise<Array>} 模型列表
 */
export async function getAvailableModels(apiUrl) {
    try {
        const response = await fetch(`${apiUrl}/api/tags`);
        if (response.ok) {
            const data = await response.json();
            return data.models || [];
        }
    } catch (error) {
        console.error('获取模型列表失败:', error);
    }
    return [];
}

/**
 * 构建医疗质控审核的JSON Schema（完整版本，包含质控记录+问题列表）
 * 注意：此Schema只包含AI应返回的字段，不包含数据库系统级字段（如id、create_time、update_time、emr_content_id等，这些由后端系统自动设置）
 * @returns {Object} JSON Schema对象
 */
export function buildAuditJSONSchema() {
    return {
        type: "object",
        properties: {
            emr_quality_control: {
                type: "object",
                properties: {
                    "患者ID": {
                        type: "string",
                        description: "患者的唯一标识ID"
                    },
                    "质控状态": {
                        type: "string",
                        description: "质控任务的状态",
                        enum: ["已质控", "质控中", "待质控"]
                    },
                    "AI质控结果": {
                        type: "string",
                        description: "AI质控的结果（统一设置为需人工复核）",
                        enum: ["需人工复核"]
                    },
                    "质控医生": {
                        type: "string",
                        description: "执行质控的医生信息"
                    },
                    "质控时间": {
                        type: "string",
                        description: "质控任务执行的时间，ISO格式"
                    }
                },
                required: ["患者ID", "质控状态", "AI质控结果", "质控医生", "质控时间"]
            },
            quality_issues: {
                type: "array",
                description: "质控发现的问题列表",
                items: {
                    type: "object",
                    properties: {
                        "问题类型": {
                            type: "string",
                            description: "问题的分类"
                        },
                        "问题描述": {
                            type: "string",
                            description: "问题的详细说明"
                        },
                        "问题位置": {
                            type: "string",
                            description: "问题在文档中的位置"
                        },
                        "解决状态": {
                            type: "string",
                            description: "问题的处理状态",
                            enum: ["待解决", "处理中", "已解决"]
                        }
                    },
                    required: ["问题类型", "问题描述", "问题位置", "解决状态"]
                }
            }
        },
        required: ["emr_quality_control", "quality_issues"]
    };
}

/**
 * 构建质量问题JSON Schema（简化版本，只包含问题列表）
 * 注意：此Schema只包含AI应返回的字段，不包含数据库系统级字段（如id、create_time、update_time、emr_content_id等，这些由后端系统自动设置）
 * @returns {Object} JSON Schema对象
 */
export function buildQualityIssuesJSONSchema() {
    return {
        type: "object",
        properties: {
            quality_issues: {
                type: "array",
                description: "质控发现的问题列表",
                items: {
                    type: "object",
                    properties: {
                        "问题类型": {
                            type: "string",
                            description: "问题的分类"
                        },
                        "问题描述": {
                            type: "string",
                            description: "问题的详细说明"
                        },
                        "问题位置": {
                            type: "string",
                            description: "问题在文档中的位置"
                        },
                        "解决状态": {
                            type: "string",
                            description: "问题的处理状态",
                            enum: ["待解决", "处理中", "已解决"]
                        }
                    },
                    required: ["问题类型", "问题描述", "问题位置", "解决状态"]
                }
            }
        },
        required: ["quality_issues"]
    };
}

/**
 * 调用 AI API 进行推理
 * @param {Object} config AI 配置
 * @param {string} prompt 完整的 prompt
 * @param {Function} onStream 流式回调函数
 * @param {boolean} useSchema 是否使用JSON Schema强制格式化
 * @param {boolean} isFirstContent 是否为第一个内容（决定使用哪种JSON Schema）
 * @returns {Promise<string>} 完整响应
 */
export async function callAiAPI(config, prompt, onStream = null, useSchema = true, isFirstContent = true) {
    const {apiUrl, model, stream, timeout, temperature} = config;

    const requestBody = {
        model,
        prompt,
        stream: stream && typeof onStream === 'function',
        options: {
            temperature: temperature || 0.3
        }
    };

    // 根据参数决定使用哪种JSON Schema
    if (useSchema) {
        if (isFirstContent) {
            // 第一个内容：使用完整的JSON Schema（包含质控记录+问题列表）
            requestBody.format = buildAuditJSONSchema();
        } else {
            // 后续内容：使用简化的JSON Schema（只包含问题列表）
            requestBody.format = buildQualityIssuesJSONSchema();
        }
    } else {
        requestBody.format = 'json';
    }

    try {
        const response = await fetch(`${apiUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout((timeout || 120) * 1000)
        });

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        if (stream && onStream) {
            // 流式处理
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const {value, done} = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (data.response) {
                                fullResponse += data.response;
                                onStream(data.response, fullResponse);
                            }
                        } catch (e) {
                            // 忽略 JSON 解析错误
                        }
                    }
                }
            }

            return fullResponse;
        } else {
            // 非流式处理
            const data = await response.json();
            return data.response || '';
        }
    } catch (error) {
        console.error('调用 AI API 失败:', error);
        throw error;
    }
}

/**
 * 根据病历类型获取专门的审核标准
 * @param {string} contentType 病历类型
 * @returns {string} 针对性的审核标准
 */
function getAuditStandardsByContentType(contentType) {
    const standards = {
        '入院记录': `
专业医疗质控审核标准（入院记录）：

🔥 重要原则：基于实际入院记录数据格式，重点关注医疗逻辑性和安全性
数据格式特点：包含科室、记录ID、详细记录内容、结构化字段（主诉、现病史、既往史、体格检查等）、患者基本信息

1. **严重质控问题**：
   - 主诉与现病史逻辑严重不符（如主诉腰痛但现病史描述头痛）
   - 既往史中的过敏史与当前用药存在冲突
   - 初步诊断与症状、检查结果明显矛盾（如诊断心梗但心电图正常且无胸痛）
   - 生命体征异常但未在病史中体现（如血压200/120mmHg但未提及高血压）
   - 危重症状未得到相应重视（如意识障碍但入院诊断为轻症）

2. **一般质控问题**：
   - 现病史时间描述不清晰（如"几天前"、"最近"等模糊时间）
   - 体格检查与症状不够匹配但不影响诊疗安全
   - 家族史、个人史记录简略但包含关键信息

3. **忽略的情况**（以下为空值是正常的）：
   - 病房、床号等管理信息空白
   - 与当前疾病无关的体格检查项目未详述
   - 签名时间、医师签名等流程信息缺失
   - 邮编、详细地址等非医疗关键信息空白`,

        '医嘱': `
专业医疗质控审核标准（医嘱）：

🔥 重要原则：基于医嘱数据格式，严格审核用药安全性和医嘱逻辑性
数据格式特点：包含医嘱ID、医嘱类型、医嘱项目、长期/临时、医嘱状态、时间信息、医师信息、药物详细信息

1. **严重质控问题**：
   - 药物单次剂量明显异常（如成人阿司匹林500mg tid，剂量过大）
   - 医嘱时间逻辑错误（开始时间晚于审核时间、结束时间早于开始时间）
   - 医嘱状态与时间不符（如医嘱状态为"执行"但无开始时间）
   - 药物与患者年龄不符（如儿童禁用药物用于儿童）
   - 给药途径明显错误（如口服药物标记为静脉注射）

2. **一般质控问题**：
   - 临时医嘱与长期医嘱分类可能不当
   - 执行频率表述不标准但可理解
   - 医嘱项目名称不够规范但不影响执行

3. **忽略的情况**（以下为空值是正常的）：
   - 药物商品名、通用名、国药准字号等可能为空（特别是检查类医嘱）
   - 结束时间空白（长期医嘱正常情况）
   - 总剂量、剂量单位可能为空（非药物医嘱）
   - 需要皮试为空或默认值`,

        '检验报告': `
专业医疗质控审核标准（检验报告）：

🔥 重要原则：基于检验报告数据格式，关注危急值和结果准确性
数据格式特点：包含检验报告ID、标本信息、时间序列、检验项目、结构化检验结果数组

1. **严重质控问题**：
   - 检验结果严重异常但结果提示为"正常"（如血糖20mmol/L提示正常）
   - 危急值未标识（如血钾2.0mmol/L未标识为异常）
   - 检验指标与正常值范围明显不匹配
   - 采样时间晚于报告时间（时间逻辑错误）
   - 标本类型与检验项目不符（如用尿液做血常规）

2. **一般质控问题**：
   - 部分检验指标缺少单位但数值合理
   - 正常值范围格式不标准但可理解
   - 某些非关键时间点记录不完整

3. **忽略的情况**（以下为空值是正常的）：
   - 检验结果原文可能为空
   - 部分检验指标的最大值、最小值为空
   - 单位字段空白但从正常值可推断
   - 预约时间可能为空（急诊检验）`,

        '检查报告': `
专业医疗质控审核标准（检查报告）：

🔥 重要原则：检查结果的临床相关性和准确性
注意：用户数据中未提供检查报告具体格式，应用通用检查报告质控标准

1. **严重质控问题**：
   - 检查结论与影像描述严重矛盾
   - 危急征象未在结论中突出强调
   - 检查部位与申请部位不符
   - 影像学表现与临床症状严重不符
   - 对比剂过敏史被忽视（增强检查）

2. **一般质控问题**：
   - 影像描述不够详细但包含关键信息
   - 检查技术参数记录不完整
   - 建议复查时间不够具体

3. **忽略的情况**（以下为空值是正常的）：
   - 设备型号、参数等技术细节
   - 非病理性表现的详细描述
   - 检查时间的精确分秒`,

        '首次病程记录': `
专业医疗质控审核标准（首次病程记录）：

🔥 重要原则：基于简化的首次病程记录格式，关注核心医疗逻辑
数据格式特点：仅包含科室、记录ID、记录时间等基本信息

1. **严重质控问题**：
   - 记录时间明显不合理（如晚于当前时间很久）
   - 记录时间与入院时间逻辑不符（如首次病程记录时间早于入院时间）

2. **一般质控问题**：
   - 记录ID格式不规范但可识别

3. **忽略的情况**（以下为空值是正常的）：
   - 由于数据格式简化，大部分详细内容缺失是正常的
   - 医师签名、具体病程内容等可能在其他记录中体现`,

        '出院记录': `
专业医疗质控审核标准（出院记录）：

🔥 重要原则：基于出院记录数据格式，确保出院信息完整性和安全性
数据格式特点：包含详细的出院记录内容、入院/出院时间、住院天数、出院医嘱

1. **严重质控问题**：
   - 出院时间早于入院时间
   - 住院天数计算错误（与入院出院时间不符）
   - 出院诊断与入院诊断变化无合理解释（在记录内容中）
   - 出院医嘱存在用药安全隐患
   - 出院时病情评估与治疗效果严重不符

2. **一般质控问题**：
   - 出院医嘱表述不够详细但包含关键信息
   - 住院过程总结可能简略

3. **忽略的情况**（以下为空值是正常的）：
   - 病房信息为空
   - 医师签名、签名时间为空（可能电子签名）
   - 病区信息空白`,

        '病案首页': `
专业医疗质控审核标准（病案首页）：

🔥 重要原则：基于病案首页复杂数据结构，重点关注编码准确性和统计数据完整性
数据格式特点：包含诊断数组、手术数组、患者详细信息、质控信息、医保结算信息

1. **严重质控问题**：
   - 主要诊断ICD编码与诊断名称不匹配
   - 手术操作编码与手术名称不符
   - 患者基本信息内部矛盾（如年龄与出生日期不符）
   - 住院天数计算错误
   - 医保分类错误可能影响费用结算

2. **一般质控问题**：
   - 次要诊断编码不够准确但不影响主要统计
   - 手术级别、麻醉方式等信息不完整
   - 质控信息记录不够详细

3. **忽略的情况**（以下为空值是正常的）：
   - 转科科别（如未转科则为空）
   - 新生儿相关信息（成人患者为空是正常的）
   - 部分医保结算明细可能为空
   - 抢救次数为0是正常的
   - 病理号为"-"或空（未做病理检查）`,

        '体温单': `
专业医疗质控审核标准（体温单）：

🔥 重要原则：基于体温单数组数据格式，关注生命体征监护的连续性和异常值
数据格式特点：包含体温、脉搏、呼吸、血压、尿量、体重等数组，每个包含值、单位、时间

1. **严重质控问题**：
   - 生命体征数值明显异常未标识（如体温>40℃、脉搏>150次/分）
   - 血压数值异常（收缩压>200mmHg或<80mmHg）
   - 生命体征趋势急剧变化未引起注意
   - 时间记录逻辑错误（如记录时间在未来）

2. **一般质控问题**：
   - 某些时间点数据缺失但整体趋势正常
   - 监护频率不够规律但覆盖关键时间点

3. **忽略的情况**（以下为空值是正常的）：
   - 体重值为空（可能未每日称重）
   - 个别时间点的数据空白（患者可能外出检查）
   - 尿量单位可能不一致但可理解（次数vs毫升）`,

        '会诊记录': `
专业医疗质控审核标准（会诊记录）：

🔥 重要原则：基于会诊记录基本格式，关注会诊的及时性和专业性
数据格式特点：包含科室、记录ID、记录时间、记录内容（可能为空）

1. **严重质控问题**：
   - 急诊会诊记录时间延迟过久
   - 会诊记录时间逻辑不合理
   - 记录内容中如有会诊意见与病情明显不符

2. **一般质控问题**：
   - 会诊记录格式不够规范
   - 记录ID格式可能不标准

3. **忽略的情况**（以下为空值是正常的）：
   - 记录内容为空（可能在其他系统记录）
   - 会诊专家签名等信息缺失`,

        '医患沟通记录': `
专业医疗质控审核标准（医患沟通记录）：

🔥 重要原则：基于医患沟通记录格式，确保知情同意的完整性
数据格式特点：包含详细的沟通记录内容，涵盖入院、住院、出院各阶段沟通

1. **严重质控问题**：
   - 知情同意关键信息缺失（如手术风险未告知）
   - 沟通记录与实际治疗方案不符
   - 患者拒绝治疗未明确记录
   - 重要医疗决策无患者或家属确认

2. **一般质控问题**：
   - 沟通记录格式不够规范
   - 某些阶段沟通记录不够详细
   - 签字确认信息不完整

3. **忽略的情况**（以下为空值是正常的）：
   - 部分沟通记录模板内容空白（可能该阶段无特殊情况）
   - 签字栏空白（可能口头沟通）`,

        '医疗费用明细': `
专业医疗质控审核标准（医疗费用明细）：

🔥 重要原则：医疗费用明细不进行任何质控，所有费用相关问题都不报告
数据格式特点：包含费用流水号、医疗目录信息、费用金额、医保相关信息

1. **严重质控问题**：
   - 无（医疗费用明细不进行质控）

2. **一般质控问题**：
   - 无（医疗费用明细不进行质控）

3. **完全不质控的情况**（以下问题不进行任何质控）：
   - 🚫 **时间问题**：费用发生时间的任何格式或合理性问题（如2020-01-12 14:49:16等正常时间）
   - 🚫 **金额计算问题**：数量、单价、总额之间的计算关系
   - 🚫 **编码对应问题**：医疗目录编码与名称的对应关系（如编码27801对应维生素B6等）
   - 🚫 **医保标志问题**：医保谈判药品标志、甲类乙类分类等（政策复杂多变）
   - 🚫 **编码映射问题**：医保目录编码与医疗目录编码的对应关系
   - 🚫 **药品信息问题**：药品编码、名称、规格等医药信息准确性
   - 🚫 **收费标准问题**：定价、自付比例、限价等收费政策相关
   - 🚫 **格式问题**：所有字段的格式、长度、内容等
   - 原费用流水号（非退费单据为空正常）
   - 定价上限金额、自付比例等可能为空
   - 备注信息通常为空
   - 部分医保特殊标志字段为空或默认值

🎯 **重要提醒**：医疗费用明细涉及复杂的医药编码体系和收费政策，AI无法准确判断，因此对此类病历内容直接返回空的质控问题列表，不报告任何问题。`
    };

    return standards[contentType] || standards['入院记录']; // 默认使用入院记录标准
}

/**
 * 从审核数据中提取病历类型
 * @param {string} data 审核数据JSON字符串
 * @returns {string} 病历类型
 */
function extractContentType(data) {
    try {
        const parsedData = JSON.parse(data);

        // 尝试从不同可能的路径获取病历类型
        if (parsedData.emrContent && parsedData.emrContent.病历类型) {
            return parsedData.emrContent.病历类型;
        }

        if (parsedData.emrContent && parsedData.emrContent['病历类型']) {
            return parsedData.emrContent['病历类型'];
        }

        if (parsedData.病历类型) {
            return parsedData.病历类型;
        }

        // 根据数据结构特征智能识别病历类型
        if (parsedData.emrContent) {
            const content = parsedData.emrContent;

            // 入院记录特征：包含主诉、现病史、既往史等
            if (content.主诉 && content.现病史 && content.既往史) {
                return '入院记录';
            }

            // 医嘱特征：包含医嘱ID、医嘱类型、医嘱项目等
            if (content.医嘱ID && content.医嘱类型 && content.医嘱项目) {
                return '医嘱';
            }

            // 检验报告特征：包含检验报告ID、检验结果数组
            if (content.检验报告ID && content.检验结果 && Array.isArray(content.检验结果)) {
                return '检验报告';
            }

            // 体温单特征：包含体温、脉搏等生命体征数组
            if (content.体温 && content.脉搏 && Array.isArray(content.体温) && Array.isArray(content.脉搏)) {
                return '体温单';
            }

            // 出院记录特征：包含出院时间、住院天数、出院医嘱
            if (content.出院时间 && content.住院天数 && content.出院医嘱) {
                return '出院记录';
            }

            // 病案首页特征：包含病案号、诊断数组、手术数组
            if (content.病案号 && content.诊断 && Array.isArray(content.诊断)) {
                return '病案首页';
            }

            // 医疗费用明细特征：包含费用明细流水号、医疗目录编码、费用金额
            if (content.费用明细流水号 && content.医疗目录编码 && content.明细项目费用总额) {
                return '医疗费用明细';
            }

            // 首次病程记录特征：仅包含基本信息，无详细内容
            if (content.科室 && content.记录ID && content.记录时间 && !content.记录内容) {
                return '首次病程记录';
            }

            // 会诊记录特征：包含会诊相关信息
            if (content.科室 && content.记录ID && content.记录时间 &&
                (content.记录内容 === "" || !content.记录内容)) {
                return '会诊记录';
            }

            // 医患沟通记录特征：记录内容包含沟通相关信息
            if (content.科室 && content.记录ID && content.记录内容 &&
                (content.记录内容.includes('沟通') || content.记录内容.includes('知情同意'))) {
                return '医患沟通记录';
            }
        }

        // 兜底逻辑：根据关键字段判断
        const dataStr = JSON.stringify(parsedData);

        // 检查关键字段判断类型
        if (dataStr.includes('医嘱ID') || dataStr.includes('医嘱类型')) {
            return '医嘱';
        }
        if (dataStr.includes('检验报告ID') || dataStr.includes('检验结果')) {
            return '检验报告';
        }
        if (dataStr.includes('体温') && dataStr.includes('脉搏')) {
            return '体温单';
        }
        if (dataStr.includes('出院时间') && dataStr.includes('住院天数')) {
            return '出院记录';
        }
        if (dataStr.includes('病案号') || dataStr.includes('住院号')) {
            return '病案首页';
        }
        if (dataStr.includes('费用明细流水号') || dataStr.includes('医疗目录编码')) {
            return '医疗费用明细';
        }
        if (dataStr.includes('主诉') && dataStr.includes('现病史')) {
            return '入院记录';
        }
        if (dataStr.includes('会诊') || dataStr.includes('consultation')) {
            return '会诊记录';
        }
        if (dataStr.includes('沟通') || dataStr.includes('知情同意')) {
            return '医患沟通记录';
        }
        if (dataStr.includes('检查') || dataStr.includes('影像')) {
            return '检查报告';
        }

        // 如果找不到具体类型，返回默认
        console.warn('无法识别病历类型，使用默认类型：入院记录');
        return '入院记录';
    } catch (e) {
        console.warn('无法解析数据获取病历类型:', e);
        return '入院记录';
    }
}

/**
 * 构建审核用的完整 prompt
 * @param {string} promptTemplate prompt 模板
 * @param {string} rules 规则内容
 * @param {string} data 待审核数据
 * @param {boolean} isFirstContent 是否为患者的第一个内容
 * @returns {string} 完整的 prompt
 */
export function buildAuditPrompt(promptTemplate, rules, data, isFirstContent = true) {
    const currentTime = new Date().toISOString();

    // 提取病历类型并获取对应的审核标准
    const contentType = extractContentType(data);
    const auditStandards = getAuditStandardsByContentType(contentType);

    let finalPrompt;

    if (isFirstContent) {
        // 第一个内容：使用完整审核模板（包含 emr_quality_control + quality_issues）
        finalPrompt = `你是一个专业的医疗质控AI助手。请对以下【${contentType}】进行严格质控审核，必须按照指定格式返回JSON结果。

🔥 重要说明：
1. 这是患者多个病历内容中的第一个内容审核，还有其他内容待审核，因此质控状态应为"质控中"，审核结果应为"需人工复核"
2. 当前审核的病历类型是：【${contentType}】，请根据该类型的专业质控标准进行审核

审核规则：${rules || '无特定规则'}

待审核数据：${data || '无数据'}

请仔细分析数据，识别可能存在的质控问题。

重要提示：必须严格按照以下JSON格式返回结果，不要添加任何其他文字、说明或注释：

{
  "emr_quality_control": {
    "患者ID": "请注意：患者ID会在后端自动赋值，此字段可以忽略",
    "质控状态": "质控中",
    "AI质控结果": "需人工复核",
    "质控医生": "AI助手",
    "质控时间": "${currentTime}"
  },
  "quality_issues": []
}

如果发现问题，则quality_issues数组中应包含问题对象：

{
  "emr_quality_control": {
    "患者ID": "请注意：患者ID会在后端自动赋值，此字段可以忽略",
    "质控状态": "质控中",
    "AI质控结果": "需人工复核",
    "质控医生": "AI助手",
    "质控时间": "${currentTime}"
  },
  "quality_issues": [
    {
      "问题类型": "诊断逻辑错误",
      "问题描述": "患者症状与诊断不符，建议重新评估诊断",
      "问题位置": "主要诊断字段",
      "解决状态": "待解决"
    }
  ]
}

${auditStandards}

严格要求：
1. 只返回JSON格式，不要添加任何说明文字
2. 确保JSON格式正确，可以被JSON.parse()解析
3. **重点**：根据【${contentType}】的特点识别专业质控问题，避免过度关注无关字段为空的情况
4. 如果没有发现真正的质控问题，quality_issues必须是空数组[]
5. 🔥 重要：这是患者的第一个内容审核，状态必须设为"质控中"+"需人工复核"（因为还有其他内容待审核）
6. 患者ID会在后端自动处理，此处可以忽略或填写任意值
7. 时间使用ISO 8601格式
8. **质控原则**：宁可漏检一般问题，不可漏检严重问题；宁可少报问题，不可误报问题
9. 🚫 **禁止返回系统级字段**：不要在返回的JSON中包含任何数据库系统级字段（如emr_content_id、id、create_time、update_time等），这些字段将由系统自动设置`;
    } else {
        // 后续内容：只需要审核问题，返回简化的JSON格式
        finalPrompt = `你是一个专业的医疗质控AI助手。请对以下【${contentType}】进行质控审核，识别其中的质量问题。

🔥 重要说明：当前审核的病历类型是：【${contentType}】，请根据该类型的专业质控标准进行审核

审核规则：${rules || '无特定规则'}

待审核数据：${data || '无数据'}

请仔细分析病历内容，识别可能存在的质控问题。

重要提示：只需返回质量问题列表，必须严格按照以下JSON格式返回结果，不要添加任何其他文字、说明或注释：

{
  "quality_issues": []
}

如果发现问题，则在quality_issues数组中包含问题对象：

{
  "quality_issues": [
    {
      "问题类型": "诊断逻辑错误",
      "问题描述": "患者症状与诊断不符，建议重新评估诊断",
      "问题位置": "主要诊断字段",
      "解决状态": "待解决"
    }
  ]
}

${auditStandards}

严格要求：
1. 只返回JSON格式，不要添加任何说明文字
2. 确保JSON格式正确，可以被JSON.parse()解析
3. **重点**：根据【${contentType}】的特点识别专业质控问题，避免过度关注无关字段为空的情况
4. 如果没有发现真正的质控问题，quality_issues必须是空数组[]
5. 专注于病历内容质量问题的识别
6. **质控原则**：宁可漏检一般问题，不可漏检严重问题；宁可少报问题，不可误报问题
7. 🚫 **禁止返回系统级字段**：不要在返回的JSON中包含任何数据库系统级字段（如emr_content_id、id、create_time、update_time等），这些字段将由系统自动设置`;
    }

    return finalPrompt;
}

/**
 * 验证AI返回的JSON结构是否符合数据库表结构
 * 注意：AI返回的JSON不应包含数据库系统级字段（如id、create_time、update_time、emr_content_id等，这些由后端系统自动设置）
 * @param {Object} jsonResult AI返回的JSON对象
 * @returns {boolean} 是否符合要求
 */
export function validateAuditResult(jsonResult) {
    if (!jsonResult || typeof jsonResult !== 'object') {
        console.error('AI返回结果不是有效的JSON对象:', jsonResult);
        return false;
    }

    console.log('开始验证AI审核结果:', JSON.stringify(jsonResult, null, 2));

    // 尝试多种可能的字段名格式
    let qualityControl = null;
    let qualityIssues = null;

    // 检查质控数据 - 支持多种字段名和嵌套结构
    const possibleQualityControlPaths = [
        'emr_quality_control',
        'quality_control',
        '质控结果',
        'audit_result',
        'quality_result',
        'emr_audit',
        'audit',
        'control',
        'result'
    ];

    for (const path of possibleQualityControlPaths) {
        if (jsonResult[path] && typeof jsonResult[path] === 'object') {
            qualityControl = jsonResult[path];
            console.log(`找到质控数据字段: ${path}`);
            break;
        }
    }

    // 如果没有找到嵌套的质控数据，尝试从根对象提取
    if (!qualityControl) {
        console.log('尝试从根对象提取质控数据...');
        // 检查根对象是否直接包含质控字段
        const qualityControlFields = ['患者ID', 'patient_id', 'patientId', 'AI质控结果', 'quality_result', 'result'];
        const hasDirectFields = qualityControlFields.some(field => jsonResult[field] !== undefined);

        if (hasDirectFields) {
            console.log('检测到根对象包含质控字段，使用根对象作为质控数据');
            qualityControl = jsonResult;
        }
    }

    if (!qualityControl || typeof qualityControl !== 'object') {
        console.error('缺少质控数据字段，支持的字段名:', possibleQualityControlPaths);
        console.error('完整的AI响应:', JSON.stringify(jsonResult, null, 2));
        return false;
    }

    // 检查问题列表 - 支持多种字段名
    const possibleIssuesPaths = [
        'quality_issues',
        'issues',
        '问题列表',
        'problems',
        'quality_problems',
        'audit_issues',
        'findings',
        'errors'
    ];

    for (const path of possibleIssuesPaths) {
        if (Array.isArray(jsonResult[path])) {
            qualityIssues = jsonResult[path];
            console.log(`找到问题列表字段: ${path}`);
            break;
        }
    }

    // 如果没有找到问题列表，使用空数组（表示没有问题）
    if (!qualityIssues) {
        console.log('未找到问题列表，使用空数组');
        qualityIssues = [];
    }

    if (!Array.isArray(qualityIssues)) {
        console.error('问题列表不是数组格式，支持的字段名:', possibleIssuesPaths);
        console.error('问题列表数据:', qualityIssues);
        return false;
    }

    // 验证质控数据的基本结构
    const hasValidQualityControl = validateQualityControl(qualityControl);
    if (!hasValidQualityControl) {
        console.error('质控数据验证失败');
        return false;
    }

    // 验证问题列表的基本结构
    const hasValidIssues = validateQualityIssues(qualityIssues);
    if (!hasValidIssues) {
        console.error('问题列表验证失败');
        return false;
    }

    console.log('AI审核结果验证通过');
    return true;
}

/**
 * 标准化AI返回的审核结果格式
 * 注意：标准化过程不会添加数据库系统级字段（如id、create_time、update_time、emr_content_id等），这些由后端系统处理
 * @param {Object} aiResult AI返回的原始结果
 * @returns {Object} 标准化后的结果
 */
export function normalizeAuditResult(aiResult) {
    console.log('开始标准化AI审核结果:', aiResult);

    // 提取质控数据 - 使用与验证函数相同的逻辑
    let qualityControl = null;
    const possibleQualityControlPaths = [
        'emr_quality_control',
        'quality_control',
        '质控结果',
        'audit_result',
        'quality_result',
        'emr_audit',
        'audit',
        'control',
        'result'
    ];

    for (const path of possibleQualityControlPaths) {
        if (aiResult[path] && typeof aiResult[path] === 'object') {
            qualityControl = aiResult[path];
            break;
        }
    }

    // 如果没有找到嵌套的质控数据，尝试从根对象提取
    if (!qualityControl) {
        const qualityControlFields = ['患者ID', 'patient_id', 'patientId', 'AI质控结果', 'quality_result', 'result'];
        const hasDirectFields = qualityControlFields.some(field => aiResult[field] !== undefined);

        if (hasDirectFields) {
            qualityControl = aiResult;
        }
    }

    // 提取问题列表 - 使用与验证函数相同的逻辑
    let qualityIssues = [];
    const possibleIssuesPaths = [
        'quality_issues',
        'issues',
        '问题列表',
        'problems',
        'quality_problems',
        'audit_issues',
        'findings',
        'errors'
    ];

    for (const path of possibleIssuesPaths) {
        if (Array.isArray(aiResult[path])) {
            qualityIssues = aiResult[path];
            break;
        }
    }

    // 如果没有找到问题列表，使用空数组
    if (!qualityIssues) {
        qualityIssues = [];
    }

    // 标准化质控数据
    const normalizedQualityControl = normalizeQualityControl(qualityControl || {});

    // 标准化问题列表
    const normalizedQualityIssues = qualityIssues.map((issue, index) =>
        normalizeQualityIssue(issue, index)
    );

    const normalizedResult = {
        emr_quality_control: normalizedQualityControl,
        quality_issues: normalizedQualityIssues
    };

    console.log('标准化后的结果:', normalizedResult);
    return normalizedResult;
}

/**
 * 标准化质控数据
 * @param {Object} qualityControl 原始质控数据
 * @returns {Object} 标准化后的质控数据
 */
function normalizeQualityControl(qualityControl) {
    const normalized = {};

    // 映射患者ID字段
    const patientIdFields = ['患者ID', 'patient_id', 'patientId', '患者编号', 'patient'];
    for (const field of patientIdFields) {
        if (qualityControl[field]) {
            normalized['患者ID'] = qualityControl[field];
            break;
        }
    }
    if (!normalized['患者ID']) {
        normalized['患者ID'] = '未知患者';
    }

    // 映射质控状态字段
    const statusFields = ['质控状态', 'status', 'state', '状态'];
    for (const field of statusFields) {
        if (qualityControl[field]) {
            normalized['质控状态'] = qualityControl[field];
            break;
        }
    }
    if (!normalized['质控状态']) {
        normalized['质控状态'] = '已质控';
    }

    // 映射AI质控结果字段 - 强制设置为"需人工复核"
    // 注意：无论AI返回什么结果，都必须人工复核
    normalized['AI质控结果'] = '需人工复核';

    // 映射质控医生字段
    const doctorFields = ['质控医生', 'doctor', 'physician', '医生', '审核医生'];
    for (const field of doctorFields) {
        if (qualityControl[field]) {
            normalized['质控医生'] = qualityControl[field];
            break;
        }
    }
    if (!normalized['质控医生']) {
        normalized['质控医生'] = 'AI助手';
    }

    // 映射质控时间字段
    const timeFields = ['质控时间', 'quality_time', 'audit_time', '时间', '审核时间'];
    for (const field of timeFields) {
        if (qualityControl[field]) {
            normalized['质控时间'] = qualityControl[field];
            break;
        }
    }
    if (!normalized['质控时间']) {
        normalized['质控时间'] = new Date().toISOString();
    }

    return normalized;
}

/**
 * 标准化问题数据
 * @param {Object} issue 原始问题数据
 * @param {number} index 问题索引
 * @returns {Object} 标准化后的问题数据
 */
function normalizeQualityIssue(issue, index) {
    const normalized = {};

    // 映射问题类型字段
    const typeFields = ['问题类型', 'type', 'category', '分类', '类型'];
    for (const field of typeFields) {
        if (issue[field]) {
            normalized['问题类型'] = issue[field];
            break;
        }
    }
    if (!normalized['问题类型']) {
        normalized['问题类型'] = '其他问题';
    }

    // 映射问题描述字段
    const descriptionFields = ['问题描述', 'description', 'desc', '描述', 'content', '内容'];
    for (const field of descriptionFields) {
        if (issue[field]) {
            normalized['问题描述'] = issue[field];
            break;
        }
    }
    if (!normalized['问题描述']) {
        normalized['问题描述'] = `问题${index + 1}`;
    }

    // 映射问题位置字段
    const locationFields = ['问题位置', 'location', 'position', '位置', 'page', '页面'];
    for (const field of locationFields) {
        if (issue[field]) {
            normalized['问题位置'] = issue[field];
            break;
        }
    }
    if (!normalized['问题位置']) {
        normalized['问题位置'] = '未知位置';
    }

    // 映射解决状态字段
    const statusFields = ['解决状态', 'status', 'state', '状态', 'resolution'];
    for (const field of statusFields) {
        if (issue[field]) {
            normalized['解决状态'] = issue[field];
            break;
        }
    }
    if (!normalized['解决状态']) {
        normalized['解决状态'] = '待解决';
    }

    return normalized;
}

/**
 * 验证质控数据的基本结构
 * @param {Object} qualityControl 质控数据
 * @returns {boolean} 是否有效
 */
function validateQualityControl(qualityControl) {
    // 检查是否有基本的质控结果字段
    const possibleResultFields = [
        'AI质控结果', 'ai_quality_result', '质控结果', 'quality_result',
        'result', 'status', '结论', '审核结果'
    ];

    const hasResult = possibleResultFields.some(field => qualityControl[field]);
    if (!hasResult) {
        console.error('质控数据缺少结果字段，支持的字段名:', possibleResultFields);
        return false;
    }

    // 检查是否有患者相关字段
    const possiblePatientFields = [
        '患者ID', 'patient_id', 'patientId', '患者编号', 'patient'
    ];

    const hasPatient = possiblePatientFields.some(field => qualityControl[field]);
    if (!hasPatient) {
        console.warn('质控数据缺少患者ID字段，但继续处理');
    }

    return true;
}

/**
 * 验证问题列表的基本结构
 * @param {Array} qualityIssues 问题列表
 * @returns {boolean} 是否有效
 */
function validateQualityIssues(qualityIssues) {
    if (qualityIssues.length === 0) {
        console.log('问题列表为空，这是正常的');
        return true;
    }

    // 检查每个问题是否有基本的描述字段
    const possibleDescriptionFields = [
        '问题描述', 'description', 'desc', '描述', 'content', '内容'
    ];

    const possibleTypeFields = [
        '问题类型', 'type', 'category', '分类', '类型'
    ];

    for (let i = 0; i < qualityIssues.length; i++) {
        const issue = qualityIssues[i];
        if (!issue || typeof issue !== 'object') {
            console.error(`第${i + 1}个问题格式无效`);
            return false;
        }

        // 检查是否有描述字段
        const hasDescription = possibleDescriptionFields.some(field => issue[field]);
        if (!hasDescription) {
            console.error(`第${i + 1}个问题缺少描述字段，支持的字段名:`, possibleDescriptionFields);
            return false;
        }

        // 检查是否有类型字段（可选）
        const hasType = possibleTypeFields.some(field => issue[field]);
        if (!hasType) {
            console.warn(`第${i + 1}个问题缺少类型字段，但继续处理`);
        }
    }

    return true;
}

/**
 * 导出配置到文件
 * @param {Object} config 配置对象
 */
export function exportConfigToFile(config) {
    try {
        const configStr = JSON.stringify(config, null, 2);
        const blob = new Blob([configStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('导出配置失败:', error);
        throw error;
    }
}

/**
 * 从文件导入配置
 * @param {File} file 配置文件
 * @returns {Promise<Object>} 配置对象
 */
export function importConfigFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target.result);
                if (validateConfig(config)) {
                    resolve(config);
                } else {
                    reject(new Error('配置文件格式无效'));
                }
            } catch (error) {
                reject(new Error('配置文件解析失败'));
            }
        };

        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };

        reader.readAsText(file);
    });
}

/**
 * 测试病历类型识别功能
 * @returns {Object} 测试结果
 */
export function testContentTypeExtraction() {
    const testData = {
        // 入院记录测试数据
        '入院记录': JSON.stringify({
            emrContent: {
                "科室": "颈肩腰腿痛科病区",
                "记录ID": "230256",
                "主诉": " 腰部伴左臀部痛4天。 ",
                "现病史": "自述4天前无明显诱因出现腰部伴左侧臀部疼痛...",
                "既往史": "平素身体状况:一般，20多年前患\"腰椎间盘突出症\"...",
                "个人史": "出生生长于原籍, 无长期外地居住史..."
            }
        }),

        // 医嘱测试数据
        '医嘱': JSON.stringify({
            emrContent: {
                "医嘱ID": "1687253",
                "医嘱类型": "检查",
                "医嘱项目": "数字化摄影（DR）(腰椎，骨盆)",
                "长期或临时": "临时",
                "医嘱状态": "执行"
            }
        }),

        // 检验报告测试数据
        '检验报告': JSON.stringify({
            emrContent: {
                "检验报告ID": "xx",
                "标本类型": "血清",
                "检验项目": "术前八项（化学发光",
                "检验结果": [
                    {"检验指标项": "乙肝e抗原", "结果": "0.010", "结果提示": "正常"}
                ]
            }
        }),

        // 体温单测试数据
        '体温单': JSON.stringify({
            emrContent: {
                "体温": [{"值": "36.30", "单位": "℃", "时间": "2020-01-18 15:00:00"}],
                "脉搏": [{"值": "70", "单位": "次/分钟", "时间": "2020-01-18 15:00:00"}],
                "呼吸": [{"值": "18", "单位": "次/分钟", "时间": "2020-01-18 15:00:00"}]
            }
        }),

        // 出院记录测试数据
        '出院记录': JSON.stringify({
            emrContent: {
                "科室": "xxxxx区",
                "记录ID": "235954",
                "出院时间": "2020-01-19 09:05:00",
                "住院天数": "10",
                "出院医嘱": "1.以休息为主，避免受凉、劳累等。"
            }
        }),

        // 病案首页测试数据
        '病案首页': JSON.stringify({
            emrContent: {
                "病案号": "202000755",
                "住院号": "202000755",
                "诊断": [
                    {"诊断类型": "门诊诊断", "诊断项": "腰椎间盘突出", "主要诊断": "是"}
                ]
            }
        }),

        // 医疗费用明细测试数据
        '医疗费用明细': JSON.stringify({
            emrContent: {
                "费用明细流水号": "10910394",
                "医疗目录编码": "250307002",
                "医疗目录名称": "肌酐测定",
                "明细项目费用总额": "11"
            }
        })
    };

    const results = {};

    for (const [expectedType, testDataStr] of Object.entries(testData)) {
        try {
            const detectedType = extractContentType(testDataStr);
            results[expectedType] = {
                expected: expectedType,
                detected: detectedType,
                success: expectedType === detectedType,
                testData: testDataStr.substring(0, 100) + '...'
            };
        } catch (error) {
            results[expectedType] = {
                expected: expectedType,
                detected: null,
                success: false,
                error: error.message
            };
        }
    }

    return results;
}

/**
 * 测试针对性prompt生成功能
 * @returns {Object} 测试结果
 */
export function testCustomizedPrompts() {
    const testResults = {};
    const supportedTypes = [
        '入院记录', '医嘱', '检验报告', '检查报告', '首次病程记录',
        '出院记录', '病案首页', '体温单', '会诊记录', '医患沟通记录', '医疗费用明细'
    ];

    for (const contentType of supportedTypes) {
        try {
            const auditStandards = getAuditStandardsByContentType(contentType);
            const hasDataFormatDescription = auditStandards.includes('数据格式特点');
            const hasIgnoreEmptyValues = auditStandards.includes('以下为空值是正常的');
            const hasSpecificIssues = auditStandards.includes('严重质控问题');

            testResults[contentType] = {
                hasDataFormatDescription,
                hasIgnoreEmptyValues,
                hasSpecificIssues,
                success: hasDataFormatDescription && hasIgnoreEmptyValues && hasSpecificIssues,
                length: auditStandards.length,
                preview: auditStandards.substring(0, 200) + '...'
            };
        } catch (error) {
            testResults[contentType] = {
                success: false,
                error: error.message
            };
        }
    }

    return testResults;
}

