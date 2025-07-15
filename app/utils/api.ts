import { ChildCreateRequest, ChildCreateResponse } from '../types/api';
import { API_BASE_URL } from '../auth';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const createChild = async (childData: ChildCreateRequest): Promise<ApiResponse<ChildCreateResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/children`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(childData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 