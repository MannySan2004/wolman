import { spawn } from "node:child_process";

const { BASTION_INSTANCE_ID, RDS_HOST, PGPORT } = process.env;

spawn(
  "aws",
  [
    "ssm", "start-session",
    "--target", BASTION_INSTANCE_ID,
    "--document-name", "AWS-StartPortForwardingSessionToRemoteHost",
    "--parameters", `host=${RDS_HOST},portNumber=5432,localPortNumber=${PGPORT}`,
  ],
  { stdio: "inherit" },
).on("exit", (code) => process.exit(code ?? 1));
