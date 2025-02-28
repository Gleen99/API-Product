import promClient from "prom-client";
import { metricsMiddleware, metricsEndpoint } from "../utils/metrics";

describe("Metrics Module", () => {
  describe("metricsMiddleware", () => {
    it("devrait logger la requête et incrémenter le compteur http_requests_total", async () => {
      const req = { method: "GET", path: "/test" };
      let finishCallback: (() => void) | undefined;
      const res = {
        on: jest.fn((event, callback) => {
          if (event === "finish") {
            finishCallback = callback;
          }
        }),
        statusCode: 200,
      };
      const next = jest.fn();
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      // Appel du middleware
      metricsMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // On simule l'événement "finish"
      expect(finishCallback).toBeDefined();
      finishCallback!();

      // Récupérer la sortie des métriques via l'endpoint
      const fakeRes = {
        set: jest.fn(),
        end: jest.fn(),
      };
      await metricsEndpoint({}, fakeRes);

      // Récupération de la chaîne de métriques retournée
      const metricsOutput = (fakeRes.end as jest.Mock).mock.calls[0][0] as string;

      expect(metricsOutput).toMatch(/http_requests_total\{.*method="GET".*route="\/test".*status="200".*\} [1-9]\d*/);

      consoleLogSpy.mockRestore();
    });
  });

  describe("metricsEndpoint", () => {
    it("devrait retourner les métriques avec le bon Content-Type", async () => {
      let headerKey: string | undefined;
      let headerValue: string | undefined;
      let endCalledWith: string | undefined;

      const req = {};
      const res = {
        set: jest.fn((key, value) => {
          headerKey = key;
          headerValue = value;
        }),
        end: jest.fn((data) => {
          endCalledWith = data;
        }),
      };

      await metricsEndpoint(req, res);

      expect(res.set).toHaveBeenCalledWith("Content-Type", expect.any(String));
      expect(headerKey).toBe("Content-Type");
      expect(typeof headerValue).toBe("string");
      // Vérifie que les métriques retournées contiennent le nom du compteur
      expect(endCalledWith).toContain("http_requests_total");
    });
  });
});
