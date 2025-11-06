function createVSCodeExtension(vscode) {
  const core = {
    initialize: async () => Promise.resolve(),
    processMessage: async (msg) => ({ success: true, coordinatedResponse: `local-core: ${msg}` })
  };

  const commands = {};

  return { core, commands };
}

function createNPXExtension() {
  const core = {
    initialize: async () => Promise.resolve(),
    processMessage: async (msg) => ({ success: true, coordinatedResponse: `Alex AI CLI: ${msg}` }),
    queryCrewMember: async (query) => ({ success: true, response: `Crew member response to: ${query}` })
  };

  const commands = {
    chat: async (message) => core.processMessage(message),
    status: async () => ({ status: 'operational', crew: 'ready' })
  };

  return { core, commands };
}

module.exports = { createVSCodeExtension, createNPXExtension };
