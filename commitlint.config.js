// commitlint - Valide les messages de commit
// Ex: "feat: add login" au lieu de "add stuff"

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // type doit être feat, fix, docs, test, etc.
    "type-enum": [2, "always", ["feat", "fix", "docs", "test", "refactor", "chore"]],
    // Max 100 caractères
    "header-max-length": [2, "always", 100],
    // Doit avoir une description
    "subject-empty": [2, "never"],
  },
};
