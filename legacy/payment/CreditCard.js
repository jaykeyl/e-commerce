import { PaymentStrategy } from './PaymentStrategy.js';

export class CreditCard extends PaymentStrategy {
    async pay(amount) {
        console.log(`Procesando pago de $${amount} con tarjeta de crédito...`);

        const isValid = await this.validatePayment();
        if (!isValid) {
            console.log("Pago fallido: Datos de la tarjeta inválidos.");
            return false;
        }

        const hasEnoughBalance = await this.checkBalance(amount);
        if (!hasEnoughBalance) {
            console.log("Pago fallido: Saldo insuficiente.");
            return false;
        }

        const paymentSuccess = await this.processPayment(amount);
        return paymentSuccess;
    }

    async validatePayment() {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardName = document.getElementById('cardName').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            alert("Número de tarjeta inválido. Debe tener 16 dígitos.");
            return false;
        }

        if (!cardName || cardName.trim() === "") {
            alert("Nombre del titular inválido.");
            return false;
        }

        if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
            alert("Fecha de expiración inválida. Use el formato MM/YY.");
            return false;
        }

        if (!cvv || cvv.length !== 3 || !/^\d+$/.test(cvv)) {
            alert("CVV inválido. Debe tener 3 dígitos.");
            return false;
        }

        try {
            const response = await fetch('/validateCreditCard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardNumber, cardName, expiryDate, cvv }),
            });
            const data = await response.json();
            if (!data.success) {
                alert(data.error || "Tarjeta no encontrada. Verifique los datos.");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al validar la tarjeta:", error);
            return false;
        }
    }

    async checkBalance(amount) {
        const cardNumber = document.getElementById('cardNumber').value;

        try {
            const response = await fetch('/checkBalance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardNumber, amount }),
            });
            const data = await response.json();
            if (!data.success) {
                alert(data.error || "Error al verificar el saldo.");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al verificar el saldo:", error);
            return false;
        }
    }

    async processPayment(amount) {
        const cardNumber = document.getElementById('cardNumber').value;

        try {
            const response = await fetch('/processPayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardNumber, amount }),
            });
            const data = await response.json();
            if (!data.success) {
                alert("Error al procesar el pago.");
                return false;
            }
            console.log(`Pago exitoso: $${amount} descontados.`);
            return true;
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            return false;
        }
    }
}