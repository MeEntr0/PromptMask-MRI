# PromptMask MRI 产品案例说明

## 1. 项目概述

PromptMask MRI 是一个面向盆腔 T2 MRI 的文本提示式解剖结构分割原型。用户可以输入目标结构名称，例如“显示膀胱”或“显示神经血管束”，系统将提示词映射为标准结构标签，并展示对应的 segmentation mask overlay。

项目当前定位为医学影像研究原型，不用于临床诊断、疾病分期或治疗决策。

## 2. 问题背景

传统 multi-organ segmentation 模型通常一次性输出多个固定类别的 mask。对于算法评估，这种方式直观；但在实际查看影像时，用户经常只关心当前任务相关的一个结构。

在盆腔 MRI 场景中，用户可能关注膀胱、直肠、前列腺分区、精囊、闭孔内肌或神经血管束。如果所有结构同时展示，容易造成视觉干扰，降低目标结构查看效率。

## 3. 目标用户

第一目标用户：

- 医学影像医生
- 放疗科医生
- 医学影像研究人员

第二目标用户：

- 医学图像标注人员
- 医学生和临床科研人员
- AI 医学影像产品或算法团队

## 4. 核心用户场景

用户打开一张盆腔 T2 MRI，希望快速查看某个目标解剖结构。

示例流程：

```text
选择 MRI 示例图
  -> 输入“显示膀胱”
  -> 系统识别目标结构为 bladder
  -> 展示 AI analyzing 状态
  -> 生成膀胱 mask overlay
  -> 用户调节透明度或切换其他目标结构
```

## 5. 产品方案

PromptMask MRI 将传统“模型输出所有结构”的方式转化为“用户指定目标结构”的交互方式。

核心能力：

- 文本 prompt 输入
- 结构快捷选择
- prompt-to-label 映射
- mock inference 状态流
- 单目标 mask overlay
- 透明度与颜色调节
- 本地图像预览
- PNG 结果导出

## 6. MVP 范围

当前 MVP 支持 8 个前景解剖结构：

| 中文结构 | Label |
|---|---|
| 膀胱 | bladder |
| 骨骼 | bone |
| 闭孔内肌 | obturator internus |
| 前列腺外周带 | PZ |
| 前列腺移行带 | TZ |
| 直肠 | rectum |
| 精囊 | seminal vesicle |
| 神经血管束 | NVB |

MVP 暂不做：

- 癌症自动诊断
- 肿瘤良恶性判断
- 治疗建议
- 临床报告生成
- PACS 集成
- 真实患者数据在线上传

## 7. Mock-first, Model-ready 设计

当前 demo 同时支持两种展示模式：

- 合成 MRI 图像和 mock masks：覆盖 8 个前景结构，用于验证 text-guided segmentation 的完整交互闭环。
- 真实样例模式：使用一张已授权展示的盆腔 MRI PNG 切片和膀胱 mask PNG，用于展示项目与真实医学影像数据的连接。

真实模型接入时，前端流程保持不变：

```text
Frontend
  -> Prompt parser
  -> Inference adapter
  -> PyTorch segmentation model
  -> Binary mask
  -> Overlay visualization
```

这种设计降低了早期演示对 GPU、数据格式和模型服务的依赖，同时为后续接入真实模型保留接口。

## 8. 数据与隐私边界

公开仓库默认不包含真实训练数据、NIfTI、DICOM 或患者相关信息。

当前真实样例仅提交必要 PNG 资产，已去除图像中的参考线和非必要标注，用于产品演示，不作为临床诊断依据。

如果后续加入真实 MRI 示例，应满足：

- 已获得明确公开展示授权
- 已去除患者姓名、ID、日期、医院等信息
- 不包含原始 DICOM header
- 仅提交必要的 PNG 示例或 overlay 结果
- README 中说明数据来源与使用边界

## 9. 产品价值

PromptMask MRI 的核心价值不是“自动诊断”，而是把医学图像分割能力转化为可交互的目标结构查看流程。

对用户的价值：

- 只查看当前关注结构
- 减少多 mask 同屏干扰
- 用自然语言表达查看意图
- 通过 overlay 快速理解结构位置
- 为后续真实模型接入和更多结构扩展提供产品基础

## 10. 后续路线

1. 接入真实 PyTorch 模型推理。
2. 支持 NIfTI 上传和 slice 选择。
3. 加入真实授权样例图和 overlay 结果。
4. 支持 current vs previous scan 对比。
5. 增加 Dice、off-target Dice 和 prompt confusion matrix 等模型质量说明。
6. 在合法数据集支持下扩展更多 MRI 场景。
