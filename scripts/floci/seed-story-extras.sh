#!/usr/bin/env bash
# Per-scenario Floci primitives (SQS, SNS, ECR extras, CodePipeline, Glue, ...).
# Sourced from scas_floci_seed_cloud_context in floci-bridge.sh. Safe to re-run.
#
# shellcheck disable=SC1091

scas_floci_id2() {
  printf '%02d' $((10#${1}))
}

# Secrets Manager + SSM lookalikes for every lab. Victim file plant stays 05/06/21/23/25.
scas_floci_seed_story_secrets() {
  local id
  id="$(scas_floci_id2 "${1:?}")"

  local npm_json aws_json github_json docker_json stripe_json slack_json
  local pypi_json openai_json hf_json db_json
  npm_json="$(scas_floci_lookalike_json npm)"
  aws_json="$(scas_floci_lookalike_json aws_ci)"
  github_json="$(scas_floci_lookalike_json github)"
  docker_json="$(scas_floci_lookalike_json docker)"
  stripe_json="$(scas_floci_lookalike_json stripe)"
  slack_json="$(scas_floci_lookalike_json slack)"
  pypi_json="$(scas_floci_lookalike_json pypi)"
  openai_json="$(scas_floci_lookalike_json openai)"
  hf_json="$(scas_floci_lookalike_json huggingface)"
  db_json="$(scas_floci_lookalike_json database)"
  local github_token db_url
  github_token="$(scas_floci_lookalike_get GITHUB_TOKEN)"
  db_url="$(scas_floci_lookalike_get DATABASE_URL)"

  case "$id" in
    01)
      scas_floci_secret_put "scas/sc01/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc01/allowed-packages" "request,lodash,express"
      ;;
    02)
      scas_floci_secret_put "scas/sc02/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc02/internal-scope" "@corp"
      ;;
    03)
      scas_floci_secret_put "scas/sc03/npm-publish-token" "$npm_json"
      scas_floci_secret_put "scas/sc03/stripe-live" "$stripe_json"
      ;;
    04)
      scas_floci_secret_put "scas/sc04/npm-publish-token" "$npm_json"
      ;;
    05)
      scas_floci_ssm_put_parameter "/scas/sc05/ci-database-url" "$db_url"
      scas_floci_secret_put "scas/sc05/ci-aws" "$aws_json"
      scas_floci_secret_put "scas/sc05/ci-database" "$db_json"
      ;;
    06)
      scas_floci_secret_put "scas/sc06/decoy-npm-token" "$npm_json"
      scas_floci_secret_put "scas/sc06/decoy-github-pat" "$github_json"
      scas_floci_secret_put "scas/sc06/decoy-aws" "$aws_json"
      ;;
    07)
      scas_floci_secret_put "scas/sc07/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc07/expected-tree-hash" "lab-only-tree-hash-not-a-real-sha"
      ;;
    08)
      scas_floci_secret_put "scas/sc08/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc08/lockfile-integrity" "lab-only-lock-sha256"
      ;;
    09)
      scas_floci_secret_put "scas/sc09/npm-publish-token" "$npm_json"
      scas_floci_secret_put "scas/sc09/publisher-signing" "$aws_json"
      ;;
    10)
      scas_floci_secret_put "scas/sc10/github-pat" "$github_json"
      scas_floci_ssm_put_parameter "/scas/sc10/submodule-canonical-url" "git://127.0.0.1/scas-lab/legit-submodule.git"
      ;;
    11)
      scas_floci_secret_put "scas/sc11/mirror-pull-token" "$docker_json"
      scas_floci_ssm_put_parameter "/scas/sc11/mirror-host" "127.0.0.1:3011"
      ;;
    12)
      scas_floci_secret_put "scas/sc12/npm-publish-token" "$npm_json"
      ;;
    13)
      scas_floci_secret_put "scas/sc13/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc13/published-metadata" '{"name":"scas-lab-pkg","version":"1.0.0","lab_only":true}'
      ;;
    14)
      scas_floci_secret_put "scas/sc14/registry-pull" "$docker_json"
      ;;
    15)
      scas_floci_secret_put "scas/sc15/slack-bot" "$slack_json"
      scas_floci_secret_put "scas/sc15/github-pat" "$github_json"
      scas_floci_secret_put "scas/sc15/npm-publish-token" "$npm_json"
      ;;
    16)
      scas_floci_secret_put "scas/sc16/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc16/cache-root" "/tmp/scas-lab-npm-cache"
      ;;
    17)
      scas_floci_secret_put "scas/sc17/stage1-npm" "$npm_json"
      ;;
    18)
      scas_floci_secret_put "scas/sc18/npm-publish-token" "$npm_json"
      ;;
    19)
      scas_floci_ssm_put_parameter "/scas/sc19/athena-workgroup" "scas-sc19-sbom"
      ;;
    20)
      scas_floci_secret_put "scas/sc20/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc20/canonical-version" "1.2.3"
      ;;
    21)
      scas_floci_secret_put "scas/sc21/ci-aws-role" "$aws_json"
      scas_floci_secret_put "scas/sc21/decoy-npm-token" "$npm_json"
      ;;
    22)
      scas_floci_secret_put "scas/sc22/pypi-token" "$pypi_json"
      scas_floci_secret_put "scas/sc22/openai-api-key" "$openai_json"
      scas_floci_ssm_put_parameter "/scas/sc22/index-url" "http://127.0.0.1:3022/simple"
      ;;
    23)
      scas_floci_ssm_put_parameter "/scas/sc23/github-pat" "$github_token"
      scas_floci_secret_put "scas/sc23/ci-aws" "$aws_json"
      scas_floci_secret_put "scas/sc23/ci-docker" "$docker_json"
      ;;
    24)
      scas_floci_secret_put "scas/sc24/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc24/allowed-packages" "asyncio,aiohttp,httpx"
      ;;
    25)
      scas_floci_secret_put "scas/sc25/github-pat" "$github_json"
      scas_floci_secret_put "scas/sc25/ci-aws" "$aws_json"
      scas_floci_ssm_put_parameter "/scas/sc25/github-pat" "$github_token"
      ;;
    26)
      scas_floci_secret_put "scas/sc26/openai-api-key" "$openai_json"
      scas_floci_secret_put "scas/sc26/github-pat" "$github_json"
      scas_floci_secret_put "scas/sc26/ci-aws" "$aws_json"
      scas_floci_ssm_put_parameter "/scas/sc26/mcp-allowlist" "filesystem,git"
      ;;
    27)
      scas_floci_secret_put "scas/sc27/npm-publish-token" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc27/trusted-issuer" "https://127.0.0.1/scas-lab/oidc"
      ;;
    28)
      scas_floci_secret_put "scas/sc28/module-checksum" "$npm_json"
      scas_floci_ssm_put_parameter "/scas/sc28/goproxy" "http://127.0.0.1:3028,off"
      ;;
    29)
      scas_floci_secret_put "scas/sc29/hf-token" "$hf_json"
      scas_floci_ssm_put_parameter "/scas/sc29/model-revision" "lab-rev-0001"
      ;;
  esac
}

