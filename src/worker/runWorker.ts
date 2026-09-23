import { runDetectionCycle } from "@/lib/worker/run-detection-cycle";

async function main() {
  const result = await runDetectionCycle();
  if (!result.ok) {
    console.error("Worker failed:", result.message);
    process.exitCode = 1;
    return;
  }

  console.log("Worker success. Detections:", result.detectionsCount ?? 0);
}

main();
