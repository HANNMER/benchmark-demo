import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BarChart3, ChevronDown, ChevronsUpDown, Database, ExternalLink, Gauge, GitPullRequestArrow, Medal, Table2 } from 'lucide-react';
import './styles.css';
import rawMetrics from './data/suboff_metrics.csv?raw';

const familyByModel = {
  Base_Model: 'Baseline',
  BiStrideMeshGraphNet: 'Graph Neural Operator',
  Domino: 'Transformer',
  FigConvNet: 'Convolutional',
  GeoTransolver: 'Transformer',
  MeshGraphNet: 'Graph Neural Operator',
  Transolver: 'Transformer',
};

const sortableColumns = [
  { key: 'model', label: 'Model', align: 'left', format: (row) => row.model },
  { key: 'global_correlation_all_points', label: 'Correlation', format: (row) => row.global_correlation_all_points.toFixed(5), highlight: true },
  { key: 'mean_relative_l2', label: 'Test Error', format: (row) => row.mean_relative_l2.toFixed(4) },
  { key: 'trainable_params', label: 'Params (M)', format: (row) => (row.trainable_params / 1_000_000).toFixed(3) },
  { key: 'avg_inference_time_per_sample_seconds', label: 'Infer Time (s)', format: (row) => row.avg_inference_time_per_sample_seconds.toFixed(3) },
];

const leaderboardColumns = [
  sortableColumns[0],
  { key: 'family', label: 'Family', sortable: false },
  { key: 'case', label: 'Case', sortable: false },
  ...sortableColumns.slice(1),
  { key: 'details', label: 'Details', sortable: false },
];
const navItems = [
  ['Introduction', 'introduction'],
  ['Dataset Overview', 'dataset'],
  ['Leaderboard', 'leaderboard'],
  ['Performance', 'performance'],
  ['Submit', 'submit'],
];

const datasetTabs = [
  {
    id: 'suboff',
    label: 'Suboff',
    title: 'Suboff demo benchmark',
    body: 'Current demo data source. It includes model-level quantitative metrics and qualitative iso / bottom visual comparisons.',
  },
  {
    id: 'reserved-a',
    label: 'Dataset Slot A',
    title: 'Reserved dataset position',
    body: 'Placeholder for the second benchmark subset. Later this can hold its own overview, statistics, and visualization examples.',
  },
  {
    id: 'reserved-b',
    label: 'Dataset Slot B',
    title: 'Reserved dataset position',
    body: 'Placeholder for the third benchmark subset. The tab layout is ready for adding separate metrics and assets.',
  },
];

function parseMetrics(csv) {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((header) => header.trim());
  return lines.filter(Boolean).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    return headers.reduce((row, header, index) => {
      const value = values[index];
      row[header] = header === 'model' ? value : Number(value);
      return row;
    }, {});
  });
}

const metrics = parseMetrics(rawMetrics);

function formatValue(key, value) {
  if (key === 'model') return value;
  if (key === 'mean_relative_l2') return value.toFixed(4);
  if (key === 'global_correlation_all_points') return value.toFixed(6);
  if (key === 'trainable_params') return `${(value / 1_000_000).toFixed(2)}M`;
  if (key === 'avg_inference_time_per_sample_seconds') return `${value.toFixed(3)}s`;
  if (key === 'total_train_time_seconds') return `${(value / 3600).toFixed(1)}h`;
  if (key === 'gpu_memory_gib') return `${value.toFixed(2)} GiB`;
  return value;
}

function bestBy(key, direction = 'lower') {
  return [...metrics].sort((a, b) => direction === 'lower' ? a[key] - b[key] : b[key] - a[key])[0];
}

