export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  dni: string;
  phone_number?: string;
  birth_date?: string;
  password: string;
  password2: string;
}

export interface RegisterResponse {
  first_name: string;
  last_name: string;
  email: string;
  dni: string;
  phone_number: string | null;
  birth_date: string | null;
}

export interface RegisterErrorResponse {
  errors: {
    [key: string]: string[];
  };
  message: string;
}

//===========================================
//<----------------LOGIN------------------->
//===========================================
export interface LoginPayload {
  email: string;
  password: string;
}

// 2. Contrato del objeto de usuario que viene dentro de la respuesta
export interface LoginUser {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  created_at: string; // Se mantiene como string por la deserialización JSON
  updated_at: string; // Se mantiene como string por la deserialización JSON
}

// 3. Contrato exacto de lo que Angular recibe (HTTP 200)
export interface LoginResponse {
  user: LoginUser; // Respetando la clave "name" que impone tu backend
  success: boolean;
  token: string; // Tu JWT real
}

// Opcional (Basado en la imagen de error de tu mensaje anterior)
export interface LoginErrorResponse {
  non_field_errors?: string[];
}
