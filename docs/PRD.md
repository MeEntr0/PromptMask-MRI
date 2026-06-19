# PromptMask MRI PRD

## 1. 文档信息

- 产品名称：PromptMask MRI
- 文档类型：产品需求文档
- 当前版本：PRD v0.3
- 目标阶段：Research Prototype MVP
- 项目基础：基于文本提示的盆腔 T2 MRI 解剖结构分割模型
- 产品边界：Research demo，不用于临床诊断、疾病分期或治疗决策

## 2. 产品一句话介绍

PromptMask MRI 是一个面向盆腔 T2 MRI 的文本提示式解剖结构分割可视化工具。用户上传或选择一张盆腔 MRI 图像后，可以通过文本提示指定目标解剖结构，系统经过模型分析后展示对应的 binary segmentation mask overlay，帮助用户更聚焦地查看当前关注的盆腔结构。

## 3. 产品定位

PromptMask MRI 不是自动诊断系统，而是一个将 prompt-guided medical image segmentation 能力产品化的医学影像研究原型。

产品当前聚焦于：

- 盆腔 T2 MRI
- 单目标解剖结构分割
- Text Prompt -> Target Structure Mask
- 医学影像结构查看与 AI 分割结果可视化
- Prompt-guided segmentation workflow

当前产品不覆盖其他 MRI 部位，也不宣称可以识别疾病、判断肿瘤性质或替代医生决策。

## 4. 产品背景

传统多器官医学图像分割模型通常输出固定类别的多个 mask。对于算法研究，这种输出方式便于计算 Dice、IoU 等指标；但在具体影像查看场景中，医生或研究人员并不总是需要同时查看所有结构。

在盆腔 T2 MRI 中，用户可能只想关注某一个目标结构，例如膀胱、直肠、前列腺分区、精囊或神经血管束。如果系统一次展示全部结构，可能造成视觉干扰，影响用户聚焦当前目标结构。

PromptMask MRI 基于提示式分割框架：

```text
Image + Text Prompt -> Binary Mask
```

系统将多类别分割任务转换为按目标结构提示生成二值 mask 的交互方式。用户不再被动查看所有固定类别输出，而是主动通过 prompt 指定当前关注的结构。

## 5. 模型能力基础

当前模型能力包括：

- 面向盆腔 T2 MRI 解剖结构分割
- 基于 U-Net 的医学图像分割 backbone
- 将多类别标签转换为按结构 prompt 生成的 binary mask
- 使用轻量级文本编码器将结构名称映射为文本向量
- 通过 FiLM 条件调制机制融合文本信息与 U-Net 解码特征
- 使用 Dice Loss + BCE Loss 训练 prompt-conditioned segmentation head
- 通过 Dice、off-target Dice、prompt confusion matrix 等指标评估分割质量与 prompt 可控性

该模型为产品提供 AI 能力基础。MVP 阶段可优先使用 mock data 验证产品交互闭环，后续再接入真实模型推理服务。

## 6. 支持的解剖结构

当前模型标签共 9 类：背景 + 8 个前景解剖结构。

背景类不作为用户可选目标。PromptMask MRI 面向用户暴露 8 个前景结构作为可提示目标。

| 类别 | 中文名称 | 英文 Label | 是否作为 Prompt Target | 说明 |
|---|---|---|---|---|
| 0 | 背景 | background | 否 | 模型训练标签，不作为用户选择项 |
| 1 | 膀胱 | bladder | 是 | 盆腔 MRI 常见结构 |
| 2 | 骨骼 | bone | 是 | 盆腔解剖定位参考结构 |
| 3 | 闭孔内肌 | obturator internus | 是 | 盆腔肌肉结构 |
| 4 | 前列腺外周带 | prostate peripheral zone / PZ | 是 | 前列腺分区结构 |
| 5 | 前列腺移行带 | prostate transition zone / TZ | 是 | 前列腺分区结构 |
| 6 | 直肠 | rectum | 是 | 盆腔和放疗相关常见关注结构 |
| 7 | 精囊 | seminal vesicle | 是 | 前列腺相关影像场景常见结构 |
| 8 | 神经血管束 | neurovascular bundle / NVB | 是 | 小结构，适合体现目标结构提示的价值 |

## 7. 初始医学场景

MVP 初始场景选择：

**盆腔 T2 MRI 解剖结构查看，重点面向前列腺相关 MRI 结构定位与盆腔结构辅助可视化。**

