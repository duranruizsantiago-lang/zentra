#!/usr/bin/env python3
"""CertFlow Report Generator CLI."""

import argparse
import json
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader


def main():
    parser = argparse.ArgumentParser(description="Generate CertFlow compliance PDF report")
    parser.add_argument("--framework", required=True, help="Framework: NIS2, DORA, ISO27001, ENS")
    parser.add_argument("--org", required=True, help="Organization name")
    parser.add_argument("--data", required=True, help="JSON file with evidence data")
    parser.add_argument("--output", default="report.pdf", help="Output PDF path")
    args = parser.parse_args()

    templates_dir = Path(__file__).parent / "templates"
    env = Environment(loader=FileSystemLoader(str(templates_dir)))

    with open(args.data) as f:
        evidence = json.load(f)

    pass_count = sum(1 for e in evidence if e["status"] == "pass")
    fail_count = sum(1 for e in evidence if e["status"] == "fail")
    warn_count = sum(1 for e in evidence if e["status"] == "warn")
    manual_count = sum(1 for e in evidence if e["status"] == "manual")
    total = len(evidence)
    score = round(pass_count / total * 100, 1) if total > 0 else 0

    template = env.get_template("report.html.j2")
    html = template.render(
        framework=args.framework,
        organization=args.org,
        date=datetime.now().strftime("%d/%m/%Y %H:%M"),
        total_evidence=total,
        score=score,
        pass_count=pass_count,
        fail_count=fail_count,
        warn_count=warn_count,
        manual_count=manual_count,
        evidence=evidence,
    )

    # Write HTML (PDF generation with WeasyPrint is opt-in)
    out_path = Path(args.output)
    out_path.write_text(html, encoding="utf-8")
    print(f"Report generated: {out_path}")

    # Optional PDF via WeasyPrint
    try:
        from weasyprint import HTML
        pdf_path = out_path.with_suffix(".pdf")
        HTML(string=html).write_pdf(str(pdf_path))
        print(f"PDF generated: {pdf_path}")
    except ImportError:
        print("(Install weasyprint for PDF generation)")


if __name__ == "__main__":
    main()