scas_floci_seed_story_extras() {
  local id bucket
  id="$(scas_floci_id2 "${1:?}")"
  bucket="${2:?bucket}"

  local topic_arn queue_url
  case "$id" in
    01)
      scas_floci_s3_put_string "$bucket" "org/customer-export-lab.csv" <<< "acct_lab,email_lab,note
ACCT-LAB-0001,workshop@127.0.0.1,dummy row not real PII"
      topic_arn="$(scas_floci_sns_create_topic "scas-sc01-registry-alerts" || true)"
      if [ -n "${topic_arn:-}" ]; then
        scas_floci_sns_publish "$topic_arn" '{"scenario":"01","event":"seeded","lab_only":true}' || true
      fi
      ;;
    02)
      queue_url="$(scas_floci_sqs_create_queue "scas-sc02-dep-resolve" || true)"
      if [ -n "${queue_url:-}" ]; then
        scas_floci_sqs_send "$queue_url" '{"scenario":"02","job":"resolve-internal-scope","lab_only":true}' || true
      fi
      ;;
    03)
      scas_floci_s3_put_string "$bucket" "org/payroll-lab-2026.enc" <<< "SCAS-LAB-DUMMY-PAYROLL-NOT-REAL"
      ;;
    04)
      topic_arn="$(scas_floci_sns_create_topic "scas-sc04-update-alerts" || true)"
      if [ -n "${topic_arn:-}" ]; then
        scas_floci_sns_publish "$topic_arn" '{"scenario":"04","event":"version-bump-watch","lab_only":true}' || true
      fi
      scas_floci_eventbridge_put "scas.package.update" '{"scenario":"04","channel":"latest","lab_only":true}'
      ;;
    08)
      scas_floci_s3_put_string "$bucket" "org/package-lock.expected.json" <<< '{"lab_only":true,"integrity":"lab-only-lock-sha256"}'
      ;;
    09)
      scas_floci_iam_create_role "scas-sc09-publisher-role"
      ;;
    12)
      queue_url="$(scas_floci_sqs_create_queue "scas-sc12-workspace-build" || true)"
      if [ -n "${queue_url:-}" ]; then
        scas_floci_sqs_send "$queue_url" '{"scenario":"12","workspace":"packages/app","lab_only":true}' || true
      fi
      ;;
    13)
      scas_floci_s3_put_string "$bucket" "org/registry-packument.json" <<< '{"name":"scas-lab-pkg","versions":{"1.0.0":{}},"_lab_only":true}'
      ;;
    16)
      scas_floci_s3_put_string "$bucket" "cache/.keep" <<< "empty cache prefix before poison"
      ;;
    18)
      scas_floci_eventbridge_put "scas.plugin.loaded" '{"scenario":"18","plugin":"scas-lab-npm-plugin","lab_only":true}'
      ;;
    19)
      scas_floci_glue_create_database "scas_sc19_sbom" "SCAS scenario 19 SBOM catalog"
      scas_floci_aws config describe-configuration-recorders >/dev/null 2>&1 || true
      ;;
    20)
      scas_floci_eventbridge_put "scas.version.resolve" '{"scenario":"20","canonical":"1.2.3","lab_only":true}'
      ;;
    24)
      scas_floci_s3_put_string "$bucket" "catalog/404-baseline.json" <<< '{"name":"python-asyncio-utils","exists":false,"lab_only":true,"note":"never published on this fake catalog"}'
      scas_floci_eventbridge_put "scas.catalog.miss" '{"scenario":"24","name":"python-asyncio-utils","lab_only":true}'
      ;;
    25)
      scas_floci_iam_create_role "scas-sc25-gha-role"
      scas_floci_s3_put_string "$bucket" "source.zip" <<< "gha-workflow-source-placeholder"
      scas_floci_codepipeline_create "scas-sc25-pipeline" "$bucket"
      ;;
    27)
      scas_floci_iam_create_role "scas-sc27-publisher-role"
      scas_floci_s3_put_string "$bucket" "attestations/unsigned-placeholder.json" <<< '{"_type":"https://in-toto.io/Statement/v0.1","lab_only":true,"predicateType":"https://slsa.dev/provenance/v0.2","predicate":{"buildType":"scas-lab-unsigned"}}'
      ;;
    28)
      scas_floci_s3_put_string "$bucket" "modules/.keep" <<< "goproxy zip analog"
      scas_floci_eventbridge_put "scas.module.fetch" '{"scenario":"28","module":"example.com/scas/widget","lab_only":true}'
      ;;
    29)
      scas_floci_s3_put_string "$bucket" "models/revision.txt" <<< "lab-rev-0001"
      scas_floci_glue_create_database "scas_sc29_models" "SCAS scenario 29 model catalog"
      ;;
  esac
}
