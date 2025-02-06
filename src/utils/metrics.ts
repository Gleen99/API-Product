import promClient from "prom-client";


const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });


const httpRequestCounter = new promClient.Counter({
    name: "http_requests_total",
    help: "Total des requêtes HTTP",
    labelNames: ["method", "route", "status"]
});
register.registerMetric(httpRequestCounter);


const metricsMiddleware = (req: any, res: any , next: any) => {
    res.on("finish", () => {
        console.log(`📊 Requête : ${req.method} ${req.path} - ${res.statusCode}`);
        httpRequestCounter.inc({
            method: req.method,
            route: req.path,
            status: res.statusCode
        });
    });
    next();
};

const metricsEndpoint = async (req: any, res: any) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
};

export { metricsMiddleware, metricsEndpoint };