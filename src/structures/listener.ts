process.on("unhandledRejection", (error: Error): void => {
    console.error("Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", (error: Error): void => {
    console.error("uncaughtException:", error);
});

process.on("uncaughtExceptionMonitor", (error: Error): void => {
    console.error("uncaughtExceptionMonitor:", error);
});
