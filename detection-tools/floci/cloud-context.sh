#!/usr/bin/env bash
# Dump the pretend Floci org for one SCAS scenario (all emulator services the
# bridge knows about). Informational: always exits 0 if Floci is up.
# Usage: detection-tools/floci/cloud-context.sh 01
set -euo pipefail

SCENARIO_ID="${1:?usage: cloud-context.sh <scenario-id> e.g. 01}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../../scripts/floci/floci-bridge.sh
source "${ROOT}/scripts/floci/floci-bridge.sh"

scas_floci_require
ID="$(scas_floci_id2 "$SCENARIO_ID")"
BUCKET="$(scas_floci_bucket_for_scenario "$ID")"
REPO="$(scas_floci_ecr_repo_for_scenario "$ID")"
PIPELINE="scas-sc${ID}-pipeline"
CLUSTER="scas-sc${ID}"

echo "=== Floci cloud context — scenario ${ID} ==="
echo "    Emulator: ${SCAS_FLOCI_ENDPOINT}  (lab-only, not real AWS)"
echo "    Bucket:   s3://${BUCKET}"
echo ""

echo "--- STS ---"
scas_floci_sts_get_caller 2>/dev/null || echo "(sts unavailable)"
echo ""

echo "--- S3 prefixes ---"
for prefix in org/ baseline/ exfil/ catalog/ attestations/ modules/ models/ cache/ chain/ truth/ sbom/ releases/ npm/ mirror/; do
  listing="$(scas_floci_aws s3 ls "s3://${BUCKET}/${prefix}" 2>/dev/null || true)"
  if [ -n "$listing" ]; then
    echo "  ${prefix}"
    echo "$listing" | sed 's/^/    /'
  fi
done
echo ""

echo "--- S3 org/critical-assets.json ---"
scas_floci_aws s3 cp "s3://${BUCKET}/org/critical-assets.json" - 2>/dev/null || echo "(seed.sh not run yet)"
echo ""
echo ""

echo "--- IAM ---"
scas_floci_aws iam get-role --role-name "scas-sc${ID}-workload-role" --query 'Role.RoleName' --output text 2>/dev/null \
  || echo "(no workload role)"
for extra in scas-sc${ID}-publisher-role scas-sc${ID}-codebuild-role scas-sc${ID}-gha-role scas-sc${ID}-ci-role; do
  name="$(scas_floci_aws iam get-role --role-name "$extra" --query 'Role.RoleName' --output text 2>/dev/null || true)"
  [ -n "$name" ] && [ "$name" != "None" ] && echo "  extra role: ${name}"
done
echo ""

echo "--- Secrets Manager (Name contains scas/sc${ID}) ---"
scas_floci_aws secretsmanager list-secrets \
  --query "SecretList[?contains(Name, \`scas/sc${ID}\`)].Name" --output text 2>/dev/null \
  || echo "(none listed)"
echo ""

echo "--- SSM /scas/sc${ID} ---"
scas_floci_aws ssm get-parameters-by-path --path "/scas/sc${ID}" --recursive \
  --query 'Parameters[*].[Name,Value]' --output text 2>/dev/null \
  || echo "(none)"
echo ""

echo "--- CloudWatch Logs ---"
scas_floci_aws logs describe-log-groups --log-group-name-prefix "/scas/sc${ID}" \
  --query 'logGroups[*].logGroupName' --output text 2>/dev/null \
  || echo "(none)"
echo ""

echo "--- SQS (prefix scas-sc${ID}) ---"
scas_floci_aws sqs list-queues --queue-name-prefix "scas-sc${ID}" \
  --query 'QueueUrls' --output text 2>/dev/null \
  || echo "(none)"
echo ""

echo "--- SNS ---"
scas_floci_aws sns list-topics --query 'Topics[*].TopicArn' --output text 2>/dev/null \
  | tr '\t' '\n' | grep -E "scas-sc${ID}" || echo "(none matching scas-sc${ID})"
echo ""

echo "--- EventBridge ---"
echo "  Seed + exfil use events.put-events (Source=scas.lab). Past events are not a durable log."
scas_floci_aws events list-rules --name-prefix "scas-sc${ID}" \
  --query 'Rules[*].Name' --output text 2>/dev/null \
  || echo "(no named rules)"
echo ""

echo "--- ECR ${REPO} ---"
scas_floci_aws ecr describe-repositories --repository-names "$REPO" \
  --query 'repositories[0].repositoryName' --output text 2>/dev/null \
  || echo "(repo not created)"
scas_floci_aws ecr describe-images --repository-name "$REPO" \
  --query 'length(imageDetails)' --output text 2>/dev/null \
  && echo "  image count above" || true
echo ""

echo "--- ECS cluster ${CLUSTER} ---"
scas_floci_aws ecs describe-clusters --clusters "$CLUSTER" \
  --query 'clusters[0].clusterName' --output text 2>/dev/null \
  || echo "(none)"
echo ""

echo "--- CodePipeline ${PIPELINE} ---"
scas_floci_aws codepipeline get-pipeline --name "$PIPELINE" \
  --query 'pipeline.name' --output text 2>/dev/null \
  || echo "(none)"
echo ""

echo "--- Step Functions ---"
scas_floci_aws stepfunctions list-state-machines \
  --query "stateMachines[?contains(name, \`scas-sc${ID}\`)].name" --output text 2>/dev/null \
  || echo "(none)"
echo ""

echo "--- Glue ---"
glue_found=0
for db in "scas_sc${ID}_sbom" "scas_sc${ID}_models"; do
  got="$(scas_floci_aws glue get-database --name "$db" --query 'Database.Name' --output text 2>/dev/null || true)"
  if [ -n "$got" ] && [ "$got" != "None" ]; then
    echo "  database: ${got}"
    glue_found=1
  fi
done
[ "$glue_found" = "0" ] && echo "(none)"
echo ""

echo "Hunt next: detection-tools/floci/s3-exfil-check.sh ${ID}"
echo "           ./infrastructure/floci/verify.sh  (from the scenario folder)"
exit 0
