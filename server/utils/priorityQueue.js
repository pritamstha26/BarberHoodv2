// utils/priorityQueue.js
export class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  // Add appointment to priority queue
  enqueue(appointment, priority = 0) {
    const queueElement = { appointment, priority };
    let added = false;

    // Insert based on priority (higher number = higher priority)
    for (let i = 0; i < this.queue.length; i++) {
      if (queueElement.priority > this.queue[i].priority) {
        this.queue.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    // If not added, push to end (lowest priority)
    if (!added) {
      this.queue.push(queueElement);
    }
  }

  // Remove and return highest priority appointment
  dequeue() {
    return this.queue.shift();
  }

  // Check if queue is empty
  isEmpty() {
    return this.queue.length === 0;
  }

  // Get queue size
  size() {
    return this.queue.length;
  }

  // Peek at highest priority appointment without removing
  peek() {
    return this.queue[0];
  }

  // Get all appointments in priority order
  getAll() {
    return this.queue.map((item) => item.appointment);
  }

  // Clear all items from the queue
  clear() {
    this.queue = [];
  }
}

export const PRIORITY_LEVELS = {
  EMERGENCY: 100,
  VIP: 80,
  PREMIUM: 60,
  REGULAR: 40,
  WALK_IN: 20
};
