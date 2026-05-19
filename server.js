const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

let tickets = [
  {
    id: crypto.randomUUID(),
    name: "Поменять краску в принтере, ком. 404",
    description: "Принтер HP LJ-1210, картриджи на складе",
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Переустановить Windows, PC-Hall24",
    description: "",
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Установить обновление KB-31642dv3875",
    description: "Вышло критическое обновление для Windows",
    status: false,
    created: Date.now(),
  },
];

// Middleware
app.use(cors());
app.use(express.json());

// Вспомогательная функция для отправки ответа
function sendResponse(res, data, status = 200) {
  res.status(status).json(data);
}

// Маршруты API
app.get('/', (req, res) => {
  const { method } = req.query;

  switch (method) {
    case 'allTickets':
      // Возвращаем все тикеты без description
      const allTickets = tickets.map(({ description, ...rest }) => rest);
      return sendResponse(res, allTickets);

    case 'ticketById': {
      const { id } = req.query;
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) {
        return sendResponse(res, { error: 'Ticket not found' }, 404);
      }
      return sendResponse(res, ticket);
    }

    case 'deleteById': {
      const { id } = req.query;
      const index = tickets.findIndex((t) => t.id === id);
      if (index === -1) {
        return sendResponse(res, { error: 'Ticket not found' }, 404);
      }
      tickets.splice(index, 1);
      return res.status(204).end();
    }

    default:
      return sendResponse(res, { error: 'Invalid method' }, 400);
  }
});

app.post('/', (req, res) => {
  const { method } = req.query;

  switch (method) {
    case 'createTicket': {
      const { name, description, status } = req.body;
      if (!name) {
        return sendResponse(res, { error: 'Name is required' }, 400);
      }
      const newTicket = {
        id: uuidv4(),
        name,
        description: description || '',
        status: status || false,
        created: Date.now(),
      };
      tickets.push(newTicket);
      // Возвращаем без description (как ожидается для списка)
      const { description: _, ...newTicketWithoutDescription } = newTicket;
      return sendResponse(res, newTicketWithoutDescription, 201);
    }

    case 'updateById': {
      const { id } = req.query;
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) {
        return sendResponse(res, { error: 'Ticket not found' }, 404);
      }
      const { name, description, status } = req.body;
      if (name !== undefined) ticket.name = name;
      if (description !== undefined) ticket.description = description;
      if (status !== undefined) ticket.status = status;
      const { description: _, ...updatedTicket } = ticket;
      return sendResponse(res, updatedTicket);
    }

    default:
      return sendResponse(res, { error: 'Invalid method' }, 400);
  }
});

// Запуск сервера
const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
  console.log(`HelpDesk backend running on port ${PORT}`);
});