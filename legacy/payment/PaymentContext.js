export class PaymentContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    executePayment(amount) {
        if (!this.strategy) {
            throw new Error("No se ha definido una estrategia de pago.");
        }
        return this.strategy.pay(amount);
    }
}