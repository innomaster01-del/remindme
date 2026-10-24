// Extends app.json: every GitHub build gets a higher Android versionCode,
// so a new APK installs cleanly over the previous one.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    versionCode: Number(process.env.GITHUB_RUN_NUMBER || 1),
  },
});
