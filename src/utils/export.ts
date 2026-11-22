import { AuditResult } from '../types/seo';

/**
 * Downloads a file from browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads JSON audit report
 */
export function exportAsJSON(audit: AuditResult) {
  const data = JSON.stringify(audit, null, 2);
  const domain = new URL(audit.url).hostname.replace(/[^a-z0-9]/gi, '_');
  downloadFile(data, `seo_audit_${domain}_${Date.now()}.json`, 'application/json');
}

/**
 * Generates and downloads CSV audit report of issues
 */
export function exportAsCSV(audit: AuditResult) {
  const headers = ['Category', 'Severity', 'Title', 'Score Impact', 'Explanation', 'Why It Matters', 'Solution', 'Element'];
  
  const rows = audit.issues.map((i) => [
    `"${i.category}"`,
    `"${i.severity}"`,
    `"${i.title.replace(/"/g, '""')}"`,
    `"-${i.scoreImpact} pts"`,
    `"${i.explanation.replace(/"/g, '""')}"`,
    `"${i.whyItMatters.replace(/"/g, '""')}"`,
    `"${i.suggestedSolution.replace(/"/g, '""')}"`,
    `"${(i.relevantElement || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const domain = new URL(audit.url).hostname.replace(/[^a-z0-9]/gi, '_');
  downloadFile(csvContent, `seo_audit_${domain}_${Date.now()}.csv`, 'text/csv');
}

/**
 * Generates printable HTML report and opens print dialog
 */
export function exportAsHTML(audit: AuditResult) {
  const domain = new URL(audit.url).hostname;
  const criticalCount = audit.counts.critical;
  const warningCount = audit.counts.warning;
  const passedCount = audit.counts.passed;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SEO Audit Report — ${domain}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #111827; background: #fff; }
    h1, h2, h3 { margin-bottom: 8px; }
    .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 25px; }
    .score-badge { display: inline-block; padding: 12px 24px; border-radius: 8px; font-size: 24px; font-weight: bold; background: ${audit.overallScore >= 80 ? '#dcfce7; color: #15803d;' : audit.overallScore >= 50 ? '#fef3c7; color: #b45309;' : '#fee2e2; color: #b91c1c;'} }
    .metric-grid { display: flex; gap: 16px; margin: 20px 0; }
    .metric-card { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .issue-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    .issue-table th, .issue-table td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
    .issue-table th { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; text-transform: uppercase; }
    .badge-critical { background: #fee2e2; color: #b91c1c; }
    .badge-warning { background: #fef3c7; color: #b45309; }
    .badge-passed { background: #dcfce7; color: #15803d; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Technical SEO Audit Report</h1>
    <p>Target URL: <strong>${audit.url}</strong></p>
    <p>Audited on: ${new Date(audit.auditDate).toLocaleString()}</p>
    <div style="margin-top: 15px;">
      <div class="score-badge">SEO Score: ${audit.overallScore} / 100</div>
    </div>
  </div>

  <div class="metric-grid">
    <div class="metric-card">
      <div style="font-size: 12px; color: #6b7280;">Critical Issues</div>
      <div style="font-size: 22px; font-weight: bold; color: #b91c1c;">${criticalCount}</div>
    </div>
    <div class="metric-card">
      <div style="font-size: 12px; color: #6b7280;">Warnings</div>
      <div style="font-size: 22px; font-weight: bold; color: #b45309;">${warningCount}</div>
    </div>
    <div class="metric-card">
      <div style="font-size: 12px; color: #6b7280;">Passed Checks</div>
      <div style="font-size: 22px; font-weight: bold; color: #15803d;">${passedCount}</div>
    </div>
  </div>

  <h2>Audit Findings & Actionable Recommendations</h2>
  <table class="issue-table">
    <thead>
      <tr>
        <th style="width: 100px;">Severity</th>
        <th style="width: 90px;">Category</th>
        <th>Issue & Recommendation</th>
        <th style="width: 250px;">Suggested Solution</th>
      </tr>
    </thead>
    <tbody>
      ${audit.issues.map((i) => `
        <tr>
          <td><span class="badge badge-${i.severity}">${i.severity}</span></td>
          <td>${i.category}</td>
          <td>
            <strong>${i.title}</strong>
            <p style="margin: 4px 0; color: #4b5563;">${i.explanation}</p>
            ${i.relevantElement ? `<code style="font-size: 11px; color: #374151;">${i.relevantElement}</code>` : ''}
          </td>
          <td>${i.suggestedSolution}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px;">
    Generated by SEO Inspector Chrome Extension
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.focus();
  } else {
    downloadFile(html, `seo_audit_${domain}_${Date.now()}.html`, 'text/html');
  }
}

