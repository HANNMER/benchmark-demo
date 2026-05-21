# Generic Benchmark Demo

This project is a local demo benchmark website inspired by pages such as CarBench and RealPDEBench. The user's goal is to build a paper/benchmark-style project page that can later become a polished public website.

## User Context

- User wants a webpage with these six sections:
  1. Introduction
  2. Dataset Overview
  3. Interactive Leaderboard
  4. Model Comparison
  5. Performance Visualization
  6. Link to Submit Result
- The demo should initially use the available Suboff benchmark results and visualizations.
- The intended workspace for this website is `D:\Files\wzh\pages`.
- The current project directory is `D:\Files\wzh\pages\benchmark-demo`.
- The source sample assets came from `D:\Files\wzh\pages\Suboff_plot`.

## Current Implementation

The site is implemented as a React + Vite single-page app.

Key files:

- `src/main.jsx`: React app, page sections, CSV parsing, leaderboard sorting, SVG charts.
- `src/styles.css`: Layout, responsive design, table, chart, gallery, and button styling.
- `src/data/suboff_metrics.csv`: Structured benchmark metrics used by the leaderboard and charts.
- `public/assets/`: Copied visualization assets from the Suboff sample folder.

Current assets:

- `public/assets/iso_r006.png`
- `public/assets/bottom_r006.png`
- `public/assets/suboff_metrics_bar.png`
- `public/assets/color-bar.png`
- `public/assets/error-bar.png`

Current CSV columns:

- `model`
- `mean_relative_l2`
- `global_correlation_all_points`
- `trainable_params`
- `avg_inference_time_per_sample_seconds`
- `total_train_time_seconds`
- `gpu_memory_gib`

## How To Run Locally

PowerShell may block `npm.ps1` on this machine, so use `npm.cmd`.

```powershell
cd D:\Files\wzh\pages\benchmark-demo
npm.cmd install
npm.cmd run dev -- --port 5173
```

Then open:

```text
http://127.0.0.1:5173/
```

Build check:

```powershell
npm.cmd run build
```

The build has already passed once after implementation.

## Current Behavior

- Top navigation jumps to each section.
- Leaderboard defaults to sorting by lower `mean_relative_l2`.
- Leaderboard uses sortable Model, Correlation, Test Error, Params (M), and Infer Time (s) columns with bidirectional arrow icons. Family, Case, and Details are not sortable. Details expands an inline metric grid for train, val, test, correlation, params, and inference time.
- Hero cover is text-only and does not show a visualization image.
- Dataset Overview uses tabs: one active Suboff tab plus two reserved dataset slots.
- Model Comparison has been removed for now.
- Performance Visualization currently keeps only:
  - Error vs Inference Time bubble chart with hover tooltip fields including Relative L2, Latency, Params, and GPU Memory.
  - Qualitative comparison with iso and bottom views stacked vertically.
  - Each qualitative figure has a light background plus color bar and error bar underneath.
- Submit Result currently points to placeholder URL `https://example.com/submit`.

## Important Environment Notes

- Node is available; observed version was `v24.15.0`.
- `npm.ps1` is blocked by PowerShell execution policy, but `npm.cmd` works.
- `git` was not available in PowerShell PATH during setup.
- The project lives outside the original Codex writable root, so future automated edits may require permission to write under `D:\Files\wzh\pages`.

## Likely Next Steps

Good next improvements:

1. Replace `Generic Benchmark` with the real benchmark/project name.
2. Replace placeholder Introduction and Dataset Overview copy with real paper/project text.
3. Replace `https://example.com/submit` with a real submission target, such as a GitHub Issue template, Google Form, or backend endpoint.
4. Add paper/code/data buttons in the hero section when links are ready.
5. If more benchmark cases are added, extend the CSV schema or add separate CSV files per dataset.
6. Optionally deploy to GitHub Pages, Vercel, or Netlify after git/deployment setup is available.

## Design Intent

The page should feel like an academic benchmark project page, not a marketing landing page. It should prioritize clear results, readable tables, reliable charts, and useful visual comparisons. Keep the first screen focused on the benchmark identity and a real result visualization.
