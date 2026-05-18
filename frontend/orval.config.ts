import { defineConfig } from "orval";

export default defineConfig({
  vespin: {
    input: {
      target: "../backend/api/openapi.yaml",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/endpoints.ts",
      schemas: "./src/api/generated/schemas",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        mutator: {
          path: "./src/api/client.ts",
          name: "vespinFetch",
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});
