module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "prefer-destructuring": ["error", {
          "array": false,
          "object": false
        }, {
          "enforceForRenamedProperties": true
        }]
      }
};