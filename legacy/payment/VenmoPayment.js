export class VenmoPayment {
    constructor(username) {
        this.username = username;
    }

    async pay(amount) {
        console.log(`Procesando pago de $${amount} con Venmo para el usuario @${this.username}`);

        // Guardar pago en la base de datos
        const response = await fetch('/savePayment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: this.username,
                amount: amount,
                method: "venmo",
                status: "success"
            })
        });

        if (response.ok) {
            console.log("Pago guardado en la BD");
        } else {
            console.error("Error al guardar el pago en la BD");
        }

        return { status: "success", message: `Pago de $${amount} realizado con Venmo.` };
    }
}
