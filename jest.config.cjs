module.exports = {
  roots: ["<rootDir>/src/tests"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc-node/jest"],
  },
};
