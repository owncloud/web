// tests/unit/config/vitest.config.ts
import { defineConfig } from "file:///Users/jannik.stehle/work/web/node_modules/.pnpm/vitest@2.0.3_@types+node@18.11.9_happy-dom@13.3.1_jsdom@20.0.3_sass@1.69.7_terser@5.26.0/node_modules/vitest/dist/config.js";
import vue from "file:///Users/jannik.stehle/work/web/node_modules/.pnpm/@vitejs+plugin-vue@5.0.3_vite@5.2.8_@types+node@18.11.9_sass@1.69.7_terser@5.26.0__vue@3.4.21_typescript@5.5.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";

// vite.config.common.ts
var compilerOptions = {
  whitespace: "preserve"
};

// tests/unit/config/vitest.config.ts
var __vite_injected_original_dirname = "/Users/jannik.stehle/work/web/tests/unit/config";
var root = path.resolve(__vite_injected_original_dirname, "../../../");
var vitest_config_default = defineConfig({
  plugins: [
    vue({ template: { compilerOptions } }),
    {
      name: "@ownclouders/vite-plugin-docs",
      transform(src, id) {
        if (id.includes("type=docs")) {
          return {
            code: "export default {}",
            map: null
          };
        }
      }
    }
  ],
  test: {
    root,
    globals: true,
    environment: "happy-dom",
    clearMocks: true,
    include: ["**/*.spec.ts"],
    setupFiles: ["tests/unit/config/vitest.init.ts", "core-js", "@vitest/web-worker"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      ".pnpm-store/*",
      "e2e/**"
    ],
    alias: {
      "vue-inline-svg": `${root}/tests/unit/stubs/empty.ts`,
      webfontloader: `${root}/tests/unit/stubs/webfontloader.ts`
    },
    coverage: {
      provider: "v8",
      reportsDirectory: `${root}/coverage`,
      reporter: "lcov"
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidGVzdHMvdW5pdC9jb25maWcvdml0ZXN0LmNvbmZpZy50cyIsICJ2aXRlLmNvbmZpZy5jb21tb24udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFubmlrLnN0ZWhsZS93b3JrL3dlYi90ZXN0cy91bml0L2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2phbm5pay5zdGVobGUvd29yay93ZWIvdGVzdHMvdW5pdC9jb25maWcvdml0ZXN0LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvamFubmlrLnN0ZWhsZS93b3JrL3dlYi90ZXN0cy91bml0L2NvbmZpZy92aXRlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGNvbXBpbGVyT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3ZpdGUuY29uZmlnLmNvbW1vbidcblxuY29uc3Qgcm9vdCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLi8nKVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKHsgdGVtcGxhdGU6IHsgY29tcGlsZXJPcHRpb25zIH0gfSksXG4gICAge1xuICAgICAgbmFtZTogJ0Bvd25jbG91ZGVycy92aXRlLXBsdWdpbi1kb2NzJyxcbiAgICAgIHRyYW5zZm9ybShzcmMsIGlkKSB7XG4gICAgICAgIGlmIChpZC5pbmNsdWRlcygndHlwZT1kb2NzJykpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29kZTogJ2V4cG9ydCBkZWZhdWx0IHt9JyxcbiAgICAgICAgICAgIG1hcDogbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgXSxcbiAgdGVzdDoge1xuICAgIHJvb3QsXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogJ2hhcHB5LWRvbScsXG4gICAgY2xlYXJNb2NrczogdHJ1ZSxcbiAgICBpbmNsdWRlOiBbJyoqLyouc3BlYy50cyddLFxuICAgIHNldHVwRmlsZXM6IFsndGVzdHMvdW5pdC9jb25maWcvdml0ZXN0LmluaXQudHMnLCAnY29yZS1qcycsICdAdml0ZXN0L3dlYi13b3JrZXInXSxcbiAgICBleGNsdWRlOiBbXG4gICAgICAnKiovbm9kZV9tb2R1bGVzLyoqJyxcbiAgICAgICcqKi9kaXN0LyoqJyxcbiAgICAgICcqKi9jeXByZXNzLyoqJyxcbiAgICAgICcqKi8ue2lkZWEsZ2l0LGNhY2hlLG91dHB1dCx0ZW1wfS8qKicsXG4gICAgICAnKiove2thcm1hLHJvbGx1cCx3ZWJwYWNrLHZpdGUsdml0ZXN0LGplc3QsYXZhLGJhYmVsLG55YyxjeXByZXNzLHRzdXAsYnVpbGR9LmNvbmZpZy4qJyxcbiAgICAgICcucG5wbS1zdG9yZS8qJyxcbiAgICAgICdlMmUvKionXG4gICAgXSxcbiAgICBhbGlhczoge1xuICAgICAgJ3Z1ZS1pbmxpbmUtc3ZnJzogYCR7cm9vdH0vdGVzdHMvdW5pdC9zdHVicy9lbXB0eS50c2AsXG4gICAgICB3ZWJmb250bG9hZGVyOiBgJHtyb290fS90ZXN0cy91bml0L3N0dWJzL3dlYmZvbnRsb2FkZXIudHNgXG4gICAgfSxcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcHJvdmlkZXI6ICd2OCcsXG4gICAgICByZXBvcnRzRGlyZWN0b3J5OiBgJHtyb290fS9jb3ZlcmFnZWAsXG4gICAgICByZXBvcnRlcjogJ2xjb3YnXG4gICAgfVxuICB9XG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFubmlrLnN0ZWhsZS93b3JrL3dlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2phbm5pay5zdGVobGUvd29yay93ZWIvdml0ZS5jb25maWcuY29tbW9uLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qYW5uaWsuc3RlaGxlL3dvcmsvd2ViL3ZpdGUuY29uZmlnLmNvbW1vbi50c1wiO2ltcG9ydCB7IENvbXBpbGVyT3B0aW9ucyB9IGZyb20gJ0B2dWUvY29tcGlsZXItc2ZjJ1xuXG5leHBvcnQgY29uc3QgY29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnMgPSB7XG4gIHdoaXRlc3BhY2U6ICdwcmVzZXJ2ZSdcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVUsU0FBUyxvQkFBb0I7QUFDaFcsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTs7O0FDQVYsSUFBTSxrQkFBbUM7QUFBQSxFQUM5QyxZQUFZO0FBQ2Q7OztBREpBLElBQU0sbUNBQW1DO0FBS3pDLElBQU0sT0FBTyxLQUFLLFFBQVEsa0NBQVcsV0FBVztBQUVoRCxJQUFPLHdCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLENBQUM7QUFBQSxJQUNyQztBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sVUFBVSxLQUFLLElBQUk7QUFDakIsWUFBSSxHQUFHLFNBQVMsV0FBVyxHQUFHO0FBQzVCLGlCQUFPO0FBQUEsWUFDTCxNQUFNO0FBQUEsWUFDTixLQUFLO0FBQUEsVUFDUDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLElBQ3hCLFlBQVksQ0FBQyxvQ0FBb0MsV0FBVyxvQkFBb0I7QUFBQSxJQUNoRixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGtCQUFrQixHQUFHLElBQUk7QUFBQSxNQUN6QixlQUFlLEdBQUcsSUFBSTtBQUFBLElBQ3hCO0FBQUEsSUFDQSxVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixrQkFBa0IsR0FBRyxJQUFJO0FBQUEsTUFDekIsVUFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
