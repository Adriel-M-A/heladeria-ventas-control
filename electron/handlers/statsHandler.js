import { handleIpc } from "../utils/ipcHelper.js";
import * as repo from "../database/statsRepo.js";

export function setupStatsHandlers() {
  handleIpc("get-stats", () => repo.getStats());
  handleIpc("get-reports", (event, period, customRange, typeFilter) =>
    repo.getReports(period, customRange, typeFilter)
  );
}
