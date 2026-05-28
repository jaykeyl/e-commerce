// Qr.js
import { PaymentStrategy } from './PaymentStrategy.js';

export class Qr extends PaymentStrategy {
    async pay(amount) {
        console.log(`Procesando pago de $${amount} mediante QR...`);

        // Validar el pago
        const isValid = await this.validatePayment();
        if (!isValid) {
            console.log("Pago fallido: Datos de QR inválidos.");
            return false;
        }

        // Procesar el pago
        const paymentSuccess = await this.processPayment(amount);
        return paymentSuccess;
    }

    async validatePayment() {
        const qrCode = document.getElementById('qrCode').value;

        // Validar que el código QR no esté vacío
        if (!qrCode || qrCode.trim() === "") {
            alert("Código QR inválido.");
            return false;
        }

        // Simular validación con el servidor
        try {
            const response = await fetch('/validateQR', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCode }),
            });
            const data = await response.json();
            if (!data.success) {
                alert(data.error || "Código QR no encontrado. Verifique los datos.");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al validar el código QR:", error);
            return false;
        }
    }

    async processPayment(amount) {
        const qrCode = document.getElementById('qrCode').value;

        // Simular procesamiento del pago con el servidor
        try {
            const response = await fetch('/processQRPayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCode, amount }),
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