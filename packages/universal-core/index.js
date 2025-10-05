function createVSCodeExtension(vscode) {
  const core = {
    initialize: async () => Promise.resolve(),
    processMessage: async (msg) => ({ success: true, coordinatedResponse: `local-core: ${msg}` })
  };

  const commands = {};

  return { core, commands };
}

module.exports = { createVSCodeExtension };
