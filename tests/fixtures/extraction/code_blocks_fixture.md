# Asynchronous Event Loop Pipeline

The event loop coordinates asynchronous I/O operations and scheduling through non-blocking phase queues:

```javascript
function scheduleMicrotask(task) {
  Promise.resolve().then(() => {
    task();
  });
}
```

Microtasks execute immediately after the active synchronous execution context empties and before the rendering pipeline triggers.
