const API_BASE_URL = 'https://0soloktech.execute-api.us-east-2.amazonaws.com/prod';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async fetchInstances() {
    try {
      const response = await fetch(`${this.baseUrl}/instances`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener instancias:', error);
      throw error;
    }
  }

  async startInstance(instanceId) {
    try {
      const response = await fetch(`${this.baseUrl}/instances/${instanceId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al iniciar instancia ${instanceId}:`, error);
      throw error;
    }
  }

  async stopInstance(instanceId) {
    try {
      const response = await fetch(`${this.baseUrl}/instances/${instanceId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al detener instancia ${instanceId}:`, error);
      throw error;
    }
  }

  async confirmUse(instanceId, userId, tickIso, decision = 'use') {
    try {
      const response = await fetch(`${this.baseUrl}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instanceId,
          userId,
          tickIso,
          decision
        })
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al confirmar uso:', error);
      throw error;
    }
  }

  async registerDevice(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al registrar dispositivo:', error);
      throw error;
    }
  }
}

export default new ApiService();