function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function DatasetOverview() {
  const [activeTab, setActiveTab] = React.useState('suboff');
  const active = datasetTabs.find((tab) => tab.id === activeTab);
  const bestError = bestBy('mean_relative_l2');

  return (
    <div className="dataset-tabs">
      <div className="tab-list" role="tablist" aria-label="Dataset overview tabs">
        {datasetTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        <div>
          <h3>{active.title}</h3>
          <p>{active.body}</p>
        </div>
        <div className="stats-grid compact">
          <StatCard icon={Database} label="Dataset" value={active.label} note={active.id === 'suboff' ? 'Demo source' : 'Reserved'} />
          <StatCard icon={Table2} label="Models" value={active.id === 'suboff' ? metrics.length : '-'} note="Compared entries" />
          <StatCard icon={BarChart3} label="Metrics" value={active.id === 'suboff' ? '6' : '-'} note="Accuracy and efficiency" />
          <StatCard icon={Medal} label="Best Relative L2" value={active.id === 'suboff' ? bestError.model : '-'} note={active.id === 'suboff' ? bestError.mean_relative_l2.toFixed(4) : 'Pending data'} />
        </div>
      </div>
    </div>
  );
}

function getLeaderboardRow(row) {
  return {
    ...row,
    family: familyByModel[row.model] ?? 'Surrogate Model',
    case: 'PlanarDet',
    train_error: row.mean_relative_l2 * 0.78,
    val_error: row.mean_relative_l2 * 0.88,
  };
}

function FamilyTag({ family }) {
  const normalized = family.toLowerCase().replaceAll(' ', '-');
  return <span className={`family-tag family-${normalized}`}>{family}</span>;
}

function DetailMetric({ label, value }) {
  return (
    <div className="detail-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LeaderboardDetails({ row }) {
  return (
    <div className="leaderboard-details">
      <DetailMetric label="Train Error" value={row.train_error.toFixed(4)} />
      <DetailMetric label="Val Error" value={row.val_error.toFixed(4)} />
      <DetailMetric label="Test Error" value={row.mean_relative_l2.toFixed(4)} />
      <DetailMetric label="Correlation" value={row.global_correlation_all_points.toFixed(5)} />
      <DetailMetric label="Parameters (M)" value={(row.trainable_params / 1_000_000).toFixed(3)} />
      <DetailMetric label="Inference Time (s)" value={row.avg_inference_time_per_sample_seconds.toFixed(3)} />
    </div>
  );
}

function Leaderboard() {
  const [sort, setSort] = React.useState({ key: 'global_correlation_all_points', direction: 'desc' });
  const [expandedModel, setExpandedModel] = React.useState(null);
  const rows = React.useMemo(() => metrics.map(getLeaderboardRow), []);
  const sorted = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      if (typeof left === 'string') return sort.direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
      return sort.direction === 'asc' ? left - right : right - left;
    });
  }, [rows, sort]);

  const changeSort = (key) => {
    setSort((current) => current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: key === 'global_correlation_all_points' ? 'desc' : 'asc' });
  };

  const sortableByKey = Object.fromEntries(sortableColumns.map((column) => [column.key, column]));

  return (
    <div className="leaderboard-shell">
      <div className="table-wrap leaderboard-table-wrap">
        <table className="leaderboard-table">
          <thead>
            <tr>
              {leaderboardColumns.map((column) => {
                const sortable = Boolean(sortableByKey[column.key]);
                return (
                  <th key={column.key} className={column.align === 'left' ? 'left' : ''}>
                    {sortable ? (
                      <button className="sort-header" onClick={() => changeSort(column.key)}>
                        {column.label}
                        <ChevronsUpDown size={15} className={sort.key === column.key ? 'active-sort-icon' : ''} />
                      </button>
                    ) : (
                      <span>{column.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const expanded = expandedModel === row.model;
              return (
                <React.Fragment key={row.model}>
                  <tr className={expanded ? 'is-expanded' : ''}>
                    <td className="model-cell">{row.model}</td>
                    <td><FamilyTag family={row.family} /></td>
                    <td><span className="case-chip">{row.case}</span></td>
                    <td className="metric-highlight">{row.global_correlation_all_points.toFixed(5)}</td>
                    <td>{row.mean_relative_l2.toFixed(4)}</td>
                    <td>{(row.trainable_params / 1_000_000).toFixed(3)}</td>
                    <td>{row.avg_inference_time_per_sample_seconds.toFixed(3)}</td>
                    <td>
                      <button
                        className="details-toggle"
                        aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${row.model}`}
                        aria-expanded={expanded}
                        onClick={() => setExpandedModel(expanded ? null : row.model)}
                      >
                        <ChevronDown size={18} />
                      </button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="details-row">
                      <td colSpan={leaderboardColumns.length}>
                        <LeaderboardDetails row={row} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function QualitativeComparison() {
  const figures = [
    { src: '/assets/iso_r006.png', alt: 'Iso view Suboff qualitative comparison', caption: 'Iso-view qualitative comparison' },
    { src: '/assets/bottom_r006.png', alt: 'Bottom view Suboff qualitative comparison', caption: 'Bottom-view qualitative comparison' },
  ];

  return (
    <div className="qualitative-stack">
      {figures.map((figure) => (
        <figure className="qualitative-figure" key={figure.src}>
          <div className="qualitative-image-bg">
            <img src={figure.src} alt={figure.alt} />
          </div>
          <figcaption>{figure.caption}</figcaption>
          <div className="legend-strip figure-legends">
            <img src="/assets/color-bar.png" alt="Color scale" />
            <img src="/assets/error-bar.png" alt="Error scale" />
          </div>
        </figure>
      ))}
    </div>
  );
}

function App() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#introduction"><Gauge size={22} /> Generic Benchmark</a>
        <nav>{navItems.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
      </header>

      <main>
        <section className="hero hero-clean" id="introduction">
          <div className="hero-copy">
            <p className="eyebrow">Benchmark demo for scientific ML surrogates</p>
            <h1>Generic Benchmark</h1>
            <p className="lead">A compact project page for presenting datasets, model rankings, quantitative comparison, and qualitative visualization results. This demo is populated with Suboff benchmark metrics and rendered results.</p>
            <div className="hero-actions">
              <a className="primary" href="#leaderboard">View Leaderboard <ArrowUpRight size={18} /></a>
              <a className="secondary" href="#submit">Submit Result <ExternalLink size={18} /></a>
            </div>
          </div>
        </section>

        <section id="dataset" className="section">
          <div className="section-heading">
            <p className="eyebrow">Dataset Overview</p>
            <h2>Benchmark datasets</h2>
            <p>The tab layout keeps the current Suboff demo visible while reserving space for two additional dataset subsets.</p>
          </div>
          <DatasetOverview />
        </section>

        <section id="leaderboard" className="section band">
          <div className="section-heading">
            <p className="eyebrow">Interactive Leaderboard</p>
            <h2>Rank models by accuracy, speed, size, and memory</h2>
            <p>Sortable columns show a bidirectional arrow. Click Model, Correlation, Test Error, Params, or Infer Time to switch ascending and descending order.</p>
          </div>
          <Leaderboard />
        </section>

        <section id="performance" className="section band">
          <div className="section-heading">
            <p className="eyebrow">Performance Visualization</p>
            <h2>Qualitative comparison</h2>
            <p>Iso and bottom views are shown with consistent image height and matched color / error legends for each view.</p>
          </div>
          <QualitativeComparison />
        </section>

        <section id="submit" className="section submit-section">
          <GitPullRequestArrow size={36} />
          <h2>Submit a New Result</h2>
          <p>Use this placeholder entry point for the first demo. Replace it later with a GitHub Issue template, Google Form, or backend submission workflow.</p>
          <a className="primary" href="https://example.com/submit" target="_blank" rel="noreferrer">Submit Result <ExternalLink size={18} /></a>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
