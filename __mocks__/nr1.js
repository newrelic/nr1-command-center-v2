const noop = () => null;

module.exports = {
  Badge: {
    TYPE: {
      CRITICAL: 'critical',
      SEVERE: 'severe',
      NORMAL: 'normal',
      INFO: 'info',
    },
  },
  Button: noop,
  Spinner: noop,
  Toast: { showToast: jest.fn() },
  NerdGraphQuery: { query: jest.fn() },
  NerdGraphMutation: { mutate: jest.fn() },
  UserQuery: { query: jest.fn() },
  AccountStorageQuery: { query: jest.fn() },
  AccountStorageMutation: { mutate: jest.fn() },
  navigation: {
    openStackedNerdlet: jest.fn(),
    openNerdlet: jest.fn(),
    getOpenStackedNerdlets: jest.fn(),
  },
  PlatformStateContext: { Consumer: ({ children }) => children({}) },
  NerdletStateContext: { Consumer: ({ children }) => children({}) },
};
