# PromptMask MRI

PromptMask MRI is a research prototype for prompt-guided pelvic T2 MRI anatomical structure segmentation. It lets users specify a target structure through text prompts and view the corresponding binary segmentation mask overlay on MRI images.

This project focuses on productizing a text-guided medical image segmentation workflow:

```text
Pelvic MRI + Text Prompt -> Target-specific Binary Mask
```

## Project Status

Current stage: Static mock demo and product documentation.

The first demo version is designed as a mock-first, model-ready prototype. It can use prepared MRI images and mock masks to validate the product workflow before connecting to the trained PyTorch segmentation model.

## Run the Demo

This repository currently ships a dependency-free static prototype.

Open `index.html` directly in a browser, or run a local static server:

```bash
python -m http.server 4173
```

Then visit:

```text
http://127.0.0.1:4173/
```

## Why This Project

Traditional multi-organ segmentation models usually output all predefined organ masks at once. In many medical image review workflows, users may only need to focus on one target structure at a time, such as the bladder, rectum, prostate zones, seminal vesicle, or neurovascular bundle.

PromptMask MRI explores a target-specific interaction model:

- Users express the target structure through text prompts.
- The system maps the prompt to a supported anatomical label.
- The model or mock inference service returns a binary mask for that target.
- The UI displays only the selected structure as an overlay, reducing visual clutter from unrelated masks.

## Product Scope

PromptMask MRI is currently scoped to:

- Pelvic T2 MRI
- Anatomical structure segmentation
- Text prompt controlled target selection
- Single-target binary mask overlay
- Research and visualization workflows

It is not intended for clinical diagnosis, disease staging, treatment planning, or automated cancer detection.

## Supported Structures

The underlying label space contains background plus 8 foreground anatomical structures. Background is not exposed as a user-selectable target.

| ID | Structure | Label |
|---:|---|---|
| 1 | Bladder | `bladder` |
| 2 | Bone | `bone` |
| 3 | Obturator internus | `obturator internus` |
| 4 | Prostate peripheral zone | `prostate peripheral zone` / `PZ` |
| 5 | Prostate transition zone | `prostate transition zone` / `TZ` |
| 6 | Rectum | `rectum` |
| 7 | Seminal vesicle | `seminal vesicle` |
| 8 | Neurovascular bundle | `neurovascular bundle` / `NVB` |

## MVP Workflow

```text
Open workspace
  -> Select or upload a pelvic MRI image
  -> Enter a target prompt or choose a structure button
  -> Parse prompt into a supported anatomical label
  -> Show AI analyzing state
  -> Generate or retrieve the target mask
  -> Display MRI + mask overlay
  -> Adjust opacity
  -> Switch target structures
  -> Export overlay image if needed
```

## MVP Features

### P0

- Pelvic MRI example image viewer
- Example case selector
- Text prompt input
- Target structure shortcut buttons
- Prompt-to-label mapping
- AI analyzing / loading state
- Single-target mask overlay
- Mask opacity control
- Unsupported prompt feedback
- Research demo disclaimer
- Mock mask display

### P1

- Local PNG upload
- Overlay image export
- Prompt history
- Mask color selection
- Multiple example cases
- Inference time display
- Current scan vs previous scan comparison

### P2

- Real PyTorch model inference
- NIfTI upload and slice selection
- DICOM viewer support
- Multi-slice navigation
- Structure area or volume statistics
- Manual mask correction
- Model quality metadata
- Prompt confusion visualization

## Mock-first, Model-ready Design

The first prototype can use mock MRI images and pre-generated masks to validate the user workflow without requiring a GPU inference environment.

The intended architecture keeps the frontend interface stable:

```text
Frontend
  -> Backend API
  -> Prompt Parser
  -> Mock Inference or Model Inference
  -> Binary Mask
  -> Overlay Visualization
```

When the trained model is connected, the mock inference module can be replaced by a PyTorch inference service while preserving the same product flow.

## Research Background

The model direction behind this project is text-prompted pelvic T2 MRI anatomical structure segmentation.

Core technical components include:

- Python
- PyTorch
- U-Net
- Lightweight text encoder
- FiLM conditioning
- Dice Loss
- BCE Loss
- Prompt-conditioned binary segmentation
- Dice, off-target Dice, and prompt confusion matrix evaluation

## Data and Privacy

Medical image data is sensitive. Public demos and repository assets should only use:

- De-identified data
- Authorized teaching or research data
- Publicly shareable PNG examples
- Synthetic or redrawn examples when needed

The repository should not include identifiable patient information, raw clinical DICOM headers, or unauthorized medical images.

## Limitations

PromptMask MRI is a research prototype. It does not provide diagnostic conclusions, disease classification, treatment recommendations, or clinical-grade validation.

Potential model risks include:

- Off-target segmentation
- Inaccurate boundaries
- Prompt confusion
- Missed small structures
- Performance variance across MRI quality and acquisition settings

All generated masks should be treated as research and visualization outputs only.

## Roadmap

1. Finalize PRD and product workflow.
2. Build mock-first interactive demo.
3. Implement prompt-to-label mapping and mask overlay controls.
4. Add model-ready backend interface.
5. Connect trained PyTorch segmentation model.
6. Expand to more structures or MRI scenarios after obtaining legally usable datasets.

## Documentation

- [Product Requirements Document](docs/PRD.md)
