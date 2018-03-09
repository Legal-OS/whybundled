/* @flow */

const { analyze, print, getStats } = require("../lib");
const validate = require("../lib/validate");
const { log, invalidStatsJson } = require("../lib/messages");

module.exports = function byCommand(
  statsFilePath /*: string */,
  flags /*: { limit: number, by: string, ignore?: string } */,
  pattern /*: string */
) {
  const stats = getStats(statsFilePath);

  if (!validate(stats)) {
    log(invalidStatsJson(statsFilePath));
    process.exit(1);
  }

  const ignore = flags.ignore ? flags.ignore.split(",") : [];
  const report = analyze(stats, ignore).filter(mod => {
    return (
      mod.reasons.some(
        reason =>
          reason.moduleName === flags.by || reason.clearName === flags.by
      ) || (mod.depsChains || []).some(deps => deps.indexOf(flags.by) !== -1)
    );
  });
  const limit /*: number */ = pattern ? 0 : flags.limit >= 0 ? flags.limit : 20;
  print(report, { by: flags.by }, limit);
};
