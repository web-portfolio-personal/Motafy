/**
 * Sistema de cola de requests para manejar rate limiting de Spotify API
 * Spotify permite ~180 requests/min, implementamos una cola segura
 */

class RequestQueue {
  constructor(options = {}) {
    this.queue = [];
    this.processing = false;
    this.requestCount = 0;
    this.windowStart = Date.now();

    // Configuración
    this.maxRequestsPerMinute = options.maxRequestsPerMinute || 150; // Margen de seguridad
    this.minDelayBetweenRequests = options.minDelayBetweenRequests || 100; // ms
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000; // ms

    // Callbacks
    this.onRateLimited = options.onRateLimited || null;
    this.onError = options.onError || null;
  }

  /**
   * Añadir request a la cola
   */
  async enqueue(requestFn, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn: requestFn,
        priority,
        resolve,
        reject,
        attempts: 0,
        addedAt: Date.now()
      });

      // Ordenar por prioridad (mayor prioridad primero)
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  /**
   * Procesar cola de requests
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Verificar rate limit
      await this.checkRateLimit();

      const request = this.queue.shift();

      try {
        const result = await this.executeRequest(request);
        request.resolve(result);
      } catch (error) {
        if (this.shouldRetry(error, request)) {
          request.attempts++;
          this.queue.unshift(request); // Re-añadir al inicio
          await this.delay(this.retryDelay * request.attempts);
        } else {
          request.reject(error);
        }
      }

      // Pequeño delay entre requests
      await this.delay(this.minDelayBetweenRequests);
    }

    this.processing = false;
  }

  /**
   * Ejecutar request con manejo de errores
   */
  async executeRequest(request) {
    this.requestCount++;

    try {
      return await request.fn();
    } catch (error) {
      // Manejar rate limiting (429)
      if (error.status === 429 || error.message?.includes('429')) {
        const retryAfter = error.headers?.get?.('Retry-After') || 30;

        if (this.onRateLimited) {
          this.onRateLimited(retryAfter);
        }

        await this.delay(retryAfter * 1000);
        throw error; // Re-throw para retry
      }

      throw error;
    }
  }

  /**
   * Verificar y esperar si es necesario por rate limit
   */
  async checkRateLimit() {
    const now = Date.now();
    const windowDuration = 60000; // 1 minuto

    // Resetear contador si pasó el window
    if (now - this.windowStart >= windowDuration) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // Si llegamos al límite, esperar
    if (this.requestCount >= this.maxRequestsPerMinute) {
      const waitTime = windowDuration - (now - this.windowStart);
      console.log(`Rate limit alcanzado, esperando ${waitTime}ms`);
      await this.delay(waitTime);
      this.requestCount = 0;
      this.windowStart = Date.now();
    }
  }

  /**
   * Determinar si se debe reintentar
   */
  shouldRetry(error, request) {
    if (request.attempts >= this.retryAttempts) return false;

    // Reintentar en errores de red o rate limiting
    const retryableErrors = [429, 500, 502, 503, 504];
    const status = error.status || error.response?.status;

    return retryableErrors.includes(status) || error.name === 'TypeError';
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtener estadísticas de la cola
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      requestsInWindow: this.requestCount,
      maxRequests: this.maxRequestsPerMinute,
      processing: this.processing
    };
  }

  /**
   * Limpiar cola
   */
  clear() {
    this.queue.forEach(req => req.reject(new Error('Queue cleared')));
    this.queue = [];
  }
}

// Instancia singleton para toda la aplicación
let queueInstance = null;

export function getRequestQueue(options) {
  if (!queueInstance) {
    queueInstance = new RequestQueue(options);
  }
  return queueInstance;
}

export function resetRequestQueue() {
  if (queueInstance) {
    queueInstance.clear();
  }
  queueInstance = null;
}

export default RequestQueue;