选择该场景的原因：

- 与当前模型和训练标签集一致
- 膀胱、直肠、精囊、前列腺分区、神经血管束等结构都位于盆腔场景内
- 前列腺相关 MRI 场景天然需要关注局部解剖结构
- 适合展示 target-specific segmentation，而不是泛泛展示所有器官 mask

产品表述应避免宣称「诊断前列腺癌」。更合适的定位是：

> 帮助用户在盆腔 T2 MRI 中按目标结构查看 AI 分割结果，作为医学影像研究和结构可视化辅助。

## 8. 目标用户

### 8.1 第一目标用户

医学影像医生 / 放疗科医生。

他们在查看盆腔 MRI 时，可能需要快速定位某个目标结构，理解其位置、边界和与周围结构的关系。

### 8.2 第二目标用户

- 医学影像 AI 研究人员
- 医学图像标注人员
- 医学生和临床科研人员
- 前列腺相关 MRI 研究人员

## 9. 用户痛点

### 9.1 当前只关心某一个结构

用户查看盆腔 MRI 时，很多情况下只想关注某个目标结构，例如 neurovascular bundle 或 prostate peripheral zone，而不是全部结构。

### 9.2 多结构 mask 容易造成视觉干扰

多器官分割同时展示多个 mask 时，可能遮挡 MRI 原图，使用户难以聚焦当前目标结构。

### 9.3 小结构和边界不清结构查看成本高

神经血管束、前列腺分区、闭孔内肌等结构在 MRI 中可能边界不够直观，AI mask overlay 可以作为辅助视觉提示。

### 9.4 分割模型输出与用户意图之间缺少交互层

传统分割模型通常直接输出固定类别结果，用户缺少一种自然方式表达“我现在只想看这个结构”。

### 9.5 上传图像后缺少清晰处理反馈

真实模型推理需要等待。如果没有 loading、状态提示和结果反馈，用户难以理解系统正在分析目标结构。

## 10. 产品目标

### 10.1 MVP 目标

构建一个稳定、可演示、可扩展的 AI 医学影像研究原型，让用户完成以下闭环：

```text
选择或上传盆腔 MRI -> 输入目标结构 prompt -> 等待 AI 分析 -> 查看目标结构 mask overlay -> 调节显示效果 -> 切换目标结构
```

### 10.2 产品目标

- 提供 target-specific MRI segmentation workflow
- 降低多 mask 同屏展示造成的视觉干扰
- 支持用户通过文本提示表达当前关注结构
- 将模型分割能力转化为可交互的产品体验
- 为后续真实模型接入、多结构扩展和多场景扩展保留接口

### 10.3 长期目标

在获得更多合法授权数据集后，扩展到更多 MRI 部位、更多解剖结构和更多临床/科研场景。

## 11. 核心使用场景

### 11.1 MVP 场景

用户希望查看一张盆腔 T2 MRI 中的某个目标结构。

示例：

1. 用户进入 PromptMask MRI 工作台。
2. 用户选择一张预置盆腔 MRI 示例图，或上传一张本地盆腔 MRI 图像。
3. 用户输入 prompt：`show neurovascular bundle`。
4. 系统将 prompt 映射到标准结构标签 `neurovascular bundle`。
5. 系统进入 analyzing 状态，提示模型正在分析目标结构。
6. 系统展示对应 mask overlay。
7. 用户调整 mask 透明度。
8. 用户切换到 `rectum`、`bladder` 或 `prostate peripheral zone`。
9. 系统重新展示对应目标结构 mask。

### 11.2 Mock Demo 场景

MVP 阶段可使用 mock data 验证产品交互闭环。

用户体验上仍然呈现为：

```text
输入 prompt -> AI analyzing -> 输出 mask overlay
```

但底层先返回预生成的 MRI 图像和 mask，以保证原型演示稳定。

### 11.3 后续扩展场景

当接入真实模型后，用户可以上传合法授权的盆腔 MRI 图像，系统调用 PyTorch inference service，根据 prompt 生成对应目标结构的 binary mask。

未来获得更多合法数据集后，可以扩展到：

- 其他盆腔结构
- 其他 MRI 序列
- 其他身体部位
- 多器官、多病种科研场景

## 12. 核心用户流程

