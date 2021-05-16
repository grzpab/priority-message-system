# Priority Message System

An exemplary implementation of a priority-message system.

Serves as an inspiration for introducing priority messages to systems that do not natively support transmission control.

## Introduction
The system has three types of components: a broker, a consumer, and a producer; one and only one broker might run, but there might exist multiple consumers and producers. These components exchange messages in an orderly fashion, taking into account transmission control information embedded in the messages.

### Message
A string containing data (agnostic to the system) and transmission control information. A message batch contains a handful of messages. The system sorts message by the time a broker accepted them.

### Broker
A broker accepts messages from producers and forwards them to consumers in constant intervals (cycles). The broker shall cease all operations if the associated message queue remains empty, or no consumers have registered, for a predefined number of cycles. The broker distributes messages in batches of predefined size using the round-robin algorithm. Only one consumer can receive a particular message.

### Consumer
Consumers accept message batches from the broker for processing. If a consumer cannot process a particular message, it can send that message back to the broker. Consumers might implement different strategies on how to deal with transmission control information.

### Producer
Producers send messages to the broker. Producers can arbitrarily set transmission control information on the message level.

## Consumer Strategies


### Predicate-based Consumer Strategy
### Priority-based Consumer Strategy
### TTL-based Consumer Strategy
