import {PaymentStrategy} from "./PaymentStrategy.js";

export class Crypto extends PaymentStrategy {

async pay(amount, cryptoType, walletKey) {
        try {
            const precios = await this.obtenerPrecios();

            // Convertir el monto en USD a la criptomoneda seleccionada
            const cryptoAmount = amount / precios[cryptoType].usd;
            console.log(`Monto en USD: $${amount} equivale a ${cryptoAmount.toFixed(6)} ${cryptoType.toUpperCase()}`);

            // Verificar saldo en el backend
            const saldoUsuario = await this.verificarSaldo(walletKey);
            if (saldoUsuario < cryptoAmount) {
                console.log("Saldo insuficiente para realizar la transacción.");
                return false;
            }

            // Procesar el pago
            return await this.procesarPago(walletKey, cryptoAmount);
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            return false;
        }
    }

    async obtenerPrecios() {
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";
        try {
            const respuesta = await fetch(url);
            return await respuesta.json();
        } catch (error) {
            console.error("Error al obtener los precios:", error);
            throw error;
        }
    }

    async verificarSaldo(walletKey) {
        try {
            const response = await fetch("/checkCryptoBalance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletKey }),
            });
            const data = await response.json();

            if (!data.success) {
                console.log(data.error || "Error al verificar saldo.");
                return 0;
            }
            return parseFloat(data.balance);
        } catch (error) {
            console.error("Error al verificar saldo:", error);
            return 0;
        }
    }

    async procesarPago(walletKey, cryptoAmount) {
        try {
            const response = await fetch("/processCryptoPayment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletKey, amount: cryptoAmount }),
            });
            const data = await response.json();

            if (!data.success) {
                console.log("Error al procesar el pago.");
                return false;
            }
            console.log(`Pago exitoso: ${cryptoAmount.toFixed(6)} descontados.`);
            return true;
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            return false;
        }
    }
}