```text
进入工作台
  -> 选择示例 MRI / 上传 MRI
  -> 输入或选择目标结构
  -> 系统解析 prompt
  -> 系统显示 analyzing 状态
  -> 返回目标结构 binary mask
  -> 展示 MRI + mask overlay
  -> 用户调节透明度
  -> 用户切换目标结构
  -> 用户导出截图或继续查看
```

## 13. MVP 功能范围

### 13.1 P0 必须功能

- 盆腔 MRI 示例图展示
- 支持示例 case 选择
- 文本 prompt 输入框
- 目标结构快捷选择按钮
- 支持 8 个前景解剖结构作为 prompt target
- prompt-to-label 映射
- AI analyzing / loading 状态
- 单目标结构 mask overlay
- mask 透明度调节
- 当前目标结构状态展示
- unsupported prompt 提示
- research demo disclaimer
- mock mask 数据展示

### 13.2 P1 加分功能

- 本地 PNG 上传演示
- overlay 图片导出
- prompt history
- mask 颜色切换
- 多个示例 case 切换
- 展示模型支持结构列表
- 简单展示 inference time
- current scan vs previous scan 对比视图

### 13.3 P2 后续功能

- 接入真实 PyTorch 模型推理
- 支持 NIfTI 上传和 slice 选择
- 支持 DICOM viewer
- 支持多 slice 浏览
- 支持结构体积或面积统计
- 支持医生手动修正 mask
- 支持模型置信度或质量提示
- 支持 prompt confusion 可视化
- 支持 PACS/RIS 集成

## 14. 暂不做功能

MVP 阶段不做以下功能：

- 癌症自动诊断
- 肿瘤良恶性判断
- 疾病分期
- 治疗建议
- 自动生成正式临床报告
- 临床级合规认证
- 真实患者数据公网上传
- 完整 PACS 系统集成
- 医生账号和权限系统
- 复杂 3D 重建
- 多部位 MRI 通用分割平台

## 15. 产品交互设计要点

### 15.1 输入方式

MVP 支持两种输入方式：

- 从预置 case 中选择一张盆腔 MRI 示例图
- 后续支持本地上传 PNG 或 NIfTI 文件

原型阶段建议优先使用预置 case，避免因上传数据格式、模型推理时间或环境问题影响体验验证。

### 15.2 Prompt 输入

用户可以通过两种方式指定目标结构：

- 文本输入，例如 `segment the bladder`
- 快捷按钮，例如 `Bladder`、`Rectum`、`NVB`

系统需要将自然语言 prompt 映射到标准 label。

示例：

| 用户输入 | 标准 Label |
|---|---|
| show bladder | bladder |
| segment rectum | rectum |
| prostate PZ | prostate peripheral zone |
| transition zone | prostate transition zone |
| NVB | neurovascular bundle |
| obturator muscle | obturator internus |

### 15.3 模型分析状态

由于真实模型推理需要等待，产品需要明确展示状态：

- Ready
- Parsing prompt
- AI analyzing target structure
- Mask generated
- Unsupported target
- Error / retry

在 mock demo 中，可以模拟 1-2 秒 analyzing 状态，让用户理解真实产品中的模型调用流程。

### 15.4 结果展示

结果区展示：

- 原始 MRI 图像
- 当前目标结构 mask overlay
- 当前 target label
- mask 透明度控制
- 可选 mask 颜色
- 可选导出按钮

默认一次只显示一个目标结构，避免多 mask 干扰。

## 16. Mock-first, Model-ready 策略

### 16.1 为什么第一版先 mock

MVP 阶段的核心目标是验证产品交互闭环，而不是依赖实时推理环境。

先使用 mock data 有几个优势：

- 原型演示更稳定
- 不依赖 GPU 环境
- 不暴露敏感医学数据
- 可以更快验证 prompt-to-mask 交互
- 有利于先明确产品体验，再接入真实模型

### 16.2 Mock demo 如何设计

准备：

- 1-2 张去标识化或可公开展示的盆腔 MRI PNG
- 8 个前景结构对应的 mock mask
- prompt-to-label 映射表
- 分析中 loading 状态

演示流程：

```text
选择示例 MRI
  -> 输入 show bladder
  -> loading: AI analyzing bladder
  -> 展示 bladder mask
  -> 切换到 neurovascular bundle
  -> loading
  -> 展示 NVB mask
```

### 16.3 后续如何接入真实模型

保持前端调用接口不变，将 mock inference 替换为真实模型服务。

