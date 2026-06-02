/**
 * Print-to-PDF helper for the Reports page.
 * Injects a print-only stylesheet, triggers print, and cleans up.
 * User selects "Save as PDF" from the browser print dialog.
 */

export function downloadReportAsPdf(reportContainerId = "reports-root"): void {
  const reportEl = document.getElementById(reportContainerId);
  if (!reportEl) {
    console.warn(`Report container with id "${reportContainerId}" not found. Opening print dialog for entire page.`);
    window.print();
    return;
  }

  // Create and inject print-only style
  const style = document.createElement("style");
  style.id = "reports-print-style";
  style.innerHTML = `
    @media print {
      body {
        background: white;
      }
      /* Hide header action buttons */
      #${reportContainerId} > div:first-child > div > div:last-child {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Trigger print dialog
  window.print();

  // Clean up style after print dialog closes (user may cancel or save)
  // Use setTimeout to ensure cleanup happens after print is initiated
  setTimeout(() => {
    const injectedStyle = document.getElementById("reports-print-style");
    if (injectedStyle) {
      injectedStyle.remove();
    }
  }, 500);
}






