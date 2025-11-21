import { setupWorker } from "msw/browser";
import { orderHandlers } from "./handlers/orders";

export const worker = setupWorker(...orderHandlers);
