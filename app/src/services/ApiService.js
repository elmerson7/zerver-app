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
      const data = await response.json();
      
      // Verificar que la respuesta tenga el formato esperado
      if (data.ok && Array.isArray(data.items)) {
        return data.items; // Devolver solo el array de instancias
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (error) {
      console.error('Error al obtener instancias:', error);
      throw error;
    }
  }

  async startInstance(instanceId) {
    try {
      // Petición simple sin headers ni body para evitar preflight CORS
      const response = await fetch(`${this.baseUrl}/instances/${instanceId}/start`, {
        method: 'POST'
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${responseText}`);
      }
      
      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // No lanzamos error, simplemente devolvemos un objeto con éxito
          data = { success: true };
        }
      } else {
        data = { success: true };
      }
      
      return data;
    } catch (error) {
      console.error(`Error al iniciar instancia ${instanceId}:`, error);
      throw error;
    }
  }

  async stopInstance(instanceId) {
    try {
      // Petición simple sin headers ni body para evitar preflight CORS
      const response = await fetch(`${this.baseUrl}/instances/${instanceId}/stop`, {
        method: 'POST'
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${responseText}`);
      }
      
      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // No lanzamos error, simplemente devolvemos un objeto con éxito
          data = { success: true };
        }
      } else {
        data = { success: true };
      }
      
      return data;
    } catch (error) {
      console.error(`Error al detener instancia ${instanceId}:`, error);
      throw error;
    }
  }

  async confirmUse(instanceId, userId, tickIso, decision = 'use') {
    try {
      // Petición con body pero sin Content-Type para evitar preflight CORS
      const response = await fetch(`${this.baseUrl}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          instanceId,
          userId,
          tickIso,
          decision
        })
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${responseText}`);
      }
      
      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { success: true };
        }
      } else {
        data = { success: true };
      }
      
      return data;
    } catch (error) {
      console.error('Error al confirmar uso:', error);
      throw error;
    }
  }

  async registerDevice(userData) {
    try {
      // Petición con body pero sin Content-Type para evitar preflight CORS
      const response = await fetch(`${this.baseUrl}/register-device`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${responseText}`);
      }
      
      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { success: true };
        }
      } else {
        data = { success: true };
      }
      
      return data;
    } catch (error) {
      console.error('Error al registrar dispositivo:', error);
      throw error;
    }
  }
}

export default new ApiService();