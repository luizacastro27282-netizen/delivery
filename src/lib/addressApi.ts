import { api } from './api';

export interface Address {
  id: string;
  leadId: string;
  type: 'home' | 'work' | 'other';
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
  type?: 'home' | 'work' | 'other';
  label?: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  type?: 'home' | 'work' | 'other';
  label?: string;
  isDefault?: boolean;
}

/**
 * Busca todos os endereços de um lead
 */
export async function getLeadAddresses(leadId: string): Promise<Address[]> {
  try {
    const response = await api.get<{ leadId: string; addresses: Address[] }>(
      `/leads/${leadId}/addresses`,
      { requiresAuth: true }
    );
    
    console.log('getLeadAddresses response:', response);
    
    if (response?.addresses) {
      return response.addresses;
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    return [];
  }
}

/**
 * Cria um novo endereço para o lead
 */
export async function createAddress(leadId: string, addressData: CreateAddressData): Promise<Address | null> {
  try {
    const response = await api.post<Address>(
      `/leads/${leadId}/addresses`,
      addressData,
      { requiresAuth: true }
    );
    
    console.log('createAddress response:', response);
    
    if (response) {
      return response;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    throw error;
  }
}

/**
 * Busca um endereço específico
 */
export async function getAddress(addressId: string): Promise<Address | null> {
  try {
    const response = await api.get<Address>(
      `/addresses/${addressId}`,
      { requiresAuth: true }
    );
    
    console.log('getAddress response:', response);
    
    if (response) {
      return response;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return null;
  }
}

/**
 * Atualiza um endereço existente
 */
export async function updateAddress(addressId: string, updates: UpdateAddressData): Promise<Address | null> {
  try {
    const response = await api.patch<Address>(
      `/addresses/${addressId}`,
      updates,
      { requiresAuth: true }
    );
    
    console.log('updateAddress response:', response);
    
    if (response) {
      return response;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    throw error;
  }
}

/**
 * Deleta um endereço
 */
export async function deleteAddress(addressId: string): Promise<boolean> {
  try {
    await api.delete(
      `/addresses/${addressId}`,
      { requiresAuth: true }
    );
    
    console.log('deleteAddress: sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao deletar endereço:', error);
    throw error;
  }
}

/**
 * Define um endereço como padrão
 */
export async function setDefaultAddress(addressId: string): Promise<Address | null> {
  try {
    const response = await api.post<Address>(
      `/addresses/${addressId}/set-default`,
      undefined,
      { requiresAuth: true }
    );
    
    console.log('setDefaultAddress response:', response);
    
    if (response) {
      return response;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao definir endereço padrão:', error);
    throw error;
  }
}