模型服务输入：

- MRI image 或 MRI slice
- text prompt 或 canonical label

模型服务输出：

- binary mask
- target label
- inference time
- optional quality metadata

## 17. 技术规划

### 17.1 前端模块

- MRI viewer
- Case selector
- Upload panel
- Prompt input panel
- Target structure selector
- Mask overlay renderer
- Opacity control
- Analysis status panel
- Export button
- Research disclaimer area

### 17.2 后端模块

- Case metadata service
- Image and mask file service
- Prompt parser
- Mock inference service
- Model inference adapter
- Export service

### 17.3 模型服务模块

真实模型接入后，建议独立为 inference service。

可能流程：

```text
Frontend
  -> Backend API
  -> Prompt Parser
  -> Model Inference Service
  -> Binary Mask
  -> Overlay Visualization
```

### 17.4 数据格式

当前已有数据：

- NIfTI
- PNG

MVP 建议：

- 前端展示优先使用 PNG
- 真实模型实验保留 NIfTI 处理能力
- GitHub 仓库中不要提交未经确认可公开的数据

## 18. 数据与隐私边界

MVP 阶段建议只使用：

- 去标识化数据
- 教学或研究授权数据
- 可公开展示的 PNG 示例
- 不包含患者身份信息的 mask
- 必要时使用合成或重绘示例图

注意事项：

- 不展示患者姓名、ID、出生日期、检查日期等信息
- 不将真实患者 DICOM header 上传到公网
- 不在 GitHub 中提交未经授权的医学影像数据
- 不在日志中保存可识别患者身份的信息
- README 中明确声明项目仅用于 research/demo

## 19. 风险与限制

### 19.1 医疗风险

本产品不提供诊断结论，不判断疾病，不生成治疗建议。所有 mask 仅作为研究和可视化参考。

### 19.2 模型风险

模型可能出现：

- off-target segmentation
- 边界不准确
- prompt confusion
- 小结构漏分割
- 不同 MRI 图像质量下表现不稳定

因此产品界面中不应使用「准确诊断」「临床级」等表述。

### 19.3 数据风险

医学影像数据具有敏感性。即使去掉显式身份信息，也需要确认数据授权和公开展示范围。

### 19.4 产品风险

如果过早扩展到多部位、多病种、多模态，项目会失去焦点。MVP 应坚持聚焦盆腔 T2 MRI 和 target-specific segmentation。

## 20. 成功指标

### 20.1 原型体验指标

- 新用户能在 10 秒内理解产品核心用途
- 用户能顺利完成一次 prompt-to-mask 操作
- 用户能清楚理解当前展示的是哪个目标结构
- 用户能通过透明度调节观察 MRI 原图与 mask overlay
- unsupported prompt 能得到明确反馈
- 用户能理解当前产品是 research demo，而不是诊断工具

### 20.2 后续产品验证指标

- 用户完成目标结构查看所需时间
- prompt 使用频率
- 最常被请求的目标结构
- unsupported prompt 比例
- overlay 导出次数
- 用户对结构切换体验的满意度
- 医生或研究人员对 target-specific workflow 的接受度

## 21. 项目路线图

### Phase 1: Product Definition

- 完成 PRD
- 明确产品定位、用户场景和 MVP 范围
- 整理模型能力与产品体验之间的关系
- 明确数据隐私和研究边界

### Phase 2: Mock Demo

- 准备示例 MRI 图和 mock masks
- 实现 prompt-to-label 交互
- 实现 mask overlay、opacity 和 loading 状态
- 完成可稳定演示的前端原型

### Phase 3: Model-ready Architecture

- 设计后端 API
- 设计 mock inference 和真实 inference 的统一接口
- 准备后续接入 PyTorch 模型

### Phase 4: Real Model Integration

- 接入已训练的 segmentation 模型
- 支持真实推理
- 展示 inference time
- 增加模型质量评估说明

### Phase 5: Data and Scenario Expansion

- 在获得更多合法数据集后扩展更多结构
- 扩展其他 MRI 部位或序列
- 探索配准、随访对比和多模态数据融合

## 22. README 展示结构

README 建议包含：

1. Project Overview
2. Why This Project
3. Product Scenario
4. Supported Pelvic Structures
5. Demo Workflow
6. Key Features
7. MVP Scope
8. Mock-first, Model-ready Design
9. Research Background
10. Limitations
11. Roadmap

