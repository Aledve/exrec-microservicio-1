const express = require('express');
const { Client } = require('pg');
const amqp = require('amqplib');

const app = express();
const port = 3000;

// 1. Configuración de PostgreSQL (Usa la IP interna de tu Instancia 1)
const dbClient = new Client({
  user: 'postgres',
  host: 'localhost', // Como estará en la misma máquina, usamos localhost
  database: 'postgres',
  password: 'admin123',
  port: 5432,
});

dbClient.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error('Error conectando a BD', err));

// 2. Ruta principal
app.get('/app1', async (req, res) => {
  try {
    // 3. Conexión a RabbitMQ (Usa la IP de tu Instancia 3, donde instalamos Rabbit)
    // REEMPLAZA <IP_INSTANCIA_3> con la IP real pública de tu instancia 3
    const rabbitConn = await amqp.connect('amqp://18.210.13.238');
    const channel = await rabbitConn.createChannel();
    const queue = 'eventos_ms';
    
    await channel.assertQueue(queue, { durable: false });
    const mensaje = "Hola, soy el Microservicio 1 reportando una visita!";
    
    // 4. Enviar el evento
    channel.sendToQueue(queue, Buffer.from(mensaje));
    console.log(" [x] Evento enviado a RabbitMQ");
    
    setTimeout(() => rabbitConn.close(), 500);

    res.send('<h1>Microservicio 1 funcionando. Evento enviado a RabbitMQ!</h1>');
  } catch (error) {
    res.status(500).send('Error conectando a RabbitMQ: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Microservicio 1 escuchando en el puerto ${port}`);
});