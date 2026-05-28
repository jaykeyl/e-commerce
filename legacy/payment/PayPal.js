import { PaymentStrategy } from "./PaymentStrategy.js";

class PayPal extends PaymentStrategy {
    pay(amount) {
        console.log(`Paying $${amount} with PayPal`);
        // Lógica para procesar el pago con PayPal
    }
}

module.exports = PayPal;