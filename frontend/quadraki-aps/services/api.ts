import { Platform } from "react-native";

// No Android Emulator, o localhost do computador host é acessível via 10.0.2.2.
// No iOS Simulator/Web, é localhost.
// Para testar em dispositivo móvel físico, altere a URL abaixo para o IP da sua rede local (ex: http://192.168.1.15:8000/api)
export const BASE_URL = Platform.select({
  android: "http://10.0.2.2:8000/api",
  default: "http://localhost:8000/api",
});

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  // Garante que o path termine com / antes da query string para o Django
  const [path, queryString] = formattedEndpoint.split("?");
  const pathWithSlash = path.endsWith("/") ? path : `${path}/`;
  const url = `${BASE_URL}${pathWithSlash}${queryString ? `?${queryString}` : ""}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Erro na requisição para ${url}:`, response.status, errorText);
    
    let errorMessage = `Erro na API (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed && typeof parsed === "object") {
        errorMessage = parsed.error || parsed.detail || JSON.stringify(parsed);
      }
    } catch (e) {
      if (errorText) {
        errorMessage = errorText;
      }
    }
    throw new Error(errorMessage);
  }

  // DELETE normalmente retorna 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
