#!/usr/bin/env python3
"""Emit LAB-ONLY pretend org JSON for Floci seed (S3 org/ prefix).

Usage:
  python3 cloud-context-assets.py <scenario-id> account|critical|inventory
"""

from __future__ import annotations

import json
import sys

LAB = {
    "lab_only": True,
    "account_id": "000000000000",
    "region": "us-east-1",
    "note": "Workshop dummy org. Not a real AWS account. Values are lookalikes.",
}

# Story-shaped decoys. Names look like payroll / CI / registry, content is fake.
SCENARIOS: dict[str, dict] = {
    "01": {
        "title": "typosquatting npm install",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "sns",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc01/npm-publish-token",
                "why": "Publisher token a typosquat harvest would steal from ~/.npmrc",
            },
            {
                "kind": "allowlist",
                "ref": "/scas/sc01/allowed-packages",
                "why": "SSM list of packages this fake org is allowed to install",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc01-artifacts/org/customer-export-lab.csv",
                "why": "Dummy customer export sitting next to the exfil prefix",
            },
        ],
    },
    "02": {
        "title": "dependency confusion (internal vs public)",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "sqs",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc02/npm-publish-token",
                "why": "Internal scope publish token",
            },
            {
                "kind": "scope",
                "ref": "/scas/sc02/internal-scope",
                "why": "Canonical @corp scope this lab pretends to own",
            },
            {
                "kind": "queue",
                "ref": "scas-sc02-dep-resolve",
                "why": "Resolver jobs a confused public package would race",
            },
        ],
    },
    "03": {
        "title": "compromised maintained package",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc03/npm-publish-token",
                "why": "Maintainer token on the hijacked package",
            },
            {
                "kind": "billing",
                "ref": "scas/sc03/stripe-live",
                "why": "Dummy Stripe-shaped key as runtime harvest bait",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc03-artifacts/org/payroll-lab-2026.enc",
                "why": "Pretend payroll blob the package should never see",
            },
        ],
    },
    "04": {
        "title": "malicious package update",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "sns",
            "events",
            "logs",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc04/npm-publish-token",
                "why": "Publisher token used on the 'trusted' update",
            },
            {
                "kind": "topic",
                "ref": "scas-sc04-update-alerts",
                "why": "SNS a real org would page on unexpected version bumps",
            },
        ],
    },
    "05": {
        "title": "build / CI compromise",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "iam",
            "sts",
            "logs",
            "events",
        ],
        "assets": [
            {
                "kind": "aws_ci",
                "ref": "scas/sc05/ci-aws",
                "why": "Lookalike CodeBuild credentials",
            },
            {
                "kind": "database",
                "ref": "/scas/sc05/ci-database-url",
                "why": "Dummy Postgres URL in SSM",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc05-artifacts/releases/legitimate/manifest.json",
                "why": "Baseline artifact before the compromised build",
            },
        ],
    },
    "06": {
        "title": "worm-style credential harvest",
        "services": [
            "s3",
            "secretsmanager",
            "sqs",
            "sns",
            "events",
            "logs",
            "iam",
            "sts",
            "ssm",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc06/decoy-npm-token",
                "why": "First hop the worm copies",
            },
            {
                "kind": "github",
                "ref": "scas/sc06/decoy-github-pat",
                "why": "Dummy PAT for repo fan-out story",
            },
            {
                "kind": "queue",
                "ref": "scas-sc06-worm-events",
                "why": "SQS stand-in for worm replication",
            },
        ],
    },
    "07": {
        "title": "transitive dependency",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc07/npm-publish-token",
                "why": "Token on the parent app, not the nested lib",
            },
            {
                "kind": "tree",
                "ref": "/scas/sc07/expected-tree-hash",
                "why": "SSM pin of the last reviewed npm ls tree",
            },
        ],
    },
    "08": {
        "title": "lockfile manipulation",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "lock",
                "ref": "/scas/sc08/lockfile-integrity",
                "why": "Expected lock hash before the silent rewrite",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc08-artifacts/org/package-lock.expected.json",
                "why": "Copy of the last good lock the CI should have compared",
            },
        ],
    },
    "09": {
        "title": "package signing bypass",
        "services": [
            "s3",
            "secretsmanager",
            "iam",
            "ssm",
            "logs",
            "events",
            "sts",
        ],
        "assets": [
            {
                "kind": "signing",
                "ref": "scas/sc09/publisher-signing",
                "why": "Lookalike signing material the bypass pretends to satisfy",
            },
            {
                "kind": "role",
                "ref": "scas-sc09-publisher-role",
                "why": "IAM role a trusted publisher would assume",
            },
        ],
    },
    "10": {
        "title": "git submodule attack",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "github",
                "ref": "scas/sc10/github-pat",
                "why": "Dummy PAT that can move a submodule pointer",
            },
            {
                "kind": "url",
                "ref": "/scas/sc10/submodule-canonical-url",
                "why": "SSM of the last known-good submodule remote",
            },
        ],
    },
    "11": {
        "title": "registry mirror poisoning",
        "services": [
            "s3",
            "ecr",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "docker",
                "ref": "scas/sc11/mirror-pull-token",
                "why": "Dummy pull secret for the enterprise mirror analog",
            },
            {
                "kind": "ecr",
                "ref": "scas-sc11-app",
                "why": "ECR repo standing in for a private registry",
            },
        ],
    },
    "12": {
        "title": "workspace / monorepo attack",
        "services": [
            "s3",
            "secretsmanager",
            "sqs",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc12/npm-publish-token",
                "why": "Workspace root token shared across packages",
            },
            {
                "kind": "queue",
                "ref": "scas-sc12-workspace-build",
                "why": "Build-graph jobs a poisoned workspace member would enqueue",
            },
        ],
    },
    "13": {
        "title": "package metadata manipulation",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "metadata",
                "ref": "/scas/sc13/published-metadata",
                "why": "SSM snapshot of the last reviewed package.json fields",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc13-artifacts/org/registry-packument.json",
                "why": "Dummy packument the metadata rewrite should not match",
            },
        ],
    },
    "14": {
        "title": "container image supply chain",
        "services": [
            "s3",
            "ecr",
            "ecs",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "docker",
                "ref": "scas/sc14/registry-pull",
                "why": "Dummy docker pull secret",
            },
            {
                "kind": "ecs",
                "ref": "scas-sc14",
                "why": "Cluster that would run the tagged image",
            },
        ],
    },
    "15": {
        "title": "developer tool compromise",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "slack",
                "ref": "scas/sc15/slack-bot",
                "why": "Dummy Slack bot token a hijacked CLI would scrape",
            },
            {
                "kind": "github",
                "ref": "scas/sc15/github-pat",
                "why": "Dummy PAT from the developer workstation story",
            },
        ],
    },
    "16": {
        "title": "package cache poisoning",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "cache",
                "ref": "/scas/sc16/cache-root",
                "why": "SSM path of the shared CI cache this lab pretends to use",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc16-artifacts/cache/.keep",
                "why": "Cache prefix to compare before vs after poison",
            },
        ],
    },
    "17": {
        "title": "multi-stage attack chain",
        "services": [
            "s3",
            "stepfunctions",
            "events",
            "secretsmanager",
            "ssm",
            "logs",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "sfn",
                "ref": "scas-sc17-chain",
                "why": "State machine mirroring stage1-3",
            },
            {
                "kind": "npm_token",
                "ref": "scas/sc17/stage1-npm",
                "why": "Token stolen in stage 1",
            },
        ],
    },
    "18": {
        "title": "package manager plugin attack",
        "services": [
            "s3",
            "secretsmanager",
            "events",
            "ssm",
            "logs",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc18/npm-publish-token",
                "why": "Token the plugin hook can read from the client env",
            },
        ],
    },
    "19": {
        "title": "SBOM manipulation",
        "services": [
            "s3",
            "glue",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "glue",
                "ref": "scas_sc19_sbom",
                "why": "Glue database for truth vs generated SBOM",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc19-artifacts/truth/dependencies.json",
                "why": "Ground inventory that the generated SBOM should match",
            },
        ],
    },
    "20": {
        "title": "package version confusion",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "events",
            "logs",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "version",
                "ref": "/scas/sc20/canonical-version",
                "why": "SSM of the version CI thinks it pinned",
            },
            {
                "kind": "npm_token",
                "ref": "scas/sc20/npm-publish-token",
                "why": "Publisher token on the confusing tag",
            },
        ],
    },
    "21": {
        "title": "axios-like postinstall",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "aws_ci",
                "ref": "scas/sc21/ci-aws-role",
                "why": "Lookalike AWS keys harvested at install",
            },
            {
                "kind": "npm_token",
                "ref": "scas/sc21/decoy-npm-token",
                "why": "Dummy npm token in the victim env",
            },
        ],
    },
    "22": {
        "title": "PyPI / LiteLLM-style compromise",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "pypi",
                "ref": "scas/sc22/pypi-token",
                "why": "Dummy PyPI upload token",
            },
            {
                "kind": "llm",
                "ref": "scas/sc22/openai-api-key",
                "why": "Dummy model API key a poisoned wheel would scrape",
            },
            {
                "kind": "index",
                "ref": "/scas/sc22/index-url",
                "why": "SSM of the extra-index-url this lab uses",
            },
        ],
    },
    "23": {
        "title": "Trivy action / CI capstone",
        "services": [
            "s3",
            "ecr",
            "codepipeline",
            "iam",
            "sts",
            "logs",
            "secretsmanager",
            "ssm",
            "events",
        ],
        "assets": [
            {
                "kind": "github",
                "ref": "/scas/sc23/github-pat",
                "why": "SSM PAT the action harvests",
            },
            {
                "kind": "pipeline",
                "ref": "scas-sc23-pipeline",
                "why": "CodePipeline artifact store on this bucket",
            },
            {
                "kind": "docker",
                "ref": "scas/sc23/ci-docker",
                "why": "Dummy docker hub PAT",
            },
        ],
    },
    "24": {
        "title": "slopsquatting (LLM-invented package name)",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "events",
            "logs",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "allowlist",
                "ref": "/scas/sc24/allowed-packages",
                "why": "Packages this fake catalog actually publishes",
            },
            {
                "kind": "npm_token",
                "ref": "scas/sc24/npm-publish-token",
                "why": "Token on the hallucinated name's squat",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc24-artifacts/catalog/404-baseline.json",
                "why": "Record that python-asyncio-utils was never a real name here",
            },
        ],
    },
    "25": {
        "title": "compromised reusable GitHub Action",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "iam",
            "codepipeline",
            "logs",
            "events",
            "sts",
        ],
        "assets": [
            {
                "kind": "github",
                "ref": "scas/sc25/github-pat",
                "why": "Dummy GITHUB_TOKEN the unsafe workflow leaks",
            },
            {
                "kind": "aws_ci",
                "ref": "scas/sc25/ci-aws",
                "why": "Lookalike AWS keys in the runner env",
            },
            {
                "kind": "pipeline",
                "ref": "scas-sc25-pipeline",
                "why": "CodePipeline analog for the reusable workflow",
            },
        ],
    },
    "26": {
        "title": "malicious MCP server",
        "services": [
            "s3",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "openai",
                "ref": "scas/sc26/openai-api-key",
                "why": "Matches victim-agent/dummy.env shape",
            },
            {
                "kind": "github",
                "ref": "scas/sc26/github-pat",
                "why": "Dummy PAT the read_env tool should not return",
            },
            {
                "kind": "allowlist",
                "ref": "/scas/sc26/mcp-allowlist",
                "why": "SSM of MCP servers this fake org permits",
            },
        ],
    },
    "27": {
        "title": "npm provenance bypass",
        "services": [
            "s3",
            "secretsmanager",
            "iam",
            "ssm",
            "logs",
            "events",
            "sts",
        ],
        "assets": [
            {
                "kind": "npm_token",
                "ref": "scas/sc27/npm-publish-token",
                "why": "Token that published the unsigned 1.0.1",
            },
            {
                "kind": "issuer",
                "ref": "/scas/sc27/trusted-issuer",
                "why": "SSM of the issuer provenance should have named",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc27-artifacts/attestations/unsigned-placeholder.json",
                "why": "Empty attestation the bypass pretends is enough",
            },
        ],
    },
    "28": {
        "title": "Go module confusion / GOPROXY",
        "services": [
            "s3",
            "ssm",
            "events",
            "logs",
            "iam",
            "sts",
            "secretsmanager",
        ],
        "assets": [
            {
                "kind": "goproxy",
                "ref": "/scas/sc28/goproxy",
                "why": "SSM of the GOPROXY this lab points at (localhost:3028)",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc28-artifacts/modules/.keep",
                "why": "Module zip analog next to the mock GOPROXY",
            },
        ],
    },
    "29": {
        "title": "Hugging Face-style model artifact",
        "services": [
            "s3",
            "glue",
            "secretsmanager",
            "ssm",
            "logs",
            "events",
            "iam",
            "sts",
        ],
        "assets": [
            {
                "kind": "hf",
                "ref": "scas/sc29/hf-token",
                "why": "Dummy hub token for the mock model pull",
            },
            {
                "kind": "glue",
                "ref": "scas_sc29_models",
                "why": "Glue catalog of model revisions",
            },
            {
                "kind": "object",
                "ref": "s3://scas-sc29-artifacts/models/revision.txt",
                "why": "Pinned dummy revision before the unsafe load",
            },
        ],
    },
}


def pad(raw: str) -> str:
    return f"{int(raw, 10):02d}"


def emit(sid: str, kind: str) -> dict:
    row = SCENARIOS[sid]
    if kind == "account":
        return {
            **LAB,
            "scenario": sid,
            "title": row["title"],
            "env": "workshop-vm",
        }
    if kind == "inventory":
        return {
            **LAB,
            "scenario": sid,
            "services": row["services"],
            "dump": "detection-tools/floci/cloud-context.sh " + sid,
        }
    if kind == "critical":
        return {
            **LAB,
            "scenario": sid,
            "title": row["title"],
            "assets": row["assets"],
        }
    raise SystemExit(f"unknown kind {kind}")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: cloud-context-assets.py <id> account|critical|inventory")
    sid = pad(sys.argv[1])
    kind = sys.argv[2]
    if sid not in SCENARIOS:
        raise SystemExit(f"unknown scenario {sid}")
    print(json.dumps(emit(sid, kind), indent=2))


if __name__ == "__main__":
    main()
