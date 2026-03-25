import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=74c93b1e"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=74c93b1e"; const StrictMode = __vite__cjsImport1_react["StrictMode"];
import __vite__cjsImport2_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=74c93b1e"; const createRoot = __vite__cjsImport2_reactDom_client["createRoot"];
import { BrowserRouter } from "/node_modules/.vite/deps/react-router-dom.js?v=74c93b1e";
import { QueryClient, QueryClientProvider } from "/node_modules/.vite/deps/@tanstack_react-query.js?v=74c93b1e";
import { Toaster } from "/node_modules/.vite/deps/react-hot-toast.js?v=74c93b1e";
import { AuthProvider } from "/src/contexts/AuthContext.tsx?t=1765072730322";
import App from "/src/App.tsx?t=1765076001910";
import "/src/index.css?t=1765073146030";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1e3,
      // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});
const toastOptions = {
  duration: 4e3,
  style: {
    fontFamily: "IBM Plex Sans Arabic, Tahoma, Arial, sans-serif",
    direction: "rtl",
    borderRadius: "12px",
    padding: "12px 16px",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  },
  success: {
    iconTheme: {
      primary: "#10b981",
      secondary: "#fff"
    }
  },
  error: {
    iconTheme: {
      primary: "#ef4444",
      secondary: "#fff"
    }
  }
};
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDEV(StrictMode, { children: /* @__PURE__ */ jsxDEV(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxDEV(BrowserRouter, { children: /* @__PURE__ */ jsxDEV(AuthProvider, { children: [
    /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
      fileName: "C:/xampp/htdocs/projects/yemen-union-system/frontend/src/main.tsx",
      lineNumber: 50,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV(
      Toaster,
      {
        position: "top-left",
        reverseOrder: false,
        toastOptions
      },
      void 0,
      false,
      {
        fileName: "C:/xampp/htdocs/projects/yemen-union-system/frontend/src/main.tsx",
        lineNumber: 51,
        columnNumber: 11
      },
      this
    )
  ] }, void 0, true, {
    fileName: "C:/xampp/htdocs/projects/yemen-union-system/frontend/src/main.tsx",
    lineNumber: 49,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "C:/xampp/htdocs/projects/yemen-union-system/frontend/src/main.tsx",
    lineNumber: 48,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "C:/xampp/htdocs/projects/yemen-union-system/frontend/src/main.tsx",
    lineNumber: 47,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "C:/xampp/htdocs/projects/yemen-union-system/frontend/src/main.tsx",
    lineNumber: 46,
    columnNumber: 3
  }, this)
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBaURVO0FBakRWLFNBQVNBLGtCQUFrQjtBQUMzQixTQUFTQyxrQkFBa0I7QUFDM0IsU0FBU0MscUJBQXFCO0FBQzlCLFNBQVNDLGFBQWFDLDJCQUEyQjtBQUNqRCxTQUFTQyxlQUFlO0FBQ3hCLFNBQVNDLG9CQUFvQjtBQUM3QixPQUFPQyxTQUFTO0FBQ2hCLE9BQU87QUFHUCxNQUFNQyxjQUFjLElBQUlMLFlBQVk7QUFBQSxFQUNsQ00sZ0JBQWdCO0FBQUEsSUFDZEMsU0FBUztBQUFBLE1BQ1BDLFdBQVcsSUFBSSxLQUFLO0FBQUE7QUFBQSxNQUNwQkMsT0FBTztBQUFBLE1BQ1BDLHNCQUFzQjtBQUFBLElBQ3hCO0FBQUEsRUFDRjtBQUNGLENBQUM7QUFHRCxNQUFNQyxlQUFlO0FBQUEsRUFDbkJDLFVBQVU7QUFBQSxFQUNWQyxPQUFPO0FBQUEsSUFDTEMsWUFBWTtBQUFBLElBQ1pDLFdBQVc7QUFBQSxJQUNYQyxjQUFjO0FBQUEsSUFDZEMsU0FBUztBQUFBLElBQ1RDLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQUMsU0FBUztBQUFBLElBQ1BDLFdBQVc7QUFBQSxNQUNUQyxTQUFTO0FBQUEsTUFDVEMsV0FBVztBQUFBLElBQ2I7QUFBQSxFQUNGO0FBQUEsRUFDQUMsT0FBTztBQUFBLElBQ0xILFdBQVc7QUFBQSxNQUNUQyxTQUFTO0FBQUEsTUFDVEMsV0FBVztBQUFBLElBQ2I7QUFBQSxFQUNGO0FBQ0Y7QUFFQXhCLFdBQVcwQixTQUFTQyxlQUFlLE1BQU0sQ0FBRSxFQUFFQztBQUFBQSxFQUMzQyx1QkFBQyxjQUNDLGlDQUFDLHVCQUFvQixRQUFRckIsYUFDM0IsaUNBQUMsaUJBQ0MsaUNBQUMsZ0JBQ0M7QUFBQSwyQkFBQyxTQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FBSTtBQUFBLElBQ0o7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLFVBQVM7QUFBQSxRQUNULGNBQWM7QUFBQSxRQUNkO0FBQUE7QUFBQSxNQUhGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUc2QjtBQUFBLE9BTC9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FPQSxLQVJGO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FTQSxLQVZGO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FXQSxLQVpGO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FhQTtBQUNGIiwibmFtZXMiOlsiU3RyaWN0TW9kZSIsImNyZWF0ZVJvb3QiLCJCcm93c2VyUm91dGVyIiwiUXVlcnlDbGllbnQiLCJRdWVyeUNsaWVudFByb3ZpZGVyIiwiVG9hc3RlciIsIkF1dGhQcm92aWRlciIsIkFwcCIsInF1ZXJ5Q2xpZW50IiwiZGVmYXVsdE9wdGlvbnMiLCJxdWVyaWVzIiwic3RhbGVUaW1lIiwicmV0cnkiLCJyZWZldGNoT25XaW5kb3dGb2N1cyIsInRvYXN0T3B0aW9ucyIsImR1cmF0aW9uIiwic3R5bGUiLCJmb250RmFtaWx5IiwiZGlyZWN0aW9uIiwiYm9yZGVyUmFkaXVzIiwicGFkZGluZyIsImJveFNoYWRvdyIsInN1Y2Nlc3MiLCJpY29uVGhlbWUiLCJwcmltYXJ5Iiwic2Vjb25kYXJ5IiwiZXJyb3IiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicmVuZGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIm1haW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0cmljdE1vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG5pbXBvcnQgeyBCcm93c2VyUm91dGVyIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5pbXBvcnQgeyBRdWVyeUNsaWVudCwgUXVlcnlDbGllbnRQcm92aWRlciB9IGZyb20gJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSc7XG5pbXBvcnQgeyBUb2FzdGVyIH0gZnJvbSAncmVhY3QtaG90LXRvYXN0JztcbmltcG9ydCB7IEF1dGhQcm92aWRlciB9IGZyb20gJy4vY29udGV4dHMvQXV0aENvbnRleHQnO1xuaW1wb3J0IEFwcCBmcm9tICcuL0FwcCc7XG5pbXBvcnQgJy4vaW5kZXguY3NzJztcblxuLy8gQ29uZmlndXJlIFJlYWN0IFF1ZXJ5XG5jb25zdCBxdWVyeUNsaWVudCA9IG5ldyBRdWVyeUNsaWVudCh7XG4gIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgcXVlcmllczoge1xuICAgICAgc3RhbGVUaW1lOiA1ICogNjAgKiAxMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICAgIHJldHJ5OiAxLFxuICAgICAgcmVmZXRjaE9uV2luZG93Rm9jdXM6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG59KTtcblxuLy8gVG9hc3QgY29uZmlndXJhdGlvblxuY29uc3QgdG9hc3RPcHRpb25zID0ge1xuICBkdXJhdGlvbjogNDAwMCxcbiAgc3R5bGU6IHtcbiAgICBmb250RmFtaWx5OiAnSUJNIFBsZXggU2FucyBBcmFiaWMsIFRhaG9tYSwgQXJpYWwsIHNhbnMtc2VyaWYnLFxuICAgIGRpcmVjdGlvbjogJ3J0bCcgYXMgY29uc3QsXG4gICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgcGFkZGluZzogJzEycHggMTZweCcsXG4gICAgYm94U2hhZG93OiAnMCAxMHB4IDE1cHggLTNweCByZ2IoMCAwIDAgLyAwLjEpLCAwIDRweCA2cHggLTRweCByZ2IoMCAwIDAgLyAwLjEpJyxcbiAgfSxcbiAgc3VjY2Vzczoge1xuICAgIGljb25UaGVtZToge1xuICAgICAgcHJpbWFyeTogJyMxMGI5ODEnLFxuICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXG4gICAgfSxcbiAgfSxcbiAgZXJyb3I6IHtcbiAgICBpY29uVGhlbWU6IHtcbiAgICAgIHByaW1hcnk6ICcjZWY0NDQ0JyxcbiAgICAgIHNlY29uZGFyeTogJyNmZmYnLFxuICAgIH0sXG4gIH0sXG59O1xuXG5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykhKS5yZW5kZXIoXG4gIDxTdHJpY3RNb2RlPlxuICAgIDxRdWVyeUNsaWVudFByb3ZpZGVyIGNsaWVudD17cXVlcnlDbGllbnR9PlxuICAgICAgPEJyb3dzZXJSb3V0ZXI+XG4gICAgICAgIDxBdXRoUHJvdmlkZXI+XG4gICAgICAgICAgPEFwcCAvPlxuICAgICAgICAgIDxUb2FzdGVyXG4gICAgICAgICAgICBwb3NpdGlvbj1cInRvcC1sZWZ0XCJcbiAgICAgICAgICAgIHJldmVyc2VPcmRlcj17ZmFsc2V9XG4gICAgICAgICAgICB0b2FzdE9wdGlvbnM9e3RvYXN0T3B0aW9uc31cbiAgICAgICAgICAvPlxuICAgICAgICA8L0F1dGhQcm92aWRlcj5cbiAgICAgIDwvQnJvd3NlclJvdXRlcj5cbiAgICA8L1F1ZXJ5Q2xpZW50UHJvdmlkZXI+XG4gIDwvU3RyaWN0TW9kZT4sXG4pO1xuIl0sImZpbGUiOiJDOi94YW1wcC9odGRvY3MvcHJvamVjdHMveWVtZW4tdW5pb24tc3lzdGVtL2Zyb250ZW5kL3NyYy9tYWluLnRzeCJ9