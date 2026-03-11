#!/usr/bin/env python3
"""
EVMBench Report Validator

Validates that an audit report conforms to the EVMBench JSON schema.
Checks:
  - File exists and is readable
  - Contains a ```json code block
  - JSON parses without errors
  - Root object has "vulnerabilities" array
  - Each vulnerability has required fields with correct types
  - Severity is always "high"
  - Titles are sentence case

Usage:
    python3 validate_report.py <path-to-audit.md>
    python3 validate_report.py submission/audit.md
"""

import json
import re
import sys
from pathlib import Path


REQUIRED_VULN_FIELDS = {
    "title": str,
    "severity": str,
    "summary": str,
    "description": list,
    "impact": str,
}

OPTIONAL_VULN_FIELDS = {
    "proof_of_concept": str,
    "remediation": str,
}

REQUIRED_DESC_FIELDS = {
    "file": str,
    "line_start": int,
    "line_end": int,
    "desc": str,
}


def extract_json_block(content: str) -> str | None:
    """Extract the first ```json ... ``` code block from markdown content."""
    pattern = r"```json\s*\n(.*?)```"
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


def is_sentence_case(title: str) -> bool:
    """Check if title is sentence case (first word capitalized, rest lower unless proper noun)."""
    if not title:
        return False
    words = title.split()
    if not words:
        return False
    # First word should start with uppercase
    if not words[0][0].isupper():
        return False
    # Check that it's NOT Title Case (not every word capitalized)
    title_case_words = sum(1 for w in words[1:] if w[0].isupper() and len(w) > 3)
    total_check_words = sum(1 for w in words[1:] if len(w) > 3)
    if total_check_words > 0 and title_case_words == total_check_words:
        return False  # Looks like Title Case
    return True


def validate_report(filepath: str) -> tuple[bool, list[str], list[str]]:
    """
    Validate an EVMBench audit report.

    Returns:
        (is_valid, errors, warnings)
    """
    errors = []
    warnings = []

    path = Path(filepath)
    if not path.exists():
        return False, [f"File not found: {filepath}"], []

    content = path.read_text(encoding="utf-8")

    # Extract JSON block
    json_str = extract_json_block(content)
    if json_str is None:
        return False, ["No ```json code block found in file"], []

    # Parse JSON
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        return False, [f"JSON parse error: {e}"], []

    # Check root structure
    if not isinstance(data, dict):
        errors.append(f"Root must be an object, got {type(data).__name__}")
        return False, errors, warnings

    if "vulnerabilities" not in data:
        errors.append('Missing required field: "vulnerabilities"')
        return False, errors, warnings

    vulns = data["vulnerabilities"]
    if not isinstance(vulns, list):
        errors.append(f'"vulnerabilities" must be an array, got {type(vulns).__name__}')
        return False, errors, warnings

    if len(vulns) == 0:
        warnings.append("Report contains 0 vulnerabilities — is this intentional?")

    # Validate each vulnerability
    for i, vuln in enumerate(vulns):
        prefix = f"vulnerabilities[{i}]"

        if not isinstance(vuln, dict):
            errors.append(f"{prefix}: must be an object, got {type(vuln).__name__}")
            continue

        # Check required fields
        for field, expected_type in REQUIRED_VULN_FIELDS.items():
            if field not in vuln:
                errors.append(f'{prefix}: missing required field "{field}"')
            elif not isinstance(vuln[field], expected_type):
                errors.append(
                    f'{prefix}.{field}: expected {expected_type.__name__}, '
                    f'got {type(vuln[field]).__name__}'
                )

        # Check severity
        if vuln.get("severity") != "high":
            errors.append(
                f'{prefix}.severity: must be "high", got "{vuln.get("severity")}"'
            )

        # Check title case
        title = vuln.get("title", "")
        if title and not is_sentence_case(title):
            warnings.append(
                f'{prefix}.title: should be sentence case, got "{title}"'
            )

        # Validate description entries
        descs = vuln.get("description", [])
        if isinstance(descs, list):
            for j, desc_entry in enumerate(descs):
                desc_prefix = f"{prefix}.description[{j}]"
                if not isinstance(desc_entry, dict):
                    errors.append(
                        f"{desc_prefix}: must be an object, got {type(desc_entry).__name__}"
                    )
                    continue
                for field, expected_type in REQUIRED_DESC_FIELDS.items():
                    if field not in desc_entry:
                        errors.append(f'{desc_prefix}: missing required field "{field}"')
                    elif not isinstance(desc_entry[field], expected_type):
                        errors.append(
                            f'{desc_prefix}.{field}: expected {expected_type.__name__}, '
                            f'got {type(desc_entry[field]).__name__}'
                        )

    is_valid = len(errors) == 0
    return is_valid, errors, warnings


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 validate_report.py <path-to-audit.md>")
        sys.exit(1)

    filepath = sys.argv[1]
    is_valid, errors, warnings = validate_report(filepath)

    if warnings:
        print(f"⚠️  {len(warnings)} warning(s):")
        for w in warnings:
            print(f"   - {w}")
        print()

    if is_valid:
        print("✅ Report is valid!")
        # Parse and show summary
        content = Path(filepath).read_text(encoding="utf-8")
        json_str = extract_json_block(content)
        data = json.loads(json_str)
        vulns = data["vulnerabilities"]
        print(f"   Found {len(vulns)} vulnerability/vulnerabilities")
        for i, v in enumerate(vulns):
            print(f"   [{i+1}] {v.get('title', 'untitled')} ({v.get('severity', '?')})")
        sys.exit(0)
    else:
        print(f"❌ Report validation failed with {len(errors)} error(s):")
        for e in errors:
            print(f"   - {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
